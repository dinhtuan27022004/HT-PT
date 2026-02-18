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

async function migrate() {
    try {
        console.log('Connecting to database...');
        const client = await pool.connect();

        console.log('Running migration: Add logo column to brands table...');
        await client.query('ALTER TABLE brands ADD COLUMN IF NOT EXISTS logo text;');

        console.log('Migration successful!');
        client.release();
    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await pool.end();
    }
}

migrate();
