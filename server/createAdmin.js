const bcrypt = require('bcryptjs');
const db = require('./db');

async function createAdmin() {
    const args = process.argv.slice(2);

    if (args.length !== 2) {
        console.error('Usage: node createAdmin.js <username> <password>');
        process.exit(1);
    }

    const username = args[0];
    const password = args[1];

    try {
        // Check if user already exists
        const [existingUsers] = await db.execute('SELECT id FROM admin_users WHERE username = ?', [username]);
        if (existingUsers.length > 0) {
            console.error(`Error: User '${username}' already exists.`);
            process.exit(1);
        }

        // Hash the password
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Insert into database
        await db.execute('INSERT INTO admin_users (username, password_hash) VALUES (?, ?)', [username, passwordHash]);
        console.log(`Success: Admin user '${username}' created successfully.`);
        process.exit(0);
    } catch (err) {
        console.error('Failed to create admin user:', err);
        process.exit(1);
    }
}

createAdmin();
