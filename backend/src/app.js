const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const app = express();

// Request logger
app.use((req, res, next) => {
    const fs = require('fs');
    try {
        fs.appendFileSync('d:\\2025 - S2\\HTTMDT\\E-Web-Project\\backend\\request_log.txt', `[${new Date().toISOString()}] ${req.method} ${req.url}\n`);
    } catch (e) {
        // ignore write errors to not crash app
    }
    next();
});

// Middleware
app.use(morgan('dev'));
app.use(cors());
// Increase body size limit for image uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static('public'));

// Routes
app.use('/api/v1/products', require('./routes/product.routes'));
app.use('/api/v1/categories', require('./routes/category.routes'));
app.use('/api/v1/auth', require('./routes/auth.routes'));
app.use('/api/v1/upload', require('./routes/upload.routes'));
app.use('/api/v1/cart', require('./routes/cart.routes'));
app.use('/api/v1/orders', require('./routes/order.routes'));
app.use('/api/v1/users', require('./routes/user.routes'));
app.use('/api/v1/reviews', require('./routes/review.routes'));
app.use('/api/v1/brands', require('./routes/brand.routes'));
app.use('/api/v1/banners', require('./routes/banner.routes'));

// Default route
app.get('/', (req, res) => {
    res.json({
        status: 'success',
        message: 'E-Web Backend API Server',
        version: '1.0.0'
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    const fs = require('fs');
    fs.appendFileSync('global_error_log.txt', `[${new Date().toISOString()}] Global Error: ${err.stack}\n`);
    console.error(err.stack);
    res.status(err.status || 500).json({
        status: 'error',
        message: err.message || 'Internal Server Error'
    });
});

module.exports = app;
