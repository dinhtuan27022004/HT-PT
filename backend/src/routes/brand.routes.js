const express = require('express');
const router = express.Router();
const brandController = require('../controllers/brand.controller');

/**
 * @route   GET /api/v1/brands
 * @desc    Get all brands
 * @access  Public
 */
router.get('/', brandController.getAllBrands);

/**
 * @route   GET /api/v1/brands/:id
 * @desc    Get brand by ID
 * @access  Public
 */
router.get('/:id', brandController.getBrandById);

/**
 * @route   POST /api/v1/brands
 * @desc    Create new brand
 * @access  Admin Only
 */
router.post('/', brandController.createBrand);

/**
 * @route   PUT /api/v1/brands/:id
 * @desc    Update brand
 * @access  Admin Only
 */
router.put('/:id', brandController.updateBrand);

/**
 * @route   DELETE /api/v1/brands/:id
 * @desc    Delete brand
 * @access  Admin Only
 */
router.delete('/:id', brandController.deleteBrand);

module.exports = router;
