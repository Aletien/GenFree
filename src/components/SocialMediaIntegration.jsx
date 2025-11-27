import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Bell, Heart, MessageCircle, Share, Play } from 'lucide-react';

const SocialMediaIntegration = ({ showLiveIndicators = true }) => {
    const [socialStats, setSocialStats] = useState({
        youtube: { subscribers: '1.2K', isLive: false },
        facebook: { followers: '850', isLive: false },
        instagram: { followers: '2.1K', isLive: true },
        tiktok: { followers: '950', isLive: false }
    });

    // Your actual social media links
    const socialLinks = {
        youtube: {
            url: 'https://youtube.com/@genfree',
            channelId: 'YOUR_YOUTUBE_CHANNEL_ID',
            name: 'YouTube',
            color: '#FF0000',
            icon: '📺',
            description: 'Subscribe for worship sessions and teachings'
        },
        facebook: {
            url: 'https://facebook.com/genfree',
            pageId: 'YOUR_FACEBOOK_PAGE_ID',
            name: 'Facebook',
            color: '#1877F2',
            icon: '📘',
            description: 'Join our community and get updates'
        },
        instagram: {
            url: 'https://instagram.com/genfree',
            handle: '@genfree',
            name: 'Instagram',
            color: '#E4405F',
            icon: '📸',
            description: 'Daily inspiration and behind-the-scenes'
        },
        tiktok: {
            url: 'https://tiktok.com/@genfree',
            handle: '@genfree',
            name: 'TikTok',
            color: '#000000',
            icon: '🎵',
            description: 'Short worship clips and testimonies'
        }
    };

    // Live stream detection (you'd implement actual API calls)
    useEffect(() => {
        const checkLiveStatus = async () => {
            try {
                // YouTube Live Check (replace with actual YouTube Data API)
                // const youtubeResponse = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${socialLinks.youtube.channelId}&eventType=live&type=video&key=${API_KEY}`);
                
                // Facebook Live Check (replace with actual Facebook Graph API)
                // const facebookResponse = await fetch(`https://graph.facebook.com/${socialLinks.facebook.pageId}/live_videos?access_token=${ACCESS_TOKEN}`);
                
                // For demo purposes, simulate live status
                setSocialStats(prev => ({
                    ...prev,
                    instagram: { ...prev.instagram, isLive: Math.random() > 0.7 }
                }));
            } catch (error) {
                console.log('Error checking live status:', error);
            }
        };

        if (showLiveIndicators) {
            checkLiveStatus();
            const interval = setInterval(checkLiveStatus, 60000); // Check every minute
            return () => clearInterval(interval);
        }
    }, [showLiveIndicators]);

    const handleSocialClick = (platform, url) => {
        // Track engagement analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', 'social_click', {
                'event_category': 'Social Media',
                'event_label': platform,
                'value': 1
            });
        }
        window.open(url, '_blank', 'noopener,noreferrer');
    };

    const handleNotificationSubscribe = (platform) => {
        // Implement push notification subscription for live alerts
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            // Request notification permission
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    alert(`You'll now receive notifications when we go live on ${platform}!`);
                    // Implement actual push subscription logic
                }
            });
        } else {
            // Fallback: redirect to platform notification settings
            handleSocialClick(platform, socialLinks[platform].url);
        }
    };

    return (
        <div style={{ padding: '2rem 0' }}>
            <div className="container">
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <h2 style={{ 
                        fontSize: '2.5rem', 
                        marginBottom: '1rem', 
                        color: 'var(--color-primary)' 
                    }}>
                        🌐 Connect With Us
                    </h2>
                    <p style={{ 
                        fontSize: '1.1rem', 
                        color: 'var(--color-text-muted)', 
                        maxWidth: '600px', 
                        margin: '0 auto' 
                    }}>
                        Follow us across all platforms for live worship sessions, daily inspiration, and community updates
                    </p>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '2rem',
                    marginBottom: '3rem'
                }}>
                    {Object.entries(socialLinks).map(([platform, details]) => {
                        const stats = socialStats[platform];
                        const isLive = stats?.isLive;

                        return (
                            <motion.div
                                key={platform}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                whileHover={{ y: -5 }}
                                style={{
                                    backgroundColor: 'var(--color-surface)',
                                    borderRadius: '12px',
                                    padding: '1.5rem',
                                    boxShadow: 'var(--shadow-md)',
                                    border: isLive ? `2px solid ${details.color}` : '2px solid transparent',
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}
                            >
                                {/* Live Indicator */}
                                {isLive && showLiveIndicators && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        style={{
                                            position: 'absolute',
                                            top: '1rem',
                                            right: '1rem',
                                            backgroundColor: '#FF4444',
                                            color: 'white',
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '12px',
                                            fontSize: '0.8rem',
                                            fontWeight: 'bold',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.25rem',
                                            animation: 'pulse 2s infinite'
                                        }}
                                    >
                                        <div style={{
                                            width: '6px',
                                            height: '6px',
                                            backgroundColor: 'white',
                                            borderRadius: '50%',
                                            animation: 'blink 1s infinite'
                                        }} />
                                        LIVE
                                    </motion.div>
                                )}

                                <div style={{ marginBottom: '1rem' }}>
                                    <div style={{
                                        width: '60px',
                                        height: '60px',
                                        backgroundColor: details.color,
                                        borderRadius: '12px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '1.5rem',
                                        marginBottom: '1rem'
                                    }}>
                                        {details.icon}
                                    </div>
                                    <h3 style={{ 
                                        fontSize: '1.3rem', 
                                        marginBottom: '0.5rem', 
                                        color: 'var(--color-text)' 
                                    }}>
                                        {details.name}
                                    </h3>
                                    <p style={{ 
                                        color: 'var(--color-text-muted)', 
                                        fontSize: '0.9rem',
                                        marginBottom: '1rem'
                                    }}>
                                        {details.description}
                                    </p>
                                    {stats && (
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            marginBottom: '1rem'
                                        }}>
                                            <Heart size={16} style={{ color: details.color }} />
                                            <span style={{ 
                                                fontSize: '0.9rem', 
                                                fontWeight: '600',
                                                color: 'var(--color-text)'
                                            }}>
                                                {stats.subscribers || stats.followers} followers
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <button
                                        onClick={() => handleSocialClick(details.name, details.url)}
                                        style={{
                                            flex: 1,
                                            padding: '0.75rem',
                                            backgroundColor: details.color,
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            fontWeight: '600',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '0.5rem',
                                            transition: 'opacity 0.3s'
                                        }}
                                        onMouseOver={(e) => e.target.style.opacity = '0.9'}
                                        onMouseOut={(e) => e.target.style.opacity = '1'}
                                    >
                                        {isLive ? <Play size={16} /> : <ExternalLink size={16} />}
                                        {isLive ? 'Watch Live' : 'Follow'}
                                    </button>
                                    
                                    <button
                                        onClick={() => handleNotificationSubscribe(details.name)}
                                        style={{
                                            padding: '0.75rem',
                                            backgroundColor: 'var(--color-surface)',
                                            border: `2px solid ${details.color}`,
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            color: details.color,
                                            transition: 'all 0.3s'
                                        }}
                                        onMouseOver={(e) => {
                                            e.target.style.backgroundColor = details.color;
                                            e.target.style.color = 'white';
                                        }}
                                        onMouseOut={(e) => {
                                            e.target.style.backgroundColor = 'var(--color-surface)';
                                            e.target.style.color = details.color;
                                        }}
                                        title="Get notified when we go live"
                                    >
                                        <Bell size={16} />
                                    </button>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Social Media Embed Preview */}
                <div style={{
                    backgroundColor: 'var(--color-surface)',
                    borderRadius: '12px',
                    padding: '2rem',
                    textAlign: 'center'
                }}>
                    <h3 style={{ 
                        fontSize: '1.5rem', 
                        marginBottom: '1rem', 
                        color: 'var(--color-primary)' 
                    }}>
                        📱 Latest Posts & Updates
                    </h3>
                    <p style={{ 
                        color: 'var(--color-text-muted)', 
                        marginBottom: '2rem' 
                    }}>
                        See our latest posts and updates from across all social media platforms
                    </p>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                        gap: '1.5rem'
                    }}>
                        {/* YouTube Latest Video */}
                        <div style={{
                            backgroundColor: 'var(--color-bg)',
                            borderRadius: '8px',
                            padding: '1rem'
                        }}>
                            <h4 style={{ color: '#FF0000', marginBottom: '0.5rem' }}>📺 Latest Video</h4>
                            <div style={{
                                width: '100%',
                                height: '120px',
                                backgroundColor: '#000',
                                borderRadius: '6px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                cursor: 'pointer'
                            }}
                            onClick={() => handleSocialClick('YouTube', socialLinks.youtube.url)}
                            >
                                <Play size={30} />
                            </div>
                            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
                                Click to watch our latest worship session
                            </p>
                        </div>

                        {/* Instagram Latest Post */}
                        <div style={{
                            backgroundColor: 'var(--color-bg)',
                            borderRadius: '8px',
                            padding: '1rem'
                        }}>
                            <h4 style={{ color: '#E4405F', marginBottom: '0.5rem' }}>📸 Latest Post</h4>
                            <div style={{
                                width: '100%',
                                height: '120px',
                                background: 'linear-gradient(45deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%)',
                                borderRadius: '6px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                cursor: 'pointer'
                            }}
                            onClick={() => handleSocialClick('Instagram', socialLinks.instagram.url)}
                            >
                                <Heart size={30} />
                            </div>
                            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
                                See our latest inspirational posts
                            </p>
                        </div>

                        {/* Community Highlights */}
                        <div style={{
                            backgroundColor: 'var(--color-bg)',
                            borderRadius: '8px',
                            padding: '1rem'
                        }}>
                            <h4 style={{ color: 'var(--color-primary)', marginBottom: '0.5rem' }}>⭐ Highlights</h4>
                            <div style={{
                                width: '100%',
                                height: '120px',
                                backgroundColor: 'var(--color-primary)',
                                borderRadius: '6px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                cursor: 'pointer'
                            }}>
                                <Share size={30} />
                            </div>
                            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
                                Community testimonies and highlights
                            </p>
                        </div>
                    </div>
                </div>

                {/* Call to Action */}
                <div style={{
                    textAlign: 'center',
                    marginTop: '3rem',
                    padding: '2rem',
                    backgroundColor: '#f0f9ff',
                    borderRadius: '12px',
                    border: '1px solid #bae6fd'
                }}>
                    <h3 style={{ color: 'var(--color-primary)', marginBottom: '1rem' }}>
                        🔔 Never Miss a Live Session!
                    </h3>
                    <p style={{ 
                        color: 'var(--color-text-muted)', 
                        marginBottom: '1.5rem',
                        fontSize: '1.1rem'
                    }}>
                        Follow us on your favorite platform and turn on notifications to get instant alerts when we go live for worship sessions, teachings, and special events.
                    </p>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: '1rem',
                        flexWrap: 'wrap'
                    }}>
                        <button
                            onClick={() => handleSocialClick('All Platforms', '#')}
                            className="btn btn-primary"
                            style={{
                                padding: '0.75rem 1.5rem',
                                fontSize: '1rem',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            <Bell size={18} />
                            Enable All Notifications
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SocialMediaIntegration;