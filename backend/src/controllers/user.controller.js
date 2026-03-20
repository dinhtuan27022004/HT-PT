const userService = require('../services/user.service');
const { successResponse, errorResponse } = require('../utils/response.util');

const getProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const profile = await userService.getUserProfile(userId);
        if (!profile) return errorResponse(res, 'User not found', 404);
        return successResponse(res, profile, 'Profile retrieved successfully');
    } catch (error) {
        return errorResponse(res, error.message);
    }
};

const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const profile = await userService.updateProfile(userId, req.body);
        return successResponse(res, profile, 'Profile updated successfully');
    } catch (error) {
        return errorResponse(res, error.message);
    }
};

const addAddress = async (req, res) => {
    try {
        const userId = req.user.id;
        const address = await userService.addAddress(userId, req.body);
        return successResponse(res, address, 'Address added successfully', 201);
    } catch (error) {
        return errorResponse(res, error.message);
    }
};

const removeAddress = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        await userService.deleteAddress(userId, id);
        return successResponse(res, null, 'Address removed successfully');
    } catch (error) {
        return errorResponse(res, error.message);
    }
};

const setDefaultAddress = async (req, res) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        const address = await userService.setDefaultAddress(userId, id);
        return successResponse(res, address, 'Default address updated successfully');
    } catch (error) {
        return errorResponse(res, error.message);
    }
};

const getAllUsers = async (req, res) => {
    try {
        const { role, status, search } = req.query;
        const users = await userService.getAllUsers({ role, status, search });
        return successResponse(res, users, 'All users retrieved successfully');
    } catch (error) {
        return errorResponse(res, error.message);
    }
};

const updateUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, role } = req.body;

        const user = await userService.updateUserStatus(id, { status, role });
        return successResponse(res, user, 'Cập nhật người dùng thành công');
    } catch (error) {
        return errorResponse(res, error.message);
    }
};

const getUserDetail = async (req, res) => {
    try {
        const { id } = req.params;
        const profile = await userService.getUserProfile(id);
        if (!profile) return errorResponse(res, 'Người dùng không tìm thấy', 404);
        return successResponse(res, profile, 'Lấy chi tiết người dùng thành công');
    } catch (error) {
        return errorResponse(res, error.message);
    }
};

module.exports = {
    getProfile,
    updateProfile,
    addAddress,
    removeAddress,
    setDefaultAddress,
    getAllUsers,
    updateUserStatus,
    getUserDetail
};
