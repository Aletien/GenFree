import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { Facebook, Instagram, Youtube, Twitter } from 'lucide-react';

const Hero = () => {
    const { t } = useLanguage();

    return (
        <div style={{
            position: 'relative',
            minHeight: '90vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            backgroundImage: 'url(https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1920&q=80)',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
        }}>
            {/* Dark Overlay */}
            <div style={{
                position: 'absolute',
                inset: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                zIndex: 1
            }} />

            {/* Social Media Icons - Left Side */}
            <div style={{
                position: 'absolute',
                left: '2rem',
                top: '50%',
                transform: 'translateY(-50%)',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem',
                zIndex: 2
            }}>
                <a href="#" style={{ color: 'white', transition: 'color 0.3s' }} onMouseOver={(e) => e.currentTarget.style.color = 'var(--color-accent)'} onMouseOut={(e) => e.currentTarget.style.color = 'white'}>
                    <Facebook size={24} />
                </a>
                <a href="#" style={{ color: 'white', transition: 'color 0.3s' }} onMouseOver={(e) => e.currentTarget.style.color = 'var(--color-accent)'} onMouseOut={(e) => e.currentTarget.style.color = 'white'}>
                    <Instagram size={24} />
                </a>
                <a href="#" style={{ color: 'white', transition: 'color 0.3s' }} onMouseOver={(e) => e.currentTarget.style.color = 'var(--color-accent)'} onMouseOut={(e) => e.currentTarget.style.color = 'white'}>
                    <Youtube size={24} />
                </a>
                <a href="#" style={{ color: 'white', transition: 'color 0.3s' }} onMouseOver={(e) => e.currentTarget.style.color = 'var(--color-accent)'} onMouseOut={(e) => e.currentTarget.style.color = 'white'}>
                    <Twitter size={24} />
                </a>
            </div>

            {/* "DISCOVER" Text - Right Side */}
            <div style={{
                position: 'absolute',
                right: '2rem',
                top: '50%',
                transform: 'translateY(-50%) rotate(90deg)',
                transformOrigin: 'center',
                zIndex: 2
            }}>
                <span style={{
                    color: 'white',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    letterSpacing: '4px',
                    textTransform: 'uppercase'
                }}>
                    DISCOVER
                </span>
            </div>

            {/* Content */}
            <div className="container" style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    {/* Main Title */}
                    <h1 style={{
                        fontSize: 'clamp(3rem, 8vw, 7rem)',
                        fontWeight: 900,
                        marginBottom: '0.5rem',
                        lineHeight: 1,
                        color: 'white',
                        textTransform: 'uppercase',
                        letterSpacing: '4px',
                        textShadow: '0 4px 20px rgba(0,0,0,0.5)',
                        fontFamily: '"Arial Black", "Helvetica Neue", Arial, sans-serif',
                        textStroke: '1px rgba(255,255,255,0.1)',
                        WebkitTextStroke: '1px rgba(255,255,255,0.1)'
                    }}>
                        {t('hero.title')}
                    </h1>

                    {/* Tagline */}
                    <div style={{
                        fontSize: 'clamp(0.9rem, 2vw, 1.2rem)',
                        fontWeight: 300,
                        marginBottom: '2.5rem',
                        color: 'rgba(255,255,255,0.9)',
                        fontFamily: '"Georgia", "Times New Roman", serif',
                        fontStyle: 'italic',
                        letterSpacing: '1px',
                        textShadow: '0 2px 10px rgba(0,0,0,0.3)',
                        textAlign: 'center'
                    }}>
                        "Am Free In Christ"
                    </div>

                    {/* Subtitle */}
                    <p style={{
                        fontSize: 'clamp(1.1rem, 2vw, 1.4rem)',
                        marginBottom: '3rem',
                        color: 'white',
                        lineHeight: 1.6,
                        maxWidth: '700px',
                        margin: '0 auto 3rem',
                        textShadow: '0 2px 10px rgba(0,0,0,0.5)'
                    }}>
                        {t('hero.subtitle')}
                    </p>

                    {/* CTA Button - Hidden on mobile */}
                    <Link to="/events" className="btn btn-accent desktop-only" style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '1.25rem 3rem',
                        fontSize: '1.1rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        boxShadow: '0 10px 30px rgba(16, 185, 129, 0.4)',
                        border: 'none'
                    }}>
                        {t('hero.joinEvents')}
                        <ArrowRight size={22} />
                    </Link>

                    {/* Stats */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                        gap: '3rem',
                        marginTop: '6rem',
                        maxWidth: '800px',
                        margin: '6rem auto 0'
                    }}>
                        <div>
                            <div style={{
                                fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                                fontWeight: 900,
                                color: 'var(--color-accent)',
                                textShadow: '0 2px 10px rgba(23, 162, 184, 0.5)'
                            }}>500+</div>
                            <div style={{
                                fontSize: '1rem',
                                color: 'white',
                                textTransform: 'uppercase',
                                letterSpacing: '1px',
                                marginTop: '0.5rem'
                            }}>{t('hero.livesTouched')}</div>
                        </div>
                        <div>
                            <div style={{
                                fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                                fontWeight: 900,
                                color: 'var(--color-accent)',
                                textShadow: '0 2px 10px rgba(23, 162, 184, 0.5)'
                            }}>50+</div>
                            <div style={{
                                fontSize: '1rem',
                                color: 'white',
                                textTransform: 'uppercase',
                                letterSpacing: '1px',
                                marginTop: '0.5rem'
                            }}>{t('hero.eventsHosted')}</div>
                        </div>
                        <div>
                            <div style={{
                                fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                                fontWeight: 900,
                                color: 'var(--color-accent)',
                                textShadow: '0 2px 10px rgba(23, 162, 184, 0.5)'
                            }}>10+</div>
                            <div style={{
                                fontSize: '1rem',
                                color: 'white',
                                textTransform: 'uppercase',
                                letterSpacing: '1px',
                                marginTop: '0.5rem'
                            }}>{t('hero.communities')}</div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Hero;
