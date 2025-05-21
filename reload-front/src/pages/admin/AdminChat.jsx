import React, { useState, useEffect, useRef } from 'react';
import { List, Avatar, Card } from 'antd';
import { SendOutlined, UserOutlined } from '@ant-design/icons';
import '../../CSS/admin/AdminChat.css';

const AdminChat = ({ stompClient, chatList, setChatList, messages, setMessages, adminName, setUnreadCounts }) => {
  const [selectedUser, setSelectedUser] = useState(null);
  const chatContainerRef = useRef(null);
  const inputRef = useRef(null);
  const inputValueRef = useRef('');

  // HTML 콘텐츠를 렌더링하는 함수 추가
  const renderHTMLContent = (content) => {
    return <div dangerouslySetInnerHTML={{ __html: content }} />;
  };

  // 시간 포맷팅 함수 수정 - 오전/오후 추가
  const formatTime = (timeString) => {
    if (!timeString) return '';

    try {
      // ISO 형식 문자열이나 일반 시간 문자열을 Date 객체로 변환
      const date = new Date(timeString);

      // 유효한 날짜인지 확인
      if (isNaN(date.getTime())) {
        // 이미 시:분 형식이면 그대로 반환
        if (timeString.match(/^\d{1,2}:\d{2}$/)) {
          return timeString;
        }
        return '';
      }

      // 시간과 분 추출
      let hours = date.getHours();
      const minutes = date.getMinutes().toString().padStart(2, '0');

      // 오전/오후 결정
      const amPm = hours < 12 ? '오전' : '오후';

      // 12시간제로 변환
      hours = hours % 12;
      hours = hours ? hours : 12; // 0시는 12시로 표시

      return `${amPm} ${hours.toString().padStart(2, '0')}:${minutes}`;
    } catch (error) {
      console.error('시간 포맷팅 오류:', error);
      return timeString; // 오류 발생 시 원본 문자열 반환
    }
  };

  // 채팅방별 사용자 이름을 찾는 함수 추가
  const getUserNameByChatId = (chatId) => {
    // 해당 채팅방의 메시지 중 관리자가 아닌 발신자의 이름을 찾음
    const userMessages = messages.filter(
      msg => msg.chatId === chatId && msg.sender !== adminName && !msg.isSystemMessage
    );

    // 사용자 메시지가 있으면 첫 번째 메시지의 발신자 이름 반환
    if (userMessages.length > 0) {
      return userMessages[0].sender;
    }

    // 없으면 기본값 반환
    return "사용자";
  };

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
    // 선택된 사용자의 실제 이름 찾기
    const userName = getUserNameByChatId(user.chatId);

    // 사용자 정보에 실제 이름 추가
    const updatedUser = {
      ...user,
      userName: userName
    };

    setSelectedUser(updatedUser);
    setChatList((prevList) =>
      prevList.map((chat) =>
        chat.chatId === user.chatId ?
          { ...chat, unread: 0, isLastMessageFromUser: false, userName: userName } :
          chat
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

  // 채팅 목록 초기화 시 사용자 이름 설정
  useEffect(() => {
    // 각 채팅방의 사용자 이름 설정
    setChatList((prevList) =>
      prevList.map((chat) => {
        const userName = getUserNameByChatId(chat.chatId);
        return { ...chat, userName: userName };
      })
    );
  }, [messages]); // messages가 변경될 때마다 실행

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
                {/* 사용자 이름 표시 - 메시지에서 찾은 이름 사용 */}
                <div className="chat-name">{chat.userName || getUserNameByChatId(chat.chatId)}</div>
                <div className="chat-time">
                  {formatTime(chat.lastMessageTime) || '방금 전'}
                </div>
              </div>

              <div className="chat-preview">
                {renderHTMLContent(chat.content)}
              </div>

              <div className="chat-footer">
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
      title={selectedUser ? `'${selectedUser.userName || getUserNameByChatId(selectedUser.chatId)}' 님과의 대화` : '유저를 선택하세요'}
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
            {/* 메시지 내용 컨테이너 추가 */}
            <div className="messageContentContainer">
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
                  {renderHTMLContent(msg.content)}
                </div>
              </div>
            </div>
            {/* 타임스탬프 컨테이너 추가 */}
            <div className="timestampContainer">
              <span className="timestamp">{formatTime(msg.sendTime || msg.time)}</span>
            </div>
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
