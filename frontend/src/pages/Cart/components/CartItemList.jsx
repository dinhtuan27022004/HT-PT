import { List, Row, Col, Typography, InputNumber, Button, Checkbox, Divider } from 'antd';
import { DeleteOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { COLORS } from '../../../theme/colors';

const { Text } = Typography;

const CartItemList = ({ items, updateQuantity, removeFromCart, formatPrice, selectedRowKeys, onSelectChange }) => {
    const navigate = useNavigate();

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            onSelectChange(items.map(item => item.variant_id));
        } else {
            onSelectChange([]);
        }
    };

    const handleSelect = (id, checked) => {
        if (checked) {
            onSelectChange([...selectedRowKeys, id]);
        } else {
            onSelectChange(selectedRowKeys.filter(key => key !== id));
        }
    };

    const allSelected = items.length > 0 && selectedRowKeys.length === items.length;
    const indeterminate = selectedRowKeys.length > 0 && selectedRowKeys.length < items.length;

    return (
        <div>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center' }}>
                <Checkbox
                    checked={allSelected}
                    indeterminate={indeterminate}
                    onChange={handleSelectAll}
                >
                    Chọn tất cả ({items.length} sản phẩm)
                </Checkbox>
            </div>
            <List
                itemLayout="horizontal"
                dataSource={items}
                renderItem={(item) => (
                    <div key={item.variant_id} style={{ padding: '20px', borderBottom: '1px solid #f0f0f0' }}>
                        <Row gutter={16} align="middle">
                            <Col xs={2} sm={1} style={{ textAlign: 'center' }}>
                                <Checkbox
                                    checked={selectedRowKeys.includes(item.variant_id)}
                                    onChange={(e) => handleSelect(item.variant_id, e.target.checked)}
                                />
                            </Col>
                            <Col xs={4} sm={3}>
                                <img src={item.image_url || 'https://via.placeholder.com/100'} alt={item.product_name} style={{ width: '100%', borderRadius: '8px', objectFit: 'cover', aspectRatio: '1/1' }} />
                            </Col>
                            <Col xs={12} sm={9}>
                                <div style={{ paddingRight: '12px' }}>
                                    <Link to={`/product/${item.product_id}`} style={{ color: 'inherit' }}>
                                        <Text strong style={{ fontSize: '16px', display: 'block' }}>{item.product_name}</Text>
                                    </Link>
                                    <Text type="secondary" style={{ fontSize: '13px' }}>Phân loại: {item.variant_name || 'Mặc định'}</Text>
                                </div>
                            </Col>
                            <Col xs={6} sm={4} style={{ textAlign: 'right' }}>
                                <Text strong style={{ fontSize: '16px', color: COLORS.PRIMARY }}>{formatPrice(item.price)}</Text>
                            </Col>
                            <Col xs={12} sm={4} style={{ textAlign: 'center' }}>
                                <InputNumber min={1} value={item.quantity} onChange={(val) => updateQuantity(item.variant_id, val)} style={{ width: '60px' }} />
                            </Col>
                            <Col xs={12} sm={3} style={{ textAlign: 'right' }}>
                                <Button type="text" danger icon={<DeleteOutlined />} onClick={() => removeFromCart(item.variant_id)} />
                            </Col>
                        </Row>
                    </div>
                )}
                footer={
                    <div style={{ padding: '20px' }}>
                        <Button type="link" icon={<ArrowLeftOutlined />} onClick={() => navigate('/')}>Tiếp tục mua sắm</Button>
                    </div>
                }
            />
        </div>
    );
};

export default CartItemList;
