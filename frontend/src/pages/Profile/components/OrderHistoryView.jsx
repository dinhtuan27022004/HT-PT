import React, { useState } from 'react';
import { Tabs, DatePicker, Typography, Empty, Button, Space, Spin } from 'antd';
import { CalendarOutlined, SearchOutlined } from '@ant-design/icons';
import OrderCard from './OrderCard';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const OrderHistoryView = ({ orders, loading, formatPrice, navigate }) => {
    const [activeTab, setActiveTab] = useState('all');

    const tabItems = [
        { key: 'all', label: 'Tất cả' },
        { key: 'pending', label: 'Chờ xác nhận' },
        { key: 'confirmed', label: 'Đã xác nhận' },
        { key: 'shipping', label: 'Đang vận chuyển' },
        { key: 'completed', label: 'Đã giao hàng' },
        { key: 'canceled', label: 'Đã hủy' },
    ];

    const filteredOrders = activeTab === 'all'
        ? orders
        : orders.filter(o => o.status === activeTab);

    return (
        <div className="order-history-view" style={{ background: '#fff', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <Title level={4} style={{ margin: 0 }}>Lịch sử mua hàng</Title>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <RangePicker
                        placeholder={['Từ ngày', 'Đến ngày']}
                        style={{ borderRadius: '8px' }}
                        suffixIcon={<CalendarOutlined />}
                    />
                </div>
            </div>

            <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                items={tabItems}
                className="order-tabs"
                style={{ marginBottom: '20px' }}
            />

            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    <Spin />
                </div>
            ) : filteredOrders.length === 0 ? (
                <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="Không tìm thấy đơn hàng nào"
                    style={{ background: '#fff', padding: '40px', borderRadius: '12px' }}
                >
                    <Button type="primary" onClick={() => navigate('/')}>Tiếp tục mua sắm</Button>
                </Empty>
            ) : (
                <div className="order-list">
                    {filteredOrders.map(order => (
                        <OrderCard
                            key={order.id}
                            order={order}
                            formatPrice={formatPrice}
                            onViewDetail={(id) => navigate(`/profile/orders/${id}`)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default OrderHistoryView;
