import React, { useEffect, useState } from 'react';
import { Card, Typography, Divider, Row, Col } from 'antd';
import Header from '../components/Header';
import { useLocation } from "react-router-dom";
import '../CSS/OrderListDetail.css';

const { Title, Text } = Typography;

const OrderListDetail = () => {
    const location = useLocation();
    const { date } = location.state || {};
    const [orderDetails, setOrderDetails] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const exampleData = [
            { id: 1, date: '2024-10-01', customerName: '서동섭', customerPhone: '010-3623-9285', customerAddress: '대구 달서구 계대동문로3안길 13-5 306호', name: '기깔나는 식탁', price: 120000, imageUrl: 'https://example.com/table-image.jpg' },
            { id: 2, date: '2024-10-01', customerName: '서동섭', customerPhone: '010-3623-9285', customerAddress: '대구 달서구 계대동문로3안길 13-5 306호', name: '기깔나는 의자', price: 80000, imageUrl: 'https://example.com/chair-image.jpg' },
            { id: 3, date: '2024-10-10', customerName: '박민수', customerPhone: '010-1234-5678', customerAddress: '서울 강남구 삼성로 100길', name: '기깔나는 테이블', price: 150000, imageUrl: 'https://example.com/table-image.jpg' },
            { id: 4, date: '2024-10-10', customerName: '박민수', customerPhone: '010-1234-5678', customerAddress: '서울 강남구 삼성로 100길', name: '기깔나는 소파', price: 200000, imageUrl: 'https://example.com/sofa-image.jpg' },
            { id: 5, date: '2024-10-17', customerName: '이영수', customerPhone: '010-5555-1234', customerAddress: '부산 해운대구 마린시티', name: '기깔나는 침대', price: 300000, imageUrl: 'https://example.com/bed-image.jpg' },
        ];

        const filteredOrders = exampleData.filter(order => order.date === date);
        
        if (filteredOrders.length > 0) {
            setOrderDetails(filteredOrders);
            const total = filteredOrders.reduce((acc, order) => acc + order.price, 0);
            setTotalPrice(total);
        }
        
        setLoading(false);
    }, [date]);

    if (loading) {
        return <p>Loading...</p>;
    }

    if (orderDetails.length === 0) {
        return <p>주문 내역이 없습니다.</p>;
    }

    const { customerName, customerPhone, customerAddress } = orderDetails[0];

    return (
        <>
            <Header />
            <div className="order-detail-container">
                <Card bordered={false} bodyStyle={{ padding: '5px 10px' }} style={{ marginBottom: '10px' }}>
                    <Title level={5}>주문 날짜: {date}</Title>
                    <Text type="secondary">총 결제 금액: {totalPrice.toLocaleString()}원</Text>
                </Card>

                <Card bordered={false} bodyStyle={{ padding: '5px 10px' }} style={{ marginBottom: '10px' }}>
                    <Title level={5}>{customerName}</Title>
                    <Text>{customerPhone}</Text><br />
                    <Text>{customerAddress}</Text>
                </Card>

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
