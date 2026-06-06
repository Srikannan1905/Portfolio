import { useEffect, useRef, useState } from 'react';

const pageLabels = {
    home: 'BOOTING...',
    about: 'LOADING PROFILE...',
    skills: 'SCANNING TECH...',
    projects: 'ACCESSING FILES...',
    experience: 'REVIEWING LOGS...',
    contact: 'OPENING CHANNEL...'
};

function Layout({ activePage, onNavigate, children }) {
    const canvasRef = useRef(null);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [wipeText, setWipeText] = useState('LOADING...');
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [resumeUrl, setResumeUrl] = useState('/Srikannan.J_ReSuMe.pdf');
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    useEffect(() => {
        // Fetch about data just for the resume URL
        fetch(`${API_URL}/about`)
            .then(res => res.json())
            .then(data => {
                if (data && data.resume_url) {
                    // If it's a relative path (e.g. /uploads/...), prepend the backend base URL
                    const url = data.resume_url.startsWith('http')
                        ? data.resume_url
                        : `http://localhost:5000${data.resume_url}`;
                    setResumeUrl(url);
                }
            })
            .catch(err => console.error('Failed to fetch resume url', err));
    }, []);

    const handleNav = (pageId) => {
        if (pageId === activePage || isTransitioning) return;
        setIsTransitioning(true);
        setWipeText(pageLabels[pageId] || 'LOADING...');
        setMobileMenuOpen(false);

        setTimeout(() => {
            onNavigate(pageId);
            window.scrollTo({ top: 0 });
            setTimeout(() => setIsTransitioning(false), 280);
        }, 280);
    };

    // Canvas Background Animation
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let W, H, particles = [];
        let animationFrameId;

        const makeParticles = (n = 60) => {
            particles = Array.from({ length: n }, () => ({
                x: Math.random() * W,
                y: Math.random() * H,
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.3,
                r: Math.random() * 1.5 + 0.3,
                color: ['#F5C518', '#E8005A', '#00C853', '#9C27B0'][Math.floor(Math.random() * 4)],
                life: Math.random()
            }));
        };

        const resizeBg = () => {
            W = canvas.width = window.innerWidth;
            H = canvas.height = window.innerHeight;
            makeParticles();
        };

        resizeBg();
        window.addEventListener('resize', resizeBg, { passive: true });

        let bgTime = 0;
        const drawBg = () => {
            bgTime += 0.005;
            ctx.clearRect(0, 0, W, H);

            ctx.strokeStyle = 'rgba(30, 30, 50, 0.8)';
            ctx.lineWidth = 0.5;
            const gs = 60;
            for (let x = 0; x < W; x += gs) {
                ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
            }
            for (let y = 0; y < H; y += gs) {
                ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
            }

            const orbs = [
                { x: W * 0.15, y: H * 0.3, r: 280, c: 'rgba(232,0,90,0.05)' },
                { x: W * 0.82, y: H * 0.55, r: 320, c: 'rgba(245,197,24,0.045)' },
                { x: W * 0.5, y: H * 0.85, r: 200, c: 'rgba(0,200,83,0.035)' }
            ];
            orbs.forEach(o => {
                const grd = ctx.createRadialGradient(
                    o.x + Math.sin(bgTime * 0.3) * 30, o.y + Math.cos(bgTime * 0.2) * 20, 0,
                    o.x, o.y, o.r
                );
                grd.addColorStop(0, o.c);
                grd.addColorStop(1, 'transparent');
                ctx.fillStyle = grd;
                ctx.beginPath(); ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2); ctx.fill();
            });

            particles.forEach(p => {
                p.x += p.vx; p.y += p.vy;
                p.life = (p.life + 0.003) % 1;
                if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
                if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;

                const op = Math.sin(p.life * Math.PI) * 0.6;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.globalAlpha = op;
                ctx.fill();
            });
            ctx.globalAlpha = 1;

            animationFrameId = requestAnimationFrame(drawBg);
        };
        drawBg();

        return () => {
            window.removeEventListener('resize', resizeBg);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    // Custom Cursor Logic
    const cInnerRef = useRef(null);
    const cOuterRef = useRef(null);
    const cTrailRef = useRef(null);

    useEffect(() => {
        if (!window.matchMedia('(pointer: fine)').matches) return;

        const cInner = cInnerRef.current;
        const cOuter = cOuterRef.current;
        const cTrail = cTrailRef.current;
        if (!cInner || !cOuter || !cTrail) return;

        let mx = -200, my = -200;
        let ox = -200, oy = -200;
        let tx = -200, ty = -200;
        let rafId;

        const onMouseMove = (e) => { mx = e.clientX; my = e.clientY; };
        document.addEventListener('mousemove', onMouseMove);

        const tickCursor = () => {
            cInner.style.left = mx + 'px';
            cInner.style.top = my + 'px';

            ox += (mx - ox) * 0.18;
            oy += (my - oy) * 0.18;
            cOuter.style.left = ox + 'px';
            cOuter.style.top = oy + 'px';

            tx += (mx - tx) * 0.06;
            ty += (my - ty) * 0.06;
            cTrail.style.left = tx + 'px';
            cTrail.style.top = ty + 'px';

            rafId = requestAnimationFrame(tickCursor);
        };
        tickCursor();

        const hoverables = 'a, button, .sk-card, .proj-card, .exp-card, .ct-link, .cf-input, .cert-thumb';
        const onMouseOver = (e) => { if (e.target.closest(hoverables)) document.body.classList.add('cursor-hover'); };
        const onMouseOut = (e) => { if (e.target.closest(hoverables)) document.body.classList.remove('cursor-hover'); };

        document.addEventListener('mouseover', onMouseOver);
        document.addEventListener('mouseout', onMouseOut);

        return () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseover', onMouseOver);
            document.removeEventListener('mouseout', onMouseOut);
            cancelAnimationFrame(rafId);
        };
    }, []);

    return (
        <>
            <div id="cursor-outer" ref={cOuterRef}></div>
            <div id="cursor-inner" ref={cInnerRef}></div>
            <div id="cursor-trail" ref={cTrailRef}></div>

            <div className="scanlines"></div>
            <div className="noise"></div>
            <div className="vignette"></div>

            <canvas id="bgCanvas" ref={canvasRef}></canvas>

            <div id="pageWipe" className={isTransitioning ? 'active' : ''}>
                <div className="wipe-text" id="wipeText">{wipeText}</div>
            </div>

            <nav id="sidebar">
                <div className="sidebar-logo">
                    <a href="/admin" title="Admin Access" style={{ textDecoration: 'none', color: 'inherit', cursor: 'pointer', display: 'block', transition: 'all 0.2s' }}
                        onMouseEnter={e => { e.currentTarget.style.textShadow = '0 0 20px var(--neon-y), 0 0 40px var(--neon-y)'; e.currentTarget.style.transform = 'scale(1.08)'; }}
                        onMouseLeave={e => { e.currentTarget.style.textShadow = ''; e.currentTarget.style.transform = ''; }}>
                        <span className="bracket">[</span>SJ<span className="bracket">]</span>
                    </a>
                </div>
                <div className="sidebar-nav">
                    {Object.keys(pageLabels).map(page => (
                        <button
                            key={page}
                            className={`nav-btn ${activePage === page ? 'active' : ''}`}
                            onClick={() => handleNav(page)}
                        >
                            <i className={`fas fa-${page === 'home' ? 'home' : page === 'about' ? 'user' : page === 'skills' ? 'microchip' : page === 'projects' ? 'code-branch' : page === 'experience' ? 'briefcase' : 'satellite-dish'}`}></i>
                            <span>{page.toUpperCase()}</span>
                        </button>
                    ))}
                </div>
                <a href={resumeUrl} download="Resume.pdf" className="sidebar-resume">
                    <i className="fas fa-download"></i>
                    <span>RESUME</span>
                </a>
            </nav>

            <header id="topbar">
                <div className="topbar-logo">
                    <a href="/admin" title="Admin Access" style={{ textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}>
                        <span className="bracket">[</span>SJ<span className="bracket">]</span>
                    </a>
                </div>
                <button id="mobileMenuBtn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                    <i className="fas fa-bars"></i>
                </button>
            </header>

            <div id="mobileMenu" className={mobileMenuOpen ? 'open' : ''}>
                {Object.keys(pageLabels).map(page => (
                    <button key={page} className="mob-nav" onClick={() => handleNav(page)}>
                        <i className={`fas fa-${page === 'home' ? 'home' : page === 'about' ? 'user' : page === 'skills' ? 'microchip' : page === 'projects' ? 'code-branch' : page === 'experience' ? 'briefcase' : 'satellite-dish'}`}></i> {page.toUpperCase()}
                    </button>
                ))}
            </div>

            <main id="app">
                <div className={`page transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'} active`}>
                    {children}
                </div>
            </main>
        </>
    );
}

export default Layout;
