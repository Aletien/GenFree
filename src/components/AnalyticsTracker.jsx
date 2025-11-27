import { useState, useEffect } from 'react';
import { BarChart3, Users, Clock, Heart, Share2, TrendingUp, Eye, Globe } from 'lucide-react';

const AnalyticsTracker = ({ streamId, platform, isLive, onAnalyticsUpdate }) => {
    const [analytics, setAnalytics] = useState({
        totalViewers: 0,
        peakViewers: 0,
        averageViewTime: 0,
        totalLikes: 0,
        totalShares: 0,
        totalComments: 0,
        engagementRate: 0,
        countries: {},
        devices: {},
        referrers: {},
        timeSpent: 0
    });
    
    const [realTimeStats, setRealTimeStats] = useState({
        currentViewers: 0,
        viewersChange: 0,
        engagementSpike: false
    });

    const [showDetailedStats, setShowDetailedStats] = useState(false);

    // Simulate real-time analytics
    useEffect(() => {
        if (!isLive) return;

        const interval = setInterval(() => {
            setRealTimeStats(prev => {
                const change = Math.floor((Math.random() - 0.5) * 20);
                const newViewers = Math.max(0, prev.currentViewers + change);
                
                return {
                    currentViewers: newViewers,
                    viewersChange: change,
                    engagementSpike: Math.random() > 0.9
                };
            });

            setAnalytics(prev => ({
                ...prev,
                totalViewers: prev.totalViewers + Math.floor(Math.random() * 5),
                peakViewers: Math.max(prev.peakViewers, realTimeStats.currentViewers),
                totalLikes: prev.totalLikes + (Math.random() > 0.8 ? 1 : 0),
                totalShares: prev.totalShares + (Math.random() > 0.95 ? 1 : 0),
                totalComments: prev.totalComments + (Math.random() > 0.9 ? 1 : 0),
                timeSpent: prev.timeSpent + 1
            }));
        }, 5000);

        return () => clearInterval(interval);
    }, [isLive, realTimeStats.currentViewers]);

    // Initialize sample data
    useEffect(() => {
        setAnalytics({
            totalViewers: 1250,
            peakViewers: 892,
            averageViewTime: 25.5,
            totalLikes: 156,
            totalShares: 34,
            totalComments: 89,
            engagementRate: 12.5,
            countries: {
                'Kenya': 35,
                'Nigeria': 28,
                'Uganda': 15,
                'Tanzania': 12,
                'Ghana': 10
            },
            devices: {
                'Mobile': 65,
                'Desktop': 25,
                'Tablet': 10
            },
            referrers: {
                'Facebook': 40,
                'YouTube': 35,
                'Direct': 15,
                'WhatsApp': 10
            },
            timeSpent: 0
        });

        setRealTimeStats({
            currentViewers: 156,
            viewersChange: 5,
            engagementSpike: false
        });
    }, []);

    // Analytics tracking functions
    const trackEvent = (eventType, data = {}) => {
        const event = {
            type: eventType,
            timestamp: Date.now(),
            streamId,
            platform,
            data,
            userId: 'anonymous_' + Math.random().toString(36).substr(2, 9)
        };

        // In production, send to analytics service
        console.log('Analytics Event:', event);
        
        // Update local analytics
        if (eventType === 'like') {
            setAnalytics(prev => ({
                ...prev,
                totalLikes: prev.totalLikes + 1
            }));
        } else if (eventType === 'share') {
            setAnalytics(prev => ({
                ...prev,
                totalShares: prev.totalShares + 1
            }));
        } else if (eventType === 'comment') {
            setAnalytics(prev => ({
                ...prev,
                totalComments: prev.totalComments + 1
            }));
        }

        // Notify parent component
        if (onAnalyticsUpdate) {
            onAnalyticsUpdate(event);
        }
    };

    const calculateEngagementRate = () => {
        const totalEngagements = analytics.totalLikes + analytics.totalShares + analytics.totalComments;
        return analytics.totalViewers > 0 ? ((totalEngagements / analytics.totalViewers) * 100).toFixed(1) : 0;
    };

    const formatNumber = (num) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    };

    const formatDuration = (minutes) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
    };

    // Expose tracking function for parent component
    useEffect(() => {
        window.trackStreamEvent = trackEvent;
        return () => {
            delete window.trackStreamEvent;
        };
    }, []);

    return (
        <div style={{
            backgroundColor: 'var(--color-surface)',
            borderRadius: '8px',
            padding: '1rem',
            border: '1px solid var(--color-border)'
        }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1rem'
            }}>
                <h4 style={{
                    margin: 0,
                    color: 'var(--color-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                }}>
                    <BarChart3 size={18} />
                    Analytics
                </h4>
                <button
                    onClick={() => setShowDetailedStats(!showDetailedStats)}
                    style={{
                        padding: '0.25rem 0.5rem',
                        backgroundColor: 'var(--color-secondary)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '0.8rem'
                    }}
                >
                    {showDetailedStats ? 'Simple' : 'Detailed'}
                </button>
            </div>

            {/* Real-time Stats */}
            {isLive && (
                <div style={{
                    backgroundColor: 'var(--color-success-bg)',
                    padding: '0.75rem',
                    borderRadius: '6px',
                    marginBottom: '1rem',
                    border: '1px solid var(--color-success)'
                }}>
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{
                                width: '8px',
                                height: '8px',
                                backgroundColor: '#00ff00',
                                borderRadius: '50%',
                                animation: 'blink 1s infinite'
                            }} />
                            <span style={{ fontWeight: 'bold', color: 'var(--color-success)' }}>
                                LIVE
                            </span>
                        </div>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontSize: '0.9rem'
                        }}>
                            <Users size={16} />
                            <span style={{ fontWeight: 'bold' }}>
                                {formatNumber(realTimeStats.currentViewers)}
                            </span>
                            <span style={{
                                color: realTimeStats.viewersChange >= 0 ? 'green' : 'red',
                                fontSize: '0.8rem'
                            }}>
                                ({realTimeStats.viewersChange >= 0 ? '+' : ''}{realTimeStats.viewersChange})
                            </span>
                        </div>
                    </div>
                </div>
            )}

            {/* Key Metrics */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                gap: '0.75rem',
                marginBottom: '1rem'
            }}>
                <div style={{ textAlign: 'center', padding: '0.5rem' }}>
                    <div style={{
                        fontSize: '1.5rem',
                        fontWeight: 'bold',
                        color: 'var(--color-primary)'
                    }}>
                        {formatNumber(analytics.totalViewers)}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                        Total Viewers
                    </div>
                </div>

                <div style={{ textAlign: 'center', padding: '0.5rem' }}>
                    <div style={{
                        fontSize: '1.5rem',
                        fontWeight: 'bold',
                        color: 'var(--color-secondary)'
                    }}>
                        {formatNumber(analytics.peakViewers)}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                        Peak Viewers
                    </div>
                </div>

                <div style={{ textAlign: 'center', padding: '0.5rem' }}>
                    <div style={{
                        fontSize: '1.5rem',
                        fontWeight: 'bold',
                        color: 'var(--color-accent)'
                    }}>
                        {formatDuration(Math.round(analytics.averageViewTime))}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                        Avg. Watch Time
                    </div>
                </div>

                <div style={{ textAlign: 'center', padding: '0.5rem' }}>
                    <div style={{
                        fontSize: '1.5rem',
                        fontWeight: 'bold',
                        color: 'var(--color-warning)'
                    }}>
                        {calculateEngagementRate()}%
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                        Engagement
                    </div>
                </div>
            </div>

            {/* Engagement Stats */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-around',
                padding: '0.75rem',
                backgroundColor: 'var(--color-bg)',
                borderRadius: '6px',
                marginBottom: '1rem'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ color: '#ff69b4', fontWeight: 'bold' }}>
                        ❤️ {analytics.totalLikes}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                        Likes
                    </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ color: '#1da1f2', fontWeight: 'bold' }}>
                        📤 {analytics.totalShares}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                        Shares
                    </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ color: '#00c851', fontWeight: 'bold' }}>
                        💬 {analytics.totalComments}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                        Comments
                    </div>
                </div>
            </div>

            {/* Detailed Stats */}
            {showDetailedStats && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {/* Geographic Distribution */}
                    <div>
                        <h5 style={{ margin: '0 0 0.5rem 0', color: 'var(--color-primary)' }}>
                            🌍 Geographic Distribution
                        </h5>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            {Object.entries(analytics.countries).map(([country, percentage]) => (
                                <div key={country} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <span style={{ fontSize: '0.8rem', minWidth: '60px' }}>{country}</span>
                                    <div style={{
                                        flex: 1,
                                        height: '8px',
                                        backgroundColor: 'var(--color-border)',
                                        borderRadius: '4px',
                                        overflow: 'hidden'
                                    }}>
                                        <div style={{
                                            width: `${percentage}%`,
                                            height: '100%',
                                            backgroundColor: 'var(--color-primary)',
                                            transition: 'width 0.3s ease'
                                        }} />
                                    </div>
                                    <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                                        {percentage}%
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Device Distribution */}
                    <div>
                        <h5 style={{ margin: '0 0 0.5rem 0', color: 'var(--color-primary)' }}>
                            📱 Device Types
                        </h5>
                        <div style={{
                            display: 'flex',
                            gap: '0.5rem',
                            flexWrap: 'wrap'
                        }}>
                            {Object.entries(analytics.devices).map(([device, percentage]) => (
                                <div
                                    key={device}
                                    style={{
                                        padding: '0.5rem',
                                        backgroundColor: 'var(--color-secondary)',
                                        color: 'white',
                                        borderRadius: '4px',
                                        fontSize: '0.8rem',
                                        textAlign: 'center'
                                    }}
                                >
                                    <div>{device}</div>
                                    <div style={{ fontWeight: 'bold' }}>{percentage}%</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Traffic Sources */}
                    <div>
                        <h5 style={{ margin: '0 0 0.5rem 0', color: 'var(--color-primary)' }}>
                            🔗 Traffic Sources
                        </h5>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            {Object.entries(analytics.referrers).map(([source, percentage]) => (
                                <div key={source} style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ fontSize: '0.8rem' }}>{source}</span>
                                    <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>{percentage}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Engagement Spike Alert */}
            {realTimeStats.engagementSpike && (
                <div style={{
                    position: 'fixed',
                    top: '20px',
                    right: '20px',
                    backgroundColor: '#FFD700',
                    color: '#000',
                    padding: '1rem',
                    borderRadius: '8px',
                    boxShadow: '0 4px 15px rgba(255, 215, 0, 0.4)',
                    animation: 'pulse 2s infinite',
                    zIndex: 1001
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <TrendingUp size={20} />
                        <span style={{ fontWeight: 'bold' }}>Engagement Spike!</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>
                        High activity detected in chat
                    </div>
                </div>
            )}

            <style jsx>{`
                @keyframes blink {
                    0%, 50% { opacity: 1; }
                    51%, 100% { opacity: 0.3; }
                }
            `}</style>
        </div>
    );
};

export default AnalyticsTracker;