import React, { useEffect, useState } from 'react';
import { Card, Typography, Divider, Row, Col, Button } from 'antd';
import Header from '../components/Header';
import { useParams, useNavigate } from "react-router-dom";
import '../CSS/OrderListDetail.css';

const { Title, Text } = Typography;

const OrderListDetail = () => {
    const { date } = useParams(); // URL에서 날짜 파라미터를 가져옵니다.
    const navigate = useNavigate();
    const [orderDetails, setOrderDetails] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 예시 데이터: 여러 날짜에 대한 주문 내역을 포함
        const exampleData = [
            { id: 1, date: '2024-10-01', customerName: '서동섭', customerPhone: '010-3623-9285', customerAddress: '대구 달서구 계대동문로3안길 13-5 306호', name: '기깔나는 식탁', price: 120000, imageUrl: 'https://example.com/table-image.jpg' },
            { id: 2, date: '2024-10-01', customerName: '서동섭', customerPhone: '010-3623-9285', customerAddress: '대구 달서구 계대동문로3안길 13-5 306호', name: '기깔나는 의자', price: 80000, imageUrl: 'https://example.com/chair-image.jpg' },
            { id: 3, date: '2024-10-10', customerName: '박민수', customerPhone: '010-1234-5678', customerAddress: '서울 강남구 삼성로 100길', name: '기깔나는 테이블', price: 150000, imageUrl: 'https://example.com/table-image.jpg' },
            { id: 4, date: '2024-10-10', customerName: '박민수', customerPhone: '010-1234-5678', customerAddress: '서울 강남구 삼성로 100길', name: '기깔나는 소파', price: 200000, imageUrl: 'https://example.com/sofa-image.jpg' },
            { id: 5, date: '2024-10-17', customerName: '이영수', customerPhone: '010-5555-1234', customerAddress: '부산 해운대구 마린시티', name: '기깔나는 침대', price: 300000, imageUrl: 'https://example.com/bed-image.jpg' },
        ];

        // 전달받은 날짜와 일치하는 주문 데이터 필터링
        const filteredOrders = exampleData.filter(order => order.date === date);
        
        if (filteredOrders.length > 0) {
            setOrderDetails(filteredOrders);
            // 총 금액 계산
            const total = filteredOrders.reduce((acc, order) => acc + order.price, 0);
            setTotalPrice(total);
        }
        
        setLoading(false); // 로딩 완료
    }, [date]);

    if (loading) {
        return <p>Loading...</p>; // 로딩 표시
    }

    if (orderDetails.length === 0) {
        return <p>주문 내역이 없습니다.</p>; // 해당 날짜에 주문이 없을 때 메시지 표시
    }

    // 주문자 정보는 모든 항목이 동일하다고 가정하고 첫 번째 항목에서 가져옵니다.
    const { customerName, customerPhone, customerAddress } = orderDetails[0];

    return (
        <>
            <Header />
            <div className="order-detail-container">
        

                {/* 주문 일자 및 주문 정보 */}
                <Card bordered={false} bodyStyle={{ padding: '5px 10px' }} style={{ marginBottom: '10px' }}>
                    <Title level={5}>주문 날짜: {date}</Title>
                    <Text type="secondary">총 결제 금액: {totalPrice.toLocaleString()}원</Text>
                </Card>

                {/* 고객 정보 */}
                <Card bordered={false} bodyStyle={{ padding: '5px 10px' }} style={{ marginBottom: '10px' }}>
                    <Title level={5}>{customerName}</Title>
                    <Text>{customerPhone}</Text><br />
                    <Text>{customerAddress}</Text>
                </Card>

                {/* 주문 상품 목록 */}
                <Card title="주문 상품" bordered={false} bodyStyle={{ padding: '5px 10px' }} style={{ marginBottom: '10px' }}>
                    {orderDetails.map((order, index) => (
                        <Row key={order.id} gutter={16} align="middle" style={{ marginBottom: '10px' }}>
                            <Col span={6}>
                                <img src={order.imageUrl} alt="Product" style={{ width: '100%', borderRadius: '8px' }} />
                            </Col>
                            <Col span={18}>
                                <Title level={5} style={{ marginBottom: 0 }}>{order.name}</Title>
                                <Text>{order.description}</Text><br />
                                <Text strong>{order.price.toLocaleString()}원</Text>
                            </Col>
                        </Row>
                    ))}
                </Card>

                {/* 최종 결제 금액 표시 */}
                <Card bordered={false} bodyStyle={{ padding: '5px 10px', textAlign: 'right' }}>
                    <Divider />
                    <Title level={5}>최종 결제 금액</Title>
                    <Title level={4} style={{ color: '#1E90FF', marginTop: 0 }}>{totalPrice.toLocaleString()}원</Title>
                </Card>
            </div>
        </>
    );
};

export default OrderListDetail;
