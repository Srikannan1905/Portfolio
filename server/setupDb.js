const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('./db');
const { AdminUser, SocialLink, Certificate } = require('./models');

async function setup() {
    try {
        await connectDB();
        console.log("Connected to MongoDB. Creating initial data...");

        // Admin User
        const adminExists = await AdminUser.findOne({ username: 'admin' });
        if (!adminExists) {
            const passwordHash = await bcrypt.hash('admin123', 10);
            await AdminUser.create({ username: 'admin', password_hash: passwordHash });
            console.log("Created default admin user (admin / admin123)");
        }

        // Social Links
        const githubExists = await SocialLink.findOne({ platform: 'github' });
        if (!githubExists) await SocialLink.create({ platform: 'github', url: 'https://github.com/Srikannan1905' });

        const linkedinExists = await SocialLink.findOne({ platform: 'linkedin' });
        if (!linkedinExists) await SocialLink.create({ platform: 'linkedin', url: 'https://linkedin.com/in/srikannan' });

        // Certificate
        const certExists = await Certificate.findOne({ title: 'Java Certification' });
        if (!certExists) await Certificate.create({ title: 'Java Certification', subtitle: 'INFI TECHZONE • AUG 2023', image_url: '/images/certificate-java.jpg' });

        console.log("Setup completed successfully.");
        process.exit(0);
    } catch (err) {
        console.error("Setup failed:", err);
        process.exit(1);
    }
}

setup();
