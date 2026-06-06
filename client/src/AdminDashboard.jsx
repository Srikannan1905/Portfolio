import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function AdminDashboard() {
  const [token, setToken] = useState(localStorage.getItem('adminToken'));
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  const [activeTab, setActiveTab] = useState('projects');

  // Core Data
  const [projects, setProjects] = useState([]);
  const [skills, setSkills] = useState([]);
  const [experience, setExperience] = useState([]);
  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Home & About Data
  const [homeData, setHomeData] = useState({ title: '', subtitle: '', bio: '', tech_chips: '' });
  const [aboutData, setAboutData] = useState({ name: '', role: '', location: '', email: '', phone: '', mission_text: '', education_json: '', interests_json: '', stats_json: '' });
  const [statsList, setStatsList] = useState([]);
  const [socialsData, setSocialsData] = useState({ github: '', linkedin: '', instagram: '' });

  const handleStatChange = (idx, key, value) => {
    const updated = [...statsList];
    updated[idx] = { ...updated[idx], [key]: value };
    setStatsList(updated);
  };
  const handleAddStat = () => {
    setStatsList([...statsList, { num: '', lbl: '', color: 'y' }]);
  };
  const handleRemoveStat = (idx) => {
    setStatsList(statsList.filter((_, i) => i !== idx));
  };

  // Form States
  const [projForm, setProjForm] = useState({ title: '', description: '', tags: '', icon: '', demo_url: '', code_url: '' });
  const [profileImgFile, setProfileImgFile] = useState(null);
  const [resumeFile, setResumeFile] = useState(null);
  const [certs, setCerts] = useState([]);
  const [certForm, setCertForm] = useState({ title: '', subtitle: '' });
  const [certFile, setCertFile] = useState(null);
  const [skillForm, setSkillForm] = useState({ category: 'web', name: '', icon: '', proficiency_percent: 80, level_text: 'ADVANCED' });
  const [expForm, setExpForm] = useState({ year: '', badge: '', role: '', company: '', period: '', bullets_json: '' });
  const [credForm, setCredForm] = useState({ currentPassword: '', newUsername: '', newPassword: '', confirmPassword: '' });
  const [credMsg, setCredMsg] = useState(null);

  useEffect(() => {
    if (token) fetchData();
  }, [token]);

  useEffect(() => {
    document.body.style.cursor = 'auto';
    return () => { document.body.style.cursor = 'none'; };
  }, []);

  const fetchData = async () => {
    try {
      const headers = { headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } };
      const [projRes, skillRes, expRes, homeRes, aboutRes, socRes, msgRes, certRes] = await Promise.all([
        axios.get(`${API_URL}/projects`),
        axios.get(`${API_URL}/skills`),
        axios.get(`${API_URL}/experience`),
        axios.get(`${API_URL}/home`),
        axios.get(`${API_URL}/about`),
        axios.get(`${API_URL}/socials`),
        axios.get(`${API_URL}/messages`, headers),
        axios.get(`${API_URL}/certificates`)
      ]);
      setProjects(projRes.data);
      setSkills(skillRes.data);
      setExperience(expRes.data);
      setMessages(msgRes.data || []);
      setUnreadCount(msgRes.data.filter(m => !m.is_read).length);
      setCerts(certRes.data || []);
      
      if (homeRes.data) {
        setHomeData({
          title: homeRes.data.title || '', subtitle: homeRes.data.subtitle || '', 
          bio: homeRes.data.bio || '', tech_chips: homeRes.data.tech_chips ? JSON.parse(homeRes.data.tech_chips).join(', ') : ''
        });
      }
      if (aboutRes.data) {
        let parsedInterests = '';
        if (aboutRes.data.interests_json) {
          try {
            const ints = typeof aboutRes.data.interests_json === 'string' ? JSON.parse(aboutRes.data.interests_json) : aboutRes.data.interests_json;
            parsedInterests = Array.isArray(ints) ? ints.join(', ') : '';
          } catch (e) {
            console.warn("Failed to parse interests JSON", e);
          }
        }
        let parsedStats = [];
        if (aboutRes.data.stats_json) {
          try {
            parsedStats = typeof aboutRes.data.stats_json === 'string' ? JSON.parse(aboutRes.data.stats_json) : aboutRes.data.stats_json;
          } catch (e) {
            console.warn("Failed to parse stats JSON", e);
          }
        }
        setStatsList(Array.isArray(parsedStats) ? parsedStats : []);
        setAboutData({
          name: aboutRes.data.name || '', role: aboutRes.data.role || '', location: aboutRes.data.location || '', email: aboutRes.data.email || '',
          phone: aboutRes.data.phone || '',
          mission_text: aboutRes.data.mission_text || '',
          education_json: (aboutRes.data.education_json && typeof aboutRes.data.education_json === 'object') ? JSON.stringify(aboutRes.data.education_json, null, 2) : (aboutRes.data.education_json || ''),
          interests_json: parsedInterests,
          stats_json: (aboutRes.data.stats_json && typeof aboutRes.data.stats_json === 'object') ? JSON.stringify(aboutRes.data.stats_json, null, 2) : (aboutRes.data.stats_json || ''),
          profile_img_url: aboutRes.data.profile_img_url || '',
          resume_url: aboutRes.data.resume_url || ''
        });
      }
      
      const socMap = { github: '', linkedin: '', instagram: '' };
      socRes.data.forEach(s => { socMap[s.platform] = s.url; });
      setSocialsData(socMap);
    } catch (err) { console.error("Error fetching admin data", err); }
  };

  const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { username, password });
      setToken(res.data.token);
      localStorage.setItem('adminToken', res.data.token);
    } catch (err) { alert(err.response?.data?.message || 'Login failed'); }
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('adminToken');
  };

  const handleSaveHome = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...homeData, tech_chips: homeData.tech_chips.split(',').map(s=>s.trim()) };
      await axios.put(`${API_URL}/home`, payload, authHeaders);
      alert('Home saved');
    } catch (err) { console.error(err); alert('Save failed'); }
  };

  const handleSaveAbout = async (e) => {
    e.preventDefault();
    try {
      let finalProfileUrl = aboutData.profile_img_url;
      if (profileImgFile) {
        const formData = new FormData();
        formData.append('image', profileImgFile);
        if (aboutData.profile_img_url) formData.append('oldImageUrl', aboutData.profile_img_url);
        const res = await axios.post(`${API_URL}/upload`, formData, { headers: { ...authHeaders.headers, 'Content-Type': 'multipart/form-data' } });
        finalProfileUrl = res.data.imageUrl;
      }
      
      let finalResumeUrl = aboutData.resume_url;
      if (resumeFile) {
        const formData = new FormData();
        formData.append('image', resumeFile);
        if (aboutData.resume_url) formData.append('oldImageUrl', aboutData.resume_url);
        const res = await axios.post(`${API_URL}/upload`, formData, { headers: { ...authHeaders.headers, 'Content-Type': 'multipart/form-data' } });
        finalResumeUrl = res.data.imageUrl;
      }
      
      let edu = {};
      try { edu = aboutData.education_json ? JSON.parse(aboutData.education_json) : {}; } catch (e) {
        console.warn("Failed to parse education JSON", e);
      }
      
      const payload = { 
        ...aboutData, 
        education_json: edu, 
        stats_json: statsList, 
        interests_json: aboutData.interests_json.split(',').map(s=>s.trim()),
        profile_img_url: finalProfileUrl,
        resume_url: finalResumeUrl
      };
      await axios.put(`${API_URL}/about`, payload, authHeaders);
      alert('About saved');
      fetchData();
    } catch (err) { console.error(err); alert('Save failed'); }
  };

  const handleSaveSocials = async (e) => {
    e.preventDefault();
    try {
      await Promise.all([
        axios.put(`${API_URL}/socials/github`, { url: socialsData.github }, authHeaders),
        axios.put(`${API_URL}/socials/linkedin`, { url: socialsData.linkedin }, authHeaders),
        axios.put(`${API_URL}/socials/instagram`, { url: socialsData.instagram }, authHeaders)
      ]);
      alert('Socials saved');
    } catch (err) { console.error(err); alert('Save failed'); }
  };

  const handleAddProject = async (e) => {
    e.preventDefault();
    try {
      const finalPayload = { ...projForm, image_url: null };
      await axios.post(`${API_URL}/projects`, finalPayload, authHeaders);
      setProjForm({ title: '', description: '', tags: '', icon: '', demo_url: '', code_url: '' });
      fetchData();
    } catch (err) { alert(err.response?.data?.message || 'Failed'); }
  };
  
  const handleAddSkill = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_URL}/skills`, skillForm, authHeaders);
      setSkillForm({ category: 'web', name: '', icon: '', proficiency_percent: 80, level_text: 'ADVANCED' });
      fetchData();
    } catch (err) { alert(err.response?.data?.message || 'Failed'); }
  };

  const handleAddExp = async (e) => {
    e.preventDefault();
    try {
      const bullets = expForm.bullets_json.split('\n').filter(s=>s.trim()!=='');
      await axios.post(`${API_URL}/experience`, { ...expForm, bullets_json: bullets }, authHeaders);
      setExpForm({ year: '', badge: '', role: '', company: '', period: '', bullets_json: '' });
      fetchData();
    } catch (err) { alert(err.response?.data?.message || 'Failed'); }
  };

  const handleAddCertificate = async (e) => {
    e.preventDefault();
    try {
      let imageUrl = '';
      if (certFile) {
        const formData = new FormData();
        formData.append('image', certFile);
        const res = await axios.post(`${API_URL}/upload`, formData, { headers: { ...authHeaders.headers, 'Content-Type': 'multipart/form-data' } });
        imageUrl = res.data.imageUrl;
      } else {
        alert('Please select an image for the certificate');
        return;
      }
      const finalPayload = { ...certForm, image_url: imageUrl };
      await axios.post(`${API_URL}/certificates`, finalPayload, authHeaders);
      setCertForm({ title: '', subtitle: '' });
      setCertFile(null);
      const fileInput = document.getElementById('cert-file-input');
      if (fileInput) fileInput.value = '';
      fetchData();
    } catch (err) { alert(err.response?.data?.message || 'Failed to add certificate'); }
  };

  const handleDelete = async (type, id) => {
    try {
      await axios.delete(`${API_URL}/${type}/${id}`, authHeaders);
      fetchData();
    } catch (err) { console.error(err); alert('Delete failed'); }
  };

  if (!token) {
    return (
      <div className="flex items-center justify-center min-h-screen relative overflow-hidden" style={{ backgroundColor: 'var(--bg)' }}>
        <div className="scanlines"></div>
        <div className="noise"></div>
        <div className="vignette"></div>
        <div className="max-w-md w-full p-8 rounded-lg relative z-10" style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: '0 16px 40px rgba(0,0,0,0.5), var(--glow-y)' }}>
          <h2 className="text-2xl font-bold mb-6 font-mono tracking-wider text-center" style={{ color: 'var(--neon-y)' }}>SYS::ADMIN_LOGIN</h2>
          <form onSubmit={handleLogin} className="cp-form">
            <div className="cf-field">
              <label className="cf-label">USERNAME_</label>
              <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="cf-input" required />
            </div>
            <div className="cf-field">
              <label className="cf-label">PASSWORD_</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="cf-input" required />
            </div>
            <button type="submit" className="cp-btn y w-full justify-center mt-2">INITIATE_CONNECTION</button>
          </form>
        </div>
      </div>
    );
  }

  const tabs = ['home', 'about', 'skills', 'experience', 'projects', 'certificates', 'socials', 'messages', 'settings'];

  return (
    <div className="min-h-screen relative overflow-x-hidden font-sans pb-12" style={{ backgroundColor: 'var(--bg)', color: 'var(--fg)' }}>
      <div className="scanlines"></div>
      <div className="noise"></div>
      <div className="vignette"></div>

      <div className="max-w-6xl mx-auto p-8 relative z-10">
        <div className="flex justify-between items-center border-b pb-4 mb-8" style={{ borderColor: 'var(--border)' }}>
          <h1 className="text-3xl font-bold font-mono" style={{ color: 'var(--neon-y)', textShadow: 'var(--glow-y)' }}>SYS::ADMIN_DASHBOARD</h1>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button onClick={() => setActiveTab('messages')} style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--neon-m)', fontSize: '1.2rem' }}>
              <i className="fas fa-bell"></i>
              {unreadCount > 0 && (
                <span style={{ position: 'absolute', top: '-6px', right: '-8px', background: 'var(--neon-m)', color: '#fff', borderRadius: '50%', fontSize: '0.55rem', fontWeight: 700, width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 10px rgba(232,0,90,0.7)' }}>{unreadCount}</span>
              )}
            </button>
            <button onClick={handleLogout} className="cp-btn m">DISCONNECT</button>
          </div>
        </div>

        <div className="sk-filterbar mb-10">
          {tabs.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} 
              className={`skf ${activeTab === tab ? 'active' : ''}`}
              style={{ position: 'relative' }}>
              {tab === 'messages' ? 'MESSAGES' : tab.toUpperCase()}
              {tab === 'messages' && unreadCount > 0 && (
                <span style={{ marginLeft: '6px', background: 'var(--neon-m)', color: '#fff', borderRadius: '50%', fontSize: '0.5rem', fontWeight: 700, padding: '1px 5px', boxShadow: '0 0 8px rgba(232,0,90,0.6)' }}>{unreadCount}</span>
              )}
            </button>
          ))}
        </div>

        {/* PROJECTS TAB */}
        {activeTab === 'projects' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-xl font-mono mb-4 border-b pb-2" style={{ color: 'var(--neon-g)', borderColor: 'var(--border)' }}>MANAGED_PROJECTS</h2>
              {projects.map(p => (
                <div key={p.id} className="p-4 rounded-lg flex justify-between items-start transition-all" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <i className={`${p.icon || 'fas fa-code'} text-xl`} style={{ color: 'var(--neon-y)' }}></i>
                    <div>
                      <h3 className="text-lg font-bold" style={{ color: 'var(--fg)' }}>{p.title}</h3>
                      <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>{p.description}</p>
                      {p.tags && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginTop: '0.5rem' }}>
                          {p.tags.split(',').map((t, idx) => (
                            <span key={idx} style={{ fontSize: '0.65rem', padding: '0.125rem 0.4rem', borderRadius: '3px', border: '1px solid var(--border)', background: 'var(--bg3)', color: 'var(--fg2)' }}>{t.trim()}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <button onClick={() => handleDelete('projects', p.id)} className="cp-btn m ml-4" style={{ padding: '0.4rem 0.8rem', fontSize: '0.7rem' }}>DELETE</button>
                </div>
              ))}
            </div>
            <div className="p-6 rounded-lg h-fit" style={{ background: 'var(--surface)', border: '1px solid var(--border-m)', boxShadow: '0 8px 30px rgba(232,0,90,0.1)' }}>
              <h2 className="text-xl font-mono mb-4 border-b pb-2" style={{ color: 'var(--neon-m)', borderColor: 'var(--border)' }}>ADD_PROJECT</h2>
              <form onSubmit={handleAddProject} className="cp-form">
                <input type="text" placeholder="Title" value={projForm.title} onChange={e => setProjForm({...projForm, title: e.target.value})} className="cf-input" required />
                <textarea placeholder="Description" value={projForm.description} onChange={e => setProjForm({...projForm, description: e.target.value})} className="cf-input" rows="3" required />
                <input type="text" placeholder="Tags (comma-separated, e.g. React, Node js)" value={projForm.tags} onChange={e => setProjForm({...projForm, tags: e.target.value})} className="cf-input" />
                <input type="text" placeholder="Icon Class (e.g. fas fa-graduation-cap)" value={projForm.icon} onChange={e => setProjForm({...projForm, icon: e.target.value})} className="cf-input" />
                <input type="text" placeholder="Demo URL" value={projForm.demo_url} onChange={e => setProjForm({...projForm, demo_url: e.target.value})} className="cf-input" />
                <input type="text" placeholder="Code URL" value={projForm.code_url} onChange={e => setProjForm({...projForm, code_url: e.target.value})} className="cf-input" />
                <button type="submit" className="cp-btn m w-full justify-center mt-2">SUBMIT</button>
              </form>
            </div>
          </div>
        )}

        {/* SKILLS TAB */}
        {activeTab === 'skills' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-xl font-mono mb-4 border-b pb-2" style={{ color: 'var(--neon-g)', borderColor: 'var(--border)' }}>MANAGED_SKILLS</h2>
              {skills.map(s => (
                <div key={s.id} className="p-4 rounded-lg flex justify-between items-center transition-all" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                  <div>
                    <h3 className="text-lg font-bold" style={{ color: 'var(--fg)' }}>{s.name} <span className="text-xs ml-2" style={{ color: 'var(--neon-y)' }}>{s.category}</span></h3>
                    <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>{s.proficiency_percent}% - {s.level_text}</p>
                  </div>
                  <button onClick={() => handleDelete('skills', s.id)} className="cp-btn m ml-4" style={{ padding: '0.4rem 0.8rem', fontSize: '0.7rem' }}>DELETE</button>
                </div>
              ))}
            </div>
            <div className="p-6 rounded-lg h-fit" style={{ background: 'var(--surface)', border: '1px solid var(--border-m)', boxShadow: '0 8px 30px rgba(232,0,90,0.1)' }}>
              <h2 className="text-xl font-mono mb-4 border-b pb-2" style={{ color: 'var(--neon-m)', borderColor: 'var(--border)' }}>ADD_SKILL</h2>
              <form onSubmit={handleAddSkill} className="cp-form">
                <select value={skillForm.category} onChange={e => setSkillForm({...skillForm, category: e.target.value})} className="cf-input">
                  <option value="lang" style={{ background: 'var(--bg)' }}>Language</option>
                  <option value="web" style={{ background: 'var(--bg)' }}>Web</option>
                  <option value="framework" style={{ background: 'var(--bg)' }}>Framework</option>
                  <option value="db" style={{ background: 'var(--bg)' }}>Database</option>
                  <option value="tool" style={{ background: 'var(--bg)' }}>Tool</option>
                </select>
                <input type="text" placeholder="Skill Name" value={skillForm.name} onChange={e => setSkillForm({...skillForm, name: e.target.value})} className="cf-input" required />
                <input type="number" placeholder="Proficiency (0-100)" value={skillForm.proficiency_percent} onChange={e => setSkillForm({...skillForm, proficiency_percent: e.target.value})} className="cf-input" required />
                <input type="text" placeholder="Level Text (e.g. EXPERT)" value={skillForm.level_text} onChange={e => setSkillForm({...skillForm, level_text: e.target.value})} className="cf-input" required />
                <button type="submit" className="cp-btn m w-full justify-center mt-2">SUBMIT</button>
              </form>
            </div>
          </div>
        )}

        {/* EXPERIENCE TAB */}
        {activeTab === 'experience' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-xl font-mono mb-4 border-b pb-2" style={{ color: 'var(--neon-g)', borderColor: 'var(--border)' }}>MANAGED_EXPERIENCE</h2>
              {experience.map(e => (
                <div key={e.id} className="p-4 rounded-lg flex justify-between items-start transition-all" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                  <div>
                    <h3 className="text-lg font-bold" style={{ color: 'var(--fg)' }}>{e.role} <span className="text-xs ml-2" style={{ color: 'var(--neon-y)' }}>{e.year}</span></h3>
                    <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>{e.company} | {e.period}</p>
                  </div>
                  <button onClick={() => handleDelete('experience', e.id)} className="cp-btn m ml-4" style={{ padding: '0.4rem 0.8rem', fontSize: '0.7rem' }}>DELETE</button>
                </div>
              ))}
            </div>
            <div className="p-6 rounded-lg h-fit" style={{ background: 'var(--surface)', border: '1px solid var(--border-m)', boxShadow: '0 8px 30px rgba(232,0,90,0.1)' }}>
              <h2 className="text-xl font-mono mb-4 border-b pb-2" style={{ color: 'var(--neon-m)', borderColor: 'var(--border)' }}>ADD_EXPERIENCE</h2>
              <form onSubmit={handleAddExp} className="cp-form">
                <input type="text" placeholder="Year (e.g. 2025)" value={expForm.year} onChange={e => setExpForm({...expForm, year: e.target.value})} className="cf-input" required />
                <input type="text" placeholder="Badge (e.g. INTERNSHIP)" value={expForm.badge} onChange={e => setExpForm({...expForm, badge: e.target.value})} className="cf-input" required />
                <input type="text" placeholder="Role" value={expForm.role} onChange={e => setExpForm({...expForm, role: e.target.value})} className="cf-input" required />
                <input type="text" placeholder="Company" value={expForm.company} onChange={e => setExpForm({...expForm, company: e.target.value})} className="cf-input" required />
                <input type="text" placeholder="Period (MAY - JUN)" value={expForm.period} onChange={e => setExpForm({...expForm, period: e.target.value})} className="cf-input" required />
                <textarea placeholder="Bullets (one per line)" value={expForm.bullets_json} onChange={e => setExpForm({...expForm, bullets_json: e.target.value})} className="cf-input" rows="4" required />
                <button type="submit" className="cp-btn m w-full justify-center mt-2">SUBMIT</button>
              </form>
            </div>
          </div>
        )}

        {/* HOME TAB */}
        {activeTab === 'home' && (
          <div className="p-6 rounded-lg" style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: '0 8px 30px rgba(0,0,0,0.5)' }}>
            <h2 className="text-xl font-mono mb-4 border-b pb-2" style={{ color: 'var(--neon-y)', borderColor: 'var(--border)' }}>HOME_CONTENT</h2>
            <form onSubmit={handleSaveHome} className="cp-form max-w-2xl">
              <input type="text" placeholder="Title" value={homeData.title} onChange={e => setHomeData({...homeData, title: e.target.value})} className="cf-input" />
              <input type="text" placeholder="Subtitle" value={homeData.subtitle} onChange={e => setHomeData({...homeData, subtitle: e.target.value})} className="cf-input" />
              <textarea placeholder="Bio" value={homeData.bio} onChange={e => setHomeData({...homeData, bio: e.target.value})} className="cf-input" rows="4" />
              <input type="text" placeholder="Tech Chips (comma separated)" value={homeData.tech_chips} onChange={e => setHomeData({...homeData, tech_chips: e.target.value})} className="cf-input" />
              <button type="submit" className="cp-btn y mt-2">SAVE HOME DATA</button>
            </form>
          </div>
        )}

        {/* ABOUT TAB */}
        {activeTab === 'about' && (
          <div className="p-6 rounded-lg" style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: '0 8px 30px rgba(0,0,0,0.5)' }}>
            <h2 className="text-xl font-mono mb-4 border-b pb-2" style={{ color: 'var(--neon-y)', borderColor: 'var(--border)' }}>ABOUT_CONTENT</h2>
            <form onSubmit={handleSaveAbout} className="cp-form max-w-2xl">
              <input type="text" placeholder="Name" value={aboutData.name || ''} onChange={e => setAboutData({...aboutData, name: e.target.value})} className="cf-input" />
              <input type="text" placeholder="Role" value={aboutData.role || ''} onChange={e => setAboutData({...aboutData, role: e.target.value})} className="cf-input" />
              <input type="text" placeholder="Location" value={aboutData.location || ''} onChange={e => setAboutData({...aboutData, location: e.target.value})} className="cf-input" />
              <input type="text" placeholder="Email" value={aboutData.email || ''} onChange={e => setAboutData({...aboutData, email: e.target.value})} className="cf-input" />
              <input type="text" placeholder="WhatsApp Phone Number (e.g. +91 8056461905)" value={aboutData.phone || ''} onChange={e => setAboutData({...aboutData, phone: e.target.value})} className="cf-input" />
              <textarea placeholder="Mission Text" value={aboutData.mission_text || ''} onChange={e => setAboutData({...aboutData, mission_text: e.target.value})} className="cf-input" rows="3" />
              <textarea placeholder='Education JSON (e.g. {"MSc":"Periyar"})' value={aboutData.education_json || ''} onChange={e => setAboutData({...aboutData, education_json: e.target.value})} className="cf-input font-mono" rows="3" />
              <input type="text" placeholder="Interests (comma separated)" value={aboutData.interests_json || ''} onChange={e => setAboutData({...aboutData, interests_json: e.target.value})} className="cf-input" />
              <div className="cf-field mt-4 border-t border-zinc-800 pt-4">
                <label className="cf-label mb-2">PORTFOLIO STATISTICS</label>
                {statsList.map((st, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row gap-2 mb-2 items-start sm:items-center">
                    <input 
                      type="text" 
                      placeholder="Number (e.g. 7.6)" 
                      value={st.num || ''} 
                      onChange={e => handleStatChange(idx, 'num', e.target.value)} 
                      className="cf-input m-0" 
                      style={{ flex: 1 }}
                      required
                    />
                    <input 
                      type="text" 
                      placeholder="Label (e.g. M.Sc CGPA)" 
                      value={st.lbl || ''} 
                      onChange={e => handleStatChange(idx, 'lbl', e.target.value)} 
                      className="cf-input m-0" 
                      style={{ flex: 2 }}
                      required
                    />
                    <select 
                      value={st.color || 'y'} 
                      onChange={e => handleStatChange(idx, 'color', e.target.value)} 
                      className="cf-input m-0" 
                      style={{ flex: 1, minHeight: '42px' }}
                    >
                      <option value="y" style={{ background: 'var(--bg)' }}>Yellow</option>
                      <option value="m" style={{ background: 'var(--bg)' }}>Magenta</option>
                      <option value="g" style={{ background: 'var(--bg)' }}>Green</option>
                    </select>
                    <button 
                      type="button" 
                      onClick={() => handleRemoveStat(idx)} 
                      className="cp-btn m" 
                      style={{ padding: '0.6rem 0.8rem', fontSize: '0.8rem', minHeight: '42px' }}
                    >
                      DELETE
                    </button>
                  </div>
                ))}
                <button 
                  type="button" 
                  onClick={handleAddStat} 
                  className="cp-btn g mt-2"
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem' }}
                >
                  + ADD STAT CARD
                </button>
              </div>
              
              <div className="cf-field mt-4">
                <label className="cf-label">PROFILE PICTURE</label>
                <input type="file" accept="image/*" onChange={e => setProfileImgFile(e.target.files[0])} className="cf-input" />
                {aboutData.profile_img_url && <span className="text-xs text-zinc-500">Current: {aboutData.profile_img_url}</span>}
              </div>
              <div className="cf-field">
                <label className="cf-label">RESUME PDF</label>
                <input type="file" accept="application/pdf" onChange={e => setResumeFile(e.target.files[0])} className="cf-input" />
                {aboutData.resume_url && <span className="text-xs text-zinc-500">Current: {aboutData.resume_url}</span>}
              </div>

              <button type="submit" className="cp-btn y mt-2">SAVE ABOUT DATA</button>
            </form>
          </div>
        )}

        {/* CERTIFICATES TAB */}
        {activeTab === 'certificates' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-xl font-mono mb-4 border-b pb-2" style={{ color: 'var(--neon-g)', borderColor: 'var(--border)' }}>MANAGED_CERTIFICATES</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {certs.map(c => (
                  <div key={c.id} className="p-4 rounded-lg flex flex-col justify-between transition-all" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                    <div>
                      <img 
                        src={c.image_url ? (c.image_url.startsWith('http') || c.image_url.startsWith('/images/') ? c.image_url : `http://localhost:5000${c.image_url}`) : "/images/certificate-java.jpg"} 
                        alt={c.title} 
                        className="w-full h-32 object-cover rounded mb-2" 
                      />
                      <h3 className="text-lg font-bold" style={{ color: 'var(--fg)' }}>{c.title}</h3>
                      <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>{c.subtitle}</p>
                    </div>
                    <button onClick={() => handleDelete('certificates', c.id)} className="cp-btn m mt-4 w-full justify-center" style={{ padding: '0.4rem 0.8rem', fontSize: '0.7rem' }}>DELETE</button>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-6 rounded-lg h-fit" style={{ background: 'var(--surface)', border: '1px solid var(--border-m)', boxShadow: '0 8px 30px rgba(232,0,90,0.1)' }}>
              <h2 className="text-xl font-mono mb-4 border-b pb-2" style={{ color: 'var(--neon-m)', borderColor: 'var(--border)' }}>ADD_CERTIFICATE</h2>
              <form onSubmit={handleAddCertificate} className="cp-form">
                <input type="text" placeholder="Title" value={certForm.title} onChange={e => setCertForm({...certForm, title: e.target.value})} className="cf-input" required />
                <input type="text" placeholder="Subtitle (e.g. INFI TECHZONE • AUG 2023)" value={certForm.subtitle} onChange={e => setCertForm({...certForm, subtitle: e.target.value})} className="cf-input" />
                <div className="cf-field">
                  <label className="cf-label">IMAGE_FILE_</label>
                  <input id="cert-file-input" type="file" onChange={e => setCertFile(e.target.files[0])} className="cf-input" required />
                </div>
                <button type="submit" className="cp-btn m w-full justify-center mt-2">SUBMIT</button>
              </form>
            </div>
          </div>
        )}

        {/* SOCIALS TAB */}
        {activeTab === 'socials' && (
          <div className="p-6 rounded-lg" style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: '0 8px 30px rgba(0,0,0,0.5)' }}>
            <h2 className="text-xl font-mono mb-4 border-b pb-2" style={{ color: 'var(--neon-y)', borderColor: 'var(--border)' }}>SOCIAL_LINKS</h2>
            <form onSubmit={handleSaveSocials} className="cp-form max-w-xl">
              <div className="cf-field">
                <label className="cf-label">GITHUB_</label>
                <input type="text" value={socialsData.github} onChange={e => setSocialsData({...socialsData, github: e.target.value})} className="cf-input" />
              </div>
              <div className="cf-field">
                <label className="cf-label">LINKEDIN_</label>
                <input type="text" value={socialsData.linkedin} onChange={e => setSocialsData({...socialsData, linkedin: e.target.value})} className="cf-input" />
              </div>
              <div className="cf-field">
                <label className="cf-label">INSTAGRAM_</label>
                <input type="text" value={socialsData.instagram} onChange={e => setSocialsData({...socialsData, instagram: e.target.value})} className="cf-input" />
              </div>
              <button type="submit" className="cp-btn y mt-4">SAVE SOCIALS</button>
            </form>
          </div>
        )}
        {/* MESSAGES TAB */}
        {activeTab === 'messages' && (
          <div className="p-6 rounded-lg" style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: '0 8px 30px rgba(0,0,0,0.5)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem', marginBottom: '1.5rem' }}>
              <h2 className="text-xl font-mono" style={{ color: 'var(--neon-m)' }}>INBOX_MESSAGES <span style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>({messages.length} total · {unreadCount} unread)</span></h2>
            </div>
            {messages.length === 0 ? (
              <p style={{ color: 'var(--muted)', fontFamily: 'var(--f-mono)', fontSize: '0.85rem' }}>[ NO_TRANSMISSIONS_RECEIVED ]</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {messages.map(msg => (
                  <div key={msg.id} style={{
                    padding: '1.25rem',
                    borderRadius: '8px',
                    background: msg.is_read ? 'rgba(255,255,255,0.02)' : 'rgba(232,0,90,0.06)',
                    border: msg.is_read ? '1px solid var(--border)' : '1px solid var(--border-m)',
                    boxShadow: msg.is_read ? 'none' : '0 0 15px rgba(232,0,90,0.15)',
                    transition: 'all 0.3s'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.3rem' }}>
                          {!msg.is_read && <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--neon-m)', display: 'inline-block', boxShadow: '0 0 8px var(--neon-m)', flexShrink: 0 }}></span>}
                          <span style={{ fontFamily: 'var(--f-head)', fontSize: '0.75rem', fontWeight: 700, color: msg.is_read ? 'var(--fg)' : 'var(--neon-m)', letterSpacing: '0.1em' }}>{msg.name}</span>
                          <span style={{ fontFamily: 'var(--f-mono)', fontSize: '0.65rem', color: 'var(--muted)' }}>&lt;{msg.email}&gt;</span>
                        </div>
                        <p style={{ fontFamily: 'var(--f-mono)', fontSize: '0.78rem', color: 'var(--fg)', lineHeight: 1.6, marginBottom: '0.5rem', whiteSpace: 'pre-wrap' }}>{msg.message}</p>
                        <span style={{ fontFamily: 'var(--f-mono)', fontSize: '0.6rem', color: 'var(--muted)' }}>{new Date(msg.created_at).toLocaleString()}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                        {!msg.is_read && (
                          <button className="cp-btn g" style={{ padding: '0.4rem 0.8rem', fontSize: '0.65rem' }}
                            onClick={async () => { await axios.put(`${API_URL}/messages/${msg.id}/read`, {}, authHeaders); fetchData(); }}>
                            <i className="fas fa-check"></i> READ
                          </button>
                        )}
                        <button className="cp-btn m" style={{ padding: '0.4rem 0.8rem', fontSize: '0.65rem' }}
                          onClick={async () => { await axios.delete(`${API_URL}/messages/${msg.id}`, authHeaders); fetchData(); }}>
                          <i className="fas fa-trash"></i> DELETE
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="p-6 rounded-lg" style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: '0 8px 30px rgba(0,0,0,0.5)', maxWidth: '520px' }}>
            <h2 className="text-xl font-mono mb-2" style={{ color: 'var(--neon-y)' }}>ADMIN_CREDENTIALS</h2>
            <p style={{ fontFamily: 'var(--f-mono)', fontSize: '0.7rem', color: 'var(--muted)', marginBottom: '1.5rem' }}>Change your admin username and/or password. Confirm current password to authorise.</p>
            <form className="cp-form" onSubmit={async (e) => {
              e.preventDefault();
              setCredMsg(null);
              if (credForm.newPassword && credForm.newPassword !== credForm.confirmPassword) {
                setCredMsg({ type: 'error', text: 'New passwords do not match.' });
                return;
              }
              if (credForm.newPassword && credForm.newPassword.length < 6) {
                setCredMsg({ type: 'error', text: 'Password must be at least 6 characters.' });
                return;
              }
              try {
                await axios.put(`${API_URL}/auth/reset-credentials`, {
                  currentPassword: credForm.currentPassword,
                  newUsername: credForm.newUsername,
                  newPassword: credForm.newPassword
                }, authHeaders);
                setCredMsg({ type: 'success', text: 'Credentials updated! Session refreshed.' });
                const loginUser = credForm.newUsername.trim() || username;
                const loginPass = credForm.newPassword.trim() || credForm.currentPassword;
                try {
                  const loginRes = await axios.post(`${API_URL}/auth/login`, { username: loginUser, password: loginPass });
                  const newToken = loginRes.data.token;
                  localStorage.setItem('adminToken', newToken);
                  setToken(newToken);
                  setUsername(loginUser);
                } catch (loginErr) {
                  console.warn("Session refresh login failed", loginErr);
                }
                setCredForm({ currentPassword: '', newUsername: '', newPassword: '', confirmPassword: '' });
              } catch (err) {
                setCredMsg({ type: 'error', text: err.response?.data?.message || 'Update failed.' });
              }
            }}>
              <div className="cf-field">
                <label className="cf-label">CURRENT_PASSWORD *</label>
                <input type="password" className="cf-input" required placeholder="Enter current password"
                  value={credForm.currentPassword} onChange={e => setCredForm({...credForm, currentPassword: e.target.value})} />
              </div>
              <div className="cf-field" style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', marginTop: '0.5rem' }}>
                <label className="cf-label">NEW_USERNAME (leave blank to keep current)</label>
                <input type="text" className="cf-input" placeholder="New username"
                  value={credForm.newUsername} onChange={e => setCredForm({...credForm, newUsername: e.target.value})} />
              </div>
              <div className="cf-field">
                <label className="cf-label">NEW_PASSWORD (min 6 chars, leave blank to keep current)</label>
                <input type="password" className="cf-input" placeholder="New password"
                  value={credForm.newPassword} onChange={e => setCredForm({...credForm, newPassword: e.target.value})} />
              </div>
              <div className="cf-field">
                <label className="cf-label">CONFIRM_NEW_PASSWORD</label>
                <input type="password" className="cf-input" placeholder="Confirm new password"
                  value={credForm.confirmPassword} onChange={e => setCredForm({...credForm, confirmPassword: e.target.value})} />
              </div>
              {credMsg && (
                <div style={{ fontFamily: 'var(--f-mono)', fontSize: '0.72rem', padding: '0.6rem 0.8rem', borderRadius: '4px',
                  background: credMsg.type === 'success' ? 'rgba(0,200,83,0.12)' : 'rgba(232,0,90,0.12)',
                  border: `1px solid ${credMsg.type === 'success' ? 'rgba(0,200,83,0.4)' : 'rgba(232,0,90,0.4)'}`,
                  color: credMsg.type === 'success' ? 'var(--neon-g)' : 'var(--neon-m)' }}>
                  <i className={`fas ${credMsg.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle'}`}></i> {credMsg.text}
                </div>
              )}
              <button type="submit" className="cp-btn y mt-2">UPDATE_CREDENTIALS</button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}

export default AdminDashboard;
