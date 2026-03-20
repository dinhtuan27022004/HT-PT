import React from 'react';
import { Card, Row, Col, Form, Input, Select } from 'antd';

const { Option } = Select;

const BasicInfoSection = ({ categories, filteredBrands, onCategoryChange }) => {
    return (
        <Card title="Thông tin chung" style={{ marginBottom: 24, borderRadius: 12 }}>
            <Row gutter={16}>
                <Col span={16}>
                    <Form.Item
                        name="name"
                        label="Tên sản phẩm"
                        rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm' }]}
                    >
                        <Input size="large" placeholder="Nhập tên sản phẩm" />
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item
                        name="sku"
                        label="Mã SKU (Gốc)"
                        rules={[{ required: true, message: 'Vui lòng nhập SKU gốc' }]}
                    >
                        <Input size="large" placeholder="SKU-001" />
                    </Form.Item>
                </Col>
            </Row>

            <Row gutter={16}>
                <Col span={8}>
                    <Form.Item
                        name="category_id"
                        label="Danh mục"
                        rules={[{ required: true, message: 'Chọn danh mục' }]}
                    >
                        <Select
                            size="large"
                            placeholder="Chọn danh mục"
                            onChange={onCategoryChange}
                        >
                            {categories.map(c => (
                                <Option key={c.id} value={c.id}>{c.name}</Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item
                        name="brand_id"
                        label="Thương hiệu"
                        rules={[{ required: true, message: 'Chọn thương hiệu' }]}
                    >
                        <Select
                            size="large"
                            placeholder="Chọn thương hiệu"
                            disabled={!filteredBrands || filteredBrands.length === 0}
                        >
                            {filteredBrands && filteredBrands.map(b => (
                                <Option key={b.id} value={b.id}>{b.name}</Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Col>
                <Col span={8}>
                    <Form.Item name="status" label="Trạng thái">
                        <Select size="large">
                            <Option value="active">Đang kinh doanh</Option>
                            <Option value="inactive">Ngừng kinh doanh</Option>
                        </Select>
                    </Form.Item>
                </Col>
            </Row>

            <Form.Item name="description" label="Mô tả">
                <Input.TextArea rows={4} showCount maxLength={2000} placeholder="Nhập mô tả sản phẩm" />
            </Form.Item>
        </Card>
    );
};

export default BasicInfoSection;
