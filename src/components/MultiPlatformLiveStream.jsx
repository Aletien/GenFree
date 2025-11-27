import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Users, MessageCircle, Share2, Volume2, VolumeX, Maximize, Calendar, ExternalLink, Heart, ThumbsUp, Download, Copy } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useLiveStatus } from '../hooks/useLiveStatus';

const MultiPlatformLiveStream = () => {
    const { t } = useLanguage();
    const { 
        isAnyLive, 
        platforms, 
        activePlatform, 
        isLoading, 
        error, 
        refreshLiveStatus 
    } = useLiveStatus();
    
    const [selectedPlatform, setSelectedPlatform] = useState('youtube');
    const [isMuted, setIsMuted] = useState(false);
    const [likes, setLikes] = useState({});
    const [hasLiked, setHasLiked] = useState({});
    const [recordings, setRecordings] = useState([]);
    const [showShareModal, setShowShareModal] = useState(false);
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [favorites, setFavorites] = useState([]);
    const [notifications, setNotifications] = useState(false);
    const [quality, setQuality] = useState('auto');
    const [fullscreen, setFullscreen] = useState(false);

    // Platform configurations with embed support
    const platformConfigs = {
        youtube: {
            name: 'YouTube Live',
            icon: '📺',
            color: '#FF0000',
            canEmbed: true,
            getEmbedUrl: (videoId) => `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=${isMuted ? 1 : 0}`,
            getChatUrl: (videoId) => `https://www.youtube.com/live_chat?v=${videoId}&embed_domain=${window.location.hostname}`,
            fallbackUrl: 'https://youtube.com/@YOUR_CHANNEL/live'
        },
        facebook: {
            name: 'Facebook Live',
            icon: '📘',
            color: '#1877F2',
            canEmbed: true,
            getEmbedUrl: (videoId) => `https://www.facebook.com/plugins/video.php?href=https://www.facebook.com/YOUR_PAGE/videos/${videoId}/&width=500&show_text=false&autoplay=true&mute=${isMuted}`,
            fallbackUrl: 'https://facebook.com/YOUR_PAGE/live'
        },
        instagram: {
            name: 'Instagram Live',
            icon: '📸',
            color: '#E4405F',
            canEmbed: false, // Instagram doesn't allow embedding
            fallbackUrl: 'https://instagram.com/YOUR_HANDLE/live'
        },
        tiktok: {
            name: 'TikTok Live',
            icon: '🎵',
            color: '#000000',
            canEmbed: false, // TikTok doesn't allow embedding
            fallbackUrl: 'https://tiktok.com/@YOUR_HANDLE/live'
        }
    };

    // Auto-select the first available live platform
    useEffect(() => {
        if (isAnyLive && activePlatform) {
            setSelectedPlatform(activePlatform.platform);
        }
        // Initialize likes for each platform
        if (platforms) {
            const initialLikes = {};
            const initialHasLiked = {};
            Object.keys(platforms).forEach(platform => {
                initialLikes[platform] = Math.floor(Math.random() * 50) + 10;
                initialHasLiked[platform] = false;
            });
            setLikes(initialLikes);
            setHasLiked(initialHasLiked);
        }
    }, [isAnyLive, activePlatform, platforms]);

    // Load recorded streams
    useEffect(() => {
        const mockRecordings = [
            {
                id: 1,
                title: 'Sunday Morning Worship - January 14, 2024',
                platform: 'youtube',
                duration: '1:45:32',
                views: 1250,
                likes: 89,
                date: '2024-01-14',
                thumbnail: 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
                url: 'https://youtube.com/watch?v=dQw4w9WgXcQ'
            },
            {
                id: 2,
                title: 'Midweek Prayer Meeting - January 10, 2024',
                platform: 'facebook',
                duration: '58:21',
                views: 432,
                likes: 34,
                date: '2024-01-10',
                thumbnail: 'https://via.placeholder.com/320x180/1877F2/white?text=Prayer+Meeting',
                url: 'https://facebook.com/your-page/videos/123456789'
            }
        ];
        setRecordings(mockRecordings);
    }, []);

    const handlePlatformSelect = (platform) => {
        setSelectedPlatform(platform);
    };

    const handleExternalWatch = (platform) => {
        window.open(platformConfigs[platform].fallbackUrl, '_blank');
    };

    const handleLike = (platform) => {
        if (!hasLiked[platform]) {
            setLikes(prev => ({
                ...prev,
                [platform]: prev[platform] + 1
            }));
            setHasLiked(prev => ({
                ...prev,
                [platform]: true
            }));
        }
    };

    const handleShare = () => {
        setShowShareModal(true);
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
    };

    const shareToSocial = (platform, url, title) => {
        const shareUrls = {
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
            twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
            whatsapp: `https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`,
            telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`
        };
        window.open(shareUrls[platform], '_blank');
    };

    const toggleFavorite = (recordingId) => {
        setFavorites(prev => 
            prev.includes(recordingId)
                ? prev.filter(id => id !== recordingId)
                : [...prev, recordingId]
        );
    };

    const toggleNotifications = async () => {
        if (!notifications) {
            if ('Notification' in window) {
                const permission = await Notification.requestPermission();
                if (permission === 'granted') {
                    setNotifications(true);
                    new Notification('🔔 Live Stream Notifications Enabled', {
                        body: 'You\'ll be notified when we go live!',
                        icon: '/logo.svg'
                    });
                }
            }
        } else {
            setNotifications(false);
        }
    };

    const setReminder = (service) => {
        if ('Notification' in window && Notification.permission === 'granted') {
            // Calculate time until service
            const serviceDate = new Date(service.date + ' ' + service.time);
            const now = new Date();
            const timeDiff = serviceDate.getTime() - now.getTime();
            
            if (timeDiff > 0) {
                // Set reminder 15 minutes before
                setTimeout(() => {
                    new Notification('🔴 Live Stream Starting Soon!', {
                        body: `${service.title} starts in 15 minutes`,
                        icon: '/logo.svg'
                    });
                }, Math.max(0, timeDiff - 15 * 60 * 1000));
                
                alert(`✅ Reminder set for ${service.title}`);
            }
        } else {
            alert('Please enable notifications first');
        }
    };

    const toggleFullscreen = () => {
        if (!fullscreen) {
            document.documentElement.requestFullscreen?.();
        } else {
            document.exitFullscreen?.();
        }
        setFullscreen(!fullscreen);
    };

    const renderPlatformSelector = () => (
        <div style={{
            display: 'flex',
            gap: '0.5rem',
            marginBottom: '1.5rem',
            flexWrap: 'wrap',
            justifyContent: 'center'
        }}>
            {Object.entries(platforms).map(([platform, data]) => {
                const config = platformConfigs[platform];
                const isSelected = selectedPlatform === platform;
                const isLive = data.isLive;
                
                return (
                    <button
                        key={platform}
                        onClick={() => handlePlatformSelect(platform)}
                        disabled={!isLive}
                        style={{
                            padding: '0.75rem 1.25rem',
                            backgroundColor: isSelected ? config.color : (isLive ? 'var(--color-surface)' : 'var(--color-bg)'),
                            color: isSelected ? 'white' : (isLive ? 'var(--color-text)' : 'var(--color-text-muted)'),
                            border: isSelected ? 'none' : '2px solid var(--color-border)',
                            borderRadius: '8px',
                            cursor: isLive ? 'pointer' : 'not-allowed',
                            fontWeight: '600',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            transition: 'all 0.3s ease',
                            position: 'relative',
                            opacity: isLive ? 1 : 0.5
                        }}
                    >
                        <span>{config.icon}</span>
                        <span>{config.name}</span>
                        {isLive && (
                            <div style={{
                                width: '8px',
                                height: '8px',
                                backgroundColor: isSelected ? 'white' : '#00ff00',
                                borderRadius: '50%',
                                animation: 'blink 1s infinite'
                            }} />
                        )}
                        {data.viewerCount && (
                            <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                                ({data.viewerCount})
                            </span>
                        )}
                        {likes[platform] && (
                            <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                                ❤️ {likes[platform]}
                            </span>
                        )}
                    </button>
                );
            })}
        </div>
    );

    const renderStreamPlayer = () => {
        const selectedConfig = platformConfigs[selectedPlatform];
        const platformData = platforms[selectedPlatform];

        if (!platformData.isLive) {
            return (
                <div style={{
                    aspectRatio: '16/9',
                    backgroundColor: '#000',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    color: 'white',
                    textAlign: 'center',
                    gap: '1rem'
                }}>
                    <Play size={48} style={{ opacity: 0.5 }} />
                    <div>
                        <h3>Not Currently Live</h3>
                        <p>Check back later or follow us for live notifications</p>
                        <button
                            onClick={() => handleExternalWatch(selectedPlatform)}
                            style={{
                                marginTop: '1rem',
                                padding: '0.5rem 1rem',
                                backgroundColor: selectedConfig.color,
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                margin: '0 auto'
                            }}
                        >
                            Visit {selectedConfig.name} <ExternalLink size={16} />
                        </button>
                    </div>
                </div>
            );
        }

        // If platform can't embed, show external link option
        if (!selectedConfig.canEmbed) {
            return (
                <div style={{
                    aspectRatio: '16/9',
                    backgroundColor: selectedConfig.color,
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    color: 'white',
                    textAlign: 'center',
                    gap: '1rem'
                }}>
                    <div style={{ fontSize: '3rem' }}>{selectedConfig.icon}</div>
                    <div>
                        <h3>🔴 Live on {selectedConfig.name}</h3>
                        <p>{platformData.title || 'Live Stream'}</p>
                        {platformData.viewerCount && (
                            <p><Users size={16} style={{ display: 'inline' }} /> {platformData.viewerCount} watching</p>
                        )}
                        <button
                            onClick={() => handleExternalWatch(selectedPlatform)}
                            style={{
                                marginTop: '1rem',
                                padding: '1rem 1.5rem',
                                backgroundColor: 'white',
                                color: selectedConfig.color,
                                border: 'none',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontWeight: 'bold',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                margin: '0 auto',
                                fontSize: '1.1rem'
                            }}
                        >
                            Watch Live <ExternalLink size={20} />
                        </button>
                    </div>
                </div>
            );
        }

        // Render embedded player
        return (
            <div style={{ position: 'relative' }}>
                <div style={{
                    position: 'relative',
                    aspectRatio: '16/9',
                    backgroundColor: '#000',
                    borderRadius: '8px',
                    overflow: 'hidden'
                }}>
                    <iframe
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            border: 'none'
                        }}
                        src={selectedConfig.getEmbedUrl(platformData.liveVideoId || 'dQw4w9WgXcQ')}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    />
                </div>

                {/* Stream Info Overlay */}
                <div style={{
                    position: 'absolute',
                    top: '10px',
                    left: '10px',
                    right: '10px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    borderRadius: '6px',
                    padding: '0.5rem',
                    color: 'white'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ 
                            backgroundColor: selectedConfig.color,
                            padding: '0.25rem 0.5rem',
                            borderRadius: '4px',
                            fontSize: '0.8rem',
                            fontWeight: 'bold'
                        }}>
                            🔴 LIVE
                        </span>
                        <span>{selectedConfig.name}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Users size={16} />
                        <span>{platformData.viewerCount || 0}</span>
                    </div>
                </div>

                {/* Stream Controls */}
                <div style={{
                    position: 'absolute',
                    bottom: '10px',
                    right: '10px',
                    display: 'flex',
                    gap: '0.5rem'
                }}>
                    <button
                        onClick={() => setIsMuted(!isMuted)}
                        style={{
                            backgroundColor: 'rgba(0,0,0,0.7)',
                            border: 'none',
                            color: 'white',
                            cursor: 'pointer',
                            padding: '0.5rem',
                            borderRadius: '4px'
                        }}
                    >
                        {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                    </button>
                    <button
                        onClick={() => handleLike(selectedPlatform)}
                        style={{
                            backgroundColor: hasLiked[selectedPlatform] ? '#FF69B4' : 'rgba(0,0,0,0.7)',
                            border: 'none',
                            color: 'white',
                            cursor: 'pointer',
                            padding: '0.5rem',
                            borderRadius: '4px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                        }}
                    >
                        <Heart size={16} />
                        <span style={{ fontSize: '12px' }}>{likes[selectedPlatform] || 0}</span>
                    </button>
                    <button
                        onClick={handleShare}
                        style={{
                            backgroundColor: 'rgba(0,0,0,0.7)',
                            border: 'none',
                            color: 'white',
                            cursor: 'pointer',
                            padding: '0.5rem',
                            borderRadius: '4px'
                        }}
                    >
                        <Share2 size={16} />
                    </button>
                    <button
                        onClick={() => handleExternalWatch(selectedPlatform)}
                        style={{
                            backgroundColor: 'rgba(0,0,0,0.7)',
                            border: 'none',
                            color: 'white',
                            cursor: 'pointer',
                            padding: '0.5rem',
                            borderRadius: '4px'
                        }}
                    >
                        <ExternalLink size={16} />
                    </button>
                </div>
            </div>
        );
    };

    const renderChatSection = () => {
        const selectedConfig = platformConfigs[selectedPlatform];
        const platformData = platforms[selectedPlatform];

        return (
            <div style={{
                backgroundColor: 'var(--color-bg)',
                padding: '1rem',
                borderRadius: '8px',
                height: 'fit-content'
            }}>
                <h4 style={{ 
                    marginBottom: '1rem', 
                    color: 'var(--color-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                }}>
                    <MessageCircle size={18} />
                    Live Chat - {selectedConfig.name}
                </h4>
                
                {platformData.isLive && selectedConfig.canEmbed && selectedConfig.getChatUrl ? (
                    <div style={{
                        height: '300px',
                        backgroundColor: 'white',
                        borderRadius: '6px',
                        overflow: 'hidden'
                    }}>
                        <iframe
                            src={selectedConfig.getChatUrl(platformData.liveVideoId)}
                            style={{ width: '100%', height: '100%', border: 'none' }}
                        />
                    </div>
                ) : (
                    <div style={{
                        height: '300px',
                        backgroundColor: 'white',
                        borderRadius: '6px',
                        padding: '1rem',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center'
                    }}>
                        <MessageCircle size={32} style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }} />
                        <p style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
                            Chat available on {selectedConfig.name}
                        </p>
                        <button
                            onClick={() => handleExternalWatch(selectedPlatform)}
                            style={{
                                padding: '0.5rem 1rem',
                                backgroundColor: selectedConfig.color,
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            Join Chat <ExternalLink size={14} />
                        </button>
                    </div>
                )}
            </div>
        );
    };

    if (error) {
        return (
            <div style={{ padding: '2rem 0' }}>
                <div className="container" style={{ textAlign: 'center' }}>
                    <h2 style={{ color: 'var(--color-error)', marginBottom: '1rem' }}>
                        Error Loading Live Streams
                    </h2>
                    <p style={{ marginBottom: '2rem' }}>{error}</p>
                    <button 
                        onClick={refreshLiveStatus}
                        className="btn btn-primary"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div style={{ padding: '2rem 0' }}>
            {/* Live Indicator */}
            <AnimatePresence>
                {isAnyLive && (
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
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="container">
                {isLoading && (
                    <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                        <p>Checking live status...</p>
                    </div>
                )}

                {/* Main Live Stream Section */}
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
                        {isAnyLive ? '🔴 Choose Your Platform' : '📺 Live Streaming'}
                    </h2>

                    {/* Platform Selector */}
                    {renderPlatformSelector()}

                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: '2fr 1fr', 
                        gap: '2rem',
                        '@media (max-width: 768px)': {
                            gridTemplateColumns: '1fr'
                        }
                    }}>
                        {/* Stream Player */}
                        {renderStreamPlayer()}

                        {/* Live Chat & Info */}
                        {renderChatSection()}
                    </div>

                    {/* Quick Actions */}
                    <div style={{
                        marginTop: '2rem',
                        padding: '1rem',
                        backgroundColor: 'var(--color-bg)',
                        borderRadius: '8px',
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '1rem',
                        flexWrap: 'wrap'
                    }}>
                        <button
                            onClick={refreshLiveStatus}
                            style={{
                                padding: '0.5rem 1rem',
                                backgroundColor: 'var(--color-primary)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer'
                            }}
                        >
                            🔄 Refresh Status
                        </button>
                        <button
                            onClick={handleShare}
                            style={{
                                padding: '0.5rem 1rem',
                                backgroundColor: 'var(--color-secondary)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            <Share2 size={14} /> Share
                        </button>
                        <button
                            onClick={toggleNotifications}
                            style={{
                                padding: '0.5rem 1rem',
                                backgroundColor: notifications ? '#00C851' : 'var(--color-accent)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            🔔 {notifications ? 'Notifications On' : 'Enable Notifications'}
                        </button>
                        <button
                            onClick={() => setShowScheduleModal(true)}
                            style={{
                                padding: '0.5rem 1rem',
                                backgroundColor: 'var(--color-info)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            📅 Schedule
                        </button>
                    </div>
                </motion.div>

                {/* Recorded Streams Section */}
                {recordings.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                            backgroundColor: 'var(--color-surface)',
                            borderRadius: '12px',
                            padding: '2rem',
                            boxShadow: 'var(--shadow-lg)'
                        }}
                    >
                        <h3 style={{
                            fontSize: '1.5rem',
                            marginBottom: '1.5rem',
                            color: 'var(--color-primary)',
                            textAlign: 'center'
                        }}>
                            📹 Previous Streams
                        </h3>
                        
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                            gap: '1.5rem'
                        }}>
                            {recordings.map((recording) => (
                                <div
                                    key={recording.id}
                                    style={{
                                        backgroundColor: 'var(--color-bg)',
                                        borderRadius: '8px',
                                        overflow: 'hidden',
                                        boxShadow: 'var(--shadow-sm)'
                                    }}
                                >
                                    <div style={{ position: 'relative' }}>
                                        <img
                                            src={recording.thumbnail}
                                            alt={recording.title}
                                            style={{
                                                width: '100%',
                                                height: '180px',
                                                objectFit: 'cover'
                                            }}
                                        />
                                        <div style={{
                                            position: 'absolute',
                                            bottom: '8px',
                                            right: '8px',
                                            backgroundColor: 'rgba(0,0,0,0.8)',
                                            color: 'white',
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            fontSize: '0.8rem'
                                        }}>
                                            {recording.duration}
                                        </div>
                                        <div style={{
                                            position: 'absolute',
                                            top: '8px',
                                            left: '8px',
                                            backgroundColor: platformConfigs[recording.platform].color,
                                            color: 'white',
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            fontSize: '0.7rem',
                                            fontWeight: 'bold'
                                        }}>
                                            {platformConfigs[recording.platform].icon} {platformConfigs[recording.platform].name}
                                        </div>
                                    </div>
                                    
                                    <div style={{ padding: '1rem' }}>
                                        <h4 style={{
                                            margin: '0 0 0.5rem 0',
                                            fontSize: '1rem',
                                            color: 'var(--color-primary)',
                                            lineHeight: '1.3'
                                        }}>
                                            {recording.title}
                                        </h4>
                                        
                                        <div style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            marginBottom: '1rem',
                                            fontSize: '0.8rem',
                                            color: 'var(--color-text-muted)'
                                        }}>
                                            <span>{recording.date}</span>
                                            <div style={{ display: 'flex', gap: '1rem' }}>
                                                <span>👁️ {recording.views}</span>
                                                <span>❤️ {recording.likes}</span>
                                            </div>
                                        </div>
                                        
                                        <div style={{
                                            display: 'flex',
                                            gap: '0.5rem',
                                            flexWrap: 'wrap'
                                        }}>
                                            <button
                                                onClick={() => window.open(recording.url, '_blank')}
                                                style={{
                                                    flex: 1,
                                                    padding: '0.5rem',
                                                    backgroundColor: 'var(--color-primary)',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer',
                                                    fontSize: '0.9rem',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: '0.5rem'
                                                }}
                                            >
                                                <Play size={14} /> Watch
                                            </button>
                                            
                                            <button
                                                onClick={() => toggleFavorite(recording.id)}
                                                style={{
                                                    padding: '0.5rem',
                                                    backgroundColor: favorites.includes(recording.id) ? '#FFD700' : 'var(--color-warning)',
                                                    color: favorites.includes(recording.id) ? '#000' : 'white',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                {favorites.includes(recording.id) ? '⭐' : '☆'}
                                            </button>
                                            
                                            <button
                                                onClick={() => shareToSocial('facebook', recording.url, recording.title)}
                                                style={{
                                                    padding: '0.5rem',
                                                    backgroundColor: 'var(--color-secondary)',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <Share2 size={14} />
                                            </button>
                                            
                                            <button
                                                onClick={() => copyToClipboard(recording.url)}
                                                style={{
                                                    padding: '0.5rem',
                                                    backgroundColor: 'var(--color-accent)',
                                                    color: 'white',
                                                    border: 'none',
                                                    borderRadius: '4px',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <Copy size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Share Modal */}
            {showShareModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        padding: '2rem',
                        maxWidth: '400px',
                        width: '90%',
                        position: 'relative'
                    }}>
                        <button
                            onClick={() => setShowShareModal(false)}
                            style={{
                                position: 'absolute',
                                top: '1rem',
                                right: '1rem',
                                background: 'none',
                                border: 'none',
                                fontSize: '1.5rem',
                                cursor: 'pointer'
                            }}
                        >
                            ×
                        </button>
                        
                        <h3 style={{ marginBottom: '1.5rem', color: 'var(--color-primary)' }}>
                            📤 Share Live Stream
                        </h3>
                        
                        <div style={{ marginBottom: '1.5rem' }}>
                            <input
                                type="text"
                                value={window.location.href}
                                readOnly
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '1px solid var(--color-border)',
                                    borderRadius: '6px',
                                    fontSize: '0.9rem'
                                }}
                            />
                            <button
                                onClick={() => copyToClipboard(window.location.href)}
                                style={{
                                    marginTop: '0.5rem',
                                    width: '100%',
                                    padding: '0.75rem',
                                    backgroundColor: 'var(--color-primary)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem'
                                }}
                            >
                                <Copy size={16} /> Copy Link
                            </button>
                        </div>
                        
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, 1fr)',
                            gap: '0.5rem'
                        }}>
                            <button
                                onClick={() => shareToSocial('facebook', window.location.href, 'Watch Live Stream')}
                                style={{
                                    padding: '0.75rem',
                                    backgroundColor: '#1877F2',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem'
                                }}
                            >
                                📘 Facebook
                            </button>
                            
                            <button
                                onClick={() => shareToSocial('twitter', window.location.href, 'Watch Live Stream')}
                                style={{
                                    padding: '0.75rem',
                                    backgroundColor: '#1DA1F2',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem'
                                }}
                            >
                                🐦 Twitter
                            </button>
                            
                            <button
                                onClick={() => shareToSocial('whatsapp', window.location.href, 'Watch Live Stream')}
                                style={{
                                    padding: '0.75rem',
                                    backgroundColor: '#25D366',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem'
                                }}
                            >
                                📱 WhatsApp
                            </button>
                            
                            <button
                                onClick={() => shareToSocial('telegram', window.location.href, 'Watch Live Stream')}
                                style={{
                                    padding: '0.75rem',
                                    backgroundColor: '#0088cc',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    fontSize: '0.9rem'
                                }}
                            >
                                ✈️ Telegram
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Schedule Modal */}
            {showScheduleModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        padding: '2rem',
                        maxWidth: '500px',
                        width: '90%',
                        maxHeight: '80vh',
                        overflowY: 'auto',
                        position: 'relative'
                    }}>
                        <button
                            onClick={() => setShowScheduleModal(false)}
                            style={{
                                position: 'absolute',
                                top: '1rem',
                                right: '1rem',
                                background: 'none',
                                border: 'none',
                                fontSize: '1.5rem',
                                cursor: 'pointer'
                            }}
                        >
                            ×
                        </button>
                        
                        <h3 style={{ marginBottom: '1.5rem', color: 'var(--color-primary)' }}>
                            📅 Upcoming Live Streams
                        </h3>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {[
                                {
                                    title: 'Sunday Worship Service',
                                    date: '2024-01-28',
                                    time: '10:00 AM',
                                    platform: 'YouTube & Facebook',
                                    description: 'Join us for our weekly worship service'
                                },
                                {
                                    title: 'Midweek Prayer Meeting',
                                    date: '2024-01-31',
                                    time: '7:00 PM',
                                    platform: 'YouTube Live',
                                    description: 'Corporate prayer and worship time'
                                },
                                {
                                    title: 'Youth Night',
                                    date: '2024-02-02',
                                    time: '6:30 PM',
                                    platform: 'Instagram & TikTok',
                                    description: 'Special youth worship session'
                                }
                            ].map((service, index) => (
                                <div
                                    key={index}
                                    style={{
                                        padding: '1rem',
                                        backgroundColor: 'var(--color-bg)',
                                        borderRadius: '8px',
                                        border: '1px solid var(--color-border)'
                                    }}
                                >
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'flex-start',
                                        marginBottom: '0.5rem'
                                    }}>
                                        <h4 style={{
                                            margin: 0,
                                            color: 'var(--color-primary)',
                                            fontSize: '1rem'
                                        }}>
                                            {service.title}
                                        </h4>
                                        <span style={{
                                            backgroundColor: 'var(--color-primary)',
                                            color: 'white',
                                            padding: '0.25rem 0.5rem',
                                            borderRadius: '12px',
                                            fontSize: '0.7rem'
                                        }}>
                                            {service.platform}
                                        </span>
                                    </div>
                                    
                                    <p style={{
                                        margin: '0 0 0.75rem 0',
                                        color: 'var(--color-text-muted)',
                                        fontSize: '0.9rem'
                                    }}>
                                        {service.description}
                                    </p>
                                    
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}>
                                        <span style={{
                                            color: 'var(--color-text)',
                                            fontWeight: '600',
                                            fontSize: '0.9rem'
                                        }}>
                                            📅 {service.date} at {service.time}
                                        </span>
                                        
                                        <button
                                            onClick={() => {
                                                setReminder(service);
                                                setShowScheduleModal(false);
                                            }}
                                            style={{
                                                padding: '0.5rem 1rem',
                                                backgroundColor: 'var(--color-primary)',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '6px',
                                                cursor: 'pointer',
                                                fontSize: '0.8rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.5rem'
                                            }}
                                        >
                                            🔔 Set Reminder
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <div style={{
                            marginTop: '1.5rem',
                            padding: '1rem',
                            backgroundColor: 'var(--color-info-bg)',
                            borderRadius: '8px',
                            textAlign: 'center'
                        }}>
                            <p style={{
                                margin: 0,
                                fontSize: '0.9rem',
                                color: 'var(--color-text-muted)'
                            }}>
                                💡 Enable notifications to get alerts 15 minutes before each service starts
                            </p>
                        </div>
                    </div>
                </div>
            )}

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

export default MultiPlatformLiveStream;