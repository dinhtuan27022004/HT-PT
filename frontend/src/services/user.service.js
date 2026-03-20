import api from './api';

const userService = {
    getProfile: async () => {
        const response = await api.get('/users/profile');
        return response.data;
    },
    updateProfile: async (data) => {
        const response = await api.put('/users/profile', data);
        return response.data;
    },
    addAddress: async (data) => {
        const response = await api.post('/users/addresses', data);
        return response.data;
    },
    removeAddress: async (id) => {
        const response = await api.delete(`/users/addresses/${id}`);
        return response.data;
    },
    setDefaultAddress: async (id) => {
        const response = await api.put(`/users/addresses/${id}/default`);
        return response.data;
    },
    // Admin methods
    getAllUsers: async (filters = {}) => {
        const response = await api.get('/users/admin/all', { params: filters });
        return response.data;
    },
    updateUserStatus: async (id, data) => {
        const response = await api.put(`/users/admin/${id}/status`, data);
        return response.data;
    },
    getUserDetail: async (id) => {
        const response = await api.get(`/users/admin/${id}`);
        return response.data;
    }
};

export default userService;
