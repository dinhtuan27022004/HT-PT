import api from './api';

const bannerService = {
    getAllBanners: async () => {
        const response = await api.get('/banners');
        return response.data;
    },

    getPublicBanners: async (position) => {
        // Explicitly remove Authorization header for this request
        const response = await api.get('/banners/public', {
            params: { position },
            // Setting Authorization to something truthy but empty string won't trigger the interceptor logic 
            // because !"" is true, but we want to PREVENT the default token injection.
            // Wait, my interceptor logic is: if (token && !config.headers.Authorization) { inject }
            // So if I set it to " ", ! " " is false, so it won't inject.
            // But let's be safe and set it to a special value or just handle it better.
            // Actually, setting it to undefined might make axios drop it, then the interceptor sees nothing and injects the token.
            // So setting it to " " (space) or "null" string is safer to bypass the interceptor check `!config.headers.Authorization`.
            headers: { Authorization: ' ' }
        });
        return response.data;
    },

    createBanner: async (data) => {
        const response = await api.post('/banners', data);
        return response.data;
    },

    updateBanner: async (id, data) => {
        const response = await api.put(`/banners/${id}`, data);
        return response.data;
    },

    deleteBanner: async (id) => {
        const response = await api.delete(`/banners/${id}`);
        return response.data;
    },

    uploadImage: async (file) => {
        const formData = new FormData();
        formData.append('image', file);
        const response = await api.post('/upload/single', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data.data;
    }
};

export default bannerService;
