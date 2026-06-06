const mysql = require('mysql2/promise');
const fs = require('fs');
require('dotenv').config();

async function setup() {
    try {
        // Connect without database selected
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            port: process.env.DB_PORT || 3306,
            multipleStatements: true
        });

        console.log("Connected to MySQL. Creating schema...");

        const schema = fs.readFileSync('schema.sql', 'utf8');
        await connection.query(schema);

        console.log("Schema created successfully.");
        await connection.end();
    } catch (err) {
        console.error("Setup failed:", err);
    }
}

setup();
