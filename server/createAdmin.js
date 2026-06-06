const bcrypt = require('bcryptjs');
const connectDB = require('./db');
const { AdminUser } = require('./models');

async function createAdmin() {
    const args = process.argv.slice(2);

    if (args.length !== 2) {
        console.error('Usage: node createAdmin.js <username> <password>');
        process.exit(1);
    }

    const username = args[0];
    const password = args[1];

    try {
        await connectDB();
        
        // Check if user already exists
        const existingUser = await AdminUser.findOne({ username });
        if (existingUser) {
            console.error(`Error: User '${username}' already exists.`);
            process.exit(1);
        }

        // Hash the password
        const passwordHash = await bcrypt.hash(password, 10);

        // Insert into database
        await AdminUser.create({ username, password_hash: passwordHash });
        console.log(`Success: Admin user '${username}' created successfully.`);
        process.exit(0);
    } catch (err) {
        console.error('Failed to create admin user:', err);
        process.exit(1);
    }
}

createAdmin();
