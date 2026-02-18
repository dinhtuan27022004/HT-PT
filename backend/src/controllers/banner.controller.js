const bannerService = require('../services/banner.service');
const { successResponse, errorResponse } = require('../utils/response.util');

const createBanner = async (req, res) => {
    try {
        const banner = await bannerService.createBanner(req.body);
        return successResponse(res, banner, 'Banner created successfully', 201);
    } catch (error) {
        return errorResponse(res, error.message);
    }
};

const getBanners = async (req, res) => {
    try {
        const banners = await bannerService.getAllBanners();
        return successResponse(res, banners, 'Banners retrieved successfully');
    } catch (error) {
        return errorResponse(res, error.message);
    }
};

const getPublicBanners = async (req, res) => {
    try {
        const { position } = req.query;
        const banners = await bannerService.getActiveBanners(position);
        return successResponse(res, banners, 'Banners retrieved successfully');
    } catch (error) {
        return errorResponse(res, error.message);
    }
};

const updateBanner = async (req, res) => {
    try {
        const { id } = req.params;
        const banner = await bannerService.updateBanner(id, req.body);
        if (!banner) return errorResponse(res, 'Banner not found', 404);
        return successResponse(res, banner, 'Banner updated successfully');
    } catch (error) {
        return errorResponse(res, error.message);
    }
};

const deleteBanner = async (req, res) => {
    try {
        const { id } = req.params;
        const banner = await bannerService.deleteBanner(id);
        if (!banner) return errorResponse(res, 'Banner not found', 404);
        return successResponse(res, null, 'Banner deleted successfully');
    } catch (error) {
        return errorResponse(res, error.message);
    }
};

module.exports = {
    createBanner,
    getBanners,
    getPublicBanners,
    updateBanner,
    deleteBanner
};
