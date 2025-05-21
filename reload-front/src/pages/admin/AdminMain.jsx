import React, { useState, useEffect, useRef } from 'react';
import { Layout, Menu, Avatar, Typography, Divider, Badge } from 'antd';
import { 
  UserOutlined, DashboardOutlined, ApartmentOutlined, ShoppingCartOutlined, 
  UploadOutlined, RocketOutlined, UserAddOutlined, LogoutOutlined, 
  CommentOutlined, TeamOutlined 
} from '@ant-design/icons';
import '../../CSS/admin/AdminMain.css';
import AdminDash from './AdminDash';
import AdminProduct from './AdminProduct';
import AdminDesigner from './AdminDesigner';
import AdminAllUser from './AdminAllUser';
import AdminChat from './AdminChat';
import AdminPickupManagement from './AdminPickUpManagement';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

// 하드코딩된 컴포넌트 정의
const PickupManagementContent = () => (
  <div>
    <h2>수거 관리</h2>
    <p>수거 관리 콘텐츠를 여기에 표시합니다.</p>
  </div>
);

const OrderManagementContent = () => (
  <div>
    <h2>주문 관리</h2>
    <p>주문 관리 콘텐츠를 여기에 표시합니다.</p>
  </div>
);

const DeliveryManagementContent = () => (
  <div>
    <h2>배송 관리</h2>
    <p>배송 관리 콘텐츠를 여기에 표시합니다.</p>
  </div>
);

const CustomerSupportContent = () => (
  <div>
    <h2>문의 채팅</h2>
    <p>문의 채팅 콘텐츠를 여기에 표시합니다.</p>
  </div>
);

const AdminMain = () => {
  const [adminName, setAdminName] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stompClient, setStompClient] = useState(null);
  const [chatList, setChatList] = useState([]);
  const [messages, setMessages] = useState([]);
  const [unreadCounts, setUnreadCounts] = useState({});
  const subscribedChatRooms = useRef(new Set());
  const adminNameRef = useRef('새로고침');

  useEffect(() => {
    const storedAdminName = localStorage.getItem("adminname");
    if (storedAdminName) {
      setAdminName(storedAdminName);
      adminNameRef.current = '새로고침'; // 관리자 채팅 이름은 '새로고침'으로 고정
    }
    
    // WebSocket 연결 설정
    initializeWebSocket();
    
    // 컴포넌트 언마운트 시 WebSocket 연결 해제
    return () => {
      if (stompClient) {
        stompClient.disconnect();
      }
    };
  }, []);

  const initializeWebSocket = () => {
    // 이미 연결된 경우 중복 연결 방지
    if (stompClient) return;

    // SockJS 옵션 설정
    const sockOptions = {
      transports: ['websocket', 'xhr-streaming', 'xhr-polling'],
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Origin, Content-Type, Accept'
      }
    };

    const socket = new SockJS('https://refresh-f5-server.o-r.kr/ws/chat', null, sockOptions);
    const client = Stomp.over(socket);

    // STOMP 클라이언트 연결 헤더 설정
    const connectHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Origin, Content-Type, Accept'
    };

    client.connect(connectHeaders, () => {
      //console.log('WebSocket connected in AdminMain');
      setStompClient(client);

      // 새 채팅방 생성 구독
      client.subscribe('/topic/admin/new-room', (message) => {
        const newRoom = JSON.parse(message.body);
        //console.log('New room created:', newRoom);

        if (newRoom.chatId && !subscribedChatRooms.current.has(newRoom.chatId)) {
          subscribedChatRooms.current.add(newRoom.chatId);

          // 채팅방별 메시지 구독
          client.subscribe(`/topic/chat/${newRoom.chatId}`, (message) => {
            const receivedMessage = JSON.parse(message.body);
            handleReceivedMessage(receivedMessage, newRoom.chatId);
          });

          setChatList((prevList) => [
            ...prevList,
            { 
              sender: newRoom.sender, 
              content: '', 
              unread: 0, 
              chatId: newRoom.chatId,
              botMode: true, // 기본값은 챗봇 모드
              lastMessageTime: '방금 전'
            },
          ]);
        }
      });
    }, (error) => {
      ///console.error('WebSocket connection error:', error);
    });
  };

  const handleReceivedMessage = (receivedMessage, chatId) => {
    if (!receivedMessage.time) {
      receivedMessage.time = new Date().toLocaleTimeString('ko-KR', {
        hour: '2-digit',
        minute: '2-digit',
      });
    }

    // 시스템 메시지 처리 (모드 전환 메시지 포함)
    const isSystemMessage = receivedMessage.sender === '시스템';
    const isBotModeChangeMessage = isSystemMessage && 
      (receivedMessage.content.includes('챗봇 모드로 전환') || 
      receivedMessage.content.includes('상담사 모드로 전환'));
  
    // 관리자나 챗봇이 보낸 메시지인지 확인
    const isAdminOrBot = receivedMessage.sender === adminNameRef.current || receivedMessage.sender === '새로고침';

    setMessages((prevMessages) => {
      // 중복 메시지 방지
      if (!prevMessages.some((msg) => msg.chatId === chatId && msg.content === receivedMessage.content)) {
        return [...prevMessages, { ...receivedMessage, chatId, isSystemMessage, isBotModeChangeMessage }];
      }
      return prevMessages;
    });

    // 채팅 목록 업데이트
    setChatList((prevList) => {
      // 기존 채팅방이 있는지 확인
      const existingChatIndex = prevList.findIndex(chat => chat.chatId === chatId);
      
      if (existingChatIndex >= 0) {
        // 기존 채팅방 업데이트
        const updatedList = [...prevList];
        
        // 마지막 메시지 발신자 정보 저장
        const lastMessageSender = receivedMessage.sender;
        const isLastMessageFromUser = !isAdminOrBot && !isSystemMessage;
        
        updatedList[existingChatIndex] = {
          ...updatedList[existingChatIndex],
          content: receivedMessage.content,
          // 마지막 메시지가 사용자로부터 온 경우에만 unread 설정
          unread: isLastMessageFromUser && activeTab !== 'customer-support' ? 1 : 0,
          botMode: isBotModeChangeMessage 
            ? receivedMessage.content.includes('챗봇 모드로 전환') 
            : updatedList[existingChatIndex].botMode,
          lastMessageTime: new Date().toLocaleTimeString('ko-KR', {
            hour: '2-digit',
            minute: '2-digit',
          }),
          lastMessageSender: lastMessageSender,
          isLastMessageFromUser: isLastMessageFromUser
        };
        return updatedList;
      } else {
        // 새 채팅방 추가
        return prevList;
      }
    });

    // 현재 활성 탭이 채팅이 아닌 경우, 사용자 메시지에 대해서만 읽지 않음 카운트 업데이트
    if (activeTab !== 'customer-support' && !isAdminOrBot && !isSystemMessage) {
      setUnreadCounts(prev => {
        const newCounts = { ...prev };
        newCounts[chatId] = 1; // 항상 1로 설정 (마지막 메시지가 사용자로부터 온 경우만 표시)
        return newCounts;
      });
    } else if (isAdminOrBot || isSystemMessage) {
      // 관리자나 챗봇이 응답했거나 시스템 메시지인 경우 해당 채팅방의 읽지 않음 카운트 초기화
      setUnreadCounts(prev => {
        const newCounts = { ...prev };
        newCounts[chatId] = 0;
        return newCounts;
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('adminname');
    window.location.href = '/login';
  };

  // 메뉴 아이템 생성
  const getMenuItems = () => {
    const items = [
      { 
        label: '대시보드', 
        key: 'dashboard', 
        icon: <DashboardOutlined /> 
      },
      { 
        label: '유저 관리', 
        key: 'user-management', 
        icon: <TeamOutlined /> 
      },
      { 
        label: '디자이너 등록', 
        key: 'designer-register', 
        icon: <UserAddOutlined /> 
      },
      { 
        label: '상품 등록', 
        key: 'product-upload', 
        icon: <UploadOutlined /> 
      },
      // { label: '주문 관리', key: 'orders', icon: <ShoppingCartOutlined /> },
      // { label: '배송 관리', key: 'delivery', icon: <RocketOutlined /> },
      { 
        label: '수거 관리', 
        key: 'pickup', 
        icon: <ApartmentOutlined /> 
      },
      { 
        label: (
          <span>
            문의 채팅
            {Object.values(unreadCounts).reduce((a, b) => a + b, 0) > 0 && (
              <Badge 
                count={Object.values(unreadCounts).reduce((a, b) => a + b, 0)} 
                style={{ marginLeft: 8 }} 
              />
            )}
          </span>
        ), 
        key: 'customer-support', 
        icon: <CommentOutlined />
      },
      { 
        label: '로그아웃', 
        key: 'logout', 
        icon: <LogoutOutlined />, 
        onClick: handleLogout 
      },
    ];
    
    return items;
  };

  // 탭 변경 시 처리
  const handleTabChange = (key) => {
    if (key === 'logout') {
      handleLogout();
      return;
    }
    
    setActiveTab(key);
    
    // 읽지않음 초기화 제거하여 채팅 목록 클릭 시에만 초기화 되도록 함
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'pickup':
        return <AdminPickupManagement />;
      case 'orders':
        return <OrderManagementContent />;
      case 'product-upload':
        return <AdminProduct />;
      case 'delivery':
        return <DeliveryManagementContent />;
      case 'designer-register':
        return <AdminDesigner />;
      case 'customer-support':
        return <AdminChat 
                 stompClient={stompClient} 
                 chatList={chatList} 
                 setChatList={setChatList} 
                 messages={messages} 
                 setMessages={setMessages} 
                 adminName={adminNameRef.current}
                 setUnreadCounts={setUnreadCounts} // 추가
               />;
      case 'user-management':
        return <AdminAllUser />;
      default:
        return <AdminDash setActiveTab={setActiveTab} />;
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={250} className="sider">
        <div className="logo">
          <Avatar size={64} icon={<UserOutlined />} />
          <Text className="user-name">관리자 <br/> {adminName}</Text>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={["dashboard"]}
          selectedKeys={[activeTab]}
          onClick={(e) => handleTabChange(e.key)}
          items={getMenuItems()}
          className="menu"
        />
      </Sider>

      <Layout className="main-layout">
        <Header className="header" style={{ backgroundColor: '#f0f2f5', textAlign: 'center', padding: '20px 0' }}>
          <Divider>
            <Text style={{ fontSize: '24px', fontWeight: 'bold', color: '#323232', letterSpacing: '1px' }}>
              지구를 다시 고칠 때까지, <span style={{ color: '#388E3C' }}>새로고침</span>
            </Text>
          </Divider>
        </Header>

        <Content className="content">
          {renderContent()}
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminMain;
