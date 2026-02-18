const db = require('../../config/database');

/**
 * Create a new banner
 */
const createBanner = async (bannerData) => {
    const { position, image_url, link_url, title, description, display_order, is_active } = bannerData;
    const query = `
        INSERT INTO banners (position, image_url, link_url, title, description, display_order, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
    `;
    const result = await db.query(query, [
        position, image_url, link_url, title, description, display_order || 0, is_active !== undefined ? is_active : true
    ]);
    return result.rows[0];
};

/**
 * Get all banners (for admin)
 */
const getAllBanners = async () => {
    const query = `SELECT * FROM banners ORDER BY position ASC, display_order ASC, created_at DESC`;
    const result = await db.query(query);
    return result.rows;
};

/**
 * Get active banners by position (for frontend)
 */
const getActiveBanners = async (position) => {
    let query = `SELECT * FROM banners WHERE is_active = true`;
    const params = [];

    if (position) {
        query += ` AND position = $1`;
        params.push(position);
    }

    query += ` ORDER BY display_order ASC, created_at DESC`;

    const result = await db.query(query, params);
    return result.rows;
};

/**
 * Update a banner
 */
const updateBanner = async (id, bannerData) => {
    const { position, image_url, link_url, title, description, display_order, is_active } = bannerData;

    // Dynamic update query
    let updateFields = [];
    let values = [];
    let paramIndex = 1;

    if (position !== undefined) { updateFields.push(`position = $${paramIndex++}`); values.push(position); }
    if (image_url !== undefined) { updateFields.push(`image_url = $${paramIndex++}`); values.push(image_url); }
    if (link_url !== undefined) { updateFields.push(`link_url = $${paramIndex++}`); values.push(link_url); }
    if (title !== undefined) { updateFields.push(`title = $${paramIndex++}`); values.push(title); }
    if (description !== undefined) { updateFields.push(`description = $${paramIndex++}`); values.push(description); }
    if (display_order !== undefined) { updateFields.push(`display_order = $${paramIndex++}`); values.push(display_order); }
    if (is_active !== undefined) { updateFields.push(`is_active = $${paramIndex++}`); values.push(is_active); }

    updateFields.push(`updated_at = NOW()`);

    if (updateFields.length === 0) return null;

    values.push(id);
    const query = `UPDATE banners SET ${updateFields.join(', ')} WHERE id = $${paramIndex} RETURNING *`;

    const result = await db.query(query, values);
    return result.rows[0];
};

/**
 * Delete a banner
 */
const deleteBanner = async (id) => {
    const query = `DELETE FROM banners WHERE id = $1 RETURNING *`;
    const result = await db.query(query, [id]);
    return result.rows[0];
};

module.exports = {
    createBanner,
    getAllBanners,
    getActiveBanners,
    updateBanner,
    deleteBanner
};
