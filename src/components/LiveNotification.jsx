import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, ExternalLink, Bell } from 'lucide-react';

const LiveNotification = ({ isLive, liveData, onClose, onJoin }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [hasBeenShown, setHasBeenShown] = useState(false);

    useEffect(() => {
        if (isLive && !hasBeenShown) {
            setIsVisible(true);
            setHasBeenShown(true);
            
            // Auto-hide after 10 seconds
            const timer = setTimeout(() => {
                setIsVisible(false);
            }, 10000);
            
            return () => clearTimeout(timer);
        }
    }, [isLive, hasBeenShown]);

    const handleClose = () => {
        setIsVisible(false);
        onClose?.();
    };

    const handleJoin = () => {
        setIsVisible(false);
        onJoin?.(liveData);
    };

    if (!isVisible || !liveData) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ x: 400, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 400, opacity: 0 }}
                style={{
                    position: 'fixed',
                    top: '100px',
                    right: '20px',
                    width: '320px',
                    backgroundColor: 'var(--color-surface)',
                    borderRadius: '12px',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
                    border: '2px solid #FF4444',
                    zIndex: 9999,
                    overflow: 'hidden'
                }}
            >
                {/* Header */}
                <div style={{
                    background: 'linear-gradient(135deg, #FF4444, #FF6666)',
                    color: 'white',
                    padding: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{
                            width: '8px',
                            height: '8px',
                            backgroundColor: 'white',
                            borderRadius: '50%',
                            animation: 'blink 1s infinite'
                        }} />
                        <span style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>LIVE NOW</span>
                    </div>
                    <button
                        onClick={handleClose}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: 'white',
                            cursor: 'pointer',
                            padding: '0.25rem'
                        }}
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Content */}
                <div style={{ padding: '1rem' }}>
                    <h4 style={{
                        color: 'var(--color-text)',
                        marginBottom: '0.5rem',
                        fontSize: '1rem',
                        fontWeight: '600'
                    }}>
                        {liveData.title || 'Worship Service Live'}
                    </h4>
                    <p style={{
                        color: 'var(--color-text-muted)',
                        fontSize: '0.8rem',
                        marginBottom: '1rem'
                    }}>
                        Join us for live worship and teaching
                    </p>

                    {liveData.viewerCount && (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            marginBottom: '1rem',
                            color: 'var(--color-text-muted)',
                            fontSize: '0.8rem'
                        }}>
                            <Users size={14} />
                            <span>{liveData.viewerCount} watching</span>
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                            onClick={handleJoin}
                            style={{
                                flex: 1,
                                padding: '0.75rem',
                                backgroundColor: 'var(--color-primary)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontWeight: '600',
                                fontSize: '0.8rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem'
                            }}
                        >
                            <ExternalLink size={14} />
                            Join Stream
                        </button>
                        <button
                            onClick={handleClose}
                            style={{
                                padding: '0.75rem',
                                backgroundColor: 'var(--color-bg)',
                                border: '1px solid var(--color-border)',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '0.8rem'
                            }}
                        >
                            Later
                        </button>
                    </div>
                </div>
            </motion.div>
            
            <style jsx>{`
                @keyframes blink {
                    0%, 50% { opacity: 1; }
                    51%, 100% { opacity: 0.3; }
                }
            `}</style>
        </AnimatePresence>
    );
};

export default LiveNotification;