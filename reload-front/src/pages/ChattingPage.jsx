import React, { useState, useEffect, useRef } from 'react';
import { Avatar } from 'antd';
import { UserOutlined, SendOutlined, MenuOutlined, CloseOutlined, ArrowUpOutlined, CustomerServiceOutlined, RobotOutlined } from '@ant-design/icons';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import Header from '../components/Header';
import '../CSS/ChattingPage.css';

const ChattingPage = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [stompClient, setStompClient] = useState(null);
  const [userName, setUserName] = useState(''); // 유저 이름 상태
  const [chatId, setChatId] = useState(null); // 동적으로 설정된 채팅방 ID
  const messageContainerRef = useRef(null);
  const [quickQuestions, setQuickQuestions] = useState([
    '회원정보 수정 방법', '상품 구매 방법', '장바구니 담는 방법', 
    '수거 신청 방법', '수거 일자 변경', '수거 진행 상태 확인', '상담사와 1:1 채팅 방법'
  ]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [suggestionVisible, setSuggestionVisible] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  // 챗봇 상태 관리 추가
  const [isBotMode, setIsBotMode] = useState(true);

  // 시간 포맷팅 함수 추가 - 오전/오후 표시
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

  // 카테고리별 자주 묻는 질문
  const categoryQuestions = {
    '계정 관리': ['회원정보 수정 방법'],
    '쇼핑 정보': ['상품 구매 방법', '장바구니 담는 방법'],
    '수거 서비스': ['수거 신청 방법', '수거 일자 변경', '수거 진행 상태 확인', '수거 당일 부재 시 집에 없을 시'],
    '고객 지원': ['상담사와 1:1 채팅 방법']
  };

  // 회원정보 조회 및 채팅방 초기화
  useEffect(() => {
    const initializeChat = async () => {
      try {
        const token = localStorage.getItem('token');
        const email = localStorage.getItem('email');

        //console.log('Initializing chat...'); // 디버깅
        //console.log('Token:', token); // 토큰 확인
        //console.log('Email:', email); // 이메일 확인

        // 회원정보 조회
        const userResponse = await fetch(
          `https://refresh-f5-server.o-r.kr/api/account/search-account/${email}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        );

        //console.log('User info response status:', userResponse.status); // 응답 상태 확인
        const userResult = await userResponse.json();
        //console.log('User info response data:', userResult); // 응답 데이터 확인

        if (userResponse.status === 200) {
          const sender = userResult.name;
          setUserName(sender); // 유저 이름 설정
          //console.log('User name set to:', sender); // 유저 이름 설정 확인

          // 채팅방 초기화 (chatId 가져오기)
          const chatResponse = await fetch(
            `https://refresh-f5-server.o-r.kr/api/chat/create-chat?email=${email}&sender=${sender}`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
            }
          );

          //console.log('Chat creation response status:', chatResponse.status); // 응답 상태 확인
          const chatResult = await chatResponse.json();
          //console.log('Chat creation response data:', chatResult); // 응답 데이터 확인

          if (chatResponse.status === 200) {
            setChatId(chatResult.chatId); // chatId 설정
            //console.log('Chat ID set to:', chatResult.chatId); // chatId 설정 확인
          } else {
            alert('채팅방 초기화 실패: ' + chatResult.message);
          }
        } else {
          alert('회원정보 조회 실패: ' + userResult.message);
        }
      } catch (error) {
        //console.error('에러 발생:', error);
        alert('서버와의 통신 중 문제가 발생했습니다.');
      }
    };

    initializeChat();
  }, []);

  // WebSocket 연결 설정
  useEffect(() => {
    if (chatId) {
      //console.log('Establishing WebSocket connection for chatId:', chatId);

      const socket = new SockJS('https://refresh-f5-server.o-r.kr/ws/chat');
      const client = Stomp.over(socket);

      client.connect(
        {},
        () => {
          setStompClient(client);
          //console.log('WebSocket connected.');

          // 서버의 채팅방 구독
          client.subscribe(`/topic/chat/${chatId}`, (message) => {
            //console.log('Message received:', message);
            const receivedMessage = JSON.parse(message.body);

            if (!receivedMessage.time) {
              receivedMessage.time = new Date().toLocaleTimeString('ko-KR', {
                hour: '2-digit',
                minute: '2-digit',
              });
            }

            // 서버에서 받은 시간 포맷팅 적용
            if (receivedMessage.sendTime) {
              receivedMessage.formattedTime = formatTime(receivedMessage.sendTime);
            } else {
              receivedMessage.formattedTime = formatTime(receivedMessage.time);
            }

            // 챗봇 응답을 받으면 로딩 상태 해제
            if (receivedMessage.sender === '새로고침') {
              setIsLoading(false);
            }

            // 중복 메시지 확인
            setMessages((prevMessages) => {
              const isDuplicate = prevMessages.some(
                msg =>
                  msg.sender === receivedMessage.sender &&
                  msg.content === receivedMessage.content
              );

              if (!isDuplicate) {
                return [...prevMessages, receivedMessage];
              }
              return prevMessages;
            });
          });
        },
        (error) => {
          //console.error('WebSocket connection error:', error);
        }
      );

      return () => {
        if (stompClient) {
          stompClient.disconnect();
          //console.log('WebSocket disconnected.');
        }
      };
    }
  }, [chatId]);

  // 메시지 전송
  const sendMessage = (text = input) => {
    if (text.trim() && stompClient && chatId) {
      const message = {
        chatId,
        content: text.trim(),
        sender: userName,
        // 추가: 메시지에 클라이언트 타임스탬프 추가
        clientTimestamp: Date.now()
      };

      //console.log('Sending message:', message);

      stompClient.send('/app/chat', {}, JSON.stringify(message));

      // 로컬 상태에 메시지 추가 (서버에서의 응답은 필터링)
      // 타임스탬프 형식 맞추기
      const now = new Date();
      message.time = new Date().toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
      });
      message.formattedTime = formatTime(now);
      setMessages((prevMessages) => [...prevMessages, message]);
      setInput('');
      setSuggestionVisible(false);

      // 로딩 상태 시작
      setIsLoading(true);
    }
  };

  // 챗봇/상담사 전환 함수 추가
  const toggleBotMode = async () => {
    if (!chatId) return;
    
    try {
      const token = localStorage.getItem('token');
      const newStatus = !isBotMode;
      
      const response = await fetch(
        `https://refresh-f5-server.o-r.kr/api/chat/bot-stat?chatId=${chatId}&status=${newStatus}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({}),
        }
      );
      
      if (response.status === 200) {
        const result = await response.json();
        //console.log('Bot status changed:', result);
        setIsBotMode(result.bot);
        
        // 상태 변경 메시지 추가
        const now = new Date();
        const statusChangeMessage = {
          sender: '시스템',
          content: `${result.bot ? '챗봇' : '상담사'} 모드로 전환되었습니다. 상담사가 대답하기 전까지 '...'으로 표시됩니다.`,
          time: new Date().toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit',
          }),
          formattedTime: formatTime(now)
        };
        
        setMessages(prevMessages => [...prevMessages, statusChangeMessage]);
      } else {
        //console.error('Bot status change failed');
      }
    } catch (error) {
      //console.error('Error changing bot status:', error);
    }
  };

  // 입력 내용이 변경될 때 관련 제안 표시
  useEffect(() => {
    if (input.trim() && input.length > 1) {
      // 입력된 내용을 기반으로 추천 질문 필터링
      const allQuestions = [
        '상품 구매 방법', '장바구니 담는 방법',
        '수거 신청 방법', '수거 일자 변경', '수거 진행 상태 확인', '수거 당일 부재 시 집에 없을 시',
        '상담사와 1:1 채팅 방법', '회원정보 수정 방법'
      ];

      const filteredSuggestions = allQuestions.filter(q =>
        q.toLowerCase().includes(input.toLowerCase())
      ).slice(0, 5);

      setSuggestions(filteredSuggestions);
      setSuggestionVisible(filteredSuggestions.length > 0);
    } else {
      setSuggestionVisible(false);
    }
  }, [input]);

  // 메시지 자동 스크롤
  useEffect(() => {
    if (messageContainerRef.current) {
      messageContainerRef.current.scrollTop = messageContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // 퀵 질문 버튼 클릭 핸들러
  const handleQuickQuestion = (question) => {
    sendMessage(question);
  };

  // 메뉴 토글 핸들러
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // HTML 콘텐츠를 렌더링하는 함수
  const renderHTMLContent = (content) => {
    return <p className="chatting-message-content" dangerouslySetInnerHTML={{ __html: content }} />;
  };

  return (
    <div className="chatting-container">
      <Header />

      {/* 메시지 컨테이너 */}
      <div className="chatting-message-container" ref={messageContainerRef}>
        {messages.map((msg, index) => (
          <div key={index} className={msg.sender === '새로고침' ? 'chatting-admin-message' : 'chatting-user-message'}>
            {msg.sender === '새로고침' ? (
              <>
                <div className="chatting-user-avatar-container">
                  <Avatar icon={<UserOutlined />} className="chatting-avatar-icon" />
                  <div className="chatting-sender-name">{msg.sender}</div>
                </div>
                <div className="chatting-admin-bubble">
                  {renderHTMLContent(msg.content)}
                </div>
                <span className="chatting-timestamp">{msg.formattedTime || formatTime(msg.sendTime) || formatTime(msg.time)}</span>
              </>
            ) : (
              <>
                <div className="chatting-user-bubble">
                  <p className="chatting-message-content">{msg.content}</p>
                </div>
                  <span className="chatting-timestamp">{msg.formattedTime || formatTime(msg.sendTime) || formatTime(msg.time)}</span>
              </>
            )}
          </div>
        ))}

        {/* 로딩 인디케이터 */}
        {isLoading && (
          <div className="chatting-admin-message">
            <div className="chatting-user-avatar-container">
              <Avatar icon={<UserOutlined />} className="chatting-avatar-icon" />
              <div className="chatting-sender-name">새로고침</div>
            </div>
            <div className="chatting-admin-bubble chatting-loading-bubble">
              <div className="chatting-typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}

        {/* 빠른 질문 버튼들 - 챗봇 첫 메시지 이후에만 표시 */}
        {messages.length > 0 && messages[0]?.sender === '새로고침' && messages.length <= 1 && (
          <div className="chatting-quick-questions-container">
            {quickQuestions.map((question, idx) => (
              <button
                key={idx}
                className="chatting-quick-question-button"
                onClick={() => handleQuickQuestion(question)}
              >
                {question}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 카테고리별 자주 묻는 질문 메뉴 */}
      <div className={`chatting-faq-menu ${isMenuOpen ? 'open' : ''}`}>
        <div className="chatting-faq-menu-header">
          <div className="chatting-faq-title">궁금한 내용을 선택해 보세요!</div>
          <button className="chatting-close-menu-button" onClick={toggleMenu}>
            <CloseOutlined />
          </button>
        </div>
        <div className="chatting-faq-content">
          {Object.entries(categoryQuestions).map(([category, questions]) => (
            <div key={category} className="chatting-faq-category">
              <h3 className="chatting-category-title">{category}</h3>
              <div className="chatting-category-questions">
                {questions.map((question, idx) => (
                  <button
                    key={idx}
                    className="chatting-category-question-button"
                    onClick={() => {
                      handleQuickQuestion(question);
                      toggleMenu();
                    }}
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 입력창 및 관련 컨트롤 */}
      <div className="chatting-input-container">
        <button
          className="chatting-menu-button"
          onClick={toggleMenu}
          aria-label="자주 묻는 질문 메뉴 열기"
        >
          <MenuOutlined />
        </button>
        
        {/* 챗봇/상담사 전환 버튼 추가 */}
        <button
          className="chatting-bot-toggle-button"
          onClick={toggleBotMode}
          aria-label={isBotMode ? "상담사 모드로 전환" : "챗봇 모드로 전환"}
          title={isBotMode ? "상담사 모드로 전환" : "챗봇 모드로 전환"}
        >
          {isBotMode ? <CustomerServiceOutlined /> : <RobotOutlined />}
        </button>
        
        <input
          className="chatting-chat-input"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          placeholder="메시지를 입력하세요."
        />
        <button
          className="chatting-send-button"
          onClick={() => sendMessage()}
          style={{ paddingRight: '0px' }}
          aria-label="메시지 보내기"
        >
          <SendOutlined />
        </button>

        {/* 검색어 연관 제안 */}
        {suggestionVisible && (
          <div className="chatting-suggestion-container">
            {suggestions.map((suggestion, idx) => (
              <div
                key={idx}
                className="chatting-suggestion-item"
                onClick={() => {
                  sendMessage(suggestion);
                }}
              >
                <span>{suggestion}</span>
              </div>
            ))}
            <div className="chatting-search-button">
              <span>검색하기</span>
              <ArrowUpOutlined />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChattingPage;
