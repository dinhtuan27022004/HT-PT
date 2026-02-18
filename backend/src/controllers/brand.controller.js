const brandService = require('../services/brand.service');
const { successResponse, errorResponse } = require('../utils/response.util');

/**
 * Get all brands
 * GET /api/v1/brands
 */
const getAllBrands = async (req, res) => {
    try {
        const brands = await brandService.getAllBrands();
        return successResponse(res, brands, 'Brands retrieved successfully');
    } catch (error) {
        console.error('Error in getAllBrands:', error);
        return errorResponse(res, error.message, 500);
    }
};

/**
 * Get brand by ID
 * GET /api/v1/brands/:id
 */
const getBrandById = async (req, res) => {
    try {
        const { id } = req.params;
        const brand = await brandService.getBrandById(id);

        if (!brand) {
            return errorResponse(res, 'Brand not found', 404);
        }

        return successResponse(res, brand, 'Brand retrieved successfully');
    } catch (error) {
        console.error('Error in getBrandById:', error);
        return errorResponse(res, error.message, 500);
    }
};

/**
 * Create new brand
 * POST /api/v1/brands
 */
const createBrand = async (req, res) => {
    try {
        const { name, categoryIds } = req.body;
        if (!name) {
            return errorResponse(res, 'Brand name is required', 400);
        }

        const brand = await brandService.createBrand(req.body);
        return successResponse(res, brand, 'Brand created successfully', 201);
    } catch (error) {
        console.error('Error in createBrand:', error);
        if (error.code === '23505') { // Unique violation
            return errorResponse(res, 'Brand with this name already exists', 409);
        }
        return errorResponse(res, error.message, 500);
    }
};

/**
 * Update brand
 * PUT /api/v1/brands/:id
 */
const updateBrand = async (req, res) => {
    try {
        const { id } = req.params;
        const brand = await brandService.updateBrand(id, req.body);

        if (!brand) {
            return errorResponse(res, 'Brand not found', 404);
        }

        return successResponse(res, brand, 'Brand updated successfully');
    } catch (error) {
        console.error('Error in updateBrand:', error);
        if (error.code === '23505') {
            return errorResponse(res, 'Brand with this name already exists', 409);
        }
        return errorResponse(res, error.message, 500);
    }
};

/**
 * Delete brand
 * DELETE /api/v1/brands/:id
 */
const deleteBrand = async (req, res) => {
    try {
        const { id } = req.params;
        await brandService.deleteBrand(id);
        return successResponse(res, null, 'Brand deleted successfully');
    } catch (error) {
        console.error('Error in deleteBrand:', error);
        return errorResponse(res, error.message, 500);
    }
};

module.exports = {
    getAllBrands,
    getBrandById,
    createBrand,
    updateBrand,
    deleteBrand
};
