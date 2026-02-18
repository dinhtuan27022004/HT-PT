import React from 'react';
import { Card, Avatar, Tag, Typography, Row, Col } from 'antd';
import { UserOutlined, ShoppingCartOutlined, DollarOutlined, RightOutlined } from '@ant-design/icons';
import { COLORS } from '../../../theme/colors';

const { Title, Text } = Typography;

const ProfileHeader = ({ user, stats }) => {
    return (
        <Card
            bordered={false}
            className="profile-header-card"
            style={{
                borderRadius: '16px',
                marginBottom: '20px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
            }}
            bodyStyle={{ padding: '24px' }}
        >
            <Row gutter={[24, 24]} align="middle">
                {/* User Basic Info */}
                <Col xs={24} md={8}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <Avatar
                            size={80}
                            src={user?.avatar}
                            icon={<UserOutlined />}
                            style={{ border: `2px solid ${COLORS.PRIMARY}` }}
                        />
                        <div>
                            <Title level={4} style={{ margin: 0, textTransform: 'uppercase' }}>
                                {user?.full_name || 'ANH TUẤN'}
                            </Title>
                            <Text type="secondary">{user?.phone || '086*****97'}</Text>
                            <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
                                <Tag color="#f0f0f0" style={{ color: '#8c8c8c', borderRadius: '12px', border: 'none' }}>
                                    S-NULL
                                </Tag>
                                <Tag color="#52c41a" style={{ borderRadius: '12px', border: 'none' }}>
                                    S-Student
                                </Tag>
                            </div>
                        </div>
                    </div>
                </Col>

                {/* Vertical Divider (Desktop) */}
                <Col md={1} style={{ display: 'flex', justifyContent: 'center' }} className="desktop-only">
                    <div style={{ height: '60px', width: '1px', background: '#f0f0f0' }} />
                </Col>

                {/* Order Stats */}
                <Col xs={12} md={4}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                            background: '#fff1f0',
                            padding: '10px',
                            borderRadius: '50%',
                            color: COLORS.PRIMARY,
                            fontSize: '20px'
                        }}>
                            <ShoppingCartOutlined />
                        </div>
                        <div>
                            <Title level={4} style={{ margin: 0 }}>{stats?.totalOrders || 7}</Title>
                            <Text type="secondary" style={{ fontSize: '12px' }}>Tổng số đơn hàng</Text>
                        </div>
                    </div>
                </Col>

                {/* Vertical Divider (Desktop) */}
                <Col md={1} style={{ display: 'flex', justifyContent: 'center' }} className="desktop-only">
                    <div style={{ height: '60px', width: '1px', background: '#f0f0f0' }} />
                </Col>

                {/* Points Stats */}
                <Col xs={12} md={6}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                            background: '#f6ffed',
                            padding: '10px',
                            borderRadius: '50%',
                            color: '#52c41a',
                            fontSize: '20px'
                        }}>
                            <DollarOutlined />
                        </div>
                        <div>
                            <Title level={4} style={{ margin: 0 }}>
                                {new Intl.NumberFormat('vi-VN').format(stats?.totalSpent || 459000)}đ
                            </Title>
                            <Text type="secondary" style={{ fontSize: '12px' }}>Tổng tiền tích lũy</Text>
                        </div>
                    </div>
                </Col>

                {/* Membership Status (Right Side) */}
                <Col xs={24} md={4} style={{ textAlign: 'right' }}>
                    <Card size="small" style={{ borderRadius: '12px', background: '#fafafa', border: '1px solid #f0f0f0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ textAlign: 'left' }}>
                                <Text type="secondary" style={{ fontSize: '11px' }}>Hạng thành viên</Text>
                                <div style={{ color: COLORS.PRIMARY, fontWeight: 'bold' }}>S-Student</div>
                            </div>
                            <RightOutlined style={{ fontSize: '12px', color: '#bfbfbf' }} />
                        </div>
                    </Card>
                </Col>
            </Row>
        </Card>
    );
};

export default ProfileHeader;
