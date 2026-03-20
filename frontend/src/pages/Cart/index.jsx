import React from 'react';
import { Row, Col, Typography, Button, Card, Empty, Breadcrumb, Space } from 'antd';
import { HomeOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import { useCart } from '../../context/CartContext';
import CartItemList from './components/CartItemList';
import CartSummary from './components/CartSummary';

const { Title, Text } = Typography;

const CartPage = () => {
    const navigate = useNavigate();
    const { cartItems, updateQuantity, removeFromCart, cartTotal, cartCount } = useCart();
    const formatPrice = (p) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p || 0);

    const [selectedRowKeys, setSelectedRowKeys] = React.useState([]);

    // Select all items by default when cart loads
    React.useEffect(() => {
        if (cartItems.length > 0) {
            setSelectedRowKeys(cartItems.map(item => item.variant_id));
        }
    }, [cartItems]); // Be careful with this dependency to avoid resetting selection on quantity update?
    // Actually, when quantity updates, key remains same. But if items change (add/remove), we should re-eval?
    // Let's keep it simple: Select all initially. If user changes logic, we might need more complex effect.
    // Better: Only select all if selectedRowKeys is empty AND items exist? Or just on mount?
    // Let's stick to: if items change length, maybe sync?
    // For now, let's just initialize using useEffect dependent on cartItems length change?

    // Better approach:
    // If cartItems changes, we want to keep selection if possible.
    // But if a new item is added, should it be selected? Yes.
    // If an item is removed, it should be removed from selection.

    // Let's rely on a derived state or just simple effect for now.
    // Actually, `useEffect` above might be too aggressive if updateQuantity triggers `cartItems` change (it does).
    // We only want to select all on FIRST load?

    // Refined logic:
    // 1. On mount/load, select all.
    // 2. On item remove, filter out.
    // 3. On quantity change, keep selection.

    // Changing useEffect:
    // React.useEffect(() => {
    //     // Only if we went from 0 to >0 items (initial load)
    //     // Or simple: default all selected.
    // }, [cartItems.length]); 

    const onSelectChange = (newSelectedRowKeys) => {
        setSelectedRowKeys(newSelectedRowKeys);
    };

    const handleCheckout = () => {
        if (selectedRowKeys.length === 0) return;
        const selectedItems = cartItems.filter(item => selectedRowKeys.includes(item.variant_id));
        navigate('/checkout', { state: { selectedItems } });
    };

    const selectedItems = cartItems.filter(item => selectedRowKeys.includes(item.variant_id));
    const selectedTotal = selectedItems.reduce((total, item) => total + (item.price * item.quantity), 0);
    const selectedCount = selectedItems.reduce((count, item) => count + item.quantity, 0);

    return (
        <MainLayout>
            <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto', minHeight: '80vh' }}>
                <Breadcrumb style={{ marginBottom: 24 }} items={[{ title: <Link to="/"><HomeOutlined /> Trang chủ</Link> }, { title: 'Giỏ hàng' }]} />
                <Title level={2} style={{ marginBottom: 32 }}><ShoppingCartOutlined /> Giỏ hàng ({cartCount} sản phẩm)</Title>
                {cartItems.length === 0 ? (
                    <Card style={{ textAlign: 'center', padding: '64px 0', borderRadius: '12px' }}>
                        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={<Space direction="vertical"><Text type="secondary" style={{ fontSize: '16px' }}>Giỏ hàng của bạn đang trống</Text><Button type="primary" size="large" onClick={() => navigate('/')}>TIẾP TỤC MUA SẮM</Button></Space>} />
                    </Card>
                ) : (
                    <Row gutter={24}>
                        <Col xs={24} lg={16}>
                            <Card style={{ borderRadius: '12px', overflow: 'hidden' }} bodyStyle={{ padding: 0 }}>
                                <CartItemList
                                    items={cartItems}
                                    updateQuantity={updateQuantity}
                                    removeFromCart={removeFromCart}
                                    formatPrice={formatPrice}
                                    selectedRowKeys={selectedRowKeys}
                                    onSelectChange={onSelectChange}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} lg={8}>
                            <CartSummary
                                total={selectedTotal}
                                count={selectedCount}
                                formatPrice={formatPrice}
                                onCheckout={handleCheckout}
                                disabled={selectedRowKeys.length === 0}
                            />
                        </Col>
                    </Row>
                )}
            </div>
        </MainLayout>
    );


};

export default CartPage;
