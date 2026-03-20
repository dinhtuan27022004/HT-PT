const db = require('../../config/database');

/**
 * Add a review for a product
 */
const addReview = async (userId, reviewData) => {
    const { productId, rating, comment } = reviewData;

    // Check if user has purchased the product
    const purchaseQuery = `
        SELECT oi.id FROM orders o
        JOIN order_items oi ON o.id = oi.order_id
        JOIN product_variants pv ON oi.variant_id = pv.id
        WHERE o.user_id = $1 AND pv.product_id = $2 AND o.status = 'completed'
        LIMIT 1
    `;
    const purchaseResult = await db.query(purchaseQuery, [userId, productId]);
    const orderItemId = purchaseResult.rows.length > 0 ? purchaseResult.rows[0].id : null;

    const query = `
        INSERT INTO product_reviews (user_id, product_id, rating, comment, order_item_id)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
    `;
    const result = await db.query(query, [userId, productId, rating, comment, orderItemId]);
    return result.rows[0];
};

/**
 * Get reviews for a product
 */
const getProductReviews = async (productId) => {
    const query = `
        SELECT r.*, u.full_name as user_name
        FROM product_reviews r
        JOIN users u ON r.user_id = u.id
        WHERE r.product_id = $1
        ORDER BY r.created_at DESC
    `;
    const result = await db.query(query, [productId]);
    return result.rows;
};

module.exports = {
    addReview,
    getProductReviews
};
