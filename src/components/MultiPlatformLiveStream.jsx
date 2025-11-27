import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Users, MessageCircle, Share2, Volume2, VolumeX, Maximize, Calendar, ExternalLink, Heart, ThumbsUp, Download, Copy } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useLiveStatus } from '../hooks/useLiveStatus';
import ChatSystem from './ChatSystem';
import AnalyticsTracker from './AnalyticsTracker';
import DonationSystem from './DonationSystem';
import './MultiPlatformLiveStream.css';

// Simplified responsive hook with consistent breakpoints
const useResponsive = () => {
    const [screenSize, setScreenSize] = useState({
        isMobile: false,
        isTablet: false,
        isDesktop: false,
        width: 0
    });
    
    useEffect(() => {
        const checkScreenSize = () => {
            const width = window.innerWidth;
            setScreenSize({
                isMobile: width <= 480,
                isTablet: width > 480 && width <= 768,
                isDesktop: width > 768,
                width
            });
        };
        
        checkScreenSize();
        const debouncedResize = debounce(checkScreenSize, 150);
        window.addEventListener('resize', debouncedResize);
        
        return () => window.removeEventListener('resize', debouncedResize);
    }, []);
    
    return screenSize;
};

// Debounce function to prevent excessive resize calls
const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

const MultiPlatformLiveStream = () => {
    const { t } = useLanguage();
    const { isMobile, isTablet, isDesktop } = useResponsive();
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
            canEmbed: false,
            fallbackUrl: 'https://instagram.com/YOUR_HANDLE/live'
        },
        tiktok: {
            name: 'TikTok Live',
            icon: '🎵',
            color: '#000000',
            canEmbed: false,
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
            const serviceDate = new Date(service.date + ' ' + service.time);
            const now = new Date();
            const timeDiff = serviceDate.getTime() - now.getTime();
            
            if (timeDiff > 0) {
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
        <div className="platform-selector">
            {Object.entries(platforms).map(([platform, data]) => {
                const config = platformConfigs[platform];
                const isSelected = selectedPlatform === platform;
                const isLive = data.isLive;
                
                return (
                    <button
                        key={platform}
                        onClick={() => handlePlatformSelect(platform)}
                        disabled={!isLive}
                        className={`platform-btn ${isSelected ? 'selected' : ''} ${!isLive ? 'disabled' : ''}`}
                        style={{
                            '--platform-color': config.color,
                            backgroundColor: isSelected ? config.color : undefined
                        }}
                    >
                        <span className="platform-icon">{config.icon}</span>
                        <span className="platform-name">
                            {isMobile ? config.name.split(' ')[0] : config.name}
                        </span>
                        {isLive && <div className="live-indicator" />}
                        {data.viewerCount && (
                            <span className="viewer-count">({data.viewerCount})</span>
                        )}
                        {likes[platform] && (
                            <span className="like-count">❤️ {likes[platform]}</span>
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
                <div className="stream-offline">
                    <Play size={48} className="offline-icon" />
                    <div className="offline-content">
                        <h3>Not Currently Live</h3>
                        <p>Check back later or follow us for live notifications</p>
                        <button
                            onClick={() => handleExternalWatch(selectedPlatform)}
                            className="visit-platform-btn"
                            style={{ backgroundColor: selectedConfig.color }}
                        >
                            Visit {selectedConfig.name} <ExternalLink size={16} />
                        </button>
                    </div>
                </div>
            );
        }

        if (!selectedConfig.canEmbed) {
            return (
                <div className="stream-external" style={{ backgroundColor: selectedConfig.color }}>
                    <div className="external-icon">{selectedConfig.icon}</div>
                    <div className="external-content">
                        <h3>🔴 Live on {selectedConfig.name}</h3>
                        <p>{platformData.title || 'Live Stream'}</p>
                        {platformData.viewerCount && (
                            <p><Users size={16} /> {platformData.viewerCount} watching</p>
                        )}
                        <button
                            onClick={() => handleExternalWatch(selectedPlatform)}
                            className="watch-live-btn"
                        >
                            Watch Live <ExternalLink size={20} />
                        </button>
                    </div>
                </div>
            );
        }

        return (
            <div className="stream-player-container">
                <div className="stream-player">
                    <iframe
                        className="stream-iframe"
                        src={selectedConfig.getEmbedUrl(platformData.liveVideoId || 'dQw4w9WgXcQ')}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    />
                </div>

                <div className="stream-info-overlay">
                    <div className="stream-info-left">
                        <span className="live-badge" style={{ backgroundColor: selectedConfig.color }}>
                            🔴 LIVE
                        </span>
                        <span className="platform-name">{selectedConfig.name}</span>
                    </div>
                    <div className="stream-info-right">
                        <Users size={16} />
                        <span>{platformData.viewerCount || 0}</span>
                    </div>
                </div>

                <div className="stream-controls">
                    <button onClick={() => setIsMuted(!isMuted)} className="control-btn">
                        {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                    </button>
                    <button 
                        onClick={() => handleLike(selectedPlatform)} 
                        className={`control-btn like-btn ${hasLiked[selectedPlatform] ? 'liked' : ''}`}
                    >
                        <Heart size={16} />
                        <span>{likes[selectedPlatform] || 0}</span>
                    </button>
                    <button onClick={handleShare} className="control-btn">
                        <Share2 size={16} />
                    </button>
                    <button onClick={() => handleExternalWatch(selectedPlatform)} className="control-btn">
                        <ExternalLink size={16} />
                    </button>
                </div>
            </div>
        );
    };

    if (error) {
        return (
            <div className="error-container">
                <div className="container">
                    <h2 className="error-title">Error Loading Live Streams</h2>
                    <p className="error-message">{error}</p>
                    <button onClick={refreshLiveStatus} className="btn btn-primary">
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="live-stream-page">
            {/* Live Indicator */}
            <AnimatePresence>
                {isAnyLive && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="live-indicator-badge"
                    >
                        <div className="live-pulse" />
                        <span>LIVE NOW</span>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="container">
                {isLoading && (
                    <div className="loading-container">
                        <p>Checking live status...</p>
                    </div>
                )}

                {/* Main Live Stream Section */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="main-stream-section"
                >
                    <h2 className="stream-title">
                        {isAnyLive ? '🔴 Choose Your Platform' : '📺 Live Streaming'}
                    </h2>

                    {renderPlatformSelector()}

                    <div className="stream-layout">
                        <div className="stream-main">
                            {renderStreamPlayer()}
                        </div>

                        <div className="stream-sidebar">
                            <ChatSystem 
                                platform={selectedPlatform}
                                streamId={activePlatform?.liveVideoId}
                                isLive={isAnyLive}
                                moderatorMode={false}
                            />
                            
                            <AnalyticsTracker
                                streamId={activePlatform?.liveVideoId}
                                platform={selectedPlatform}
                                isLive={isAnyLive}
                                onAnalyticsUpdate={(event) => {
                                    console.log('Analytics:', event);
                                }}
                            />
                            
                            <DonationSystem
                                streamId={activePlatform?.liveVideoId}
                                onDonationComplete={(donation) => {
                                    console.log('Donation completed:', donation);
                                }}
                            />
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="quick-actions">
                        <button onClick={refreshLiveStatus} className="action-btn primary">
                            🔄 {isMobile ? 'Refresh' : 'Refresh Status'}
                        </button>
                        <button onClick={handleShare} className="action-btn secondary">
                            <Share2 size={14} /> Share
                        </button>
                        <button 
                            onClick={toggleNotifications} 
                            className={`action-btn ${notifications ? 'success' : 'accent'}`}
                        >
                            🔔 {isMobile ? 'Notify' : (notifications ? 'Notifications On' : 'Enable Notifications')}
                        </button>
                        <button onClick={() => setShowScheduleModal(true)} className="action-btn info">
                            📅 Schedule
                        </button>
                    </div>
                </motion.div>

                {/* Recorded Streams Section */}
                {recordings.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="recordings-section"
                    >
                        <h3 className="recordings-title">📹 Previous Streams</h3>
                        
                        <div className="recordings-grid">
                            {recordings.map((recording) => (
                                <div key={recording.id} className="recording-card">
                                    <div className="recording-thumbnail">
                                        <img src={recording.thumbnail} alt={recording.title} />
                                        <div className="duration-badge">{recording.duration}</div>
                                        <div 
                                            className="platform-badge"
                                            style={{ backgroundColor: platformConfigs[recording.platform].color }}
                                        >
                                            {platformConfigs[recording.platform].icon} {platformConfigs[recording.platform].name}
                                        </div>
                                    </div>
                                    
                                    <div className="recording-content">
                                        <h4 className="recording-title">{recording.title}</h4>
                                        
                                        <div className="recording-meta">
                                            <span>{recording.date}</span>
                                            <div className="recording-stats">
                                                <span>👁️ {recording.views}</span>
                                                <span>❤️ {recording.likes}</span>
                                            </div>
                                        </div>
                                        
                                        <div className="recording-actions">
                                            <button
                                                onClick={() => window.open(recording.url, '_blank')}
                                                className="recording-action primary"
                                            >
                                                <Play size={14} /> Watch
                                            </button>
                                            
                                            <button
                                                onClick={() => toggleFavorite(recording.id)}
                                                className={`recording-action ${favorites.includes(recording.id) ? 'favorited' : 'favorite'}`}
                                            >
                                                {favorites.includes(recording.id) ? '⭐' : '☆'}
                                            </button>
                                            
                                            <button
                                                onClick={() => shareToSocial('facebook', recording.url, recording.title)}
                                                className="recording-action secondary"
                                            >
                                                <Share2 size={14} />
                                            </button>
                                            
                                            <button
                                                onClick={() => copyToClipboard(recording.url)}
                                                className="recording-action accent"
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
                <div className="modal-overlay">
                    <div className="modal-content">
                        <button
                            onClick={() => setShowShareModal(false)}
                            className="modal-close"
                        >
                            ✕
                        </button>
                        
                        <h3>Share Live Stream</h3>
                        
                        <div className="share-options">
                            <button
                                onClick={() => shareToSocial('facebook', window.location.href, 'Join our live stream!')}
                                className="share-option facebook"
                            >
                                📘 Facebook
                            </button>
                            <button
                                onClick={() => shareToSocial('twitter', window.location.href, 'Join our live stream!')}
                                className="share-option twitter"
                            >
                                🐦 Twitter
                            </button>
                            <button
                                onClick={() => shareToSocial('whatsapp', window.location.href, 'Join our live stream!')}
                                className="share-option whatsapp"
                            >
                                📱 WhatsApp
                            </button>
                            <button
                                onClick={() => copyToClipboard(window.location.href)}
                                className="share-option copy"
                            >
                                📋 Copy Link
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Schedule Modal */}
            {showScheduleModal && (
                <div className="modal-overlay">
                    <div className="modal-content schedule-modal">
                        <button
                            onClick={() => setShowScheduleModal(false)}
                            className="modal-close"
                        >
                            ✕
                        </button>
                        
                        <h3>Upcoming Services</h3>
                        
                        <div className="schedule-list">
                            <div className="schedule-item">
                                <div className="schedule-time">
                                    <span className="day">Sunday</span>
                                    <span className="time">10:00 AM</span>
                                </div>
                                <div className="schedule-info">
                                    <h4>Morning Worship</h4>
                                    <p>Join us for worship and teaching</p>
                                </div>
                                <button 
                                    onClick={() => setReminder({
                                        title: 'Morning Worship',
                                        date: new Date().toISOString().split('T')[0],
                                        time: '10:00'
                                    })}
                                    className="reminder-btn"
                                >
                                    🔔 Remind Me
                                </button>
                            </div>
                            
                            <div className="schedule-item">
                                <div className="schedule-time">
                                    <span className="day">Wednesday</span>
                                    <span className="time">7:00 PM</span>
                                </div>
                                <div className="schedule-info">
                                    <h4>Prayer Meeting</h4>
                                    <p>Midweek prayer and fellowship</p>
                                </div>
                                <button 
                                    onClick={() => setReminder({
                                        title: 'Prayer Meeting',
                                        date: new Date().toISOString().split('T')[0],
                                        time: '19:00'
                                    })}
                                    className="reminder-btn"
                                >
                                    🔔 Remind Me
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MultiPlatformLiveStream;