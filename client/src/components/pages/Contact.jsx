import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function Contact() {
    const [socials, setSocials] = useState({ github: '', linkedin: '', instagram: '' });
    const [about, setAbout] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [socRes, aboutRes] = await Promise.all([
                    axios.get(`${API_URL}/socials`),
                    axios.get(`${API_URL}/about`)
                ]);
                const socMap = {};
                socRes.data.forEach(s => { socMap[s.platform] = s.url; });
                setSocials(socMap);
                if (aboutRes.data) {
                    setAbout(aboutRes.data);
                }
            } catch (err) { console.error('Failed to fetch contact details', err); }
        };
        fetchData();
    }, []);

    const email = about?.email || 'srikannan9460@gmail.com';
    const phone = about?.phone || '+91 8056461905';
    const cleanPhone = phone.replace(/[^0-9]/g, '');

    const github = socials.github || 'https://github.com/Srikannan1905';
    const linkedin = socials.linkedin || 'https://linkedin.com/in/srikannan';
    const instagram = socials.instagram || 'https://instagram.com';

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        const name = document.getElementById('cf-name').value;
        const emailVal = document.getElementById('cf-email').value;
        const message = document.getElementById('cf-msg').value;
        try {
            await axios.post(`${API_URL}/messages`, { name, email: emailVal, message });
            const success = document.getElementById('cfSuccess');
            if (success) {
                success.classList.add('show');
                setTimeout(() => success.classList.remove('show'), 4000);
            }
            e.target.reset();
        } catch (err) {
            console.error('Failed to send message', err);
            alert('Transmission failed. Please try again.');
        }
    };

    return (
        <>
            <div className="page-header">
                <span className="ph-tag">{"//06"}</span>
                <h2 className="ph-title">CON<span className="accent-m">_TACT</span></h2>
                <div className="ph-line"></div>
            </div>
            <div className="contact-layout">
                <div className="contact-info">
                    <h3 className="cl-heading">CONNECT<span className="accent-y">::</span></h3>
                    <p className="cl-sub">Whether you have a question, a project idea, or just want to say hi, my inbox is always open.</p>

                    <div className="contact-links">
                        <a href={`mailto:${email}`} className="ct-link y">
                            <div className="ctl-icon"><i className="fas fa-envelope"></i></div>
                            <div className="ctl-text">
                                <span className="ctl-label">EMAIL</span>
                                <strong className="ctl-val">{email}</strong>
                            </div>
                        </a>
                        <a href={`https://wa.me/${cleanPhone}`} target="_blank" rel="noreferrer" className="ct-link g">
                            <div className="ctl-icon"><i className="fab fa-whatsapp"></i></div>
                            <div className="ctl-text">
                                <span className="ctl-label">WHATSAPP</span>
                                <strong className="ctl-val">{phone}</strong>
                            </div>
                        </a>
                    </div>

                    <h3 className="cl-heading" style={{ marginTop: '2rem' }}>SOCIALS<span className="accent-m">::</span></h3>
                    <div className="ac-socials">
                        <a href={github} target="_blank" rel="noreferrer" className="ac-social-btn" title="GitHub"><i className="fab fa-github"></i></a>
                        <a href={linkedin} target="_blank" rel="noreferrer" className="ac-social-btn linkedin" title="LinkedIn"><i className="fab fa-linkedin-in"></i></a>
                        <a href={instagram} target="_blank" rel="noreferrer" className="ac-social-btn" title="Instagram"><i className="fab fa-instagram"></i></a>
                        <a href={`mailto:${email}`} className="ac-social-btn" title="Email"><i className="fas fa-envelope"></i></a>
                    </div>
                </div>

                <div className="about-terminal">
                    <div className="term-bar">
                        <div className="tb-dot green"></div>
                        <i className="fas fa-terminal tb-title"></i> <span className="tb-title">TRANSMIT_MESSAGE</span>
                    </div>
                    <form id="contactForm" className="cp-form" style={{ padding: '1.1rem 1.4rem' }} onSubmit={handleFormSubmit}>
                        <div className="cf-field">
                            <input type="text" id="cf-name" className="cf-input" placeholder=" " required />
                            <label htmlFor="cf-name" className="cf-label">GUEST_NAME</label>
                        </div>
                        <div className="cf-field">
                            <input type="email" id="cf-email" className="cf-input" placeholder=" " required />
                            <label htmlFor="cf-email" className="cf-label">GUEST_EMAIL</label>
                        </div>
                        <div className="cf-field">
                            <textarea id="cf-msg" className="cf-input" rows="4" placeholder=" " required></textarea>
                            <label htmlFor="cf-msg" className="cf-label">MESSAGE_PAYLOAD</label>
                        </div>
                        <button type="submit" className="cp-btn primary w-full" style={{ marginTop: '1rem' }}>
                            <span className="btn-bg"></span>
                            <i className="fas fa-paper-plane"></i> SEND_DATA
                        </button>
                        <div className="cf-success" id="cfSuccess">
                            <i className="fas fa-check-circle"></i> TRANSMISSION SUCCESSFUL
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}

export default Contact;
