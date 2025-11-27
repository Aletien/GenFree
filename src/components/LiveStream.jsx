import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Users, MessageCircle, Share2, Volume2, VolumeX, Maximize, Calendar } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const LiveStream = () => {
    const { t } = useLanguage();
    const [isLive, setIsLive] = useState(false);
    const [viewerCount, setViewerCount] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    const [currentStream, setCurrentStream] = useState(null);

    // Live stream configurations for different platforms
    const streamPlatforms = {
        youtube: {
            name: 'YouTube Live',
            embedUrl: 'https://www.youtube.com/embed/YOUR_LIVE_STREAM_ID?autoplay=1&mute=0',
            chatUrl: 'https://www.youtube.com/live_chat?v=YOUR_LIVE_STREAM_ID',
            color: '#FF0000'
        },
        facebook: {
            name: 'Facebook Live',
            embedUrl: 'https://www.facebook.com/plugins/video.php?href=YOUR_FACEBOOK_LIVE_URL',
            chatUrl: 'https://www.facebook.com/YOUR_PAGE/live',
            color: '#1877F2'
        },
        instagram: {
            name: 'Instagram Live',
            embedUrl: null, // Instagram doesn't allow embedding
            directUrl: 'https://www.instagram.com/YOUR_HANDLE',
            color: '#E4405F'
        }
    };

    // Check if any stream is currently live
    useEffect(() => {
        // This would connect to your streaming service API to check live status
        const checkLiveStatus = () => {
            // Simulated API call - replace with actual implementation
            setIsLive(true); // Set based on actual live status
            setViewerCount(Math.floor(Math.random() * 200) + 50);
        };

        checkLiveStatus();
        const interval = setInterval(checkLiveStatus, 30000); // Check every 30 seconds

        return () => clearInterval(interval);
    }, []);

    const upcomingServices = [
        {
            title: 'Sunday Worship Service',
            date: '2024-01-14',
            time: '10:00 AM',
            platform: 'YouTube & Facebook',
            description: 'Join us for our weekly worship service with Pastor John'
        },
        {
            title: 'Midweek Prayer Meeting',
            date: '2024-01-17',
            time: '7:00 PM',
            platform: 'YouTube Live',
            description: 'Corporate prayer and worship time'
        },
        {
            title: 'Youth Night',
            date: '2024-01-19',
            time: '6:30 PM',
            platform: 'Instagram & TikTok Live',
            description: 'Special youth worship and teaching session'
        }
    ];

    return (
        <div style={{ padding: '2rem 0' }}>
            {/* Live Indicator */}
            <AnimatePresence>
                {isLive && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        style={{
                            position: 'fixed',
                            top: '80px',
                            right: '20px',
                            backgroundColor: '#FF4444',
                            color: 'white',
                            padding: '0.75rem 1.5rem',
                            borderRadius: '25px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            zIndex: 1000,
                            boxShadow: '0 4px 15px rgba(255, 68, 68, 0.4)',
                            animation: 'pulse 2s infinite'
                        }}
                    >
                        <div style={{
                            width: '8px',
                            height: '8px',
                            backgroundColor: 'white',
                            borderRadius: '50%',
                            animation: 'blink 1s infinite'
                        }} />
                        <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>LIVE NOW</span>
                        <Users size={16} />
                        <span>{viewerCount}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="container">
                {/* Live Stream Section */}
                {isLive ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        style={{
                            backgroundColor: 'var(--color-surface)',
                            borderRadius: '12px',
                            padding: '2rem',
                            marginBottom: '3rem',
                            boxShadow: 'var(--shadow-lg)'
                        }}
                    >
                        <h2 style={{ 
                            fontSize: '2rem', 
                            marginBottom: '1.5rem', 
                            color: 'var(--color-primary)',
                            textAlign: 'center'
                        }}>
                            🔴 Live Worship Service
                        </h2>

                        <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: '2fr 1fr', 
                            gap: '2rem',
                            '@media (max-width: 768px)': {
                                gridTemplateColumns: '1fr'
                            }
                        }}>
                            {/* Video Player */}
                            <div style={{ position: 'relative' }}>
                                <div style={{
                                    position: 'relative',
                                    paddingBottom: '56.25%',
                                    height: 0,
                                    backgroundColor: '#000',
                                    borderRadius: '8px',
                                    overflow: 'hidden'
                                }}>
                                    {/* Replace with actual stream embed */}
                                    <iframe
                                        style={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            width: '100%',
                                            height: '100%',
                                            border: 'none'
                                        }}
                                        src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1&mute=0"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    />
                                </div>

                                {/* Stream Controls */}
                                <div style={{
                                    position: 'absolute',
                                    bottom: '10px',
                                    left: '10px',
                                    right: '10px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    backgroundColor: 'rgba(0,0,0,0.7)',
                                    borderRadius: '6px',
                                    padding: '0.5rem'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white' }}>
                                        <Users size={18} />
                                        <span>{viewerCount} watching</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <button
                                            onClick={() => setIsMuted(!isMuted)}
                                            style={{
                                                backgroundColor: 'transparent',
                                                border: 'none',
                                                color: 'white',
                                                cursor: 'pointer',
                                                padding: '0.25rem'
                                            }}
                                        >
                                            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                                        </button>
                                        <button
                                            style={{
                                                backgroundColor: 'transparent',
                                                border: 'none',
                                                color: 'white',
                                                cursor: 'pointer',
                                                padding: '0.25rem'
                                            }}
                                        >
                                            <Maximize size={18} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Live Chat & Social Links */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {/* Social Platform Links */}
                                <div style={{
                                    backgroundColor: 'var(--color-bg)',
                                    padding: '1rem',
                                    borderRadius: '8px'
                                }}>
                                    <h4 style={{ marginBottom: '1rem', color: 'var(--color-primary)' }}>
                                        📱 Watch on Your Favorite Platform
                                    </h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        <button
                                            onClick={() => window.open('https://youtube.com/live/YOUR_CHANNEL', '_blank')}
                                            style={{
                                                padding: '0.75rem',
                                                backgroundColor: '#FF0000',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                fontWeight: '600'
                                            }}
                                        >
                                            📺 YouTube Live
                                        </button>
                                        <button
                                            onClick={() => window.open('https://facebook.com/YOUR_PAGE/live', '_blank')}
                                            style={{
                                                padding: '0.75rem',
                                                backgroundColor: '#1877F2',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                fontWeight: '600'
                                            }}
                                        >
                                            📘 Facebook Live
                                        </button>
                                        <button
                                            onClick={() => window.open('https://instagram.com/YOUR_HANDLE', '_blank')}
                                            style={{
                                                padding: '0.75rem',
                                                backgroundColor: '#E4405F',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                fontWeight: '600'
                                            }}
                                        >
                                            📸 Instagram Live
                                        </button>
                                        <button
                                            onClick={() => window.open('https://tiktok.com/@YOUR_HANDLE', '_blank')}
                                            style={{
                                                padding: '0.75rem',
                                                backgroundColor: '#000000',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                fontWeight: '600'
                                            }}
                                        >
                                            🎵 TikTok Live
                                        </button>
                                    </div>
                                </div>

                                {/* Live Chat */}
                                <div style={{
                                    backgroundColor: 'var(--color-bg)',
                                    padding: '1rem',
                                    borderRadius: '8px',
                                    flex: 1
                                }}>
                                    <h4 style={{ marginBottom: '1rem', color: 'var(--color-primary)' }}>
                                        💬 Live Chat
                                    </h4>
                                    <div style={{
                                        height: '200px',
                                        backgroundColor: 'white',
                                        borderRadius: '6px',
                                        padding: '1rem',
                                        overflow: 'auto'
                                    }}>
                                        <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                                            Join the conversation on your preferred platform or use our website chat below.
                                        </p>
                                    </div>
                                    <button
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            marginTop: '0.5rem',
                                            backgroundColor: 'var(--color-primary)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        💬 Join Chat
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    // Upcoming Services Section
                    <div>
                        <h2 style={{
                            fontSize: '2.5rem',
                            textAlign: 'center',
                            marginBottom: '2rem',
                            color: 'var(--color-primary)'
                        }}>
                            📺 Live Streaming Schedule
                        </h2>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                            gap: '2rem',
                            marginBottom: '3rem'
                        }}>
                            {upcomingServices.map((service, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="card"
                                    style={{ padding: '1.5rem' }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                                        <Calendar size={20} style={{ color: 'var(--color-primary)' }} />
                                        <span style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                                            {service.date} at {service.time}
                                        </span>
                                    </div>
                                    <h3 style={{ marginBottom: '0.5rem', color: 'var(--color-primary)' }}>
                                        {service.title}
                                    </h3>
                                    <p style={{ marginBottom: '1rem', color: 'var(--color-text-muted)' }}>
                                        {service.description}
                                    </p>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                        <span style={{
                                            backgroundColor: 'var(--color-primary)',
                                            color: 'white',
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '12px',
                                            fontSize: '0.8rem'
                                        }}>
                                            {service.platform}
                                        </span>
                                        <button
                                            className="btn btn-primary"
                                            style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                                        >
                                            Set Reminder
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Social Media Integration */}
                        <div style={{
                            backgroundColor: 'var(--color-surface)',
                            padding: '2rem',
                            borderRadius: '12px',
                            textAlign: 'center'
                        }}>
                            <h3 style={{ marginBottom: '1rem', color: 'var(--color-primary)' }}>
                                🌐 Follow Us for Live Updates
                            </h3>
                            <p style={{ marginBottom: '2rem', color: 'var(--color-text-muted)' }}>
                                Don't miss our live sessions! Follow us on social media for instant notifications.
                            </p>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'center',
                                gap: '1rem',
                                flexWrap: 'wrap'
                            }}>
                                <button
                                    onClick={() => window.open('https://youtube.com/@YOUR_CHANNEL?sub_confirmation=1', '_blank')}
                                    style={{
                                        padding: '1rem 1.5rem',
                                        backgroundColor: '#FF0000',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontWeight: '600',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}
                                >
                                    📺 Subscribe on YouTube
                                </button>
                                <button
                                    onClick={() => window.open('https://facebook.com/YOUR_PAGE', '_blank')}
                                    style={{
                                        padding: '1rem 1.5rem',
                                        backgroundColor: '#1877F2',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontWeight: '600',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}
                                >
                                    👍 Like on Facebook
                                </button>
                                <button
                                    onClick={() => window.open('https://instagram.com/YOUR_HANDLE', '_blank')}
                                    style={{
                                        padding: '1rem 1.5rem',
                                        backgroundColor: '#E4405F',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontWeight: '600',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}
                                >
                                    📸 Follow on Instagram
                                </button>
                                <button
                                    onClick={() => window.open('https://tiktok.com/@YOUR_HANDLE', '_blank')}
                                    style={{
                                        padding: '1rem 1.5rem',
                                        backgroundColor: '#000000',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: 'pointer',
                                        fontWeight: '600',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}
                                >
                                    🎵 Follow on TikTok
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <style jsx>{`
                @keyframes pulse {
                    0% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                    100% { transform: scale(1); }
                }
                @keyframes blink {
                    0%, 50% { opacity: 1; }
                    51%, 100% { opacity: 0.3; }
                }
            `}</style>
        </div>
    );
};

export default LiveStream;