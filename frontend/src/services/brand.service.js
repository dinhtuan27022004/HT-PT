import api from './api';

const brandService = {
    /**
     * Get all brands
     * @returns {Promise<Array>} List of brands
     */
    getAllBrands: async () => {
        try {
            const response = await api.get('/brands');
            return response.data.data;
        } catch (error) {
            throw error;
        }
    },

    createBrand: async (data) => {
        try {
            const response = await api.post('/brands', data);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    updateBrand: async (id, data) => {
        try {
            const response = await api.put(`/brands/${id}`, data);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    deleteBrand: async (id) => {
        try {
            const response = await api.delete(`/brands/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};

export default brandService;
