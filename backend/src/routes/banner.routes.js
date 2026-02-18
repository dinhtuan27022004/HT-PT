const express = require('express');
const router = express.Router();
const bannerController = require('../controllers/banner.controller');
const { protect, admin } = require('../middleware/auth.middleware');

// Public routes
router.get('/public', bannerController.getPublicBanners);

// Admin routes
router.use(protect);
router.use(admin);

router.post('/', bannerController.createBanner);
router.get('/', bannerController.getBanners);
router.put('/:id', bannerController.updateBanner);
router.delete('/:id', bannerController.deleteBanner);

module.exports = router;
