const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { protect, admin } = require('../middleware/auth.middleware');

router.use(protect);

router.get('/profile', userController.getProfile);
router.put('/profile', userController.updateProfile);
router.post('/addresses', userController.addAddress);
router.delete('/addresses/:id', userController.removeAddress);
router.put('/addresses/:id/default', userController.setDefaultAddress);

// Admin routes
router.get('/admin/all', admin, userController.getAllUsers);
router.put('/admin/:id/status', admin, userController.updateUserStatus);
router.get('/admin/:id', admin, userController.getUserDetail);

module.exports = router;
