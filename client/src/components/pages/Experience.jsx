import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function Experience() {
    const [data, setData] = useState([]);

    useEffect(() => {
        const fetchExp = async () => {
            try {
                const res = await axios.get(`${API_URL}/experience`);
                if (res.data && res.data.length > 0) setData(res.data);
            } catch (err) { console.error('Failed to fetch experience', err); }
        };
        fetchExp();
    }, []);

    const fallbackData = [
        {
            id: 'f1', year: '2025', badge: 'INTERNSHIP', role: 'Full Stack Web Development Intern', company: 'Viswa Digital Technology, Salem', period: 'MAY 2025 — JUN 2025',
            bullets_json: JSON.stringify([
                'Intensive Python training focused on E-commerce development and data science concepts.',
                'Built understanding of company guidelines throughout the full-cycle development process.',
                'Incorporated basic data analysis techniques for business insights into development projects.'
            ]),
            tags_json: JSON.stringify(['Python', 'Web Dev', 'Data Analysis', 'E-Commerce'])
        },
        {
            id: 'f2', year: '2023', badge: 'CERTIFICATION', role: 'Full-Stack Java Development', company: 'Infi Techzone, Salem', period: 'AUG 2023',
            bullets_json: JSON.stringify([
                'Certified Full-Stack Java Developer recognized by INFI TECHZONE.',
                'Hands-on training in Spring Boot, Hibernate, and enterprise Java patterns.',
                'Project-based learning covering REST APIs, JWT security, and database design.'
            ]),
            tags_json: JSON.stringify(['Java', 'Spring Boot', 'Hibernate', 'REST API'])
        },
        {
            id: 'f3', year: '2021', badge: 'EDUCATION', role: 'M.Sc. Computer Science', company: 'Periyar University', period: '2025–2026',
            bullets_json: JSON.stringify([
                'Focus on advanced programming, algorithms, and software engineering.',
                'CGPA: 8.0 — consistent academic excellence.'
            ]),
            tags_json: JSON.stringify(['M.Sc CS', 'CGPA 8.0'])
        }
    ];

    const expToRender = data.length > 0 ? data : fallbackData;

    return (
        <>
            <div className="page-header">
                <span className="ph-tag">{"//05"}</span>
                <h2 className="ph-title">EXPERI<span className="accent-y">_ENCE</span></h2>
                <div className="ph-line"></div>
            </div>
            <div className="exp-layout">
                {/* Timeline */}
                <div className="exp-timeline">
                    {expToRender.map((exp, idx) => (
                        <React.Fragment key={`tl-${exp.id}`}>
                            <div className={`etl-item ${idx === 0 ? 'active' : ''}`}>
                                <div className={`etl-dot ${idx !== 0 ? 'dim' : ''}`}></div>
                                <div className={`etl-year ${idx !== 0 ? 'dim' : ''}`}>{exp.year}</div>
                                {idx === 0 && <div className="etl-connector"></div>}
                            </div>
                            {idx < expToRender.length - 1 && <div className={`etl-line ${idx !== 0 ? 'dim' : ''}`}></div>}
                        </React.Fragment>
                    ))}
                </div>
                {/* Cards */}
                <div className="exp-cards">
                    {expToRender.map((exp, idx) => {
                        let bullets = [];
                        let tags = [];
                        try { bullets = typeof exp.bullets_json === 'string' ? JSON.parse(exp.bullets_json) : exp.bullets_json || []; } catch (e) { console.warn("Failed to parse experience bullets JSON", e); }
                        try { tags = typeof exp.tags_json === 'string' ? JSON.parse(exp.tags_json) : exp.tags_json || []; } catch (e) { console.warn("Failed to parse experience tags JSON", e); }

                        return (
                            <div key={`card-${exp.id}`} className={`exp-card ${idx === 0 ? 'active-card' : ''}`}>
                                <div className="ec-corner tl"></div>
                                <div className="ec-corner br"></div>
                                <div className="ec-badge">{exp.badge}</div>
                                <div className="ec-header">
                                    <div>
                                        <h3 className="ec-role">{exp.role}</h3>
                                        <p className="ec-company">
                                            <i className={`fas fa-${exp.badge === 'EDUCATION' ? 'university' : exp.badge === 'CERTIFICATION' ? 'award' : 'building'}`}></i> {exp.company}
                                        </p>
                                    </div>
                                    <div className="ec-period">
                                        <span>{exp.period}</span>
                                    </div>
                                </div>
                                <ul className="ec-bullets">
                                    {bullets.map((b, i) => (
                                        <li key={i}>
                                            <i className={`fas fa-caret-right accent-${['y', 'm', 'g'][i % 3]}`}></i> {b}
                                        </li>
                                    ))}
                                </ul>
                                <div className="ec-tags">
                                    {tags.map((t, i) => (
                                        <span key={i} className={`ptag ${['y', 'm', 'g'][i % 3]}`}>{t}</span>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </>
    );
}

export default Experience;
