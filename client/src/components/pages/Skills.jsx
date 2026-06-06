import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

function Skills() {
    const [data, setData] = useState([]);
    const [filter, setFilter] = useState('all');
    const [animateBars, setAnimateBars] = useState(false);

    useEffect(() => {
        const fetchSkills = async () => {
            try {
                const res = await axios.get(`${API_URL}/skills`);
                if (res.data && res.data.length > 0) {
                    setData(res.data);
                }
            } catch (err) { console.error('Failed to fetch skills', err); }
        };
        fetchSkills();
    }, []);

    // Static fallback data if API returns empty
    const fallbackSkills = [
        { id: 'f1', category: 'lang', name: 'Java EE', icon: 'fab fa-java', proficiency_percent: 90, level_text: 'EXPERT', accent: 'y' },
        { id: 'f2', category: 'lang', name: 'Python', icon: 'fab fa-python', proficiency_percent: 78, level_text: 'ADVANCED', accent: 'm', featured: true },
        { id: 'f3', category: 'web', name: 'HTML / CSS', icon: 'fab fa-html5', proficiency_percent: 88, level_text: 'EXPERT', accent: 'g' },
        { id: 'f4', category: 'web', name: 'JavaScript', icon: 'fab fa-js', proficiency_percent: 82, level_text: 'ADVANCED', accent: 'y' },
        { id: 'f5', category: 'web framework', name: 'React.js', icon: 'fab fa-react', proficiency_percent: 75, level_text: 'ADVANCED', accent: 'm', featured: true },
        { id: 'f6', category: 'framework', name: 'Spring Boot', icon: 'SB', proficiency_percent: 88, level_text: 'EXPERT', accent: 'y', featured: true },
        { id: 'f7', category: 'framework', name: 'Django', icon: 'fab fa-python', proficiency_percent: 72, level_text: 'INTERMEDIATE', accent: 'm', featured: true },
        { id: 'f8', category: 'db', name: 'MySQL', icon: 'fas fa-database', proficiency_percent: 87, level_text: 'EXPERT', accent: 'y', featured: true },
        { id: 'f9', category: 'tool', name: 'VS Code', icon: 'fab fa-microsoft', proficiency_percent: 90, level_text: 'EXPERT', accent: 'g' }
    ];

    const skillsToRender = data.length > 0 ? data.map(s => {
        let mappedIcon = s.icon;
        if (!mappedIcon) {
            const ln = s.name.toLowerCase();
            if (ln.includes('java') && !ln.includes('javascript')) mappedIcon = 'fab fa-java';
            else if (ln.includes('python') || ln.includes('pyhton')) mappedIcon = 'fab fa-python';
            else if (ln.includes('html')) mappedIcon = 'fab fa-html5';
            else if (ln.includes('css')) mappedIcon = 'fab fa-css3-alt';
            else if (ln.includes('javascript') || ln.includes('js')) mappedIcon = 'fab fa-js';
            else if (ln.includes('react')) mappedIcon = 'fab fa-react';
            else if (ln.includes('spring boot')) mappedIcon = 'SB';
            else if (ln.includes('django')) mappedIcon = 'fab fa-python';
            else if (ln.includes('mysql') || ln.includes('postgre') || ln.includes('sql') || ln.includes('database')) mappedIcon = 'fas fa-database';
            else if (ln.includes('git')) mappedIcon = 'fab fa-github';
            else if (ln.includes('vs code')) mappedIcon = 'fab fa-microsoft';
            else if (ln.includes('bootstrap')) mappedIcon = 'BS';
            else if (ln.includes('spring mvc')) mappedIcon = 'MVC';
            else if (ln.includes('hibernate')) mappedIcon = 'H';
            else if (ln.includes('jpa')) mappedIcon = 'JPA';
            else if (ln.includes('postman')) mappedIcon = 'PM';
            else mappedIcon = s.name.length <= 3 ? s.name.toUpperCase() : s.name.substring(0, 2).toUpperCase();
        }
        return {
            ...s, 
            icon: mappedIcon,
            accent: s.category === 'lang' ? 'y' : s.category === 'web' ? 'g' : s.category === 'framework' ? 'm' : 'y' 
        };
    }) : fallbackSkills;

    const filteredSkills = skillsToRender.filter(s => filter === 'all' || s.category.includes(filter));

    useEffect(() => {
        setAnimateBars(false);
        const t = setTimeout(() => setAnimateBars(true), 100);
        return () => clearTimeout(t);
    }, [filter]);

    return (
        <>
            <div className="page-header">
                <span className="ph-tag">{"//03"}</span>
                <h2 className="ph-title">TECH<span className="accent-m">_STACK</span></h2>
                <div className="ph-line"></div>
            </div>
            <div className="skills-layout">
                <div className="sk-panel">
                    <div className="sk-filterbar">
                        {['all', 'lang', 'web', 'framework', 'db', 'tool'].map(f => (
                            <button 
                                key={f} 
                                className={`skf ${filter === f ? 'active' : ''}`} 
                                onClick={() => setFilter(f)}
                            >
                                {f === 'lang' ? 'LANGUAGES' : f.toUpperCase()}
                            </button>
                        ))}
                    </div>
                    <div className="sk-grid">
                        {filteredSkills.map((sk) => (
                            <div key={sk.id} className={`sk-card ${sk.featured || sk.proficiency_percent >= 85 ? 'featured' : ''}`}>
                                <div className={`skc-icon accent-${sk.accent}`}>
                                    {sk.icon.startsWith('fa') ? <i className={sk.icon}></i> : sk.icon || 'JS'}
                                </div>
                                <div className="skc-name">{sk.name}</div>
                                <div className="skc-bar">
                                    <div 
                                        className="skc-fill transition-all duration-1000 ease-out" 
                                        style={{ width: animateBars ? `${sk.proficiency_percent}%` : '0%' }}
                                    ></div>
                                </div>
                                <div className="skc-lvl">{sk.level_text}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}

export default Skills;
