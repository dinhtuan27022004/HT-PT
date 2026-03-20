const db = require('../../config/database');

/**
 * Get user profile including addresses
 */
const getUserProfile = async (userId) => {
    const userQuery = `
        SELECT id, email, full_name, phone, gender, date_of_birth, role, created_at
        FROM users WHERE id = $1
    `;
    const userResult = await db.query(userQuery, [userId]);
    const user = userResult.rows[0];

    if (!user) return null;

    const addressQuery = `
        SELECT * FROM addresses WHERE user_id = $1 ORDER BY is_default DESC, created_at DESC
    `;
    const addressResult = await db.query(addressQuery, [userId]);
    user.addresses = addressResult.rows;

    const orderQuery = `
        SELECT o.*,
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
        WHERE o.user_id = $1 
        ORDER BY o.created_at DESC
    `;
    const orderResult = await db.query(orderQuery, [userId]);
    const baseUrl = process.env.BASE_URL || '';
    user.orders = orderResult.rows.map(order => {
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

    return user;
};

/**
 * Update user profile
 */
const updateProfile = async (userId, updateData) => {
    // Support both camelCase (legacy/internal) and snake_case (frontend/db)
    const fullName = updateData.fullName || updateData.full_name;
    const phone = updateData.phone;
    const gender = updateData.gender;
    const dob = updateData.dob || updateData.date_of_birth;

    const query = `
        UPDATE users 
        SET full_name = COALESCE($1, full_name),
            phone = COALESCE($2, phone),
            gender = COALESCE($3, gender),
            date_of_birth = COALESCE($4, date_of_birth),
            updated_at = NOW()
        WHERE id = $5
        RETURNING id, email, full_name, phone, gender, date_of_birth, role
    `;
    const result = await db.query(query, [fullName, phone, gender, dob, userId]);
    return result.rows[0];
};

/**
 * Address management
 */
const addAddress = async (userId, addressData) => {
    const { recipient, phone, line1, line2, ward, district, province, is_default } = addressData;

    if (is_default) {
        await db.query('UPDATE addresses SET is_default = false WHERE user_id = $1', [userId]);
    }

    const query = `
        INSERT INTO addresses (user_id, recipient, phone, line1, line2, ward, district, province, is_default)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
    `;
    const result = await db.query(query, [userId, recipient, phone, line1, line2, ward, district, province, is_default]);
    return result.rows[0];
};

const deleteAddress = async (userId, addressId) => {
    await db.query('DELETE FROM addresses WHERE id = $1 AND user_id = $2', [addressId, userId]);
    return true;
};

const setDefaultAddress = async (userId, addressId) => {
    const client = await db.connect();
    try {
        await client.query('BEGIN');

        // 1. Unset default for all user's addresses
        await client.query('UPDATE addresses SET is_default = false WHERE user_id = $1', [userId]);

        // 2. Set new default
        const result = await client.query(
            'UPDATE addresses SET is_default = true WHERE id = $1 AND user_id = $2 RETURNING *',
            [addressId, userId]
        );

        if (result.rowCount === 0) {
            throw new Error('Address not found');
        }

        await client.query('COMMIT');
        return result.rows[0];
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

/**
 * Get all users (Admin)
 * @param {Object} filters - filters (role, status, search)
 */
const getAllUsers = async (filters = {}) => {
    let query = `
        SELECT u.id, u.email, u.full_name, u.phone, u.gender, u.date_of_birth, u.role, u.status, u.created_at,
               COUNT(o.id) as total_orders,
               COALESCE(SUM(o.total), 0) as total_spent
        FROM users u
        LEFT JOIN orders o ON u.id = o.user_id
    `;
    const params = [];
    const conditions = [];

    if (filters.role) {
        params.push(filters.role);
        conditions.push(`u.role = $${params.length}`);
    }

    if (filters.status) {
        params.push(filters.status);
        conditions.push(`u.status = $${params.length}`);
    }

    if (filters.search) {
        params.push(`%${filters.search}%`);
        conditions.push(`(u.full_name ILIKE $${params.length} OR u.email ILIKE $${params.length} OR u.phone ILIKE $${params.length})`);
    }

    if (conditions.length > 0) {
        query += ` WHERE ` + conditions.join(' AND ');
    }

    query += ` GROUP BY u.id ORDER BY u.created_at DESC`;

    const result = await db.query(query, params);
    return result.rows;
};

/**
 * Update user status/role (Admin)
 */
const updateUserStatus = async (userId, updateData) => {
    const { status, role } = updateData;
    const query = `
        UPDATE users 
        SET status = COALESCE($1, status),
            role = COALESCE($2, role),
            updated_at = NOW()
        WHERE id = $3
        RETURNING id, email, full_name, role, status
    `;
    const result = await db.query(query, [status, role, userId]);
    if (result.rows.length === 0) {
        throw new Error('User not found');
    }
    return result.rows[0];
};

module.exports = {
    getUserProfile,
    updateProfile,
    addAddress,
    deleteAddress,
    setDefaultAddress,
    getAllUsers,
    updateUserStatus
};
