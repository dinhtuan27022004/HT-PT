import React from 'react';
import { Spin } from 'antd';
import MainLayout from '../../components/layout/MainLayout';
import CategoryProductRow from './components/CategoryProductRow';
import productService from '../../services/product.service';
import CategorySidebar from '../../components/sidebar/CategorySidebar';
import Hero from './components/Hero';

const Home = () => {
    const [categories, setCategories] = React.useState([]);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const fetchHomeCategories = async () => {
            try {
                const data = await productService.getHomeCategories();
                setCategories(data);
            } catch (error) {
                console.error('Failed to fetch home categories:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchHomeCategories();
    }, []);

    return (
        <MainLayout showSidebar={false}>
            <div className="homepage-content-wrapper" style={{ display: 'flex', gap: '20px' }}>
                <div className="sidebar-container">
                    <CategorySidebar />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <Hero />
                </div>
            </div>

            <div style={{ marginTop: '40px', width: '100%' }}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '50px' }}>
                        <Spin size="large" />
                    </div>
                ) : (
                    categories.map(category => (
                        <CategoryProductRow key={category.id} category={category} />
                    ))
                )}
            </div>
        </MainLayout>
    );
};

export default Home;
