import React from 'react';
import { Card, Tag, Typography, Button, Space, Divider } from 'antd';
import { RightOutlined, FileTextOutlined } from '@ant-design/icons';
import { COLORS } from '../../../theme/colors';

const { Text, Title } = Typography;

const OrderCard = ({ order, formatPrice, onViewDetail }) => {
    const getStatusTag = (status) => {
        const map = {
            'pending': { color: 'gold', text: 'Chờ xác nhận', bg: '#fffbe6' },
            'paid': { color: 'green', text: 'Đã nhận hàng', bg: '#f6ffed' },
            'shipped': { color: 'blue', text: 'Đang vận chuyển', bg: '#e6f7ff' },
            'completed': { color: 'success', text: 'Đã nhận hàng', bg: '#f6ffed' },
            'canceled': { color: 'error', text: 'Đã hủy', bg: '#fff1f0' }
        };
        const c = map[status] || { color: 'default', text: status, bg: '#f5f5f5' };
        return (
            <Tag color={c.color} style={{ borderRadius: '4px', border: 'none', padding: '2px 8px' }}>
                {c.text}
            </Tag>
        );
    };

    const firstItem = order.items?.[0] || {};

    return (
        <Card
            bordered={false}
            hoverable
            bodyStyle={{ padding: '16px' }}
            style={{ borderRadius: '12px', marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}
            onClick={() => onViewDetail(order.id)}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <Space split={<Divider type="vertical" />}>
                    <Text type="secondary" style={{ fontSize: '12px' }}>Đơn hàng: <Text strong>#{order.order_code}</Text></Text>
                    <Text type="secondary" style={{ fontSize: '12px' }}>Ngày đặt hàng: <Text strong>{new Date(order.created_at).toLocaleDateString('vi-VN')}</Text></Text>
                </Space>
                {getStatusTag(order.status)}
            </div>

            <Divider style={{ margin: '12px 0' }} />

            <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ width: '80px', height: '80px', background: '#f5f5f5', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {firstItem.thumbnail ? (
                        <img src={firstItem.thumbnail} alt={firstItem.product_name} style={{ maxWidth: '100%', maxHeight: '100%' }} />
                    ) : (
                        <FileTextOutlined style={{ fontSize: '32px', color: '#bfbfbf' }} />
                    )}
                </div>
                <div style={{ flex: 1 }}>
                    <Title level={5} style={{ margin: '0 0 8px 0', fontSize: '14px', lineHeight: '1.4' }}>
                        {firstItem.product_name || 'Sản phẩm'}
                    </Title>
                    <Text type="secondary" style={{ fontSize: '13px' }}>{formatPrice(firstItem.price || 0)}</Text>
                    {order.items?.length > 1 && (
                        <div style={{ marginTop: '4px' }}>
                            <Text type="secondary" style={{ fontSize: '12px' }}>và {order.items.length - 1} sản phẩm khác</Text>
                        </div>
                    )}
                    <div style={{ marginTop: '8px' }}>
                        <Tag color="blue" size="small" style={{ fontSize: '10px' }}>Đã xuất VAT</Tag>
                    </div>
                </div>
                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                    <div style={{ marginBottom: '8px' }}>
                        <Text type="secondary" style={{ fontSize: '12px' }}>Tổng thanh toán:</Text>
                        <div style={{ color: COLORS.PRIMARY, fontWeight: 'bold', fontSize: '16px' }}>
                            {formatPrice(order.total)}
                        </div>
                    </div>
                    <Button type="link" size="small" style={{ padding: 0, height: 'auto' }}>
                        Xem chi tiết <RightOutlined style={{ fontSize: '10px' }} />
                    </Button>
                </div>
            </div>
        </Card>
    );
};

export default OrderCard;
