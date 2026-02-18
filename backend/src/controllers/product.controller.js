const productService = require('../services/product.service');
const categoryService = require('../services/category.service');
const { successResponse, errorResponse } = require('../utils/response.util');

/**
 * Get all products
 * GET /api/v1/products?page=1&limit=20&search=laptop&category_id=xxx&brand_id=xxx&published=true
 */
const getAllProducts = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            search,
            category_id,
            brand_id,
            published,
            minPrice,
            maxPrice,
            ...rest
        } = req.query;

        // Build filters
        const filters = {
            limit: parseInt(limit),
            offset: (parseInt(page) - 1) * parseInt(limit)
        };

        if (search) filters.search = search;
        if (category_id) filters.category_id = category_id;
        if (brand_id) filters.brand_id = brand_id;
        if (published !== undefined) filters.published = published === 'true';
        if (minPrice) filters.minPrice = parseFloat(minPrice);
        if (maxPrice) filters.maxPrice = parseFloat(maxPrice);

        // Handle dynamic attributes (any other query param starting with attr_)
        const dynamicAttrs = {};
        Object.keys(rest).forEach(key => {
            if (key.startsWith('attr_')) {
                const attrKey = key.replace('attr_', '');
                dynamicAttrs[attrKey] = rest[key];
            }
        });

        if (Object.keys(dynamicAttrs).length > 0) {
            filters.attributes = dynamicAttrs;
        }

        // Get products and total count
        const [products, totalCount] = await Promise.all([
            productService.getAllProducts(filters),
            productService.getProductCount(filters)
        ]);

        const totalPages = Math.ceil(totalCount / parseInt(limit));

        return successResponse(res, {
            products,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: totalCount,
                totalPages
            }
        }, 'Products retrieved successfully');

    } catch (error) {
        console.error('Error in getAllProducts:', error);
        return errorResponse(res, error.message, 500);
    }
};

/**
 * Get product by ID
 * GET /api/v1/products/:id
 */
const getProductById = async (req, res) => {
    try {
        const { id } = req.params;

        const product = await productService.getProductById(id);

        if (!product) {
            return errorResponse(res, 'Product not found', 404);
        }

        return successResponse(res, product, 'Product retrieved successfully');

    } catch (error) {
        console.error('Error in getProductById:', error);
        return errorResponse(res, error.message, 500);
    }
};

/**
 * Create new product
 * POST /api/v1/products
 */
const createProduct = async (req, res) => {
    try {
        const productData = req.body;

        // Basic validation
        if (!productData.name || !productData.slug || !productData.category_id) {
            return errorResponse(res, 'Missing required fields: name, slug, category_id', 400);
        }

        const product = await productService.createProduct(productData);
        return successResponse(res, product, 'Product created successfully', 201);

    } catch (error) {
        console.error('Error in createProduct:', error);

        // Handle unique constraint violations
        if (error.code === '23505') {
            return errorResponse(res, 'Product with this SKU or slug already exists', 409);
        }

        return errorResponse(res, error.message, 500);
    }
};

/**
 * Update product
 * PUT /api/v1/products/:id
 */
const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const productData = req.body;

        const product = await productService.updateProduct(id, productData);
        return successResponse(res, product, 'Product updated successfully');

    } catch (error) {
        console.error('Error in updateProduct:', error);

        // Handle unique constraint violations
        if (error.code === '23505') {
            return errorResponse(res, 'Product with this SKU or slug already exists', 409);
        }

        return errorResponse(res, error.message, 500);
    }
};

/**
 * Get products grouped by category for Home page
 * GET /api/v1/products/home-categories
 */
const getHomeProductCategories = async (req, res) => {
    try {
        // 1. Get all active categories
        const categories = await categoryService.getAllCategories();

        // 2. Fetch products for each category
        const categoriesWithProducts = await Promise.all(
            categories.map(async (category) => {
                // Skip if category is not active (if status exists)
                if (category.status && category.status !== 'active') return null;

                const products = await productService.getAllProducts({
                    category_id: category.id,
                    limit: 12, // Fetch top 12 products
                    published: true
                });

                // Only return categories that have products
                if (products.length === 0) return null;

                return {
                    ...category,
                    products
                };
            })
        );

        // Filter out nulls
        const result = categoriesWithProducts.filter(Boolean);

        return successResponse(res, result, 'Home categories retrieved successfully');

    } catch (error) {
        console.error('Error in getHomeProductCategories:', error);
        return errorResponse(res, error.message, 500);
    }
};

/**
 * Delete product
 * DELETE /api/v1/products/:id
 */
const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        await productService.deleteProduct(id);
        return successResponse(res, null, 'Product deleted successfully');

    } catch (error) {
        console.error('Error in deleteProduct:', error);
        if (error.message === 'Product not found') {
            return errorResponse(res, 'Product not found', 404);
        }
        return errorResponse(res, error.message, 500);
    }
};

module.exports = {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    getHomeProductCategories
};
