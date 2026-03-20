import { useState, useEffect } from 'react';
import { Row, Col, Spin, Alert, Empty } from 'antd';
import { useSearchParams } from 'react-router-dom';
import ProductCard from './ProductCard';
import ProductFilters from './ProductFilters';
import productService from '../../services/product.service';
import { transformProduct } from '../../utils/dataTransform';
import './ProductGrid.css';

const ProductGrid = ({ categoryId: propCategoryId }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchParams] = useSearchParams();
    const categoryId = propCategoryId || searchParams.get('category');

    const [filters, setFilters] = useState({
        sort: 'newest',
        minPrice: null,
        maxPrice: null
    });

    useEffect(() => {
        fetchProducts();
    }, [filters, categoryId]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const params = {
                page: 1,
                limit: 24,
                published: true,
                category_id: categoryId || undefined,
                ...filters
            };

            const data = await productService.getAllProducts(params);

            // Transform backend data to frontend format
            let transformedProducts = (data.products || []).map(transformProduct);

            setProducts(transformedProducts);
            setError(null);
        } catch (err) {
            console.error('Error fetching products:', err);
            setError('Không thể tải sản phẩm. Vui lòng thử lại sau.');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (newFilter) => {
        setFilters(prev => ({ ...prev, ...newFilter }));
    };

    if (error) {
        return (
            <Alert
                message="Lỗi"
                description={error}
                type="error"
                showIcon
                style={{ margin: '20px' }}
            />
        );
    }

    return (
        <div className="product-grid-container">
            <ProductFilters onFilterChange={handleFilterChange} hideCategoryFilter={!!propCategoryId} />

            {loading ? (
                <div style={{ padding: '50px', textAlign: 'center' }}>
                    <Spin size="large" tip="Đang tải sản phẩm...">
                        <div style={{ height: 100 }} />
                    </Spin>
                </div>
            ) : products.length === 0 ? (
                <Empty
                    description="Không có sản phẩm nào phù hợp với bộ lọc"
                    style={{ padding: '50px' }}
                />
            ) : (
                <Row gutter={[16, 16]}>
                    {products.map((product) => (
                        <Col
                            key={product.id}
                            className="product-grid-col-5"
                            style={{ overflow: 'visible' }}
                            xs={24}
                            sm={12}
                            md={8}
                        >
                            <ProductCard product={product} />
                        </Col>
                    ))}
                </Row>
            )}
        </div>
    );
};

export default ProductGrid;
