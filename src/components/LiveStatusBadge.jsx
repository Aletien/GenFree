import { motion } from 'framer-motion';
import { Users, Play } from 'lucide-react';
import { useLiveStatus } from '../hooks/useLiveStatus';

const LiveStatusBadge = ({ 
    size = 'medium', 
    showViewers = true, 
    onClick,
    className = '' 
}) => {
    const { isAnyLive, activePlatform } = useLiveStatus();

    if (!isAnyLive) return null;

    const sizeStyles = {
        small: {
            padding: '0.5rem 0.75rem',
            fontSize: '0.8rem',
            iconSize: 14,
            dotSize: '6px'
        },
        medium: {
            padding: '0.75rem 1rem',
            fontSize: '0.9rem',
            iconSize: 16,
            dotSize: '8px'
        },
        large: {
            padding: '1rem 1.5rem',
            fontSize: '1rem',
            iconSize: 18,
            dotSize: '10px'
        }
    };

    const style = sizeStyles[size];

    const handleClick = () => {
        if (onClick) {
            onClick(activePlatform);
        } else {
            // Default behavior - redirect to live page
            window.location.href = '/live';
        }
    };

    return (
        <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleClick}
            className={className}
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: style.padding,
                backgroundColor: '#FF4444',
                color: 'white',
                borderRadius: '25px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: style.fontSize,
                boxShadow: '0 4px 15px rgba(255, 68, 68, 0.4)',
                animation: 'pulse 2s infinite',
                border: 'none',
                outline: 'none'
            }}
        >
            {/* Blinking dot */}
            <motion.div
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                style={{
                    width: style.dotSize,
                    height: style.dotSize,
                    backgroundColor: 'white',
                    borderRadius: '50%'
                }}
            />
            
            <span>LIVE</span>
            
            <Play size={style.iconSize} />
            
            {showViewers && activePlatform?.viewerCount && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Users size={style.iconSize - 2} />
                    <span>{activePlatform.viewerCount}</span>
                </div>
            )}
        </motion.div>
    );
};

export default LiveStatusBadge;