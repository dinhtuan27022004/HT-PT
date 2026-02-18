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

async function listTables() {
    const client = await pool.connect();
    try {
        console.log('Inspecting categories table...');
        const query = `
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'categories'
        `;
        const result = await client.query(query);
        console.log('Columns:', result.rows);
    } catch (err) {
        console.error('Query failed:', err);
    } finally {
        client.release();
        await pool.end();
    }
}

listTables();
