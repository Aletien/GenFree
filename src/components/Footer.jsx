import { Facebook, Instagram, Youtube, Twitter } from 'lucide-react';

const Footer = () => {
    return (
        <footer style={{ backgroundColor: '#f8fafc', color: '#1f2937', padding: '3rem 0', marginTop: 'auto' }}>
            <div className="container">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
                    <div>
                        <img src="/logo.svg" alt="GenFree Network" style={{ height: '140px', marginBottom: '1rem' }} />
                        <p style={{ color: '#374151', fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem' }}>GENFREE.</p>
                        <p style={{ color: '#6b7280', fontSize: '0.95rem', lineHeight: '1.6' }}>A Spirit-led initiative transforming lives for God's glory.</p>
                    </div>

                    <div>
                        <h4 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#1f2937' }}>Quick Links</h4>
                        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <li><a href="/about" style={{ color: '#6b7280', textDecoration: 'none', fontSize: '0.95rem', transition: 'color 0.2s' }} onMouseOver={(e) => e.target.style.color = '#10b981'} onMouseOut={(e) => e.target.style.color = '#6b7280'}>About Us</a></li>
                            <li><a href="/activities" style={{ color: '#6b7280', textDecoration: 'none', fontSize: '0.95rem', transition: 'color 0.2s' }} onMouseOver={(e) => e.target.style.color = '#10b981'} onMouseOut={(e) => e.target.style.color = '#6b7280'}>Activities</a></li>
                            <li><a href="/contact" style={{ color: '#6b7280', textDecoration: 'none', fontSize: '0.95rem', transition: 'color 0.2s' }} onMouseOver={(e) => e.target.style.color = '#10b981'} onMouseOut={(e) => e.target.style.color = '#6b7280'}>Contact</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#1f2937', fontWeight: '600' }}>Stay Updated</h4>
                        <p style={{ color: '#6b7280', marginBottom: '1rem', fontSize: '0.95rem', lineHeight: '1.6' }}>
                            Subscribe to our newsletter for the latest updates and inspiration.
                        </p>
                        <form style={{ display: 'flex', gap: '0.5rem' }} onSubmit={(e) => e.preventDefault()}>
                            <input
                                type="email"
                                placeholder="Your email"
                                style={{
                                    padding: '0.75rem',
                                    borderRadius: '6px',
                                    border: '1px solid #d1d5db',
                                    backgroundColor: '#ffffff',
                                    color: '#374151',
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
                            <a href="https://youtube.com/@genfree" target="_blank" rel="noopener noreferrer" style={{ color: '#6b7280', transition: 'color 0.2s' }} onMouseOver={(e) => e.target.style.color = '#FF0000'} onMouseOut={(e) => e.target.style.color = '#6b7280'}><Youtube size={24} /></a>
                            <a href="https://facebook.com/genfree" target="_blank" rel="noopener noreferrer" style={{ color: '#6b7280', transition: 'color 0.2s' }} onMouseOver={(e) => e.target.style.color = '#1877F2'} onMouseOut={(e) => e.target.style.color = '#6b7280'}><Facebook size={24} /></a>
                            <a href="https://instagram.com/genfree" target="_blank" rel="noopener noreferrer" style={{ color: '#6b7280', transition: 'color 0.2s' }} onMouseOver={(e) => e.target.style.color = '#E4405F'} onMouseOut={(e) => e.target.style.color = '#6b7280'}><Instagram size={24} /></a>
                            <a href="https://tiktok.com/@genfree" target="_blank" rel="noopener noreferrer" style={{ color: '#6b7280', transition: 'color 0.2s' }} onMouseOver={(e) => e.target.style.color = '#000000'} onMouseOut={(e) => e.target.style.color = '#6b7280'}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>

                <div style={{ borderTop: '1px solid #e5e7eb', marginTop: '2rem', paddingTop: '2rem', textAlign: 'center' }}>
                    <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>&copy; {new Date().getFullYear()} GenFree Network. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
