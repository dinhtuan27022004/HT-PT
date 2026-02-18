import React from 'react';
import { Menu } from 'antd';
import {
    DashboardOutlined,
    FileTextOutlined,
    SearchOutlined,
    HistoryOutlined,
    TeamOutlined,
    ShopOutlined,
    UserOutlined,
    EnvironmentOutlined,
    QuestionCircleOutlined,
    MessageOutlined,
    RollbackOutlined
} from '@ant-design/icons';
import { COLORS } from '../../../theme/colors';

import { useLocation, useNavigate } from 'react-router-dom';

const ProfileSidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Determine active key based on path
    const getActiveKey = () => {
        const path = location.pathname;
        if (path === '/profile' || path === '/profile/') return 'profile';

        // Extract the last segment or specific segments
        const parts = path.split('/');
        // parts[0] = "", parts[1] = "profile", parts[2] = "orders" etc.
        if (parts.length > 2) {
            return parts[2];
        }
        return 'profile';
    };

    const activeKey = getActiveKey();

    const menuItems = [
        {
            key: 'overview',
            icon: <DashboardOutlined />,
            label: 'Tổng quan',
            onClick: () => navigate('/profile/overview'),
        },
        {
            key: 'orders',
            icon: <FileTextOutlined />,
            label: 'Lịch sử mua hàng',
            onClick: () => navigate('/profile/orders'),
        },
        {
            key: 'warranty',
            icon: <SearchOutlined />,
            label: 'Tra cứu bảo hành',
            onClick: () => navigate('/profile/warranty'),
        },
        {
            key: 'trade-in',
            icon: <HistoryOutlined />,
            label: 'Lịch sử thu cũ',
            onClick: () => navigate('/profile/trade-in'),
        },
        {
            key: 'membership',
            icon: <TeamOutlined />,
            label: 'Hạng thành viên và ưu đãi',
            onClick: () => navigate('/profile/membership'),
        },
        {
            key: 's-business',
            icon: <ShopOutlined />,
            label: 'Ưu đãi và đơn hàng S-Business',
            onClick: () => navigate('/profile/s-business'),
        },
        {
            key: 's-student',
            icon: <TeamOutlined />,
            label: 'Ưu đãi S-Student và S-Teacher',
            onClick: () => navigate('/profile/s-student'),
        },
        {
            key: 'profile',
            icon: <UserOutlined />,
            label: 'Thông tin tài khoản',
            onClick: () => navigate('/profile'),
        },
        {
            key: 'address',
            icon: <EnvironmentOutlined />,
            label: 'Sổ địa chỉ',
            onClick: () => navigate('/profile/address'),
        },
        {
            key: 'store-search',
            icon: <ShopOutlined />,
            label: 'Tìm kiếm cửa hàng',
            onClick: () => navigate('/profile/store-search'),
        },
        {
            key: 'warranty-policy',
            icon: <FileTextOutlined />,
            label: 'Chính sách bảo hành',
            onClick: () => navigate('/profile/warranty-policy'),
        },
        {
            key: 'feedback',
            icon: <MessageOutlined />,
            label: 'Góp ý - Phản hồi - Hỗ trợ',
            onClick: () => navigate('/profile/feedback'),
        }
    ];

    return (
        <div className="profile-sidebar-container" style={{ bgcolor: '#fff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
            <Menu
                mode="vertical"
                selectedKeys={[activeKey]}
                style={{ borderRight: 0, padding: '8px' }}
                className="profile-sidebar-menu"
                items={menuItems.map(item => ({
                    ...item,
                    style: {
                        borderRadius: '8px',
                        marginBottom: '4px',
                        height: '45px',
                        lineHeight: '45px'
                    }
                }))}
            />
        </div>
    );
};

export default ProfileSidebar;
