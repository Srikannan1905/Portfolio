const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const db = require('./db');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'cyberpunk_secret_key_1905';

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
        const [rows] = await db.execute('SELECT * FROM admin_users WHERE username = ?', [username]);
        console.log(rows);
        if (rows.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const user = rows[0];
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
        const [rows] = await db.execute('SELECT * FROM admin_users WHERE id = ?', [req.user.id]);
        if (rows.length === 0) return res.status(404).json({ message: 'User not found' });

        const valid = await bcrypt.compare(currentPassword, rows[0].password_hash);
        if (!valid) return res.status(401).json({ message: 'Current password is incorrect' });

        const updates = [];
        const values = [];
        if (newUsername && newUsername.trim()) {
            updates.push('username = ?');
            values.push(newUsername.trim());
        }
        if (newPassword && newPassword.trim().length >= 6) {
            const hash = await bcrypt.hash(newPassword.trim(), 10);
            updates.push('password_hash = ?');
            values.push(hash);
        }
        if (updates.length === 0) return res.status(400).json({ message: 'Nothing to update' });

        values.push(req.user.id);
        await db.execute(`UPDATE admin_users SET ${updates.join(', ')} WHERE id = ?`, values);
        res.json({ message: 'Credentials updated. Please log in again.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// --- Public Routes ---
app.get('/api/projects', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM projects ORDER BY display_order ASC, created_at DESC');
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.get('/api/socials', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM social_links');
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.get('/api/home', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM home_content LIMIT 1');
        res.json(rows[0] || null);
    } catch (error) { res.status(500).json({ message: 'Server error' }); }
});

app.get('/api/about', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM about_content LIMIT 1');
        res.json(rows[0] || null);
    } catch (error) { res.status(500).json({ message: 'Server error' }); }
});

app.get('/api/skills', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM skills ORDER BY id ASC');
        res.json(rows);
    } catch (error) { res.status(500).json({ message: 'Server error' }); }
});

app.get('/api/experience', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM experience ORDER BY display_order ASC, year DESC');
        res.json(rows);
    } catch (error) { res.status(500).json({ message: 'Server error' }); }
});

// --- Protected Routes (Admin) ---
// Projects
app.post('/api/projects', authenticateToken, async (req, res) => {
    const { title, description, tags, icon, image_url, demo_url, code_url, display_order } = req.body;
    try {
        const [result] = await db.execute(
            'INSERT INTO projects (title, description, tags, icon, image_url, demo_url, code_url, display_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [title ?? null, description ?? null, tags ?? null, icon ?? null, image_url ?? null, demo_url ?? null, code_url ?? null, display_order || 0]
        );
        res.status(201).json({ id: result.insertId, message: 'Project created successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.put('/api/projects/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { title, description, tags, icon, image_url, demo_url, code_url, display_order } = req.body;
    try {
        await db.execute(
            'UPDATE projects SET title = ?, description = ?, tags = ?, icon = ?, image_url = ?, demo_url = ?, code_url = ?, display_order = ? WHERE id = ?',
            [title ?? null, description ?? null, tags ?? null, icon ?? null, image_url ?? null, demo_url ?? null, code_url ?? null, display_order ?? 0, id]
        );
        res.json({ message: 'Project updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.delete('/api/projects/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        await db.execute('DELETE FROM projects WHERE id = ?', [id]);
        res.json({ message: 'Project deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update display order in bulk
app.post('/api/projects/reorder', authenticateToken, async (req, res) => {
    const { orderedIds } = req.body; // Array of IDs in new order
    try {
        for (let i = 0; i < orderedIds.length; i++) {
            await db.execute('UPDATE projects SET display_order = ? WHERE id = ?', [i, orderedIds[i]]);
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
        const [rows] = await db.execute('SELECT id FROM social_links WHERE platform = ?', [platform]);
        if (rows.length > 0) {
            await db.execute('UPDATE social_links SET url = ? WHERE platform = ?', [url, platform]);
        } else {
            await db.execute('INSERT INTO social_links (platform, url) VALUES (?, ?)', [platform, url]);
        }
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
        const [existing] = await db.execute('SELECT id FROM home_content LIMIT 1');
        if (existing.length > 0) {
            await db.execute('UPDATE home_content SET title=?, subtitle=?, bio=?, tech_chips=? WHERE id=?',
                [title ?? null, subtitle ?? null, bio ?? null, tech_chips ? JSON.stringify(tech_chips) : null, existing[0].id]);
        } else {
            await db.execute('INSERT INTO home_content (title, subtitle, bio, tech_chips) VALUES (?, ?, ?, ?)',
                [title ?? null, subtitle ?? null, bio ?? null, tech_chips ? JSON.stringify(tech_chips) : null]);
        }
        res.json({ message: 'Home content updated' });
    } catch (error) { console.error(error); res.status(500).json({ message: 'Server error' }); }
});

// About Content
app.put('/api/about', authenticateToken, async (req, res) => {
    const { name, role, location, email, phone, mission_text, education_json, interests_json, stats_json, profile_img_url, resume_url, cert_img_url } = req.body;
    try {
        const [existing] = await db.execute('SELECT id FROM about_content LIMIT 1');
        if (existing.length > 0) {
            await db.execute('UPDATE about_content SET name=?, role=?, location=?, email=?, phone=?, mission_text=?, education_json=?, interests_json=?, stats_json=?, profile_img_url=?, resume_url=?, cert_img_url=? WHERE id=?',
                [name ?? null, role ?? null, location ?? null, email ?? null, phone ?? null, mission_text ?? null, education_json ? JSON.stringify(education_json) : null, interests_json ? JSON.stringify(interests_json) : null, stats_json ? JSON.stringify(stats_json) : null, profile_img_url ?? existing[0].profile_img_url ?? null, resume_url ?? existing[0].resume_url ?? null, cert_img_url ?? existing[0].cert_img_url ?? null, existing[0].id]);
        } else {
            await db.execute('INSERT INTO about_content (name, role, location, email, phone, mission_text, education_json, interests_json, stats_json, profile_img_url, resume_url, cert_img_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [name ?? null, role ?? null, location ?? null, email ?? null, phone ?? null, mission_text ?? null, education_json ? JSON.stringify(education_json) : null, interests_json ? JSON.stringify(interests_json) : null, stats_json ? JSON.stringify(stats_json) : null, profile_img_url ?? null, resume_url ?? null, cert_img_url ?? null]);
        }
        res.json({ message: 'About content updated' });
    } catch (error) { console.error(error); res.status(500).json({ message: 'Server error' }); }
});

// Skills
app.post('/api/skills', authenticateToken, async (req, res) => {
    const { category, name, icon, proficiency_percent, level_text } = req.body;
    try {
        const [result] = await db.execute('INSERT INTO skills (category, name, icon, proficiency_percent, level_text) VALUES (?, ?, ?, ?, ?)',
            [category ?? null, name ?? null, icon ?? null, proficiency_percent ?? 0, level_text ?? null]);
        res.json({ id: result.insertId, message: 'Skill created' });
    } catch (error) { console.error(error); res.status(500).json({ message: 'Server error' }); }
});
app.put('/api/skills/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { category, name, icon, proficiency_percent, level_text } = req.body;
    try {
        await db.execute('UPDATE skills SET category=?, name=?, icon=?, proficiency_percent=?, level_text=? WHERE id=?',
            [category ?? null, name ?? null, icon ?? null, proficiency_percent ?? 0, level_text ?? null, id]);
        res.json({ message: 'Skill updated' });
    } catch (error) { console.error(error); res.status(500).json({ message: 'Server error' }); }
});
app.delete('/api/skills/:id', authenticateToken, async (req, res) => {
    try {
        await db.execute('DELETE FROM skills WHERE id=?', [req.params.id]);
        res.json({ message: 'Skill deleted' });
    } catch (error) { console.error(error); res.status(500).json({ message: 'Server error' }); }
});

// Experience
app.post('/api/experience', authenticateToken, async (req, res) => {
    const { year, badge, role, company, period, bullets_json, tags_json, display_order } = req.body;
    try {
        const [result] = await db.execute('INSERT INTO experience (year, badge, role, company, period, bullets_json, tags_json, display_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [year ?? null, badge ?? null, role ?? null, company ?? null, period ?? null, bullets_json ? JSON.stringify(bullets_json) : null, tags_json ? JSON.stringify(tags_json) : null, display_order || 0]);
        res.json({ id: result.insertId, message: 'Experience created' });
    } catch (error) { console.error(error); res.status(500).json({ message: 'Server error' }); }
});
app.put('/api/experience/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { year, badge, role, company, period, bullets_json, tags_json, display_order } = req.body;
    try {
        await db.execute('UPDATE experience SET year=?, badge=?, role=?, company=?, period=?, bullets_json=?, tags_json=?, display_order=? WHERE id=?',
            [year ?? null, badge ?? null, role ?? null, company ?? null, period ?? null, bullets_json ? JSON.stringify(bullets_json) : null, tags_json ? JSON.stringify(tags_json) : null, display_order || 0, id]);
        res.json({ message: 'Experience updated' });
    } catch (error) { console.error(error); res.status(500).json({ message: 'Server error' }); }
});
app.delete('/api/experience/:id', authenticateToken, async (req, res) => {
    try {
        await db.execute('DELETE FROM experience WHERE id=?', [req.params.id]);
        res.json({ message: 'Experience deleted' });
    } catch (error) { console.error(error); res.status(500).json({ message: 'Server error' }); }
});

// Certificates
app.get('/api/certificates', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM certificates ORDER BY display_order ASC, id DESC');
        res.json(rows);
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
        const [result] = await db.execute(
            'INSERT INTO certificates (title, subtitle, image_url, display_order) VALUES (?, ?, ?, ?)',
            [title, subtitle ?? null, image_url, display_order || 0]
        );
        res.status(201).json({ id: result.insertId, message: 'Certificate created successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

app.delete('/api/certificates/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await db.execute('SELECT image_url FROM certificates WHERE id = ?', [id]);
        if (rows.length > 0 && rows[0].image_url) {
            await deleteMediaByUrl(rows[0].image_url);
        }
        await db.execute('DELETE FROM certificates WHERE id = ?', [id]);
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

// Public: Submit a message from contact form
app.post('/api/messages', async (req, res) => {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
        return res.status(400).json({ message: 'All fields are required' });
    }
    try {
        await db.execute(
            'INSERT INTO messages (name, email, message) VALUES (?, ?, ?)',
            [name, email, message]
        );
        res.status(201).json({ message: 'Message received' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Admin: Get all messages
app.get('/api/messages', authenticateToken, async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT * FROM messages ORDER BY created_at DESC');
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Admin: Get unread count
app.get('/api/messages/unread-count', authenticateToken, async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT COUNT(*) as count FROM messages WHERE is_read = 0');
        res.json({ count: rows[0].count });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Admin: Mark a message as read
app.put('/api/messages/:id/read', authenticateToken, async (req, res) => {
    try {
        await db.execute('UPDATE messages SET is_read = 1 WHERE id = ?', [req.params.id]);
        res.json({ message: 'Marked as read' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Admin: Delete a message
app.delete('/api/messages/:id', authenticateToken, async (req, res) => {
    try {
        await db.execute('DELETE FROM messages WHERE id = ?', [req.params.id]);
        res.json({ message: 'Message deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// ==========================================
// INITIALIZATION
// ==========================================

const fs = require('fs');
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
