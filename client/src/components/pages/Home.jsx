import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const phrases = [
    'Full-Stack Java Developer',
    'Python & Django Engineer',
    'React.js Front-End Dev',
    'Spring Boot Specialist',
    'API Design Expert',
    'Problem Solver'
];

function Home({ onNavigate }) {
    const [data, setData] = useState(null);
    const [aboutData, setAboutData] = useState(null);
    const [typedText, setTypedText] = useState('');

    useEffect(() => {
        const fetchHome = async () => {
            try {
                const [homeRes, aboutRes] = await Promise.all([
                    axios.get(`${API_URL}/home`),
                    axios.get(`${API_URL}/about`)
                ]);
                if (homeRes.data) setData(homeRes.data);
                if (aboutRes.data) setAboutData(aboutRes.data);
            } catch (err) { console.error('Failed to fetch home data', err); }
        };
        fetchHome();
    }, []);

    useEffect(() => {
        let pi = 0, ci = 0, deleting = false, pauseFrames = 0;
        let timeout;

        const type = () => {
            const phrase = phrases[pi];
            if (pauseFrames > 0) { 
                pauseFrames--; 
                timeout = setTimeout(type, 80); 
                return; 
            }

            if (!deleting) {
                ci++;
                setTypedText(phrase.slice(0, ci));
                if (ci === phrase.length) { deleting = true; pauseFrames = 28; }
                timeout = setTimeout(type, 75);
            } else {
                ci--;
                setTypedText(phrase.slice(0, ci));
                if (ci === 0) { deleting = false; pi = (pi + 1) % phrases.length; pauseFrames = 6; }
                timeout = setTimeout(type, 38);
            }
        };
        timeout = setTimeout(type, 800);
        return () => clearTimeout(timeout);
    }, []);

    // Static Fallback Data
    const fallbackTitle = "SRIKANNAN J";
    const fallbackBio = (
        <>
            Building <span className="accent-y">scalable</span> systems with 
            <span className="accent-m">cutting-edge</span> technology. 
            Specialized in Full-Stack Java, Python, React.js & Django.
            Turning <span className="accent-g">complex problems</span> into elegant solutions.
        </>
    );
    const fallbackChips = ["Java", "Python", "React", "Django", "Spring Boot"];

    const title = data?.title || fallbackTitle;
    const bio = data?.bio || fallbackBio;
    let chips = fallbackChips;
    if (data?.tech_chips) {
        try { 
            const parsed = typeof data.tech_chips === 'string' ? JSON.parse(data.tech_chips) : data.tech_chips; 
            if (Array.isArray(parsed)) chips = parsed;
        } catch (e) { console.warn("Failed to parse tech chips JSON", e); }
    }

    let stats = [];
    if (aboutData?.stats_json) {
        try {
            stats = typeof aboutData.stats_json === 'string' ? JSON.parse(aboutData.stats_json) : aboutData.stats_json;
        } catch (e) { console.warn("Failed to parse stats JSON in Home", e); }
    }
    const defaultStats = [
        { lbl: 'PROJECTS', num: '4+', color: 'y' },
        { lbl: 'LANGUAGES', num: '6+', color: 'm' },
        { lbl: 'FRAMEWORKS', num: '8+', color: 'g' },
        { lbl: 'CGPA', num: '8.0', color: 'y' }
    ];
    const statsToRender = Array.isArray(stats) && stats.length > 0 ? stats : defaultStats;

    return (
        <div className="home-layout">
            <div className="home-left">
                <div className="glitch-wrap">
                    <span className="home-eyebrow">{"// " + (data?.subtitle || 'FULL-STACK DEVELOPER')}</span>
                    <h1 className="home-title glitch-text" data-text={title}>{title}</h1>
                    <div className="home-subtitle typewriter">{typedText}<span className="t-cursor">▋</span></div>
                </div>
                <p className="home-bio">{bio}</p>
                <div className="home-tech-row">
                    {chips.map((chip, idx) => (
                        <div key={idx} className={`tech-chip ${idx === 3 ? 'active-chip' : ''}`}>{chip}</div>
                    ))}
                </div>
                <div className="home-actions">
                    <button className="cp-btn primary" onClick={() => onNavigate('projects')}>
                        <span className="btn-bg"></span>
                        <i className="fas fa-code"></i> VIEW PROJECTS
                    </button>
                    <button className="cp-btn outline" onClick={() => onNavigate('contact')}>
                        <i className="fas fa-satellite-dish"></i> LET{"'"}S TALK
                    </button>
                </div>
            </div>
            <div className="home-right">
                <div className="avatar-frame" id="avatarFrame">
                    <div className="af-corner tl"></div>
                    <div className="af-corner tr"></div>
                    <div className="af-corner bl"></div>
                    <div className="af-corner br"></div>
                    <img src={aboutData?.profile_img_url ? (aboutData.profile_img_url.startsWith('http') ? aboutData.profile_img_url : `http://localhost:5000${aboutData.profile_img_url}`) : "/images/profile.jpeg"} alt="Srikannan J" className="avatar-photo" />
                    <div className="af-scan"></div>
                    <div className="af-overlay">
                        <span>{title}</span>
                        <span>{data?.subtitle || 'FULL-STACK DEV'}</span>
                    </div>
                </div>
                <div className="home-stats">
                    {statsToRender.map((st, idx) => {
                        let val = st.num || '0';
                        let pct = 80;
                        let numOnly = parseFloat(val);
                        if (!isNaN(numOnly)) {
                            if (numOnly <= 10) {
                                pct = numOnly * 10;
                            } else if (numOnly > 10 && numOnly <= 100) {
                                pct = numOnly;
                            } else if (numOnly > 100) {
                                pct = 95;
                            }
                        }
                        return (
                            <div className="hs-bar" key={idx}>
                                <span className="hs-label">{st.lbl.toUpperCase()}</span>
                                <div className="hs-track"><div className="hs-fill" style={{ width: `${pct}%` }}></div></div>
                                <span className="hs-val">{st.num}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
            {/* Floating corner labels */}
            <div className="corner-label top-left">SYS::PORTFOLIO_v2.6</div>
            <div className="corner-label top-right">STATUS::ONLINE</div>
            <div className="corner-label bot-left">NODE::TAMIL_NADU</div>
            <div className="corner-label bot-right">©2026_SJ</div>
        </div>
    );
}

export default Home;
