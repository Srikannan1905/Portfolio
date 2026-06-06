const mongoose = require('mongoose');

const transform = (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    return ret;
};
const opts = { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }, toJSON: { transform }, toObject: { transform } };

const AdminUserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password_hash: { type: String, required: true },
}, opts);

const ProjectSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    tags: String,
    icon: String,
    image_url: String,
    demo_url: String,
    code_url: String,
    display_order: { type: Number, default: 0 }
}, opts);

const SocialLinkSchema = new mongoose.Schema({
    platform: { type: String, required: true, unique: true },
    url: { type: String, required: true }
}, opts);

const HomeContentSchema = new mongoose.Schema({
    title: String,
    subtitle: String,
    bio: String,
    tech_chips: mongoose.Schema.Types.Mixed
}, opts);

const AboutContentSchema = new mongoose.Schema({
    name: String,
    role: String,
    location: String,
    email: String,
    phone: String,
    mission_text: String,
    education_json: mongoose.Schema.Types.Mixed,
    interests_json: mongoose.Schema.Types.Mixed,
    stats_json: mongoose.Schema.Types.Mixed,
    profile_img_url: String,
    resume_url: String,
    cert_img_url: String
}, opts);

const SkillSchema = new mongoose.Schema({
    category: String,
    name: String,
    icon: String,
    proficiency_percent: Number,
    level_text: String
}, opts);

const ExperienceSchema = new mongoose.Schema({
    year: String,
    badge: String,
    role: String,
    company: String,
    period: String,
    bullets_json: mongoose.Schema.Types.Mixed,
    tags_json: mongoose.Schema.Types.Mixed,
    display_order: { type: Number, default: 0 }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

const MessageSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    message: { type: String, required: true },
    is_read: { type: Boolean, default: false }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

const CertificateSchema = new mongoose.Schema({
    title: { type: String, required: true },
    subtitle: String,
    image_url: { type: String, required: true },
    display_order: { type: Number, default: 0 }
}, { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } });

module.exports = {
    AdminUser: mongoose.model('AdminUser', AdminUserSchema),
    Project: mongoose.model('Project', ProjectSchema),
    SocialLink: mongoose.model('SocialLink', SocialLinkSchema),
    HomeContent: mongoose.model('HomeContent', HomeContentSchema),
    AboutContent: mongoose.model('AboutContent', AboutContentSchema),
    Skill: mongoose.model('Skill', SkillSchema),
    Experience: mongoose.model('Experience', ExperienceSchema),
    Message: mongoose.model('Message', MessageSchema),
    Certificate: mongoose.model('Certificate', CertificateSchema)
};
