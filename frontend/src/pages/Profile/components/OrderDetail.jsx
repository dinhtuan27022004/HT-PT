import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Typography, Spin, Descriptions, Table, Tag, Button, Row, Col, Divider, Alert } from 'antd';
import orderService from '../../../services/order.service';
import { ArrowLeftOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const OrderDetail = ({ formatPrice }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchOrderDetail = async () => {
            try {
                setLoading(true);
                const response = await orderService.getOrderById(id);
                if (response.status === 'success') {
                    setOrder(response.data);
                } else {
                    setError('Failed to load order details');
                }
            } catch (err) {
                setError(err.message || 'An error occurred');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchOrderDetail();
        }
    }, [id]);

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <Spin size="large" />
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ padding: '24px' }}>
                <Alert message="Error" description={error} type="error" showIcon />
                <Button type="primary" onClick={() => navigate('/profile/orders')} style={{ marginTop: 16 }}>
                    Back to Orders
                </Button>
            </div>
        );
    }

    if (!order) {
        return (
            <div style={{ padding: '24px' }}>
                <Alert message="Order not found" type="warning" showIcon />
                <Button type="primary" onClick={() => navigate('/profile/orders')} style={{ marginTop: 16 }}>
                    Back to Orders
                </Button>
            </div>
        );
    }

    const columns = [
        {
            title: 'Sản phẩm',
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => (
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    {/* Placeholder for product image if available in record */}
                    <div style={{ marginLeft: 0 }}>
                        <Text strong>{text}</Text>
                        <div style={{ fontSize: '12px', color: '#888' }}>SKU: {record.sku}</div>
                    </div>
                </div>
            ),
        },
        {
            title: 'Đơn giá',
            dataIndex: 'unit_price',
            key: 'unit_price',
            align: 'right',
            render: (price) => formatPrice ? formatPrice(price) : price.toLocaleString('vi-VN') + ' đ',
        },
        {
            title: 'Số lượng',
            dataIndex: 'quantity',
            key: 'quantity',
            align: 'center',
        },
        {
            title: 'Thành tiền',
            dataIndex: 'line_total',
            key: 'line_total',
            align: 'right',
            render: (originalTotal, record) => {
                // If line_total is not directly available, calculate it
                const total = record.line_total || (record.unit_price * record.quantity);
                return formatPrice ? formatPrice(total) : total.toLocaleString('vi-VN') + ' đ';
            },
        },
    ];

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'orange';
            case 'confirmed': return 'blue';
            case 'shipping': return 'cyan';
            case 'completed': return 'green';
            case 'cancelled': return 'red';
            default: return 'default';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'pending': return 'Chờ xác nhận';
            case 'confirmed': return 'Đã xác nhận';
            case 'shipping': return 'Đang vận chuyển';
            case 'completed': return 'Đã giao hàng';
            case 'cancelled': return 'Đã hủy';
            default: return status;
        }
    };


    return (
        <Card bordered={false} className="order-detail-card" style={{ borderRadius: '8px' }}>
            <Button
                type="link"
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate('/profile/orders')}
                style={{ marginBottom: 16, paddingLeft: 0 }}
            >
                Quay lại danh sách đơn hàng
            </Button>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <div>
                    <Title level={4} style={{ margin: 0 }}>Chi tiết đơn hàng #{order.order_code || order.id}</Title>
                    <Text type="secondary">Ngày đặt: {new Date(order.created_at).toLocaleString('vi-VN')}</Text>
                </div>
                <Tag color={getStatusColor(order.status)} style={{ fontSize: '14px', padding: '6px 12px' }}>
                    {getStatusText(order.status).toUpperCase()}
                </Tag>
            </div>

            <Row gutter={[24, 24]}>
                <Col span={24} md={16}>
                    <Table
                        dataSource={order.items || []}
                        columns={columns}
                        pagination={false}
                        rowKey="id"
                        summary={(pageData) => {
                            return (
                                <>
                                    <Table.Summary.Row>
                                        <Table.Summary.Cell index={0} colSpan={3} align="right"><Text>Tạm tính</Text></Table.Summary.Cell>
                                        <Table.Summary.Cell index={1} align="right">
                                            <Text>{formatPrice ? formatPrice(order.subtotal) : order.subtotal.toLocaleString('vi-VN') + ' đ'}</Text>
                                        </Table.Summary.Cell>
                                    </Table.Summary.Row>
                                    <Table.Summary.Row>
                                        <Table.Summary.Cell index={0} colSpan={3} align="right"><Text>Phí vận chuyển</Text></Table.Summary.Cell>
                                        <Table.Summary.Cell index={1} align="right">
                                            <Text>{formatPrice ? formatPrice(order.shipping_fee) : order.shipping_fee.toLocaleString('vi-VN') + ' đ'}</Text>
                                        </Table.Summary.Cell>
                                    </Table.Summary.Row>
                                    <Table.Summary.Row>
                                        <Table.Summary.Cell index={0} colSpan={3} align="right"><Text strong style={{ fontSize: '16px' }}>Tổng cộng</Text></Table.Summary.Cell>
                                        <Table.Summary.Cell index={1} align="right">
                                            <Text strong style={{ fontSize: '16px', color: '#ff4d4f' }}>
                                                {formatPrice ? formatPrice(order.total) : order.total.toLocaleString('vi-VN') + ' đ'}
                                            </Text>
                                        </Table.Summary.Cell>
                                    </Table.Summary.Row>
                                </>
                            );
                        }}
                    />
                </Col>
                <Col span={24} md={8}>
                    <Card title="Thông tin nhận hàng" size="small" style={{ marginBottom: 16 }}>
                        <Descriptions column={1} layout="vertical">
                            <Descriptions.Item label="Người nhận">
                                {order.shipping_address?.full_name || order.shipping_address?.name}
                            </Descriptions.Item>
                            <Descriptions.Item label="Số điện thoại">
                                {order.shipping_address?.phone_number || order.shipping_address?.phone}
                            </Descriptions.Item>
                            <Descriptions.Item label="Địa chỉ">
                                {order.shipping_address?.detail_address || order.shipping_address?.address}, {order.shipping_address?.ward}, {order.shipping_address?.district}, {order.shipping_address?.city}
                            </Descriptions.Item>
                        </Descriptions>
                    </Card>

                    <Card title="Thanh toán" size="small">
                        <Descriptions column={1} layout="vertical">
                            <Descriptions.Item label="Phương thức">
                                {order.payment_method === 'cod' ? 'Thanh toán khi nhận hàng (COD)' : order.payment_provider || order.payment_method}
                            </Descriptions.Item>
                            <Descriptions.Item label="Trạng thái thanh toán">
                                <Tag color={order.payment_status === 'completed' ? 'green' : 'orange'}>
                                    {order.payment_status === 'completed' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                                </Tag>
                            </Descriptions.Item>
                        </Descriptions>
                    </Card>
                </Col>
            </Row>
        </Card>
    );
};

export default OrderDetail;
