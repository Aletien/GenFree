import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Sun, Moon, Globe, Search } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [showLangMenu, setShowLangMenu] = useState(false);
    const { theme, toggleTheme } = useTheme();
    const { language, changeLanguage, t } = useLanguage();

    const navLinks = [
        { name: t('nav.home'), path: '/' },
        { name: t('nav.about'), path: '/about' },
        { name: t('nav.activities'), path: '/activities' },
        { name: t('nav.events'), path: '/events' },
        { name: t('nav.contact'), path: '/contact' },
    ];

    const languages = [
        { code: 'en', name: 'English', flag: '🇬🇧' },
        { code: 'lg', name: 'Luganda', flag: '🇺🇬' },
        { code: 'fr', name: 'Français', flag: '🇫🇷' },
        { code: 'ndo', name: 'Lukonzo', flag: '🇺🇬' }
    ];

    const currentLang = languages.find(lang => lang.code === language);

    return (
        <nav style={{
            backgroundColor: theme === 'dark' ? '#0f172a' : '#000000',
            color: 'white',
            position: 'sticky',
            top: 0,
            zIndex: 1000,
            borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}>
            <div className="container" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                height: '80px',
                padding: '0 2rem'
            }}>
                {/* Logo */}
                <Link to="/" style={{ display: 'flex', alignItems: 'center' }}>
                    <img src="/logo.svg" alt="GenFree Network" style={{ height: '80px' }} />
                </Link>

                {/* Desktop Menu - Centered */}
                <div style={{
                    display: 'none',
                    gap: '2.5rem',
                    position: 'absolute',
                    left: '50%',
                    transform: 'translateX(-50%)'
                }} className="desktop-menu">
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            to={link.path}
                            style={{
                                color: 'white',
                                textDecoration: 'none',
                                fontSize: '0.9rem',
                                fontWeight: 500,
                                textTransform: 'uppercase',
                                letterSpacing: '1px',
                                transition: 'color 0.3s',
                                position: 'relative',
                                padding: '0.5rem 0'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.color = 'var(--color-accent)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.color = 'white';
                            }}
                        >
                            {link.name}
                        </Link>
                    ))}
                </div>

                {/* Right Side Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {/* Search Icon */}
                    <button
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'white',
                            cursor: 'pointer',
                            padding: '0.5rem',
                            display: 'flex',
                            alignItems: 'center'
                        }}
                        aria-label="Search"
                    >
                        <Search size={20} />
                    </button>

                    {/* Language Selector */}
                    <div style={{ position: 'relative' }}>
                        <button
                            onClick={() => setShowLangMenu(!showLangMenu)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                padding: '0.5rem 0.75rem',
                                border: '1px solid rgba(255,255,255,0.3)',
                                borderRadius: '4px',
                                backgroundColor: 'transparent',
                                color: 'white',
                                cursor: 'pointer',
                                fontSize: '0.85rem'
                            }}
                        >
                            <Globe size={16} />
                            <span>{currentLang?.code.toUpperCase()}</span>
                        </button>

                        {showLangMenu && (
                            <div style={{
                                position: 'absolute',
                                top: '100%',
                                right: 0,
                                marginTop: '0.5rem',
                                backgroundColor: theme === 'dark' ? '#1e293b' : '#000000',
                                border: '1px solid rgba(255,255,255,0.2)',
                                borderRadius: '4px',
                                boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
                                minWidth: '150px',
                                zIndex: 1000
                            }}>
                                {languages.map((lang) => (
                                    <button
                                        key={lang.code}
                                        onClick={() => {
                                            changeLanguage(lang.code);
                                            setShowLangMenu(false);
                                        }}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            width: '100%',
                                            padding: '0.75rem 1rem',
                                            border: 'none',
                                            backgroundColor: language === lang.code ? 'var(--color-accent)' : 'transparent',
                                            color: 'white',
                                            cursor: 'pointer',
                                            fontSize: '0.9rem',
                                            textAlign: 'left'
                                        }}
                                        onMouseOver={(e) => {
                                            if (language !== lang.code) {
                                                e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)';
                                            }
                                        }}
                                        onMouseOut={(e) => {
                                            if (language !== lang.code) {
                                                e.currentTarget.style.backgroundColor = 'transparent';
                                            }
                                        }}
                                    >
                                        <span>{lang.flag}</span>
                                        <span>{lang.name}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Theme Toggle */}
                    <button
                        onClick={toggleTheme}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '36px',
                            height: '36px',
                            border: '1px solid rgba(255,255,255,0.3)',
                            borderRadius: '4px',
                            backgroundColor: 'transparent',
                            color: 'var(--color-accent)',
                            cursor: 'pointer'
                        }}
                        aria-label="Toggle theme"
                    >
                        {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                    </button>

                    {/* Mobile Menu Button */}
                    <button
                        className="mobile-menu-btn"
                        onClick={() => setIsOpen(!isOpen)}
                        style={{
                            display: 'block',
                            background: 'none',
                            border: 'none',
                            color: 'white',
                            cursor: 'pointer'
                        }}
                    >
                        {isOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {isOpen && (
                <div style={{
                    backgroundColor: theme === 'dark' ? '#1e293b' : '#000000',
                    padding: '1.5rem',
                    borderTop: '1px solid rgba(255,255,255,0.1)'
                }}>
                    {navLinks.map((link) => (
                        <Link
                            key={link.name}
                            to={link.path}
                            onClick={() => setIsOpen(false)}
                            style={{
                                display: 'block',
                                padding: '1rem 0',
                                color: 'white',
                                textDecoration: 'none',
                                fontSize: '1rem',
                                fontWeight: 500,
                                borderBottom: '1px solid rgba(255,255,255,0.1)'
                            }}
                        >
                            {link.name}
                        </Link>
                    ))}
                </div>
            )}

            <style>{`
        @media (min-width: 768px) {
          .desktop-menu { display: flex !important; }
          .mobile-menu-btn { display: none !important; }
        }
      `}</style>
        </nav>
    );
};

export default Navbar;
