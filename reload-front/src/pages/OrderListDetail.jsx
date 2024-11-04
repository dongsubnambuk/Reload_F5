import React, { useEffect, useState } from 'react';
import { Card, Typography, Divider, Row, Col, Button } from 'antd';
import Header from '../components/Header';
import { useParams, useNavigate } from "react-router-dom";
import '../CSS/OrderListDetail.css';
import logo from "../images/Logo.png";

const { Title, Text } = Typography;

const OrderListDetail = () => {
    const { date } = useParams(); // URL에서 날짜 파라미터를 가져옵니다.
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        // 날짜별 예시 데이터를 설정합니다.
        const exampleData = [
            { id: 1, date: '2024-10-01', name: 'D. 김철수', description: '기깔나는 식탁', price: '120,000', imageUrl: 'https://example.com/table-image.jpg' },
            { id: 2, date: '2024-10-01', name: 'D. 김철수', description: '기깔나는 식탁', price: '120,000', imageUrl: 'https://example.com/table-image.jpg' },
            { id: 3, date: '2024-10-10', name: 'D. 김철수', description: '기깔나는 식탁', price: '120,000', imageUrl: 'https://example.com/table-image.jpg' },
            { id: 4, date: '2024-10-10', name: 'D. 김철수', description: '기깔나는 식탁', price: '120,000', imageUrl: 'https://example.com/table-image.jpg' },
            { id: 5, date: '2024-10-17', name: 'D. 김철수', description: '기깔나는 식탁', price: '120,000', imageUrl: 'https://example.com/table-image.jpg' },
        ];

        // 전달받은 날짜와 일치하는 주문 데이터 필터링
        const filteredOrders = exampleData.filter(order => order.date === date);
        setOrders(filteredOrders);
    }, [date]);

    if (orders.length === 0) {
        return <p>Loading...</p>;
    }

    return (
        <>
            <Header />
            <div className="order-detail-container">
                <Button onClick={() => navigate(-1)} style={{ marginBottom: '10px' }}>뒤로가기</Button>

                <Card bordered={false} bodyStyle={{ padding: '5px 10px' }} style={{ marginBottom: '10px' }}>
                    <Title level={5}>{date} 주문 내역</Title>
                </Card>

                {orders.map((order, index) => (
                    <Card key={order.id} bordered={false} bodyStyle={{ padding: '5px 10px' }} style={{ marginBottom: '10px' }}>
                        <Row gutter={16} align="middle">
                            <Col span={6}>
                                <img src={order.imageUrl} alt="Product" style={{ width: '100%' }} />
                            </Col>
                            <Col span={18}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Title level={5} style={{ marginBottom: 0 }}>{order.name}</Title>
                                    <Text type="secondary" style={{ fontSize: '12px' }}>디자이너정보</Text>
                                </div>
                                <Text>{order.description}</Text><br />
                                <Text>{order.price}원</Text>
                            </Col>
                        </Row>
                        {index < orders.length - 1 && <Divider />}
                    </Card>
                ))}
            </div>
        </>
    );
};

export default OrderListDetail;
