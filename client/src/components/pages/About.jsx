import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

function About() {
    const [data, setData] = useState(null);
    const [socials, setSocials] = useState({ github: '', linkedin: '' });
    const [certs, setCerts] = useState([]);

    useEffect(() => {
        const fetchAbout = async () => {
            try {
                const [aboutRes, socRes, certsRes] = await Promise.all([
                    axios.get(`${API_URL}/about`),
                    axios.get(`${API_URL}/socials`),
                    axios.get(`${API_URL}/certificates`)
                ]);
                if (aboutRes.data) setData(aboutRes.data);
                
                const socMap = {};
                socRes.data.forEach(s => { socMap[s.platform] = s.url; });
                setSocials(socMap);
                
                if (certsRes.data) setCerts(certsRes.data);
            } catch (err) { console.error('Failed to fetch about data', err); }
        };
        fetchAbout();
    }, []);

    const name = data?.name || "SRIKANNAN J";
    const role = data?.role || "Full-Stack Developer";
    const location = data?.location || "Salem, Tamil Nadu";
    const email = data?.email || "srikannan9460@gmail.com";
    const mission = data?.mission_text || "Passionate about building powerful, scalable solutions that tackle real-world problems. Dedicated to writing clean, maintainable code with precision and creativity.";
    
    let eduText = `{\n  "MSc": "Periyar University (2025-2026)",\n  "BSc": "Bharathiar University (2018-2021)",\n  "Cert": "Infi Techzone, Salem (2023)"\n}`;
    if (data?.education_json) {
        try { 
            const parsedEdu = typeof data.education_json === 'string' ? JSON.parse(data.education_json) : data.education_json;
            eduText = JSON.stringify(parsedEdu, null, 2); 
        } catch (e) { console.warn("Failed to parse education JSON in UI", e); }
    }
    
    let interests = "problem-solving/  backend-dev/  api-design/  data-analysis/  open-source/";
    if (data?.interests_json) {
        try { 
            const parsed = typeof data.interests_json === 'string' ? JSON.parse(data.interests_json) : data.interests_json; 
            if (Array.isArray(parsed)) interests = parsed.join('/  ') + '/';
        } catch (e) { console.warn("Failed to parse interests JSON in UI", e); }
    }

    const github = socials.github || "https://github.com/Srikannan1905";
    const linkedin = socials.linkedin || "https://linkedin.com";

    const fallbackCerts = [
        {
            id: 'c1',
            title: 'Java Certification',
            subtitle: 'INFI TECHZONE • AUG 2023',
            image_url: '/images/certificate-java.jpg'
        }
    ];
    const certsToRender = certs.length > 0 ? certs : fallbackCerts;

    const defaultStats = [
        { num: "8.0", lbl: "M.Sc CGPA", color: "y" },
        { num: "4+", lbl: "Projects", color: "m" },
        { num: "10+", lbl: "Technologies", color: "g" },
        { num: "2023", lbl: "Certified", color: "y" }
    ];
    let renderStats = defaultStats;
    if (data?.stats_json) {
        try { 
            const parsed = typeof data.stats_json === 'string' ? JSON.parse(data.stats_json) : data.stats_json; 
            if (Array.isArray(parsed) && parsed.length > 0) {
                renderStats = parsed;
            }
        } catch (e) { console.warn("Failed to parse stats JSON in UI", e); }
    }

    return (
        <>
            <div className="page-header">
                <span className="ph-tag">{"//02"}</span>
                <h2 className="ph-title">ABOUT<span className="accent-y">_ME</span></h2>
                <div className="ph-line"></div>
            </div>
            <div className="about-layout">
                <div className="about-left">
                    <div className="about-card">
                        <div className="ac-corners"></div>
                        <img src={data?.profile_img_url ? (data.profile_img_url.startsWith('http') ? data.profile_img_url : `http://localhost:5000${data.profile_img_url}`) : "/images/profile.jpeg"} alt={name} loading="lazy" />
                        <div className="ac-info">
                            <div className="ac-name">{name}</div>
                            <div className="ac-role">{role}</div>
                            <div className="ac-loc"><i className="fas fa-map-marker-alt"></i> {location}</div>
                            <div className="ac-mail"><i className="fas fa-envelope"></i> {email}</div>
                            <div className="ac-socials">
                                <a href={github} target="_blank" rel="noreferrer" className="ac-social-btn github" title="GitHub">
                                    <i className="fab fa-github"></i> GitHub
                                </a>
                                <a href={linkedin} target="_blank" rel="noreferrer" className="ac-social-btn linkedin" title="LinkedIn">
                                    <i className="fab fa-linkedin-in"></i> LinkedIn
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="about-right">
                    <div className="about-terminal">
                        <div className="term-bar">
                            <span className="tb-dot red"></span>
                            <span className="tb-dot yellow"></span>
                            <span className="tb-dot green"></span>
                            <span className="tb-title">srikannan@portfolio:~$</span>
                        </div>
                        <div className="term-body">
                            <p><span className="t-cmd">$ whoami</span></p>
                            <p className="t-out">{name} — {role}</p>
                            <p><span className="t-cmd">$ cat mission.txt</span></p>
                            <p className="t-out" dangerouslySetInnerHTML={{__html: mission.replace(/powerful, scalable solutions/, '<span class="accent-y">powerful, scalable solutions</span>')}}></p>
                            <p><span className="t-cmd">$ cat education.json</span></p>
                            <pre className="t-out t-json">{eduText}</pre>
                            <p><span className="t-cmd">$ ls interests/</span></p>
                            <p className="t-out accent-g">{interests}</p>
                            <p className="t-cursor">▋</p>
                        </div>
                    </div>
                    {/* Stats grid */}
                    <div className="about-stats">
                        {renderStats.map((st, i) => (
                            <div className="ast-card" key={i}>
                                <div className={`ast-num accent-${st.color || 'y'}`}>{st.num}</div>
                                <div className="ast-lbl">{st.lbl}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Certifications Section */}
            <div className="mt-16">
                <div className="page-header">
                    <span className="ph-tag">{"//03"}</span>
                    <h2 className="ph-title">CERTIFICATIONS<span className="accent-y">_</span></h2>
                    <div className="ph-line"></div>
                </div>
                <div className="certs-grid mt-8">
                    {certsToRender.map((cert) => (
                        <div key={cert.id} className="cert-thumb">
                            <div className="ct-label"><i className="fas fa-award"></i> CERTIFICATION</div>
                            <img src={cert.image_url ? (cert.image_url.startsWith('http') || cert.image_url.startsWith('/images/') ? cert.image_url : `http://localhost:5000${cert.image_url}`) : "/images/certificate-java.jpg"} alt={cert.title} />
                            <div className="ct-overlay">{cert.subtitle || cert.title}</div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}

export default About;
