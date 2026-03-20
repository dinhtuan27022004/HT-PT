import api from './api';

const orderService = {
    createOrder: async (orderData) => {
        const response = await api.post('/orders', orderData);
        return response.data;
    },

    getMyOrders: async () => {
        const response = await api.get('/orders');
        return response.data;
    },

    getOrderById: async (id) => {
        const response = await api.get(`/orders/${id}`);
        return response.data;
    },

    // Admin methods
    getAllOrders: async (filters = {}) => {
        const response = await api.get('/orders/admin/all', { params: filters });
        return response.data;
    },

    updateOrderStatus: async (id, status, comment) => {
        const response = await api.put(`/orders/admin/${id}/status`, { status, comment });
        return response.data;
    }
};

export default orderService;
