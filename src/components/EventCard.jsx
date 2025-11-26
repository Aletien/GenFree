import { Calendar, MapPin, Clock } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const EventCard = ({ title, date, time, location, description, image, category, isPast, onRegister }) => {
    const { t } = useLanguage();

    return (
        <div className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', opacity: isPast ? 0.8 : 1 }}>
            {/* Event Image */}
            <div style={{
                position: 'relative',
                height: '220px',
                backgroundColor: '#e2e8f0',
                backgroundImage: image ? `url(${image})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#94a3b8',
                filter: isPast ? 'grayscale(50%)' : 'none'
            }}>
                {!image && <span>{isPast ? 'Past Event' : 'Event Image'}</span>}

                {/* Category Badge */}
                {category && (
                    <div style={{
                        position: 'absolute',
                        top: '1rem',
                        left: '1rem',
                        padding: '0.5rem 1rem',
                        backgroundColor: isPast ? 'rgba(100, 116, 139, 0.9)' : 'rgba(23, 162, 184, 0.9)',
                        color: 'white',
                        borderRadius: '50px',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                    }}>
                        {category}
                    </div>
                )}
            </div>

            <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{
                    color: isPast ? 'var(--color-text-muted)' : 'var(--color-accent)',
                    fontWeight: '700',
                    fontSize: '0.9rem',
                    textTransform: 'uppercase',
                    marginBottom: '0.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                }}>
                    <Calendar size={16} /> {date}
                </div>

                <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: isPast ? 'var(--color-text-muted)' : 'var(--color-primary)' }}>{title}</h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem', color: 'var(--color-text-muted)', fontSize: '0.95rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Clock size={16} /> {time}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <MapPin size={16} /> {location}
                    </div>
                </div>

                <p style={{ color: 'var(--color-text)', marginBottom: '1.5rem', flex: 1, lineHeight: 1.6 }}>{description}</p>

                {!isPast && (
                    <button
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '0.75rem' }}
                        onClick={onRegister}
                    >
                        {t('events.registerNow')}
                    </button>
                )}
                {isPast && (
                    <div style={{ marginTop: 'auto', padding: '0.75rem', textAlign: 'center', color: 'var(--color-text-muted)', fontStyle: 'italic', borderTop: '1px solid #e2e8f0', fontWeight: 600 }}>
                        {t('events.concluded')}
                    </div>
                )}
            </div>
        </div>
    );
};

export default EventCard;
