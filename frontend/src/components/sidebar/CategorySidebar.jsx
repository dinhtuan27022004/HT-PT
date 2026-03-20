import { useState, useEffect } from 'react';
import { Menu, Spin, Alert } from 'antd';
import { InfoCircleOutlined, AppstoreOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import categoryService from '../../services/category.service';
import { categoryIcons } from './categoryIcons.jsx';

const CategorySidebar = ({ mode = 'inline' }) => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { id: categoryId } = useParams(); // Get category ID from URL if in category page

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            setCategories(await categoryService.getAllCategories());
            setError(null);
        }
        catch (err) { console.error(err); setError('Không thể tải danh mục.'); }
        finally { setLoading(false); }
    };

    const handleCategoryClick = (id) => {
        if (id === 'all') {
            navigate('/');
        } else {
            navigate(`/category/${id}`);
        }
    };

    const items = [
        {
            key: 'all',
            icon: <AppstoreOutlined />,
            label: 'Tất cả danh mục'
        },
        ...categories.map((cat) => ({
            key: cat.id.toString(),
            icon: categoryIcons[cat.icon] || <InfoCircleOutlined />,
            label: cat.name
        }))
    ];

    if (loading) return <div style={{ padding: '20px', textAlign: 'center' }}><Spin tip="Đang tải..."><div style={{ height: 50 }} /></Spin></div>;
    if (error) return <Alert message="Lỗi" description={error} type="error" showIcon style={{ margin: '10px' }} />;

    return (
        <Menu
            mode={mode}
            items={items}
            selectedKeys={[categoryId || 'all']}
            onClick={(e) => handleCategoryClick(e.key)}
            style={{  }}
        />
    );
};

export default CategorySidebar;
