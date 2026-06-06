const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'portfolio_db',
  port: process.env.DB_PORT || 5432,
  ssl: process.env.DB_HOST && process.env.DB_HOST.includes('render.com') ? { rejectUnauthorized: false } : false
});

// Test connection
(async () => {
    try {
        const client = await pool.connect();
        console.log('Successfully connected to PostgreSQL database.');
        client.release();
    } catch (error) {
        console.error('Error connecting to PostgreSQL database:', error.message);
    }
})();

// Wrapper to map MySQL syntax to PostgreSQL syntax
const execute = async (query, params = []) => {
    // Replace MySQL ? placeholders with PostgreSQL $1, $2, etc.
    let i = 1;
    let pgQuery = query.replace(/\?/g, () => `$${i++}`);

    // If it's an INSERT statement and doesn't have RETURNING, add it so we can get the ID
    if (pgQuery.trim().toUpperCase().startsWith('INSERT') && !pgQuery.toUpperCase().includes('RETURNING')) {
        pgQuery += ' RETURNING id';
    }

    const result = await pool.query(pgQuery, params);

    if (result.command === 'SELECT') {
        return [result.rows, result.fields];
    } else {
        // For INSERT/UPDATE/DELETE, mock the MySQL result object
        const mockResult = {
            affectedRows: result.rowCount,
            insertId: (result.command === 'INSERT' && result.rows.length > 0) ? result.rows[0].id : null
        };
        return [mockResult, result.fields];
    }
};

module.exports = { pool, execute };
