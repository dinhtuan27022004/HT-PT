import { useState, useEffect } from 'react';
import { Form, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import userService from '../../../services/user.service';
import authService from '../../../services/auth.service';

import dayjs from 'dayjs';

export const useProfile = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
    const [form] = Form.useForm();
    const [addressForm] = Form.useForm();

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const res = await userService.getProfile();
            if (res.status === 'success') {
                setUser(res.data);
                // Format date for Form (DatePicker expects dayjs object)
                const formData = {
                    ...res.data,
                    date_of_birth: res.data.date_of_birth ? dayjs(res.data.date_of_birth) : null
                };
                form.setFieldsValue(formData);
            }
        } catch (e) { message.error('Không thể tải thông tin'); } finally { setLoading(false); }
    };

    useEffect(() => { fetchProfile(); }, []);

    const handleUpdateProfile = async (v) => {
        try {
            // Format date for API (YYYY-MM-DD)
            const updateData = {
                ...v,
                date_of_birth: v.date_of_birth ? v.date_of_birth.format('YYYY-MM-DD') : null
            };

            if ((await userService.updateProfile(updateData)).status === 'success') {
                message.success('Thành công'); setIsEditModalOpen(false); fetchProfile();
            }
        } catch (e) { message.error('Thất bại'); }
    };

    const handleAddAddress = async (v) => {
        try {
            // Use is_default from form if present, else true (or logic as preferred)
            // User requested ability to choose default status -> use v.is_default
            // Existing logic enforced is_default: true. Let's respect user choice now.
            const addressData = { ...v, is_default: v.is_default || false };
            if ((await userService.addAddress(addressData)).status === 'success') {
                message.success('Thành công'); setIsAddressModalOpen(false); addressForm.resetFields(); fetchProfile();
            }
        } catch (e) { message.error('Thất bại'); }
    };

    const handleLogout = () => { authService.logout(); navigate('/'); window.location.reload(); };

    return { user, loading, isEditModalOpen, setIsEditModalOpen, isAddressModalOpen, setIsAddressModalOpen, form, addressForm, handleUpdateProfile, handleAddAddress, handleLogout, fetchProfile };
};
