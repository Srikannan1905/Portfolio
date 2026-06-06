import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

function Projects() {
    const [data, setData] = useState([]);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const res = await axios.get(`${API_URL}/projects`);
                if (res.data && res.data.length > 0) setData(res.data);
            } catch (err) { console.error('Failed to fetch projects', err); }
        };
        fetchProjects();
    }, []);

    const fallbackData = [
        {
            id: 'f1', title: 'EduConnect Platform', description: 'Comprehensive student engagement & faculty review system with tiered analytics.', tags: 'Spring Boot, MySQL, Thymeleaf', icon: 'fas fa-graduation-cap', image_url: null, demo_url: '#', code_url: 'https://github.com/Srikannan1905/educonnect'
        },
        {
            id: 'f2', title: 'Beauty Parlour System', description: 'Appointment management and staff scheduling system with automated email reminders.', tags: 'Django, PostgreSQL, Bootstrap', icon: 'fas fa-spa', image_url: null, demo_url: '#', code_url: 'https://github.com/Srikannan1905/beautyparlour'
        },
        {
            id: 'f3', title: 'AI Resume Matcher', description: 'NLP-powered tool to score resumes against job descriptions using TF-IDF algorithms.', tags: 'Python, NLTK, Flask', icon: 'fas fa-robot', image_url: null, demo_url: '#', code_url: 'https://github.com/Srikannan1905/airesume'
        },
        {
            id: 'f4', title: 'Resort Management', description: 'Booking engine and inventory tracker built specifically for high-end boutique resorts.', tags: 'React, Node.js, Express', icon: 'fas fa-hotel', image_url: null, demo_url: '#', code_url: 'https://github.com/Srikannan1905/resortmgmt'
        }
    ];

    const projectsToRender = data.length > 0 ? data : fallbackData;

    return (
        <>
            <div className="page-header">
                <span className="ph-tag">{"//04"}</span>
                <h2 className="ph-title">PRO<span className="accent-g">_JECTS</span></h2>
                <div className="ph-line"></div>
            </div>
            <div className="proj-grid">
                {projectsToRender.map((proj, idx) => {
                    const tagList = proj.tags ? proj.tags.split(',').map(s => s.trim()) : [];
                    return (
                        <div key={`proj-${proj.id}`} className={`proj-card p${idx + 1} ${idx === 0 ? 'pc-featured' : ''}`}>
                            <div className="pc-glow"></div>
                            <div className="pc-num">{String(idx + 1).padStart(2, '0')}</div>
                            <div className="pc-inner">
                                <div className="pc-header">
                                    <i className={`${proj.icon || 'fas fa-code'} pc-icon ${['accent-y', 'accent-m', 'accent-g'][idx % 3]}`}></i>
                                </div>
                                <h3 className="pc-title">{proj.title}</h3>
                                <p className="pc-desc">{proj.description}</p>
                                <div className="pc-tags">
                                    {tagList.map((tag, i) => (
                                        <span key={i} className={`ptag ${['y', 'm', 'g'][i % 3]}`}>{tag}</span>
                                    ))}
                                </div>
                                <div className="pc-actions">
                                    {proj.demo_url && (
                                        <a href={proj.demo_url} target="_blank" rel="noreferrer" className="pc-btn">
                                            <i className="fas fa-external-link-alt"></i> DEMO
                                        </a>
                                    )}
                                    {proj.code_url && (
                                        <a href={proj.code_url} target="_blank" rel="noreferrer" className="pc-btn">
                                            <i className="fab fa-github"></i> CODE
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </>
    );
}

export default Projects;
