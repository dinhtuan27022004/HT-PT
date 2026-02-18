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

module.exports = {
    getUserProfile,
    updateProfile,
    addAddress,
    deleteAddress,
    setDefaultAddress
};
