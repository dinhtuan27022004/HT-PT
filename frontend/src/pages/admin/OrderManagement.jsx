import React, { useState, useEffect } from 'react';
import {
    Table,
    Button,
    Space,
    Typography,
    Card,
    Select,
    Tag,
    Input,
    App,
    Tooltip,
    DatePicker
} from 'antd';
import {
    CheckCircleOutlined,
    CloseCircleOutlined,
    CarOutlined,
    EyeOutlined,
    ArrowLeftOutlined
} from '@ant-design/icons';
import orderService from '../../services/order.service';
import categoryService from '../../services/category.service';

const { Title } = Typography;
const { Option } = Select;

const OrderManagement = () => {
    const { message } = App.useApp();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [statusFilter, setStatusFilter] = useState('');
    const [searchText, setSearchText] = useState('');
    const [viewMode, setViewMode] = useState('list'); // 'list' | 'detail'
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [categoryFilter, setCategoryFilter] = useState('');
    const [startDate, setStartDate] = useState(null);
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        fetchOrders();
    }, [statusFilter, categoryFilter, startDate]);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await categoryService.getAllCategories();
            if (response.status === 'success') {
                setCategories(response.data);
            }
        } catch (error) {
            console.error('Fetch categories error:', error);
        }
    };

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const response = await orderService.getAllOrders({
                status: statusFilter || undefined,
                search: searchText || undefined,
                category_id: categoryFilter || undefined,
                startDate: startDate ? startDate.startOf('day').toISOString() : undefined
            });
            if (response.status === 'success') {
                setOrders(response.data);
            } else {
                setOrders([]);
                message.error('Không thể tải danh sách đơn hàng');
            }
        } catch (error) {
            console.error('Fetch Orders Error:', error);
            message.error('Có lỗi xảy ra khi tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        fetchOrders();
    };

    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            setLoading(true);
            const response = await orderService.updateOrderStatus(orderId, newStatus);
            if (response.status === 'success') {
                message.success('Cập nhật trạng thái thành công');
                fetchOrders(); // Refresh list
            } else {
                message.error(response.message || 'Cập nhật thất bại');
            }
        } catch (error) {
            console.error('Update Status Error:', error);
            message.error('Lỗi khi cập nhật trạng thái');
        } finally {
            setLoading(false);
        }
    };

    const getStatusTag = (status) => {
        const statusMap = {
            pending: { color: 'orange', text: 'Chờ xử lý' },
            confirmed: { color: 'blue', text: 'Đã xác nhận' },
            shipping: { color: 'cyan', text: 'Đang giao' },
            completed: { color: 'green', text: 'Hoàn thành' },
            cancelled: { color: 'red', text: 'Đã hủy' }
        };

        const config = statusMap[status] || { color: 'default', text: status };
        return <Tag color={config.color}>{config.text}</Tag>;
    };

    const columns = [
        {
            title: 'Hình ảnh',
            dataIndex: 'first_item_image',
            key: 'first_item_image',
            width: 80,
            render: (image) => (
                image ? (
                    <img src={image} alt="Sản phẩm" style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 4, border: '1px solid #f0f0f0' }} />
                ) : (
                    <div style={{ width: 40, height: 40, background: '#f5f5f5', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bfbfbf', fontSize: '11px' }}>No Pic</div>
                )
            )
        },
        {
            title: 'Mã đơn hàng',
            dataIndex: 'order_code',
            key: 'order_code',
            render: (text) => <strong>{text}</strong>,
        },
        {
            title: 'Khách hàng',
            dataIndex: 'customer_name',
            key: 'customer_name',
            render: (text, record) => (
                <div>
                    <div>{text}</div>
                    <small style={{ color: '#8c8c8c' }}>{record.customer_email}</small>
                </div>
            )
        },
        {
            title: 'Tổng tiền',
            dataIndex: 'total',
            key: 'total',
            render: (total) => `${Number(total).toLocaleString('vi-VN')} đ`,
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => getStatusTag(status),
        },
        {
            title: 'Ngày đặt',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (date) => new Date(date).toLocaleString('vi-VN'),
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <Space size="small">
                    {record.status === 'pending' && (
                        <Tooltip title="Xác nhận đơn hàng">
                            <Button
                                type="primary"
                                icon={<CheckCircleOutlined />}
                                onClick={() => handleUpdateStatus(record.id, 'confirmed')}
                                size="small"
                                style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                            />
                        </Tooltip>
                    )}
                    {record.status === 'confirmed' && (
                        <Tooltip title="Giao hàng">
                            <Button
                                type="primary"
                                icon={<CarOutlined />}
                                onClick={() => handleUpdateStatus(record.id, 'shipping')}
                                size="small"
                                style={{ backgroundColor: '#1890ff', borderColor: '#1890ff' }}
                            />
                        </Tooltip>
                    )}
                    {record.status === 'shipping' && (
                        <Tooltip title="Hoàn thành đơn hàng">
                            <Button
                                type="primary"
                                icon={<CheckCircleOutlined />}
                                onClick={() => handleUpdateStatus(record.id, 'completed')}
                                size="small"
                                style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                            />
                        </Tooltip>
                    )}
                    {['pending', 'confirmed'].includes(record.status) && (
                        <Tooltip title="Hủy đơn hàng">
                            <Button
                                type="primary"
                                danger
                                icon={<CloseCircleOutlined />}
                                onClick={() => handleUpdateStatus(record.id, 'cancelled')}
                                size="small"
                            />
                        </Tooltip>
                    )}
                    {/* View Detail Button could be added here if Detail Modal is implemented */}
                </Space>
            ),
        },
    ];

    return (
        <div>
            {viewMode === 'list' ? (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                        <Title level={3} style={{ margin: 0 }}>Quản lý Đơn hàng</Title>
                    </div>

                    <Card style={{ marginBottom: 16 }}>
                        <Space wrap>
                            <Select
                                placeholder="Trạng thái"
                                style={{ width: 140 }}
                                allowClear
                                onChange={(value) => setStatusFilter(value || '')}
                                value={statusFilter || undefined}
                            >
                                <Option value="pending">Chờ xử lý</Option>
                                <Option value="confirmed">Đã xác nhận</Option>
                                <Option value="shipping">Đang giao</Option>
                                <Option value="completed">Hoàn thành</Option>
                                <Option value="cancelled">Đã hủy</Option>
                            </Select>

                            <Select
                                placeholder="Lọc theo danh mục"
                                style={{ width: 170 }}
                                allowClear
                                onChange={(value) => setCategoryFilter(value || '')}
                                value={categoryFilter || undefined}
                            >
                                {categories.map(cat => (
                                    <Option key={cat.id} value={cat.id}>{cat.name}</Option>
                                ))}
                            </Select>

                            <DatePicker 
                                placeholder="Từ ngày đặt"
                                style={{ width: 150 }}
                                value={startDate}
                                onChange={(date) => setStartDate(date)}
                                format="DD/MM/YYYY"
                            />

                            <Input.Search
                                placeholder="Tìm theo mã hàng / khách hàng"
                                style={{ width: 230 }}
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                onSearch={handleSearch}
                                enterButton
                            />
                        </Space>
                    </Card>

                    <Table
                        columns={columns}
                        dataSource={orders}
                        rowKey="id"
                        loading={loading}
                        pagination={{ pageSize: 10 }}
                        onRow={(record) => ({
                            onClick: () => {
                                setSelectedOrder(record);
                                setViewMode('detail');
                            },
                            style: { cursor: 'pointer' }
                        })}
                    />
                </div>
            ) : (
                <div>
                    <Button 
                        icon={<ArrowLeftOutlined />} 
                        onClick={() => setViewMode('list')} 
                        style={{ marginBottom: 16 }}
                    >
                        Quay lại danh sách
                    </Button>

                    {selectedOrder && (
                        <Card title={<Title level={4} style={{ margin: 0 }}>Chi tiết Đơn hàng: {selectedOrder.order_code}</Title>}>
                            <div style={{ padding: '10px 0' }}>
                                <Typography.Paragraph style={{ fontSize: '16px' }}>
                                    <strong>Trạng thái:</strong> {getStatusTag(selectedOrder.status)}
                                </Typography.Paragraph>

                                <Typography.Title level={5} style={{ marginTop: 24 }}>Thông tin Khách hàng</Typography.Title>
                                <div style={{ background: '#fafafa', padding: 12, borderRadius: 4, marginBottom: 16 }}>
                                    <div><strong>Tên khách hàng:</strong> {selectedOrder.customer_name}</div>
                                    <div style={{ marginTop: 4 }}><strong>Email:</strong> {selectedOrder.customer_email}</div>
                                </div>

                                <Typography.Title level={5}>Địa chỉ giao hàng</Typography.Title>
                                <div style={{ background: '#fafafa', padding: 12, borderRadius: 4, marginBottom: 16 }}>
                                    {(() => {
                                        try {
                                            const sAddr = typeof selectedOrder.shipping_address === 'string' ? JSON.parse(selectedOrder.shipping_address) : selectedOrder.shipping_address;
                                            return sAddr ? (
                                                <div>
                                                    <div><strong>Người nhận:</strong> {sAddr.recipient} - {sAddr.phone}</div>
                                                    <div style={{ marginTop: 4 }}>
                                                        <strong>Địa chỉ:</strong> {sAddr.line1}{sAddr.ward ? `, ${sAddr.ward}` : ''}{sAddr.district ? `, ${sAddr.district}` : ''}{sAddr.province ? `, ${sAddr.province}` : ''}
                                                    </div>
                                                </div>
                                            ) : '-';
                                        } catch (e) {
                                            return selectedOrder.shipping_address || '-';
                                        }
                                    })()}
                                </div>

                                <Typography.Title level={5}>Sản phẩm đã mua</Typography.Title>
                                {selectedOrder.items && selectedOrder.items.length > 0 ? (
                                    <Table 
                                        dataSource={selectedOrder.items}
                                        rowKey="id"
                                        pagination={false}
                                        size="small"
                                        columns={[
                                            {
                                                title: 'Sản phẩm',
                                                dataIndex: 'name',
                                                key: 'name',
                                                render: (text, item) => (
                                                    <div style={{ display: 'flex', alignItems: 'center' }}>
                                                        {item.image && <img src={item.image} alt={text} style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: 4, marginRight: 8, border: '1px solid #f0f0f0' }} />}
                                                        <span>{text}</span>
                                                    </div>
                                                )
                                            },
                                            { title: 'Số lượng', dataIndex: 'quantity', key: 'quantity', width: 90, align: 'center' },
                                            { 
                                                title: 'Đơn giá', 
                                                dataIndex: 'unit_price', 
                                                key: 'unit_price',
                                                align: 'right',
                                                render: (price) => `${Number(price).toLocaleString('vi-VN')} đ`
                                            },
                                            { 
                                                title: 'Thành tiền', 
                                                dataIndex: 'line_total', 
                                                key: 'line_total',
                                                align: 'right',
                                                render: (tot) => <strong style={{ color: '#f5222d' }}>{Number(tot).toLocaleString('vi-VN')} đ</strong>
                                            }
                                        ]}
                                    />
                                ) : <div>Không có thông tin sản phẩm</div>}

                                <div style={{ marginTop: 24, textAlign: 'right', fontSize: '14px', color: '#595959' }}>
                                    <div>Tạm tính: <strong>{Number(selectedOrder.subtotal).toLocaleString('vi-VN')} đ</strong></div>
                                    <div style={{ marginTop: 8 }}>Phí vận chuyển: <strong>{Number(selectedOrder.shipping_fee || 0).toLocaleString('vi-VN')} đ</strong></div>
                                    <div style={{ marginTop: 12, fontSize: '16px', color: '#262626' }}>
                                        <strong>Tổng cộng: </strong>
                                        <span style={{ color: '#f5222d', fontWeight: 'bold', fontSize: '18px' }}>
                                            {Number(selectedOrder.total).toLocaleString('vi-VN')} đ
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    )}
                </div>
            )}
        </div>
    );
};

export default OrderManagement;
