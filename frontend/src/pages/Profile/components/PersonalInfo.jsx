import React from 'react';
import { Card, Typography, Button, Row, Col } from 'antd';
import { EditOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const PersonalInfo = ({ user, setIsEditModalOpen }) => {
    return (
        <Card bordered={false} style={{ borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
                <Title level={4} style={{ margin: 0 }}>Thông tin cá nhân</Title>
                <Button icon={<EditOutlined />} onClick={() => setIsEditModalOpen(true)}>Chỉnh sửa</Button>
            </div>
            <Row gutter={[16, 24]}>
                <Col span={12}>
                    <Text type="secondary">Họ và tên</Text>
                    <div style={{ fontSize: '16px', fontWeight: '500' }}>{user?.full_name}</div>
                </Col>
                <Col span={12}>
                    <Text type="secondary">Email</Text>
                    <div style={{ fontSize: '16px', fontWeight: '500' }}>{user?.email}</div>
                </Col>
                <Col span={12}>
                    <Text type="secondary">Số điện thoại</Text>
                    <div style={{ fontSize: '16px', fontWeight: '500' }}>{user?.phone || 'Chưa cập nhật'}</div>
                </Col>
                <Col span={12}>
                    <Text type="secondary">Giới tính</Text>
                    <div style={{ fontSize: '16px', fontWeight: '500' }}>{user?.gender === 'male' ? 'Nam' : user?.gender === 'female' ? 'Nữ' : 'Khác'}</div>
                </Col>
                <Col span={12}>
                    <Text type="secondary">Ngày sinh</Text>
                    <div style={{ fontSize: '16px', fontWeight: '500' }}>
                        {user?.date_of_birth ? new Date(user.date_of_birth).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}
                    </div>
                </Col>
            </Row>
        </Card>
    );
};

export default PersonalInfo;
