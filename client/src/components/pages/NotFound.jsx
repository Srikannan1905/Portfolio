import React from 'react';
import { Link } from 'react-router-dom';

function NotFound() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg)', color: 'var(--fg)', textAlign: 'center' }}>
            <h1 style={{ fontSize: '4rem', fontFamily: 'var(--f-head)', color: 'var(--neon-m)', marginBottom: '1rem', textShadow: 'var(--glow-m)' }}>404</h1>
            <p style={{ fontFamily: 'var(--f-mono)', fontSize: '1.2rem', color: 'var(--muted)', marginBottom: '2rem' }}>SYS::ERR_PAGE_NOT_FOUND</p>
            <Link to="/" className="cp-btn y">
                RETURN_TO_BASE
            </Link>
        </div>
    );
}

export default NotFound;
