import React from 'react';
import { Carousel, Row, Col, Typography, Button, Card } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import ProductCard from '../../../components/product/ProductCard';
import '../../../components/product/ProductGrid.css';
import { transformProduct } from '../../../utils/dataTransform';

const { Title, Link } = Typography;

const CategoryProductRow = ({ category }) => {
    const navigate = useNavigate();
    const carouselRef = React.useRef(null);

    if (!category || !category.products || category.products.length === 0) {
        return null;
    }

    const handleCategoryClick = () => {
        navigate(`/category/${category.id}`);
    };

    // Transform products and split into chunks for the carousel (2 rows x 5 items = 10 items per slide)
    const products = category.products.map(transformProduct);
    const productsPerSlide = 10;
    const slides = [];

    for (let i = 0; i < products.length; i += productsPerSlide) {
        slides.push(products.slice(i, i + productsPerSlide));
    }

    const settings = {
        dots: false,
        infinite: false,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: false, // We'll use custom arrows
    };

    return (
        <Card
            title={
                <Title level={3} style={{ margin: 0, color: '#d32f2f', cursor: 'pointer' }} onClick={handleCategoryClick}>
                    {category.name}
                </Title>
            }
            extra={
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <Link onClick={handleCategoryClick} style={{ fontSize: '14px' }}>Xem tất cả</Link>
                </div>
            }
            style={{ marginBottom: '40px', borderRadius: '8px' }}
            bodyStyle={{ padding: '20px' }}
        >
            <div style={{ position: 'relative' }}>
                {slides.length > 1 && (
                    <>
                        <Button
                            shape="circle"
                            icon={<LeftOutlined />}
                            onClick={() => carouselRef.current.prev()}
                            style={{ position: 'absolute', top: '50%', left: '-15px', zIndex: 1, transform: 'translateY(-50%)', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
                        />
                        <Button
                            shape="circle"
                            icon={<RightOutlined />}
                            onClick={() => carouselRef.current.next()}
                            style={{ position: 'absolute', top: '50%', right: '-15px', zIndex: 1, transform: 'translateY(-50%)', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
                        />
                    </>
                )}

                <Carousel ref={carouselRef} {...settings}>
                    {slides.map((slideProducts, slideIndex) => (
                        <div key={slideIndex}>
                            <Row gutter={[16, 16]} >
                                {slideProducts.map((product) => (
                                    <Col
                                        key={product.id}
                                        className="product-grid-col-5"
                                        xs={24}
                                        sm={12}
                                        md={8}
                                        lg={6}
                                        xxl={4} // Fallback for 1200px (though product-grid-col-5 handles it)
                                    >
                                        <ProductCard product={product} />
                                    </Col>
                                ))}
                            </Row>
                        </div>
                    ))}
                </Carousel>
            </div>
        </Card>
    );
};

export default CategoryProductRow;
