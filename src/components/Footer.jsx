import { Facebook, Instagram, Youtube, Twitter } from 'lucide-react';

const Footer = () => {
    return (
        <footer style={{ backgroundColor: 'var(--color-text)', color: 'var(--color-white)', padding: '3rem 0', marginTop: 'auto' }}>
            <div className="container">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
                    <div>
                        <img src="/logo.svg" alt="GenFree Network" style={{ height: '140px', marginBottom: '1rem' }} />
                        <p style={{ color: '#cbd5e1', fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem' }}>GENFREE.</p>
                        <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: '1.6' }}>A Spirit-led initiative transforming lives for God's glory.</p>
                    </div>

                    <div>
                        <h4 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--color-white)' }}>Quick Links</h4>
                        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <li><a href="/about" style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: '0.95rem', transition: 'color 0.2s' }} onMouseOver={(e) => e.target.style.color = '#10b981'} onMouseOut={(e) => e.target.style.color = '#cbd5e1'}>About Us</a></li>
                            <li><a href="/activities" style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: '0.95rem', transition: 'color 0.2s' }} onMouseOver={(e) => e.target.style.color = '#10b981'} onMouseOut={(e) => e.target.style.color = '#cbd5e1'}>Activities</a></li>
                            <li><a href="/contact" style={{ color: '#cbd5e1', textDecoration: 'none', fontSize: '0.95rem', transition: 'color 0.2s' }} onMouseOver={(e) => e.target.style.color = '#10b981'} onMouseOut={(e) => e.target.style.color = '#cbd5e1'}>Contact</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#f1f5f9', fontWeight: '600' }}>Stay Updated</h4>
                        <p style={{ color: '#94a3b8', marginBottom: '1rem', fontSize: '0.95rem', lineHeight: '1.6' }}>
                            Subscribe to our newsletter for the latest updates and inspiration.
                        </p>
                        <form style={{ display: 'flex', gap: '0.5rem' }} onSubmit={(e) => e.preventDefault()}>
                            <input
                                type="email"
                                placeholder="Your email"
                                style={{
                                    padding: '0.75rem',
                                    borderRadius: '6px',
                                    border: '1px solid #64748b',
                                    backgroundColor: '#1e293b',
                                    color: '#f1f5f9',
                                    flex: 1,
                                    fontSize: '0.9rem'
                                }}
                            />
                            <button
                                type="submit"
                                className="btn btn-accent"
                                style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
                            >
                                Join
                            </button>
                        </form>

                        <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1.5rem' }}>
                            <a href="#" style={{ color: '#94a3b8', transition: 'color 0.2s' }} onMouseOver={(e) => e.target.style.color = '#10b981'} onMouseOut={(e) => e.target.style.color = '#94a3b8'}><Youtube size={24} /></a>
                            <a href="#" style={{ color: '#94a3b8', transition: 'color 0.2s' }} onMouseOver={(e) => e.target.style.color = '#10b981'} onMouseOut={(e) => e.target.style.color = '#94a3b8'}><Facebook size={24} /></a>
                            <a href="#" style={{ color: '#94a3b8', transition: 'color 0.2s' }} onMouseOver={(e) => e.target.style.color = '#10b981'} onMouseOut={(e) => e.target.style.color = '#94a3b8'}><Instagram size={24} /></a>
                            <a href="#" style={{ color: '#94a3b8', transition: 'color 0.2s' }} onMouseOver={(e) => e.target.style.color = '#10b981'} onMouseOut={(e) => e.target.style.color = '#94a3b8'}><Twitter size={24} /></a>
                        </div>
                    </div>
                </div>

                <div style={{ borderTop: '1px solid #475569', marginTop: '2rem', paddingTop: '2rem', textAlign: 'center' }}>
                    <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>&copy; {new Date().getFullYear()} GenFree Network. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
