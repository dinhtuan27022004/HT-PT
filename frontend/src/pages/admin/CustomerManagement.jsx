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
    Popconfirm,
    Modal
} from 'antd';
import {
    UnlockOutlined,
    LockOutlined,
    UserSwitchOutlined,
    ArrowLeftOutlined
} from '@ant-design/icons';
import userService from '../../services/user.service';

const { Title } = Typography;
const { Option } = Select;

const CustomerManagement = () => {
    const { message } = App.useApp();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [statusFilter, setStatusFilter] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [searchText, setSearchText] = useState('');
    const [viewMode, setViewMode] = useState('list'); // 'list' | 'detail'
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);
    const [expandedOrders, setExpandedOrders] = useState([]);

    const toggleOrderExpand = (orderId) => {
        setExpandedOrders(prev => 
            prev.includes(orderId) ? prev.filter(id => id !== orderId) : [...prev, orderId]
        );
    };

    useEffect(() => {
        fetchUsers();
    }, [statusFilter, roleFilter]);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const response = await userService.getAllUsers({
                status: statusFilter || undefined,
                role: roleFilter || undefined,
                search: searchText || undefined
            });
            if (response.status === 'success') {
                setUsers(response.data);
            } else {
                setUsers([]);
                message.error('Không thể tải danh sách khách hàng');
            }
        } catch (error) {
            console.error('Fetch Users Error:', error);
            message.error('Có lỗi xảy ra khi tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = () => {
        fetchUsers();
    };

    const handleUpdateStatus = async (userId, newStatus) => {
        try {
            setLoading(true);
            const response = await userService.updateUserStatus(userId, { status: newStatus });
            if (response.status === 'success') {
                message.success('Cập nhật trạng thái thành công');
                fetchUsers(); // Refresh list
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

    const handleToggleRole = async (userId, currentRole) => {
        const newRole = currentRole === 'admin' ? 'user' : 'admin';
        try {
            setLoading(true);
            const response = await userService.updateUserStatus(userId, { role: newRole });
            if (response.status === 'success') {
                message.success('Cập nhật vai trò thành công');
                fetchUsers();
            } else {
                message.error(response.message || 'Cập nhật thất bại');
            }
        } catch (error) {
            console.error('Toggle Role Error:', error);
            message.error('Lỗi khi cập nhật vai trò');
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetail = async (record) => {
        setSelectedCustomer(record);
        setViewMode('detail');
        setDetailLoading(true);
        try {
            const response = await userService.getUserDetail(record.id);
            if (response.status === 'success') {
                setSelectedCustomer(prev => ({ ...prev, ...response.data }));
            }
        } catch (error) {
            console.error('Fetch User Detail Error:', error);
            message.error('Không thể tải chi tiết khách hàng');
        } finally {
            setDetailLoading(false);
        }
    };

    const getOrderStatusTag = (status) => {
        const statusMap = {
            pending: { color: 'gold', text: 'Chờ xử lý' },
            confirmed: { color: 'blue', text: 'Đã xác nhận' },
            shipping: { color: 'purple', text: 'Đang giao' },
            completed: { color: 'green', text: 'Hoàn thành' },
            cancelled: { color: 'red', text: 'Đã hủy' }
        };

        const config = statusMap[status] || { color: 'default', text: status };
        return <Tag color={config.color}>{config.text}</Tag>;
    };

    const getStatusTag = (status) => {
        const statusMap = {
            active: { color: 'green', text: 'Hoạt động' },
            inactive: { color: 'red', text: 'Bị khóa' }
        };

        const config = statusMap[status] || { color: 'default', text: status };
        return <Tag color={config.color}>{config.text}</Tag>;
    };

    const getRoleTag = (role) => {
        const roleMap = {
            admin: { color: 'magenta', text: 'Admin' },
            user: { color: 'blue', text: 'Người dùng' }
        };

        const config = roleMap[role] || { color: 'default', text: role };
        return <Tag color={config.color}>{config.text}</Tag>;
    };

    const columns = [
        {
            title: 'Họ tên',
            dataIndex: 'full_name',
            key: 'full_name',
            render: (text) => <strong>{text}</strong>,
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Số điện thoại',
            dataIndex: 'phone',
            key: 'phone',
            render: (text) => text || '-',
        },
        {
            title: 'Vai trò',
            dataIndex: 'role',
            key: 'role',
            render: (role) => getRoleTag(role),
        },
        {
            title: 'Tổng đơn hàng',
            dataIndex: 'total_orders',
            key: 'total_orders',
            render: (text) => <strong>{text || 0}</strong>,
            sorter: (a, b) => (a.total_orders || 0) - (b.total_orders || 0),
        },
        {
            title: 'Tổng chi tiêu',
            dataIndex: 'total_spent',
            key: 'total_spent',
            render: (total) => `${Number(total || 0).toLocaleString('vi-VN')} đ`,
            sorter: (a, b) => (a.total_spent || 0) - (b.total_spent || 0),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => getStatusTag(status),
        },
        {
            title: 'Ngày tham gia',
            dataIndex: 'created_at',
            key: 'created_at',
            render: (date) => new Date(date).toLocaleDateString('vi-VN'),
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <Space size="small">
                    {record.status === 'active' ? (
                        <Popconfirm
                            title="Khóa tài khoản"
                            description="Bạn có chắc chắn muốn khóa tài khoản này?"
                            onConfirm={() => handleUpdateStatus(record.id, 'inactive')}
                            okText="Khóa"
                            cancelText="Hủy"
                            okType="danger"
                        >
                            <Tooltip title="Khóa tài khoản">
                                <Button
                                    type="primary"
                                    danger
                                    icon={<LockOutlined />}
                                    size="small"
                                />
                            </Tooltip>
                        </Popconfirm>
                    ) : (
                        <Tooltip title="Kích hoạt tài khoản">
                            <Button
                                type="primary"
                                icon={<UnlockOutlined />}
                                onClick={() => handleUpdateStatus(record.id, 'active')}
                                size="small"
                                style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                            />
                        </Tooltip>
                    )}

                    <Popconfirm
                        title="Đổi vai trò"
                        description={`Bạn có muốn đổi vai trò sang ${record.role === 'admin' ? 'Người dùng' : 'Admin'}?`}
                        onConfirm={() => handleToggleRole(record.id, record.role)}
                        okText="Đồng ý"
                        cancelText="Hủy"
                    >
                        <Tooltip title="Đổi vai trò">
                            <Button
                                type="default"
                                icon={<UserSwitchOutlined />}
                                size="small"
                            />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div>
            {viewMode === 'list' ? (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                        <Title level={3} style={{ margin: 0 }}>Quản lý Khách hàng</Title>
                    </div>

                    <Card style={{ marginBottom: 16 }}>
                        <Space wrap>
                            <Select
                                placeholder="Lọc theo vai trò"
                                style={{ width: 160 }}
                                allowClear
                                onChange={(value) => setRoleFilter(value || '')}
                                value={roleFilter || undefined}
                            >
                                <Option value="user">Người dùng</Option>
                                <Option value="admin">Admin</Option>
                            </Select>

                            <Select
                                placeholder="Lọc theo trạng thái"
                                style={{ width: 160 }}
                                allowClear
                                onChange={(value) => setStatusFilter(value || '')}
                                value={statusFilter || undefined}
                            >
                                <Option value="active">Hoạt động</Option>
                                <Option value="inactive">Bị khóa</Option>
                            </Select>

                            <Input.Search
                                placeholder="Tìm theo tên / Email / SĐT"
                                style={{ width: 250 }}
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                onSearch={handleSearch}
                                enterButton
                            />
                        </Space>
                    </Card>

                    <Table
                        columns={columns}
                        dataSource={users}
                        rowKey="id"
                        loading={loading}
                        pagination={{ pageSize: 10 }}
                        onRow={(record) => ({
                            onClick: () => handleViewDetail(record),
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

                    {selectedCustomer && (
                        <Card title={<Title level={4} style={{ margin: 0 }}>Thông tin chi tiết: {selectedCustomer.full_name}</Title>}>
                            <div style={{ padding: '10px 0' }}>
                                <Typography.Paragraph><strong>Họ tên:</strong> {selectedCustomer.full_name}</Typography.Paragraph>
                                <Typography.Paragraph><strong>Email:</strong> {selectedCustomer.email}</Typography.Paragraph>
                                <Typography.Paragraph><strong>SĐT:</strong> {selectedCustomer.phone || '-'}</Typography.Paragraph>
                                <Typography.Paragraph><strong>Giới tính:</strong> {selectedCustomer.gender === 'male' ? 'Nam' : selectedCustomer.gender === 'female' ? 'Nữ' : '-'}</Typography.Paragraph>
                                <Typography.Paragraph><strong>Ngày sinh:</strong> {selectedCustomer.date_of_birth ? new Date(selectedCustomer.date_of_birth).toLocaleDateString('vi-VN') : '-'}</Typography.Paragraph>
                                <Typography.Paragraph><strong>Vai trò:</strong> {getRoleTag(selectedCustomer.role)}</Typography.Paragraph>
                                <Typography.Paragraph><strong>Trạng thái:</strong> {getStatusTag(selectedCustomer.status)}</Typography.Paragraph>
                                <Typography.Paragraph><strong>Ngày tham gia:</strong> {new Date(selectedCustomer.created_at).toLocaleDateString('vi-VN')}</Typography.Paragraph>
                                <div style={{ marginTop: 12, padding: '12px', background: '#f5f5f5', borderRadius: 4 }}>
                                    <strong>Đã mua:</strong> <span style={{ color: '#52c41a', fontWeight: 'bold' }}>{selectedCustomer.total_orders || 0} đơn</span> 
                                    <span style={{ margin: '0 12px' }}>|</span> 
                                    <strong>Chi tiêu:</strong> <span style={{ color: '#f5222d', fontWeight: 'bold' }}>{Number(selectedCustomer.total_spent || 0).toLocaleString('vi-VN')} đ</span>
                                </div>

                                <Typography.Title level={5} style={{ marginTop: 24 }}>Danh sách địa chỉ</Typography.Title>
                                {detailLoading ? 'Đang tải địa chỉ...' : (
                                    selectedCustomer.addresses && selectedCustomer.addresses.length > 0 ? (
                                        <ul style={{ paddingLeft: 20 }}>
                                            {selectedCustomer.addresses.map(addr => (
                                                <li key={addr.id} style={{ marginBottom: 12, paddingBottom: 12, borderBottom: '1px solid #f0f0f0' }}>
                                                    <div><strong>{addr.recipient}</strong> - {addr.phone} {addr.is_default && <Tag color="blue" style={{ marginLeft: 8 }}>Mặc định</Tag>}</div>
                                                    <div style={{ color: '#595959', marginTop: 4 }}>{addr.line1}{addr.ward ? `, ${addr.ward}` : ''}{addr.district ? `, ${addr.district}` : ''}{addr.province ? `, ${addr.province}` : ''}</div>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : <div>Chưa có địa chỉ nào</div>
                                )}

                                <Typography.Title level={5} style={{ marginTop: 24 }}>Lịch sử đơn hàng</Typography.Title>
                                {detailLoading ? 'Đang tải đơn hàng...' : (
                                    selectedCustomer.orders && selectedCustomer.orders.length > 0 ? (
                                        <ul style={{ paddingLeft: 0, listStyle: 'none' }}>
                                            {selectedCustomer.orders.map(order => {
                                                const isExpanded = expandedOrders.includes(order.id);
                                                let shippingAddr = '-';
                                                try {
                                                    const sAddr = typeof order.shipping_address === 'string' ? JSON.parse(order.shipping_address) : order.shipping_address;
                                                    shippingAddr = sAddr ? `${sAddr.recipient} - ${sAddr.phone}, ${sAddr.line1}${sAddr.ward ? `, ${sAddr.ward}` : ''}${sAddr.district ? `, ${sAddr.district}` : ''}${sAddr.province ? `, ${sAddr.province}` : ''}` : '-';
                                                } catch (err) {
                                                    shippingAddr = typeof order.shipping_address === 'string' ? order.shipping_address : '-';
                                                }

                                                return (
                                                    <li key={order.id} style={{ marginBottom: 12, padding: '12px', border: '1px solid #f0f0f0', borderRadius: 4, background: '#fff' }}>
                                                        <div 
                                                            style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
                                                            onClick={() => toggleOrderExpand(order.id)}
                                                        >
                                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                                {order.first_item_image ? (
                                                                    <img src={order.first_item_image} alt="product" style={{ width: 44, height: 44, objectFit: 'cover', borderRadius: 4, marginRight: 12, border: '1px solid #f0f0f0' }} />
                                                                ) : (
                                                                    <div style={{ width: 44, height: 44, background: '#f5f5f5', borderRadius: 4, marginRight: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bfbfbf', fontSize: '11px' }}>No Pic</div>
                                                                )}
                                                                <div>
                                                                    <div><strong>Đơn hàng: {order.order_code || `#${order.id}`}</strong></div>
                                                                    <div style={{ color: '#8c8c8c', fontSize: '12px' }}>{new Date(order.created_at).toLocaleString('vi-VN')}</div>
                                                                </div>
                                                            </div>
                                                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                                                {getOrderStatusTag(order.status)}
                                                                <strong style={{ marginLeft: 12, color: '#f5222d', minWidth: '90px', textAlign: 'right' }}>{Number(order.total).toLocaleString('vi-VN')} đ</strong>
                                                            </div>
                                                        </div>

                                                        {isExpanded && (
                                                            <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #f0f0f0' }}>
                                                                <div style={{ fontSize: '13px', color: '#595959', marginBottom: 12, padding: '8px', background: '#fafafa', borderRadius: 4 }}>
                                                                    <strong>Địa chỉ giao hàng:</strong> {shippingAddr}
                                                                </div>
                                                                {order.items && order.items.length > 0 ? (
                                                                    <Table 
                                                                        dataSource={order.items}
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
                                                                                        {item.image && <img src={item.image} alt={text} style={{ width: 32, height: 32, objectFit: 'cover', borderRadius: 2, marginRight: 8, border: '1px solid #f0f0f0' }} />}
                                                                                        <span style={{ fontSize: '13px' }}>{text}</span>
                                                                                    </div>
                                                                                )
                                                                            },
                                                                            { title: 'SL', dataIndex: 'quantity', key: 'quantity', width: 40, align: 'center' },
                                                                            { 
                                                                                title: 'Giá', 
                                                                                dataIndex: 'unit_price', 
                                                                                key: 'unit_price',
                                                                                width: 100,
                                                                                align: 'right',
                                                                                render: (price) => `${Number(price).toLocaleString('vi-VN')}đ`
                                                                            },
                                                                            { 
                                                                                title: 'Tổng', 
                                                                                dataIndex: 'line_total', 
                                                                                key: 'line_total',
                                                                                width: 110,
                                                                                align: 'right',
                                                                                render: (tot) => <strong style={{ color: '#262626' }}>{Number(tot).toLocaleString('vi-VN')}đ</strong>
                                                                            }
                                                                        ]}
                                                                        style={{ border: '1px solid #f0f0f0', borderRadius: 4 }}
                                                                    />
                                                                 ) : <div>Không có chi tiết sản phẩm</div>}

                                                                <div style={{ marginTop: 16, textAlign: 'right', fontSize: '13px', color: '#595959' }}>
                                                                    <div>Tạm tính: <strong>{Number(order.subtotal).toLocaleString('vi-VN')} đ</strong></div>
                                                                    <div style={{ marginTop: 4 }}>Phí vận chuyển: <strong>{Number(order.shipping_fee || 0).toLocaleString('vi-VN')} đ</strong></div>
                                                                    <div style={{ marginTop: 8, fontSize: '15px', color: '#262626' }}>
                                                                        <strong>Tổng cộng: </strong>
                                                                        <span style={{ color: '#f5222d', fontWeight: 'bold' }}>
                                                                            {Number(order.total).toLocaleString('vi-VN')} đ
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    ) : <div>Chưa có đơn hàng nào</div>
                                )}
                            </div>
                        </Card>
                    )}
                </div>
            )}
        </div>
    );
};

export default CustomerManagement;
