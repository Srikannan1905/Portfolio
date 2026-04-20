'use strict';

// ── Page Router ────────────────────────────────────────
const pages     = document.querySelectorAll('.page');
const navBtns   = document.querySelectorAll('[data-page]');
const wipe      = document.getElementById('pageWipe');
const wipeText  = document.getElementById('wipeText');
let currentPage = 'home';
let isTransitioning = false;

const pageLabels = {
    home:       'BOOTING...',
    about:      'LOADING PROFILE...',
    skills:     'SCANNING TECH...',
    projects:   'ACCESSING FILES...',
    experience: 'REVIEWING LOGS...',
    contact:    'OPENING CHANNEL...'
};

function navigateTo(id, force = false) {
    if ((id === currentPage && !force) || isTransitioning) return;
    isTransitioning = true;

    // Wipe open
    wipeText.textContent = pageLabels[id] || 'LOADING...';
    wipe.classList.add('active');

    setTimeout(() => {
        // Swap pages
        pages.forEach(p => p.classList.remove('active'));
        const target = document.getElementById('page-' + id);
        if (target) target.classList.add('active');
        currentPage = id;

        // Update sidebar/mobile active
        navBtns.forEach(b => {
            b.classList.toggle('active', b.dataset.page === id);
        });

        // Wipe close
        wipe.classList.remove('active');
        isTransitioning = false;

        // Scroll to top
        document.getElementById('app').scrollTo({ top: 0 });

        // Trigger page-specific init
        onPageEnter(id);
    }, 280);
}

function onPageEnter(id) {
    if (id === 'home')       initHomeBars();
    if (id === 'skills')     initSkillBars();
    if (id === 'about')      initCounters();
}

// Nav buttons
navBtns.forEach(btn => {
    btn.addEventListener('click', () => navigateTo(btn.dataset.page));
});

// ── Background Canvas (CRT Grid + Particles) ───────────
const canvas = document.getElementById('bgCanvas');
const ctx    = canvas.getContext('2d');
let W, H, particles = [];

function resizeBg() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
    makeParticles();
}

function makeParticles(n = 60) {
    particles = Array.from({ length: n }, () => ({
        x: Math.random() * W,
        y: Math.random() * H,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 1.5 + 0.3,
        color: ['#F5C518','#E8005A','#00C853','#9C27B0'][Math.floor(Math.random() * 4)],
        life: Math.random()
    }));
}

let bgTime = 0;
function drawBg() {
    bgTime += 0.005;
    ctx.clearRect(0, 0, W, H);

    // Grid
    ctx.strokeStyle = 'rgba(30, 30, 50, 0.8)';
    ctx.lineWidth = 0.5;
    const gs = 60;
    for (let x = 0; x < W; x += gs) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
    for (let y = 0; y < H; y += gs) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }

    // Neon orbs (underlying glow) — gold / magenta / green
    const orbs = [
        { x: W * 0.15, y: H * 0.3, r: 280, c: 'rgba(232,0,90,0.05)' },
        { x: W * 0.82, y: H * 0.55, r: 320, c: 'rgba(245,197,24,0.045)' },
        { x: W * 0.5,  y: H * 0.85, r: 200, c: 'rgba(0,200,83,0.035)' }
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

    // Particles
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

    requestAnimationFrame(drawBg);
}

resizeBg();
drawBg();
window.addEventListener('resize', resizeBg, { passive: true });

// ── Custom Cursor ──────────────────────────────────────
const cInner = document.getElementById('cursor-inner');
const cOuter = document.getElementById('cursor-outer');
const cTrail = document.getElementById('cursor-trail');

if (window.matchMedia('(pointer: fine)').matches) {
    let mx = -200, my = -200;
    let ox = -200, oy = -200;
    let tx = -200, ty = -200;

    document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });

    function tickCursor() {
        cInner.style.left = mx + 'px';
        cInner.style.top  = my + 'px';

        ox += (mx - ox) * 0.18;
        oy += (my - oy) * 0.18;
        cOuter.style.left = ox + 'px';
        cOuter.style.top  = oy + 'px';

        tx += (mx - tx) * 0.06;
        ty += (my - ty) * 0.06;
        cTrail.style.left = tx + 'px';
        cTrail.style.top  = ty + 'px';

        requestAnimationFrame(tickCursor);
    }
    tickCursor();

    const hoverables = 'a, button, .sk-card, .proj-card, .exp-card, .ct-link, .cf-input, .cert-thumb';
    document.addEventListener('mouseover', e => {
        if (e.target.closest(hoverables)) document.body.classList.add('cursor-hover');
    });
    document.addEventListener('mouseout', e => {
        if (e.target.closest(hoverables)) document.body.classList.remove('cursor-hover');
    });
} else {
    cInner.style.display = 'none';
    cOuter.style.display = 'none';
    cTrail.style.display = 'none';
    document.body.style.cursor = 'auto';
}

// ── Typewriter Effect ──────────────────────────────────
const phrases = [
    'Full-Stack Java Developer',
    'Python & Django Engineer',
    'React.js Front-End Dev',
    'Spring Boot Specialist',
    'API Design Expert',
    'Problem Solver'
];
(function initTypewriter() {
    const el = document.getElementById('typewriter');
    if (!el) return;
    let pi = 0, ci = 0, deleting = false, pauseFrames = 0;

    function type() {
        const phrase = phrases[pi];
        if (pauseFrames > 0) { pauseFrames--; setTimeout(type, 80); return; }

        if (!deleting) {
            ci++;
            el.textContent = phrase.slice(0, ci);
            if (ci === phrase.length) { deleting = true; pauseFrames = 28; }
            setTimeout(type, 75);
        } else {
            ci--;
            el.textContent = phrase.slice(0, ci);
            if (ci === 0) { deleting = false; pi = (pi + 1) % phrases.length; pauseFrames = 6; }
            setTimeout(type, 38);
        }
    }
    setTimeout(type, 800); // short delay on load
})();

// ── Home Stat Bars ─────────────────────────────────────
function initHomeBars() {
    setTimeout(() => {
        document.querySelectorAll('.hs-fill').forEach(el => {
            const w = el.style.getPropertyValue('--pct') || el.dataset.width + '%';
            el.style.width = w;
        });
    }, 200);
}

// ── Skill Filter ───────────────────────────────────────
document.querySelectorAll('.skf').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.skf').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.dataset.filter;

        document.querySelectorAll('.sk-card').forEach(card => {
            const cat = card.dataset.cat || '';
            if (filter === 'all' || cat.includes(filter)) {
                card.classList.remove('hidden');
                // Re-trigger skill bar animation
                setTimeout(() => {
                    const fill = card.querySelector('.skc-fill');
                    if (fill) fill.style.width = fill.dataset.w + '%';
                }, 50);
            } else {
                card.classList.add('hidden');
            }
        });
    });
});

// ── Skill Bar Animations ───────────────────────────────
function initSkillBars() {
    setTimeout(() => {
        document.querySelectorAll('.skc-fill').forEach(el => {
            el.style.width = '0';
            setTimeout(() => { el.style.width = el.dataset.w + '%'; }, 100);
        });
    }, 200);
}

// ── Animated Counters ──────────────────────────────────
function initCounters() {
    document.querySelectorAll('[data-count]').forEach(el => {
        const target = parseFloat(el.dataset.count);
        const suffix = el.dataset.suffix || '';
        let start = null;
        const dur = 1600;

        function step(ts) {
            if (!start) start = ts;
            const p = Math.min((ts - start) / dur, 1);
            const ease = 1 - Math.pow(1 - p, 3);
            const val = target * ease;
            el.textContent = Number.isInteger(target) ? Math.floor(val) : val.toFixed(1);
            if (p < 1) requestAnimationFrame(step);
            else el.textContent = (Number.isInteger(target) ? target : target.toFixed(1)) + suffix;
        }
        requestAnimationFrame(step);
    });
}

// ── Tilt Effect (smooth spring) ───────────────────────
document.querySelectorAll('.proj-card, .exp-card, .sk-card').forEach(card => {
    let cx = 0, cy = 0, tx2 = 0, ty2 = 0, raf2, inside = false;

    function tick2() {
        cx += (tx2 - cx) * 0.09;
        cy += (ty2 - cy) * 0.09;
        const scale = inside ? 1.015 : 1;
        card.style.transform = `perspective(900px) rotateX(${cy}deg) rotateY(${cx}deg) scale(${scale})`;
        if (inside || Math.abs(cx) > 0.05 || Math.abs(cy) > 0.05) {
            raf2 = requestAnimationFrame(tick2);
        } else {
            card.style.transform = '';
        }
    }

    card.addEventListener('mouseenter', () => { inside = true; cancelAnimationFrame(raf2); tick2(); });
    card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        tx2 = ((e.clientX - r.left) / r.width  - 0.5) * 10;
        ty2 = ((e.clientY - r.top)  / r.height - 0.5) * -10;
    });
    card.addEventListener('mouseleave', () => {
        inside = false; tx2 = 0; ty2 = 0;
        tick2();
    });
});

// ── Mobile Menu ────────────────────────────────────────
const mobileMenuBtn  = document.getElementById('mobileMenuBtn');
const mobileMenuEl   = document.getElementById('mobileMenu');
mobileMenuBtn?.addEventListener('click', () => mobileMenuEl.classList.toggle('open'));

document.querySelectorAll('.mob-nav').forEach(btn => {
    btn.addEventListener('click', () => {
        mobileMenuEl.classList.remove('open');
    });
});

// ── Contact Form ───────────────────────────────────────
document.getElementById('contactForm')?.addEventListener('submit', e => {
    e.preventDefault();
    const success = document.getElementById('cfSuccess');
    success.classList.add('show');
    e.target.reset();
    setTimeout(() => success.classList.remove('show'), 4000);
});

// ── Certificate Lightbox ───────────────────────────────
const lb     = document.getElementById('lightbox');
const lbImg  = document.getElementById('lbImg');
const lbBd   = document.getElementById('lbBackdrop');
const lbCls  = document.getElementById('lbClose');

document.querySelectorAll('.cert-thumb').forEach(el => {
    el.addEventListener('click', () => {
        const src = el.querySelector('img')?.src;
        if (!src) return;
        lbImg.src = src;
        lb.classList.add('open');
        document.body.style.overflow = 'hidden';
    });
});
function closeLB() { lb.classList.remove('open'); document.body.style.overflow = ''; lbImg.src = ''; }
lbBd?.addEventListener('click', closeLB);
lbCls?.addEventListener('click', closeLB);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLB(); });

// ── Glitch on hover (title) ────────────────────────────
document.querySelectorAll('.glitch-text').forEach(el => {
    const original = el.dataset.text;
    const chars = 'アイウエオカキク！@#$%^&ΞΨΩΔ';
    let interval, count = 0;

    el.addEventListener('mouseenter', () => {
        count = 0;
        interval = setInterval(() => {
            el.textContent = original.split('').map((c, i) =>
                i < count ? c : chars[Math.floor(Math.random() * chars.length)]
            ).join('');
            count++;
            if (count >= original.length) {
                clearInterval(interval);
                el.textContent = original;
            }
        }, 40);
    });
});

// ── Initialize home on load ────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
    navigateTo('home', true);
    initHomeBars();
});

// ── Staggered entrance for skill/project cards ────────
(function staggerCards() {
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const parent = entry.target.closest('.sk-grid, .proj-grid, .exp-cards');
            const siblings = parent ? [...parent.querySelectorAll('.sk-card, .proj-card, .exp-card')] : [entry.target];
            const idx = siblings.indexOf(entry.target);
            const delay = Math.max(0, idx * 60);
            setTimeout(() => {
                entry.target.style.opacity = '1';
                entry.target.style.transform = '';
            }, delay);
            observer.unobserve(entry.target);
        });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.sk-card, .proj-card, .exp-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(18px)';
        el.style.transition = 'opacity 0.5s ease, transform 0.5s cubic-bezier(0.4,0,0.2,1)';
        observer.observe(el);
    });
})();

console.log('%c⚡ [SJ PORTFOLIO] // PROFESSIONAL CYBERPUNK v3 ACTIVE', 'color:#F5C518;font-size:13px;font-family:monospace;font-weight:bold;');
console.log('%c   Java | Python | React.js | Spring Boot | Django', 'color:#E8005A;font-size:11px;font-family:monospace;');
