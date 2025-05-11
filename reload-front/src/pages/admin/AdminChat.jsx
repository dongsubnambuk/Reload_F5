import React, { useState, useEffect, useRef } from 'react';
import { List, Avatar, Card } from 'antd';
import { SendOutlined, UserOutlined } from '@ant-design/icons';
import '../../CSS/admin/AdminChat.css';

const AdminChat = ({ stompClient, chatList, setChatList, messages, setMessages, adminName, setUnreadCounts }) => {
  const [selectedUser, setSelectedUser] = useState(null);
  const chatContainerRef = useRef(null);
  const inputRef = useRef(null);
  const inputValueRef = useRef('');

  const sendMessage = () => {
     if (inputValueRef.current && inputValueRef.current.trim().length > 0 && stompClient && selectedUser) {
      const message = {
        chatId: selectedUser.chatId,
        content: inputValueRef.current,
        sender: adminName, // 관리자 이름 사용
        time: new Date().toLocaleTimeString('ko-KR', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      };

      stompClient.send('/app/chat', {}, JSON.stringify(message));

      setMessages((prevMessages) => [...prevMessages, message]);
      inputValueRef.current = '';
      inputRef.current.value = '';
    }
  };

  const selectUser = (user) => {
    setSelectedUser(user);
    setChatList((prevList) =>
      prevList.map((chat) =>
        chat.chatId === user.chatId ? { ...chat, unread: 0, isLastMessageFromUser: false } : chat
      )
    );
    
    // 부모 컴포넌트의 unreadCounts 상태도 업데이트
    if (typeof setUnreadCounts === 'function') {
      setUnreadCounts((prev) => {
        const newCounts = { ...prev };
        newCounts[user.chatId] = 0;
        return newCounts;
      });
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const filteredMessages = messages
    .filter((msg) => msg.chatId === selectedUser?.chatId)
    // 빈 메시지 필터링 추가
    .filter((msg) => msg.content && msg.content.trim().length > 0);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [filteredMessages]);

  const ChatList = () => (
    <Card title="채팅 목록" className="chatList" bordered>
      <List
        className="chat-list"
        dataSource={chatList}
        renderItem={(chat) => (
          <div 
            className={`chat-list-item ${selectedUser?.chatId === chat.chatId ? 'selected' : ''}`}
            onClick={() => selectUser(chat)}
          >
            <div className="chat-avatar-container">
              <div className="chat-avatar">
                <Avatar icon={<UserOutlined />} />
              </div>
              {chat.isOnline && <div className="chat-status-indicator"></div>}
            </div>
            
            <div className="chat-info-container">
              <div className="chat-header">
                <div className="chat-name">{chat.sender}</div>
                <div className="chat-time">
                  {chat.lastMessageTime || '방금 전'}
                </div>
              </div>
              
              <div className="chat-preview">
                {chat.content}
              </div>
              
              <div className="chat-footer">
                <div className={`chat-mode-badge ${chat.botMode ? 'bot' : 'counselor'}`}>
                  {chat.botMode ? '챗봇' : '상담사'}
                </div>
                
                {/* 마지막 메시지가 사용자로부터 온 경우에만 읽지 않음 표시 */}
                {chat.isLastMessageFromUser && chat.unread > 0 && selectedUser?.chatId !== chat.chatId && (
                  <div className="chat-unread-badge">
                    읽지 않음
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      />
    </Card>
  );

  const ChatWindow = () => (
    <Card
      title={selectedUser ? `${selectedUser.sender}와의 대화` : '유저를 선택하세요'}
      className="chatWindow"
      bordered
    >
      <div className="messageContainer" ref={chatContainerRef}>
        {filteredMessages.map((msg, index) => (
          <div key={index} className={
            msg.isSystemMessage 
              ? "systemMessage" 
              : msg.sender === adminName  // 관리자 이름으로 비교
                ? "adminMessage" 
                : "userMessage"
          }>
            {msg.sender !== adminName && !msg.isSystemMessage && (
              <div className="userAvatarContainer">
                <Avatar icon={<UserOutlined />} />
                <div className="senderName">{msg.sender}</div>
              </div>
            )}
            <div className={
              msg.isSystemMessage 
                ? "systemBubble" 
                : msg.sender === adminName 
                  ? "adminBubble" 
                  : "userBubble"
            }>
              <div className={
                msg.isBotModeChangeMessage 
                  ? "modeChangeContent" 
                  : "messageContent"
              }>
                {msg.content}
              </div>
            </div>
            <span className="timestamp">{msg.time}</span>
          </div>
        ))}
      </div>
      <div className="inputContainer">
        <input
          className="input"
          type="text"
          onChange={(e) => (inputValueRef.current = e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="메시지를 입력하세요"
          ref={inputRef}
          disabled={!selectedUser}
          autoComplete="off"
        />
        <SendOutlined
          onClick={sendMessage}
          style={{ color: '#4CAF50', fontSize: '24px', cursor: 'pointer', marginLeft: '10px' }}
        />
      </div>
    </Card>
  );

  return (
    <div className="container">
      <ChatList />
      <ChatWindow />
    </div>
  );
};

export default AdminChat;
