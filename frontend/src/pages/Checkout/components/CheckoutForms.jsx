import React from 'react';
import { Row, Col, Form, Input, Typography, Button, Radio, Space, Divider, Card, Modal, List, Tag } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const { Title } = Typography;

const CheckoutForms = ({ currentStep, setCurrentStep, form, loading, addresses, selectedAddressId, setSelectedAddressId }) => {
    const [isAddressModalOpen, setIsAddressModalOpen] = React.useState(false);
    return (
        <>
            {currentStep === 0 && (
                <div className="step-content">
                    <Title level={4}>Thông tin giao hàng</Title>

                    {/* Address Selection Logic */}
                    {addresses && addresses.length > 0 && selectedAddressId !== 'new' ? (
                        <div style={{ marginBottom: 24 }}>
                            {selectedAddressId && addresses.find(a => a.id === selectedAddressId) && (
                                <Card
                                    title={<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <span>Địa chỉ nhận hàng</span>
                                        <Button type="link" onClick={() => setIsAddressModalOpen(true)}>Thay đổi</Button>
                                    </div>}
                                    style={{ borderRadius: '8px', border: '1px solid #d9d9d9' }}
                                >
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                        <Typography.Text strong style={{ fontSize: '16px' }}>
                                            {addresses.find(a => a.id === selectedAddressId).recipient}
                                            <span style={{ fontWeight: 'normal', marginLeft: 8 }}>
                                                ({addresses.find(a => a.id === selectedAddressId).phone})
                                            </span>
                                            {addresses.find(a => a.id === selectedAddressId).is_default && <Tag color="blue" style={{ marginLeft: 8 }}>Mặc định</Tag>}
                                        </Typography.Text>
                                        <Typography.Text type="secondary">{addresses.find(a => a.id === selectedAddressId).line1}</Typography.Text>
                                    </div>
                                </Card>
                            )}
                            <Form.Item label="Ghi chú (tùy chọn)" name="notes" style={{ marginTop: 16 }}>
                                <Input.TextArea rows={2} placeholder="Lưu ý cho người giao hàng..." />
                            </Form.Item>
                            <Button type="primary" onClick={() => setCurrentStep(1)} size="large" style={{ marginTop: 16 }}>Tiếp tục</Button>
                        </div>
                    ) : (
                        <>
                            {addresses && addresses.length > 0 && (
                                <div style={{ marginBottom: 16, textAlign: 'right' }}>
                                    <Button type="link" onClick={() => setIsAddressModalOpen(true)}>Chọn từ sổ địa chỉ</Button>
                                </div>
                            )}
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Form.Item label="Họ tên người nhận" name="recipient" rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}>
                                        <Input placeholder="Ví dụ: Nguyễn Văn A" />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item label="Số điện thoại" name="phone" rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}>
                                        <Input placeholder="Ví dụ: 0987654321" />
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Form.Item label="Địa chỉ chi tiết" name="address" rules={[{ required: true, message: 'Vui lòng nhập địa chỉ giao hàng' }]}>
                                <Input.TextArea rows={3} placeholder="Số nhà, tên đường, phường/xã, quận/huyện..." />
                            </Form.Item>
                            <Form.Item label="Ghi chú (tùy chọn)" name="notes">
                                <Input.TextArea rows={2} placeholder="Lưu ý cho người giao hàng..." />
                            </Form.Item>
                            <Button type="primary" onClick={() => form.validateFields(['recipient', 'phone', 'address']).then(() => setCurrentStep(1))} size="large">Tiếp tục</Button>
                        </>
                    )}

                    {/* Address Selection Modal */}
                    <Modal
                        title="Chọn địa chỉ giao hàng"
                        open={isAddressModalOpen}
                        onCancel={() => setIsAddressModalOpen(false)}
                        footer={null}
                    >
                        <List
                            dataSource={[...(addresses || []), { id: 'new', is_new: true }]}
                            renderItem={(item) => {
                                if (item.is_new) {
                                    return (
                                        <List.Item
                                            onClick={() => {
                                                setSelectedAddressId('new');
                                                setIsAddressModalOpen(false);
                                                form.resetFields(['recipient', 'phone', 'address']);
                                            }}
                                            style={{ cursor: 'pointer', border: selectedAddressId === 'new' ? '1px solid #1890ff' : '1px solid #f0f0f0', borderRadius: '8px', padding: '12px', marginBottom: '8px' }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', gap: 8 }}>
                                                <PlusOutlined /> <span>Sử dụng địa chỉ mới</span>
                                            </div>
                                        </List.Item>
                                    );
                                }
                                return (
                                    <List.Item
                                        onClick={() => {
                                            setSelectedAddressId(item.id);
                                            setIsAddressModalOpen(false);
                                        }}
                                        style={{
                                            cursor: 'pointer',
                                            border: selectedAddressId === item.id ? '1px solid #1890ff' : '1px solid #f0f0f0',
                                            borderRadius: '8px',
                                            padding: '12px',
                                            marginBottom: '8px',
                                            backgroundColor: selectedAddressId === item.id ? '#e6f7ff' : '#fff'
                                        }}
                                    >
                                        <div style={{ width: '100%' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                                                <Typography.Text strong>{item.recipient}</Typography.Text>
                                                <Typography.Text type="secondary">| {item.phone}</Typography.Text>
                                                {item.is_default && <Tag color="blue">Mặc định</Tag>}
                                            </div>
                                            <Typography.Text type="secondary" style={{ display: 'block' }}>{item.line1}</Typography.Text>
                                        </div>
                                    </List.Item>
                                );
                            }}
                        />
                    </Modal>
                </div>
            )}

            {currentStep === 1 && (
                <div className="step-content">
                    <Title level={4}>Phương thức thanh toán</Title>
                    <Form.Item name="payment_method">
                        <Radio.Group style={{ width: '100%' }}>
                            <Space direction="vertical" style={{ width: '100%' }}>
                                <Radio.Button value="cod" style={{ width: '100%', height: 'auto', padding: '12px' }}>
                                    <div style={{ fontSize: '16px', fontWeight: 'bold' }}>Thanh toán khi nhận hàng (COD)</div>
                                </Radio.Button>
                            </Space>
                        </Radio.Group>
                    </Form.Item>
                    <Divider />
                    <Space>
                        <Button onClick={() => setCurrentStep(0)} size="large">Quay lại</Button>
                        <Button type="primary" htmlType="submit" size="large" loading={loading}>Xác nhận đặt hàng</Button>
                    </Space>
                </div>
            )}
        </>
    );
};

export default CheckoutForms;
