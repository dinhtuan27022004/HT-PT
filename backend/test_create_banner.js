require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
});

async function testCreateBanner() {
    const client = await pool.connect();
    try {
        console.log('Connecting to database...');

        const bannerData = {
            position: 'main',
            image_url: 'https://placehold.co/800x400',
            link_url: 'https://example.com',
            title: 'Test Banner',
            description: 'This is a test banner created by script',
            display_order: 1,
            is_active: true
        };

        console.log('Inserting test banner...');
        const query = `
            INSERT INTO banners (position, image_url, link_url, title, description, display_order, is_active)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `;

        const result = await client.query(query, [
            bannerData.position,
            bannerData.image_url,
            bannerData.link_url,
            bannerData.title,
            bannerData.description,
            bannerData.display_order,
            bannerData.is_active
        ]);

        console.log('Banner created successfully!');
        console.log(result.rows[0]);

    } catch (err) {
        console.error('Creation failed:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

testCreateBanner();
