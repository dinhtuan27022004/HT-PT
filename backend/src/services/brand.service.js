const db = require('../../config/database');

/**
 * Get all brands
 * @returns {Promise<Array>} List of brands
 */
const getAllBrands = async () => {
    try {
        const query = `
            SELECT b.id, b.name, b.slug, b.logo, 
                   array_agg(bc.category_id) FILTER (WHERE bc.category_id IS NOT NULL) as category_ids
            FROM brands b
            LEFT JOIN brand_categories bc ON b.id = bc.brand_id
            GROUP BY b.id
            ORDER BY b.name ASC
        `;
        const result = await db.query(query);
        return result.rows;
    } catch (error) {
        throw error;
    }
};

/**
 * Get brand by ID
 * @param {string} id - Brand UUID
 * @returns {Promise<Object>} Brand object
 */
const getBrandById = async (id) => {
    try {
        const query = 'SELECT * FROM brands WHERE id = $1';
        const result = await db.query(query, [id]);
        return result.rows[0];
    } catch (error) {
        throw error;
    }
};

/**
 * Create new brand
 * @param {Object} brandData - Brand data
 * @returns {Promise<Object>} Created brand
 */
const createBrand = async (brandData) => {
    const client = await db.connect();
    try {
        await client.query('BEGIN');
        const { name, logo, categoryIds } = brandData;

        // Generate slug from name
        const slug = name
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9\s-]/g, "")
            .trim()
            .replace(/\s+/g, "-");

        const query = 'INSERT INTO brands (name, slug, logo) VALUES ($1, $2, $3) RETURNING *';
        const result = await client.query(query, [name, slug, logo]);
        const brand = result.rows[0];

        // Insert categories if provided
        if (categoryIds && categoryIds.length > 0) {
            const categoryQuery = `
                INSERT INTO brand_categories (brand_id, category_id)
                VALUES ($1, $2)
            `;
            for (const catId of categoryIds) {
                await client.query(categoryQuery, [brand.id, catId]);
            }
        }

        await client.query('COMMIT');
        return { ...brand, category_ids: categoryIds || [] };
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

/**
 * Update brand
 * @param {string} id - Brand UUID
 * @param {Object} brandData - Brand data
 * @returns {Promise<Object>} Updated brand
 */
const updateBrand = async (id, brandData) => {
    const client = await db.connect();
    try {
        await client.query('BEGIN');
        const { name, logo, categoryIds } = brandData;

        // Generate slug
        const slug = name
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9\s-]/g, "")
            .trim()
            .replace(/\s+/g, "-");

        const query = 'UPDATE brands SET name = $1, slug = $2, logo = $3 WHERE id = $4 RETURNING *';
        const result = await client.query(query, [name, slug, logo, id]);
        const brand = result.rows[0];

        if (brand && categoryIds) {
            // Remove existing categories
            await client.query('DELETE FROM brand_categories WHERE brand_id = $1', [id]);

            // Insert new categories
            if (categoryIds.length > 0) {
                const categoryQuery = `
                     INSERT INTO brand_categories (brand_id, category_id)
                     VALUES ($1, $2)
                 `;
                for (const catId of categoryIds) {
                    await client.query(categoryQuery, [id, catId]);
                }
            }
        }

        await client.query('COMMIT');
        return { ...brand, category_ids: categoryIds };
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};

/**
 * Delete brand
 * @param {string} id - Brand UUID
 * @returns {Promise<boolean>} Success status
 */
const deleteBrand = async (id) => {
    try {
        await db.query('DELETE FROM brands WHERE id = $1', [id]);
        return true;
    } catch (error) {
        throw error;
    }
};

module.exports = {
    getAllBrands,
    getBrandById,
    createBrand,
    updateBrand,
    deleteBrand
};
