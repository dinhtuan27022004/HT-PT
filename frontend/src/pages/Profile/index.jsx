import React, { useState } from 'react';
import { Row, Col, Typography, Card, Spin } from 'antd';
import { useNavigate, useOutletContext, Outlet } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import ProfileHeader from './components/ProfileHeader';
import ProfileSidebar from './components/ProfileSidebar';
import ProfileLayout from './components/ProfileLayout';
import OrderHistoryView from './components/OrderHistoryView';
import OrderDetail from './components/OrderDetail';
import PersonalInfo from './components/PersonalInfo';
import AddressBook from './components/AddressBook';
import { EditProfileModal, AddAddressModal } from './components/ProfileModals';
import { useProfile } from './hooks/useProfile';
import { useOrders } from './hooks/useOrders';

const ProfilePage = () => {
    const {
        user,
        isEditModalOpen,
        setIsEditModalOpen,
        isAddressModalOpen,
        setIsAddressModalOpen,
        form,
        addressForm,
        handleUpdateProfile,
        handleAddAddress,
        handleLogout,
        fetchProfile
    } = useProfile();

    const { orders, loading: ordersLoading, formatPrice } = useOrders();

    if (!user) {
        return (
            <MainLayout>
                <div style={{ padding: '100px', textAlign: 'center' }}>
                    <Spin size="large" />
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="profile-page-container" style={{ padding: '24px 0', minHeight: '80vh' }}>
                <div style={{ margin: '0 auto', padding: '0 16px', width: '100%' }}>
                    <ProfileHeader user={user} stats={{ totalOrders: orders.length, totalSpent: orders.reduce((acc, curr) => acc + (curr.total || 0), 0) }} />

                    <ProfileLayout
                        sidebar={<ProfileSidebar />}
                    >
                        <Outlet context={{
                            user,
                            orders,
                            ordersLoading,
                            formatPrice,
                            setIsEditModalOpen,
                            setIsAddressModalOpen,
                            fetchProfile
                        }} />
                    </ProfileLayout>
                </div>

                <EditProfileModal
                    open={isEditModalOpen}
                    onCancel={() => setIsEditModalOpen(false)}
                    form={form}
                    onFinish={handleUpdateProfile}
                />
                <AddAddressModal
                    open={isAddressModalOpen}
                    onCancel={() => setIsAddressModalOpen(false)}
                    form={addressForm}
                    onFinish={handleAddAddress}
                />
            </div>
        </MainLayout>
    );
};

// Sub-components wrapper to use Outlet context
const PersonalInfoWrapper = () => {
    const { user, setIsEditModalOpen } = useOutletContext();
    return <PersonalInfo user={user} setIsEditModalOpen={setIsEditModalOpen} />;
};

const OrdersWrapper = () => {
    const navigate = useNavigate();
    const { orders, ordersLoading, formatPrice } = useOutletContext();
    return (
        <OrderHistoryView
            orders={orders}
            loading={ordersLoading}
            formatPrice={formatPrice}
            navigate={navigate}
        />
    );
};

const AddressWrapper = () => {
    const { user, setIsAddressModalOpen, fetchProfile } = useOutletContext();
    return (
        <AddressBook
            addresses={user?.addresses}
            setIsAddressModalOpen={setIsAddressModalOpen}
            fetchProfile={fetchProfile}
        />
    );
};

const ComingSoonWrapper = () => {
    return (
        <div style={{ padding: '40px', textAlign: 'center', background: '#fff', borderRadius: '12px' }}>
            <Typography.Title level={4}>Tính năng đang phát triển</Typography.Title>
            <Typography.Text type="secondary">Vui lòng quay lại sau.</Typography.Text>
        </div>
    );
};


const OrderDetailWrapper = () => {
    const { formatPrice } = useOutletContext();
    return <OrderDetail formatPrice={formatPrice} />;
};

ProfilePage.PersonalInfo = PersonalInfoWrapper;
ProfilePage.Orders = OrdersWrapper;
ProfilePage.Address = AddressWrapper;
ProfilePage.ComingSoon = ComingSoonWrapper;
ProfilePage.OrderDetail = OrderDetailWrapper;

export default ProfilePage;
