import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Row, Col, Breadcrumb, Spin } from 'antd';
import { HomeOutlined } from '@ant-design/icons';
import MainLayout from '../../components/layout/MainLayout';
import ProductGrid from '../../components/product/ProductGrid';
import CategoryBanner from './components/CategoryBanner';
import { LeftBanner, RightBanner } from '../../components/common/SideBanners';
import categoryService from '../../services/category.service';

const CategoryPage = () => {
    const { id } = useParams();
    const [category, setCategory] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategoryDetails = async () => {
            try {
                setLoading(true);
                // Assuming getCategoryById exists or we fetch all and find one
                // If getCategoryById doesn't exist, we might need to rely on getAllCategories
                const categories = await categoryService.getAllCategories();
                const foundCategory = categories.find(c => c.id.toString() === id);
                setCategory(foundCategory || { id, name: 'Danh mục' });
            } catch (error) {
                console.error('Error fetching category:', error);
                setCategory({ id, name: 'Danh mục' });
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchCategoryDetails();
        }
    }, [id]);

    if (loading) {
        return (
            <MainLayout showSidebar={false}>
                <div style={{ padding: '100px', textAlign: 'center' }}>
                    <Spin size="large" tip="Đang tải..." />
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout showSidebar={false}>
            <div className="page-content-wrapper">
                <Row gutter={[24, 24]} justify="center">
                    {/* Left Banner */}
                    <LeftBanner />

                    {/* Main Content */}
                    <Col xs={24} lg={22} xxl={18}>
                        <div style={{ padding: '16px 0' }}>
                            <Breadcrumb
                                items={[
                                    { title: <Link to="/"><HomeOutlined /></Link> },
                                    { title: category?.name || 'Sản phẩm' }
                                ]}
                                style={{ marginBottom: 16 }}
                            />

                            <CategoryBanner category={category} />

                            <div style={{ background: '#fff', padding: '24px', borderRadius: '8px', minHeight: '500px' }}>
                                <ProductGrid categoryId={id} />
                            </div>
                        </div>
                    </Col>

                    {/* Right Banner */}
                    <RightBanner />
                </Row>
            </div>
        </MainLayout>
    );
};

export default CategoryPage;
