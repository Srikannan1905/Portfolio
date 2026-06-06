const { Client } = require('pg');
const fs = require('fs');
require('dotenv').config();

async function setup() {
    try {
        const client = new Client({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'portfolio_db',
            port: process.env.DB_PORT || 5432,
            ssl: process.env.DB_HOST && process.env.DB_HOST.includes('render.com') ? { rejectUnauthorized: false } : false
        });

        await client.connect();
        console.log("Connected to PostgreSQL. Creating schema...");

        const schema = fs.readFileSync('schema.sql', 'utf8');
        await client.query(schema);

        console.log("Schema created successfully.");
        await client.end();
    } catch (err) {
        console.error("Setup failed:", err);
    }
}

setup();
