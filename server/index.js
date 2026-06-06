const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const connectDB = require('./db');
const { AdminUser, Project, SocialLink, HomeContent, AboutContent, Skill, Experience, Message, Certificate } = require('./models');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'cyberpunk_secret_key_1905';

// Connect to MongoDB
connectDB();

// --- Authentication Middleware ---
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) return res.sendStatus(401);

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// --- Cloudinary Upload Setup ---
const { uploadCloud, deleteMediaByUrl } = require('./cloudinary');

// ==========================================
// ROUTES
// ==========================================

// --- Auth Routes ---
app.post('/api/auth/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await AdminUser.findOne({ username });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '24h' });
        res.json({ token, username: user.username });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// --- Reset Admin Credentials (Protected) ---
app.put('/api/auth/reset-credentials', authenticateToken, async (req, res) => {
    const { currentPassword, newUsername, newPassword } = req.body;
    try {
        const user = await AdminUser.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const valid = await bcrypt.compare(currentPassword, user.password_hash);
        if (!valid) return res.status(401).json({ message: 'Current password is incorrect' });

        let updated = false;
        if (newUsername && newUsername.trim()) {
            user.username = newUsername.trim();
            updated = true;
        }
        if (newPassword && newPassword.trim().length >= 6) {
            user.password_hash = await bcrypt.hash(newPassword.trim(), 10);
            updated = true;
        }
        if (!updated) return res.status(400).json({ message: 'Nothing to update' });

        await user.save();
        res.json({ message: 'Credentials updated. Please log in again.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// --- Public Routes ---
app.get('/api/projects', async (req, res) => {
    try {
        const projects = await Project.find().sort({ display_order: 1, created_at: -1 });
        res.json(projects);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.get('/api/socials', async (req, res) => {
    try {
        const socials = await SocialLink.find();
        res.json(socials);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.get('/api/home', async (req, res) => {
    try {
        const home = await HomeContent.findOne();
        res.json(home || null);
    } catch (error) { res.status(500).json({ message: 'Server error' }); }
});

app.get('/api/about', async (req, res) => {
    try {
        const about = await AboutContent.findOne();
        res.json(about || null);
    } catch (error) { res.status(500).json({ message: 'Server error' }); }
});

app.get('/api/skills', async (req, res) => {
    try {
        const skills = await Skill.find().sort({ _id: 1 });
        res.json(skills);
    } catch (error) { res.status(500).json({ message: 'Server error' }); }
});

app.get('/api/experience', async (req, res) => {
    try {
        const exp = await Experience.find().sort({ display_order: 1, year: -1 });
        res.json(exp);
    } catch (error) { res.status(500).json({ message: 'Server error' }); }
});

// --- Protected Routes (Admin) ---
// Projects
app.post('/api/projects', authenticateToken, async (req, res) => {
    const { title, description, tags, icon, image_url, demo_url, code_url, display_order } = req.body;
    try {
        const p = await Project.create({ title, description, tags, icon, image_url, demo_url, code_url, display_order: display_order || 0 });
        res.status(201).json({ id: p.id, message: 'Project created successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.put('/api/projects/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { title, description, tags, icon, image_url, demo_url, code_url, display_order } = req.body;
    try {
        await Project.findByIdAndUpdate(id, { title, description, tags, icon, image_url, demo_url, code_url, display_order: display_order || 0 });
        res.json({ message: 'Project updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.delete('/api/projects/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        await Project.findByIdAndDelete(id);
        res.json({ message: 'Project deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update display order in bulk
app.post('/api/projects/reorder', authenticateToken, async (req, res) => {
    const { orderedIds } = req.body; 
    try {
        for (let i = 0; i < orderedIds.length; i++) {
            await Project.findByIdAndUpdate(orderedIds[i], { display_order: i });
        }
        res.json({ message: 'Projects reordered successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Socials
app.put('/api/socials/:platform', authenticateToken, async (req, res) => {
    const { platform } = req.params;
    const { url } = req.body;
    try {
        await SocialLink.findOneAndUpdate({ platform }, { url }, { upsert: true, new: true });
        res.json({ message: 'Social link updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Home Content
app.put('/api/home', authenticateToken, async (req, res) => {
    const { title, subtitle, bio, tech_chips } = req.body;
    try {
        const existing = await HomeContent.findOne();
        if (existing) {
            await HomeContent.findByIdAndUpdate(existing.id, { title, subtitle, bio, tech_chips });
        } else {
            await HomeContent.create({ title, subtitle, bio, tech_chips });
        }
        res.json({ message: 'Home content updated' });
    } catch (error) { console.error(error); res.status(500).json({ message: 'Server error' }); }
});

// About Content
app.put('/api/about', authenticateToken, async (req, res) => {
    const { name, role, location, email, phone, mission_text, education_json, interests_json, stats_json, profile_img_url, resume_url, cert_img_url } = req.body;
    try {
        const existing = await AboutContent.findOne();
        const payload = { name, role, location, email, phone, mission_text, education_json, interests_json, stats_json };
        if (profile_img_url) payload.profile_img_url = profile_img_url;
        if (resume_url) payload.resume_url = resume_url;
        if (cert_img_url) payload.cert_img_url = cert_img_url;

        if (existing) {
            await AboutContent.findByIdAndUpdate(existing.id, payload);
        } else {
            await AboutContent.create(payload);
        }
        res.json({ message: 'About content updated' });
    } catch (error) { console.error(error); res.status(500).json({ message: 'Server error' }); }
});

// Skills
app.post('/api/skills', authenticateToken, async (req, res) => {
    const { category, name, icon, proficiency_percent, level_text } = req.body;
    try {
        const s = await Skill.create({ category, name, icon, proficiency_percent: proficiency_percent || 0, level_text });
        res.json({ id: s.id, message: 'Skill created' });
    } catch (error) { console.error(error); res.status(500).json({ message: 'Server error' }); }
});
app.put('/api/skills/:id', authenticateToken, async (req, res) => {
    const { category, name, icon, proficiency_percent, level_text } = req.body;
    try {
        await Skill.findByIdAndUpdate(req.params.id, { category, name, icon, proficiency_percent: proficiency_percent || 0, level_text });
        res.json({ message: 'Skill updated' });
    } catch (error) { console.error(error); res.status(500).json({ message: 'Server error' }); }
});
app.delete('/api/skills/:id', authenticateToken, async (req, res) => {
    try {
        await Skill.findByIdAndDelete(req.params.id);
        res.json({ message: 'Skill deleted' });
    } catch (error) { console.error(error); res.status(500).json({ message: 'Server error' }); }
});

// Experience
app.post('/api/experience', authenticateToken, async (req, res) => {
    const { year, badge, role, company, period, bullets_json, tags_json, display_order } = req.body;
    try {
        const e = await Experience.create({ year, badge, role, company, period, bullets_json, tags_json, display_order: display_order || 0 });
        res.json({ id: e.id, message: 'Experience created' });
    } catch (error) { console.error(error); res.status(500).json({ message: 'Server error' }); }
});
app.put('/api/experience/:id', authenticateToken, async (req, res) => {
    const { year, badge, role, company, period, bullets_json, tags_json, display_order } = req.body;
    try {
        await Experience.findByIdAndUpdate(req.params.id, { year, badge, role, company, period, bullets_json, tags_json, display_order: display_order || 0 });
        res.json({ message: 'Experience updated' });
    } catch (error) { console.error(error); res.status(500).json({ message: 'Server error' }); }
});
app.delete('/api/experience/:id', authenticateToken, async (req, res) => {
    try {
        await Experience.findByIdAndDelete(req.params.id);
        res.json({ message: 'Experience deleted' });
    } catch (error) { console.error(error); res.status(500).json({ message: 'Server error' }); }
});

// Certificates
app.get('/api/certificates', async (req, res) => {
    try {
        const certs = await Certificate.find().sort({ display_order: 1, _id: -1 });
        res.json(certs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.post('/api/certificates', authenticateToken, async (req, res) => {
    const { title, subtitle, image_url, display_order } = req.body;
    if (!title || !image_url) {
        return res.status(400).json({ message: 'Title and image are required' });
    }
    try {
        const c = await Certificate.create({ title, subtitle, image_url, display_order: display_order || 0 });
        res.status(201).json({ id: c.id, message: 'Certificate created successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.delete('/api/certificates/:id', authenticateToken, async (req, res) => {
    try {
        const c = await Certificate.findById(req.params.id);
        if (c && c.image_url) {
            await deleteMediaByUrl(c.image_url);
        }
        await Certificate.findByIdAndDelete(req.params.id);
        res.json({ message: 'Certificate deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Image Upload (Cloudinary)
app.post('/api/upload', authenticateToken, (req, res) => {
    uploadCloud.single('image')(req, res, async function (err) {
        if (err) {
            console.error('Upload Error:', err);
            return res.status(500).json({ message: 'Image upload failed', error: err.message || err });
        }
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        // If an old image URL is provided, delete it from Cloudinary
        if (req.body.oldImageUrl) {
            await deleteMediaByUrl(req.body.oldImageUrl);
        }

        // Cloudinary URL is available in req.file.path
        const imageUrl = req.file.path;
        res.json({ imageUrl });
    });
});

// ==========================================
// MESSAGES (Contact Form Inbox)
// ==========================================

app.post('/api/messages', async (req, res) => {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
        return res.status(400).json({ message: 'All fields are required' });
    }
    try {
        await Message.create({ name, email, message });
        res.status(201).json({ message: 'Message received' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.get('/api/messages', authenticateToken, async (req, res) => {
    try {
        const msgs = await Message.find().sort({ created_at: -1 });
        res.json(msgs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.get('/api/messages/unread-count', authenticateToken, async (req, res) => {
    try {
        const count = await Message.countDocuments({ is_read: false });
        res.json({ count });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

app.put('/api/messages/:id/read', authenticateToken, async (req, res) => {
    try {
        await Message.findByIdAndUpdate(req.params.id, { is_read: true });
        res.json({ message: 'Marked as read' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

app.delete('/api/messages/:id', authenticateToken, async (req, res) => {
    try {
        await Message.findByIdAndDelete(req.params.id);
        res.json({ message: 'Message deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
