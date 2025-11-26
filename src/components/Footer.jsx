import { Facebook, Instagram, Youtube, Twitter } from 'lucide-react';

const Footer = () => {
    return (
        <footer style={{ backgroundColor: 'var(--color-text)', color: 'var(--color-white)', padding: '3rem 0', marginTop: 'auto' }}>
            <div className="container">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
                    <div>
                        <img src="/GenFree/logo.svg" alt="GenFree Network" style={{ height: '70px', marginBottom: '1rem' }} />
                        <p style={{ color: 'var(--color-text-muted)' }}>GENFREE.</p>
                        <p style={{ color: 'var(--color-text-muted)' }}>A Spirit-led initiative transforming lives for God's glory.</p>
                    </div>

                    <div>
                        <h4 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Quick Links</h4>
                        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <li><a href="/about" style={{ color: 'var(--color-text-muted)' }}>About Us</a></li>
                            <li><a href="/activities" style={{ color: 'var(--color-text-muted)' }}>Activities</a></li>
                            <li><a href="/contact" style={{ color: 'var(--color-text-muted)' }}>Contact</a></li>
                        </ul>
                    </div>

                    <div>
                        <h4 style={{ fontSize: '1.2rem', marginBottom: '1rem' }}>Stay Updated</h4>
                        <p style={{ color: 'var(--color-text-muted)', marginBottom: '1rem', fontSize: '0.9rem' }}>
                            Subscribe to our newsletter for the latest updates and inspiration.
                        </p>
                        <form style={{ display: 'flex', gap: '0.5rem' }} onSubmit={(e) => e.preventDefault()}>
                            <input
                                type="email"
                                placeholder="Your email"
                                style={{
                                    padding: '0.5rem',
                                    borderRadius: '2px',
                                    border: '1px solid #475569',
                                    backgroundColor: '#1e293b',
                                    color: 'white',
                                    flex: 1
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

                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                            <a href="#" style={{ color: 'var(--color-white)', transition: 'color 0.2s' }}><Youtube size={20} /></a>
                            <a href="#" style={{ color: 'var(--color-white)', transition: 'color 0.2s' }}><Facebook size={20} /></a>
                            <a href="#" style={{ color: 'var(--color-white)', transition: 'color 0.2s' }}><Instagram size={20} /></a>
                            <a href="#" style={{ color: 'var(--color-white)', transition: 'color 0.2s' }}><Twitter size={20} /></a>
                        </div>
                    </div>
                </div>

                <div style={{ borderTop: '1px solid #334155', marginTop: '2rem', paddingTop: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                    <p>&copy; {new Date().getFullYear()} GenFree Network. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
