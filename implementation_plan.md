# Full Portfolio Dynamic Migration & CRUD Plan

This updated plan outlines how we will make **every single section** of your portfolio completely dynamic. You will be able to manage all content from your Admin Dashboard. If any API endpoint fails or the database is empty, the frontend will automatically render your original Cyberpunk static HTML content as a fallback.

## Goal Description
Expand the backend database schema to store content for Home, About, Skills, Experience, Social Media Links, and **Projects**. Add/Update CRUD endpoints for these sections in Node.js. Update the React Admin Dashboard to manage this data. Finally, extract the static `index.html` into React components that fetch this data dynamically with built-in static fallbacks.

## Proposed Architecture

### 1. Database Schema Extensions (`server/schema.sql`)
We need to ensure tables exist to manage the text and structured data for each section:
- **`projects`**: Already exists (`id`, `title`, `description`, `tags`, `icon`, `image_url`, `demo_url`, `code_url`, `display_order`).
- **`home_content`**: `id`, `title`, `bio`, `tech_chips` (JSON array).
- **`about_content`**: `id`, `name`, `role`, `location`, `email`, `mission_text`, `education_json`, `interests_json`.
- **`skills`**: `id`, `category` (lang, web, framework, db, tool), `name`, `icon`, `proficiency_percent`, `level_text`.
- **`experience`**: `id`, `year`, `badge`, `role`, `company`, `period`, `bullets_json`, `tags_json`.
- **`social_links`**: Already exists (`id`, `platform`, `url`). Will explicitly support `github`, `linkedin`, and `instagram`.

### 2. Backend API Expansion (`server/index.js`)
Add public `GET` and protected `POST`/`PUT`/`DELETE` routes for:
- `/api/projects` (Already exists, but will ensure it handles all CRUD ops seamlessly)
- `/api/home`
- `/api/about`
- `/api/skills`
- `/api/experience`
- `/api/socials` 

### 3. Admin Dashboard Expansion (`client/src/AdminDashboard.jsx`)
Update the React admin interface to be multi-tabbed:
- **Projects Tab**: Full CRUD interface to add, edit, delete, and reorder your portfolio projects.
- **Social Media Tab**: A dedicated section to easily update your `instagram`, `github`, and `linkedin` URLs.
- **Content Management Tabs**: Tabs to add/edit Skills, Experience entries, and update the static text blocks for the Home and About pages.

### 4. React Component Migration (`client/src/components/`)
We will extract your `archive/index.html` sections into the following React components. Each will try to fetch its data and fallback to the hardcoded HTML data if empty/error:
- `Layout.jsx` (Sidebar, Backgrounds, Routing state)
- `Home.jsx`
- `About.jsx`
- `Skills.jsx`
- `Projects.jsx` (Will fetch from `/api/projects`. If the database is empty or fails, it will render the 4 original static HTML projects as a fallback).
- `Experience.jsx`
- `Contact.jsx` (Will map the social media links for Email, WhatsApp, Instagram, GitHub, and LinkedIn).

## User Review Required
> [!IMPORTANT]
> **Component State Management:** We will use a state-based rendering approach (e.g., `const [activePage, setActivePage] = useState('home')`) instead of React Router URLs. This is necessary to keep your original Cyberpunk wipe-transitions and single-page layout perfectly intact without harsh page reloads.

## Verification Plan
### Automated Tests
- Restart backend to apply new routes.
- Execute SQL queries to verify new schema tables.
### Manual Verification
- Verify that opening the public portfolio with an empty database perfectly matches the original static `index.html`.
- Add an Instagram link via the Admin Dashboard and verify it dynamically overwrites the static fallback on the Contact page.
- Test that the Projects section successfully falls back to the static projects when the API is empty, and dynamically updates when a project is added via the Admin Dashboard.
