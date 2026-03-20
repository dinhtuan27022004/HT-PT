const db = require('../../config/database');

/**
 * Create a new order from a user's cart
 * @param {string} userId - User UUID
 * @param {Object} orderData - Order details (address, payment_method, notes)
 * @returns {Promise<Object>} Created order
 */
const createOrder = async (userId, orderData) => {
    const client = await db.connect();
    try {
        await client.query('BEGIN');

        const { address, payment_method, notes } = orderData;

        // 1. Get user's open cart and items
        const cartQuery = 'SELECT id FROM carts WHERE user_id = $1 AND status = \'open\' ORDER BY created_at DESC LIMIT 1';
        const cartResult = await client.query(cartQuery, [userId]);

        if (cartResult.rows.length === 0) {
            throw new Error('No open cart found');
        }

        const cartId = cartResult.rows[0].id;
        const itemsQuery = `
            SELECT ci.*, pv.price, pv.sku, p.name as product_name, pv.variant_name
            FROM cart_items ci
            JOIN product_variants pv ON ci.variant_id = pv.id
            JOIN products p ON pv.product_id = p.id
            WHERE ci.cart_id = $1
        `;
        const itemsResult = await client.query(itemsQuery, [cartId]);

        if (itemsResult.rows.length === 0) {
            throw new Error('Cart is empty');
        }

        // 2. Calculate totals
        const subtotal = itemsResult.rows.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const shippingFee = 30000; // Flat fee for now
        const total = subtotal + shippingFee;
        const orderCode = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

        // 3. Create order
        const insertOrderQuery = `
            INSERT INTO orders (
                user_id, order_code, status, currency, 
                subtotal, shipping_fee, total, 
                shipping_address, customer_notes
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *
        `;
        const orderResult = await client.query(insertOrderQuery, [
            userId, orderCode, 'pending', 'VND',
            subtotal, shippingFee, total,
            JSON.stringify(address), notes
        ]);
        const order = orderResult.rows[0];

        // 4. Create order items
        for (const item of itemsResult.rows) {
            const insertOrderItemQuery = `
                INSERT INTO order_items (
                    order_id, variant_id, sku, name, 
                    unit_price, quantity, line_total
                ) VALUES ($1, $2, $3, $4, $5, $6, $7)
            `;
            await client.query(insertOrderItemQuery, [
                order.id,
                item.variant_id,
                item.sku,
                `${item.product_name}${item.variant_name ? ' - ' + item.variant_name : ''}`,
                item.price,
                item.quantity,
                item.price * item.quantity
            ]);

            // 5. Update inventory
            const updateInventoryQuery = `
                UPDATE inventory 
                SET on_hand = on_hand - $1 
                WHERE variant_id = $2
            `;
            await client.query(updateInventoryQuery, [item.quantity, item.variant_id]);
        }

        // 6. Record payment placeholder
        const insertPaymentQuery = `
            INSERT INTO payments (order_id, provider, amount, status)
            VALUES ($1, $2, $3, $4)
        `;
        await client.query(insertPaymentQuery, [
            order.id,
            payment_method,
            total,
            payment_method === 'cod' ? 'pending' : 'initiated'
        ]);

        // 7. Clear cart items and close cart
        await client.query('DELETE FROM cart_items WHERE cart_id = $1', [cartId]);
        await client.query('UPDATE carts SET status = \'converted\', updated_at = NOW() WHERE id = $1', [cartId]);

        // 8. Add order history
        await client.query('INSERT INTO order_status_history (order_id, status, comment) VALUES ($1, $2, $3)', [
            order.id, 'pending', 'Order placed successfully'
        ]);

        await client.query('COMMIT');
        return order;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

/**
 * Get all orders for a user
 */
const getUserOrders = async (userId) => {
    const query = `
        SELECT o.*, 
            (SELECT json_agg(oi) FROM order_items oi WHERE oi.order_id = o.id) as items
        FROM orders o
        WHERE o.user_id = $1
        ORDER BY o.created_at DESC
    `;
    const result = await db.query(query, [userId]);
    return result.rows;
};

/**
 * Get order detail by ID
 */
const getOrderById = async (orderId, userId) => {
    const query = `
        SELECT o.*, 
            json_agg(oi) as items,
            p.provider as payment_provider,
            p.status as payment_status
        FROM orders o
        JOIN order_items oi ON o.id = oi.order_id
        LEFT JOIN payments p ON o.id = p.order_id
        WHERE o.id = $1 AND o.user_id = $2
        GROUP BY o.id, p.id
    `;
    const result = await db.query(query, [orderId, userId]);
    return result.rows[0];
};

/**
 * Get all orders (Admin)
 * @param {Object} filters - filters (status, search)
 */
const getAllOrders = async (filters = {}) => {
    let query = `
        SELECT o.*, u.full_name as customer_name, u.email as customer_email,
               (
                   SELECT pai.image_urls[1]
                   FROM order_items oi
                   JOIN product_variants pv ON oi.variant_id = pv.id
                   LEFT JOIN product_attribute_images pai ON pv.product_id = pai.product_id
                   WHERE oi.order_id = o.id
                   ORDER BY oi.id ASC, pai.created_at ASC
                   LIMIT 1
               ) as first_item_image,
               (
                   SELECT json_agg(jsonb_build_object(
                       'id', oi.id,
                       'variant_id', oi.variant_id,
                       'sku', oi.sku,
                       'name', oi.name,
                       'unit_price', oi.unit_price,
                       'quantity', oi.quantity,
                       'line_total', oi.line_total,
                       'image', (
                           SELECT pai2.image_urls[1] 
                           FROM product_attribute_images pai2 
                           WHERE pai2.product_id = pv.product_id 
                           LIMIT 1
                       )
                   ))
                   FROM order_items oi
                   JOIN product_variants pv ON oi.variant_id = pv.id
                   WHERE oi.order_id = o.id
               ) as items
        FROM orders o
        JOIN users u ON o.user_id = u.id
    `;
    const params = [];
    const conditions = [];

    if (filters.status) {
        params.push(filters.status);
        conditions.push(`o.status = $${params.length}`);
    }

    if (filters.search) {
        params.push(`%${filters.search}%`);
        conditions.push(`(o.order_code ILIKE $${params.length} OR u.full_name ILIKE $${params.length})`);
    }

    if (filters.category_id) {
        params.push(filters.category_id);
        conditions.push(`EXISTS (
            SELECT 1 FROM order_items oi
            JOIN product_variants pv ON oi.variant_id = pv.id
            JOIN products p ON pv.product_id = p.id
            WHERE oi.order_id = o.id AND p.category_id = $${params.length}
        )`);
    }

    if (filters.startDate) {
        params.push(filters.startDate);
        conditions.push(`o.created_at >= $${params.length}::timestamp`);
    }

    if (conditions.length > 0) {
        query += ` WHERE ` + conditions.join(' AND ');
    }

    query += ` ORDER BY o.created_at DESC`;

    const result = await db.query(query, params);
    const baseUrl = process.env.BASE_URL || '';

    return result.rows.map(order => {
        if (order.first_item_image && !order.first_item_image.startsWith('http')) {
            order.first_item_image = `${baseUrl}${order.first_item_image}`;
        }
        if (order.items) {
            order.items = order.items.map(item => {
                if (item.image && !item.image.startsWith('http')) {
                    item.image = `${baseUrl}${item.image}`;
                }
                return item;
            });
        }
        return order;
    });
};

/**
 * Update order status (Admin)
 * @param {string} orderId - Order UUID
 * @param {string} status - New Status
 * @param {string} comment - Comment for history
 */
const updateOrderStatus = async (orderId, status, comment) => {
    const client = await db.connect();
    try {
        await client.query('BEGIN');

        const updateQuery = `
            UPDATE orders 
            SET status = $1, updated_at = NOW() 
            WHERE id = $2 
            RETURNING *
        `;
        const result = await client.query(updateQuery, [status, orderId]);

        if (result.rows.length === 0) {
            throw new Error('Order not found');
        }

        // Add history
        await client.query('INSERT INTO order_status_history (order_id, status, comment) VALUES ($1, $2, $3)', [
            orderId, status, comment || `Trạng thái được cập nhật thành: ${status}`
        ]);

        await client.query('COMMIT');
        return result.rows[0];
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

module.exports = {
    createOrder,
    getUserOrders,
    getOrderById,
    getAllOrders,
    updateOrderStatus
};
