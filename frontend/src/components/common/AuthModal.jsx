import React, { useState } from 'react';
import { Modal, Tabs, App } from 'antd';
import { GoogleOutlined, FacebookOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/auth.service';
import LoginForm from './auth/LoginForm';
import RegisterForm from './auth/RegisterForm';
import './AuthModal.css';

const AuthModal = ({ open, onCancel, onLoginSuccess }) => {
    const { message } = App.useApp();
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('1');
    const navigate = useNavigate();

    const handleLogin = async (values) => {
        setLoading(true);
        try {
            const { email, password } = values;
            const res = await authService.login(email, password);
            if (res.status === 'success') {
                message.success('Đăng nhập thành công!');
                setLoading(false); // Ensure loading is off

                if (res.data.user.role === 'admin') {
                    onCancel();
                    navigate('/admin');
                } else {
                    if (onLoginSuccess) {
                        // Delay slightly to allow message to show and state to settle
                        setTimeout(() => {
                            onLoginSuccess();
                        }, 500);
                    } else {
                        onCancel();
                        window.location.reload();
                    }
                }
            }
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Đăng nhập thất bại!';
            if (errorMsg === 'Tài khoản của bạn đã bị khóa') {
                Modal.error({
                    title: 'Tài khoản bị khóa',
                    content: 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên để được hỗ trợ.',
                    okText: 'Đồng ý',
                    onOk: () => {
                        authService.logout();
                    }
                });
            } else {
                message.error(errorMsg);
            }
        } finally { setLoading(false); }
    };

    const handleSignup = async (values) => {
        setLoading(true);
        try {
            const formattedValues = { ...values, dob: values.dob.format('YYYY-MM-DD') };
            const res = await authService.signup(formattedValues);
            if (res.status === 'success') {
                message.success('Đăng ký thành công! Vui lòng đăng nhập.');
                setActiveTab('1');
            }
        } catch (error) {
            message.error(error.response?.data?.message || 'Đăng ký thất bại!');
        } finally { setLoading(false); }
    };

    const items = [
        { key: '1', label: 'ĐĂNG NHẬP', children: <LoginForm onFinish={handleLogin} loading={loading} /> },
        { key: '2', label: 'ĐĂNG KÝ', children: <RegisterForm onFinish={handleSignup} loading={loading} /> },
    ];

    return (
        <Modal
            open={open}
            onCancel={onCancel}
            footer={null}
            width={550}
            className="auth-modal"
            centered
            maskClosable={true}
            destroyOnClose
            afterClose={() => {
                setActiveTab('1');
                setLoading(false);
            }}
        >
            <div className="auth-modal-container">
                <div className="auth-header">
                    <h2>GEARVN</h2>
                    <p>Chào mừng bạn quay trở lại</p>
                </div>
                <div className="auth-body">
                    <Tabs activeKey={activeTab} onChange={setActiveTab} items={items} centered className="auth-tabs" />
                    <div className="auth-footer">
                        <p>Hoặc đăng nhập bằng</p>
                        <div className="social-login">
                            <div className="social-btn"><GoogleOutlined style={{ fontSize: '20px' }} /></div>
                            <div className="social-btn"><FacebookOutlined style={{ fontSize: '20px' }} /></div>
                        </div>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default AuthModal;
