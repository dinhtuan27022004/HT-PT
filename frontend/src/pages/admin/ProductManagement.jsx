import React from 'react';
import { Card, Input, Typography, Button, App } from 'antd';
import { PlusOutlined, SearchOutlined } from '@ant-design/icons';
import ProductTable from './components/ProductTable';
import { useProductManagement } from './hooks/useProductManagement';
import { useNavigate } from 'react-router-dom';
import productService from '../../services/product.service';

const { Title } = Typography;

const ProductManagement = () => {
    const navigate = useNavigate();
    const { message, modal } = App.useApp();
    const { searchText, setSearchText, products, loading, fetchProducts } = useProductManagement();

    const handleDelete = async (id) => {
        modal.confirm({
            title: 'Xóa sản phẩm',
            content: 'Bạn có chắc chắn muốn xóa sản phẩm này không? Hành động này không thể hoàn tác.',
            okText: 'Xóa',
            okType: 'danger',
            cancelText: 'Hủy',
            onOk: async () => {
                try {
                    await productService.deleteProduct(id);
                    message.success('Xóa sản phẩm thành công');
                    fetchProducts();
                } catch (error) {
                    console.error('Error deleting product:', error);
                    message.error('Không thể xóa sản phẩm');
                }
            }
        });
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <Title level={3} style={{ margin: 0 }}>Quản lý sản phẩm</Title>
                <Button type="primary" icon={<PlusOutlined />} size="large" onClick={() => navigate('/admin/products/new')} style={{ height: '45px', borderRadius: '8px' }}>
                    Thêm sản phẩm mới
                </Button>
            </div>

            <Card style={{ marginBottom: '16px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                <Input
                    placeholder="Tìm kiếm sản phẩm theo tên hoặc SKU..."
                    prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    style={{ width: '100%', maxWidth: '400px', borderRadius: '8px' }}
                    size="large"
                />
            </Card>

            <ProductTable products={products} loading={loading} navigate={navigate} onDelete={handleDelete} />
        </div>
    );
};

export default ProductManagement;
