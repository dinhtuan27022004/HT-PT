const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { protect, admin } = require('../middleware/auth.middleware');

// All order routes require authentication
router.use(protect);

router.post('/', orderController.createOrder);
router.get('/', orderController.getMyOrders);
router.get('/:id', orderController.getOrderDetail);

// Admin routes
router.get('/admin/all', admin, orderController.getAllOrders);
router.put('/admin/:id/status', admin, orderController.updateOrderStatus);

module.exports = router;
