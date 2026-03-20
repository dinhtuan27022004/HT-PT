import { useState, useEffect } from 'react';
import { message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../../context/CartContext';
import orderService from '../../../services/order.service';
import userService from '../../../services/user.service';

export const useCheckoutLogic = () => {
    const navigate = useNavigate();
    const { cartItems, cartTotal, clearCart } = useCart();
    const [currentStep, setCurrentStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [orderInfo, setOrderInfo] = useState(null);

    // Address management state
    const [addresses, setAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);

    useEffect(() => {
        const fetchAddresses = async () => {
            try {
                const res = await userService.getProfile();
                if (res.status === 'success' && res.data) {
                    const profile = res.data;
                    if (profile.addresses && profile.addresses.length > 0) {
                        setAddresses(profile.addresses);
                        // Find default address or use first one
                        const defaultAddr = profile.addresses.find(a => a.is_default);
                        setSelectedAddressId(defaultAddr ? defaultAddr.id : profile.addresses[0].id);
                    }
                }
            } catch (error) {
                console.error("Error fetching addresses:", error);
                // Fail silently, user will just see manual form
            }
        };
        fetchAddresses();
    }, []);

    const onFinish = async (values) => {
        try {
            setLoading(true);
            let orderAddress = {};

            if (selectedAddressId && selectedAddressId !== 'new') {
                const selectedAddr = addresses.find(a => a.id === selectedAddressId);
                if (selectedAddr) {
                    orderAddress = {
                        recipient: selectedAddr.recipient,
                        phone: selectedAddr.phone,
                        line1: selectedAddr.line1
                    };
                }
            } else {
                // Manual entry
                orderAddress = {
                    recipient: values.recipient,
                    phone: values.phone,
                    line1: values.address
                };
            }

            const orderData = {
                address: orderAddress,
                payment_method: values.payment_method,
                notes: values.notes
            };

            const res = await orderService.createOrder(orderData);
            if (res.status === 'success') {
                setOrderInfo(res.data);
                setIsSuccess(true);
                clearCart();
                message.success('Đặt hàng thành công!');
            }
        } catch (error) {
            message.error(error.response?.data?.message || 'Lỗi khi đặt hàng');
        } finally { setLoading(false); }
    };

    return {
        navigate, cartItems, cartTotal, currentStep, setCurrentStep,
        loading, isSuccess, orderInfo, onFinish,
        addresses, selectedAddressId, setSelectedAddressId
    };
};
