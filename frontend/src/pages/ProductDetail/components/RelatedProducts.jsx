import React, { useEffect, useState } from 'react';
import { Row, Col, Typography, Spin } from 'antd';
import ProductCard from '../../../components/product/ProductCard';
import productService from '../../../services/product.service';
import { transformProduct } from '../../../utils/dataTransform';

const { Title } = Typography;

const RelatedProducts = ({ categoryId, currentProductId }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRelatedProducts = async () => {
            if (!categoryId) return;

            try {
                setLoading(true);
                // Fetch more than needed to ensure we have enough after filtering current product
                const params = {
                    page: 1,
                    limit: 6, // Fetch 6, display 5
                    category_id: categoryId,
                    published: true
                };

                const data = await productService.getAllProducts(params);
                let related = (data.products || []).map(transformProduct);

                // Filter out current product
                related = related.filter(p => p.id !== currentProductId);

                // Limit to 5 products
                setProducts(related.slice(0, 5));
            } catch (error) {
                console.error('Failed to fetch related products', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRelatedProducts();
    }, [categoryId, currentProductId]);

    if (loading) return <div style={{ textAlign: 'center', padding: '20px' }}><Spin /></div>;
    if (products.length === 0) return null;

    return (
        <div style={{ marginTop: '40px', background: '#fff', padding: '32px', borderRadius: '12px', boxShadow: '0 0px 20px rgba(0, 0, 0, 0.08)' }}>
            <Title level={3} style={{ marginBottom: '24px' }}>Sản phẩm liên quan</Title>
            <Row gutter={[16, 16]}>
                {products.map(product => (
                    <Col
                        key={product.id}
                        className="product-grid-col-5" // Reusing the 5-column class
                        xs={24} sm={12} md={8} lg={6} xl={6} xxl={6}
                    >
                        <ProductCard product={product} />
                    </Col>
                ))}
            </Row>
        </div>
    );
};

export default RelatedProducts;
