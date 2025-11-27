import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EventCard from '../components/EventCard';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';

const Events = () => {
    const navigate = useNavigate();
    const { t } = useLanguage();
    const [showModal, setShowModal] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [activeCategory, setActiveCategory] = useState('All');

    const categories = ['All', 'Worship', 'Charity', 'Outreaches', 'Leadership', 'Camps'];

    const upcomingEvents = [
        {
            id: 1,
            slug: 'annual-worship-night',
            title: "Annual Worship Night",
            date: "Dec 15, 2025",
            time: "6:00 PM - 9:00 PM",
            location: "Main Auditorium, City Center",
            description: "Join us for an unforgettable night of praise and worship as we lift up the name of Jesus.",
            category: "Worship",
            image: "https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=600&q=80"
        },
        {
            id: 2,
            slug: 'christmas-charity-drive',
            title: "Christmas Charity Drive",
            date: "Dec 20, 2025",
            time: "10:00 AM - 4:00 PM",
            location: "Community Hall",
            description: "Spreading the joy of Christmas by distributing food and gifts to families in need.",
            category: "Charity",
            image: "https://images.unsplash.com/photo-1593113598332-cd288d649433?w=600&q=80"
        },
        {
            id: 3,
            slug: 'street-outreach',
            title: "Street Outreach Ministry",
            date: "Dec 28, 2025",
            time: "2:00 PM - 6:00 PM",
            location: "Downtown Area",
            description: "Taking the Gospel to the streets and sharing the love of Christ with our community.",
            category: "Outreaches",
            image: "https://images.unsplash.com/photo-1509099863731-ef4bff19e808?w=600&q=80"
        }
    ];

    const pastEvents = [
        {
            id: 4,
            slug: 'youth-leadership-summit',
            title: "Youth Leadership Summit",
            date: "Oct 10, 2025",
            time: "9:00 AM - 5:00 PM",
            location: "Conference Center",
            description: "Equipping the next generation of leaders with biblical principles and practical skills.",
            category: "Leadership",
            image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&q=80"
        },
        {
            id: 5,
            slug: 'summer-camp-2025',
            title: "Summer Camp 2025",
            date: "Aug 15-20, 2025",
            time: "All Day",
            location: "Mountain Retreat Center",
            description: "A week of fun, fellowship, and spiritual growth in the great outdoors.",
            category: "Camps",
            image: "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=600&q=80"
        },
        {
            id: 6,
            slug: 'praise-night-october',
            title: "Praise Night October",
            date: "Oct 5, 2025",
            time: "7:00 PM - 10:00 PM",
            location: "Main Sanctuary",
            description: "An evening of powerful worship and prayer.",
            category: "Worship",
            image: "https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=600&q=80"
        }
    ];

    const allEvents = [...upcomingEvents, ...pastEvents];
    const filteredUpcoming = activeCategory === 'All'
        ? upcomingEvents
        : upcomingEvents.filter(event => event.category === activeCategory);

    const filteredPast = activeCategory === 'All'
        ? pastEvents
        : pastEvents.filter(event => event.category === activeCategory);

    const handleRegister = (event) => {
        setSelectedEvent(event);
        setShowModal(true);
    };

    const handleGoogleFormRegistration = (event) => {
        // Google Form URL with pre-filled event information
        // Replace 'YOUR_FORM_ID' with your actual Google Form ID
        // Replace the entry IDs with your actual form field IDs
        const formUrl = `https://forms.gle/YOUR_FORM_ID?usp=pp_url&entry.1234567890=${encodeURIComponent(event.title)}&entry.0987654321=${encodeURIComponent(event.date)}&entry.1122334455=${encodeURIComponent(event.time)}`;
        window.open(formUrl, '_blank');
        setShowModal(false);
    };

    const handleWhatsAppRegistration = (event) => {
        const message = `Hello GenFree Network! 🙏

I would like to register for the following event:

📅 *Event:* ${event.title}
🗓️ *Date:* ${event.date}
⏰ *Time:* ${event.time}
📍 *Location:* ${event.location}

*My Details:*
• Name: [Please enter your full name]
• Phone: [Your phone number]
• Email: [Your email address]
• Special Requirements: [Any dietary restrictions, accessibility needs, or questions]

Thank you! Looking forward to this event. 🎉`;
        
        // Replace with your actual WhatsApp number (include country code without + sign)
        const whatsappNumber = '256700000000'; // Update with your Uganda number
        window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank');
        setShowModal(false);
    };

    const handleViewDetails = (slug) => {
        navigate(`/events/${slug}`);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        alert('Registration submitted! We will contact you soon.');
        setShowModal(false);
    };

    return (
        <div>
            {/* Page Header */}
            <div style={{
                backgroundColor: 'var(--color-primary)',
                color: 'var(--color-white)',
                padding: '4rem 0',
                textAlign: 'center',
                background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #17a2b8 100%)'
            }}>
                <div className="container">
                    <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', marginBottom: '1rem', color: 'white' }}>
                        {t('events.title')}
                    </h1>
                    <p style={{ maxWidth: '600px', margin: '0 auto', opacity: 0.9, fontSize: 'clamp(1rem, 2vw, 1.1rem)' }}>
                        {t('events.subtitle')}
                    </p>
                </div>
            </div>

            {/* Category Filter */}
            <section style={{ padding: '3rem 0 1rem', backgroundColor: '#f8fafc' }}>
                <div className="container">
                    <div style={{
                        display: 'flex',
                        gap: '1rem',
                        justifyContent: 'center',
                        flexWrap: 'wrap'
                    }}>
                        {categories.map(category => (
                            <button
                                key={category}
                                onClick={() => setActiveCategory(category)}
                                style={{
                                    padding: '0.75rem 1.5rem',
                                    borderRadius: '50px',
                                    border: activeCategory === category ? '2px solid var(--color-accent)' : '2px solid #cbd5e1',
                                    backgroundColor: activeCategory === category ? 'var(--color-accent)' : 'white',
                                    color: activeCategory === category ? 'white' : 'var(--color-text)',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    transition: 'all 0.3s',
                                    fontSize: '0.95rem'
                                }}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Upcoming Events */}
            <section style={{ padding: '3rem 0 5rem', backgroundColor: '#f8fafc' }}>
                <div className="container">
                    <h2 className="section-title">{t('events.upcoming')}</h2>
                    {filteredUpcoming.length > 0 ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
                            {filteredUpcoming.map(event => (
                                <div key={event.id} style={{ position: 'relative' }}>
                                    <EventCard {...event} onRegister={() => handleRegister(event)} />
                                    <button
                                        onClick={() => handleViewDetails(event.slug)}
                                        style={{
                                            position: 'absolute',
                                            top: '1rem',
                                            right: '1rem',
                                            padding: '0.5rem 1rem',
                                            backgroundColor: 'rgba(23, 162, 184, 0.9)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            fontSize: '0.85rem',
                                            fontWeight: 600,
                                            zIndex: 10
                                        }}
                                    >
                                        {t('events.viewDetails')}
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '2rem' }}>
                            No upcoming events in this category.
                        </p>
                    )}
                </div>
            </section>

            {/* Past Events */}
            <section style={{ padding: '5rem 0', backgroundColor: '#e2e8f0' }}>
                <div className="container">
                    <h2 className="section-title">{t('events.past')}</h2>
                    {filteredPast.length > 0 ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
                            {filteredPast.map(event => (
                                <div key={event.id} style={{ position: 'relative' }}>
                                    <EventCard {...event} isPast={true} />
                                    <button
                                        onClick={() => handleViewDetails(event.slug)}
                                        style={{
                                            position: 'absolute',
                                            top: '1rem',
                                            right: '1rem',
                                            padding: '0.5rem 1rem',
                                            backgroundColor: 'rgba(100, 116, 139, 0.9)',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer',
                                            fontSize: '0.85rem',
                                            fontWeight: 600,
                                            zIndex: 10
                                        }}
                                    >
                                        {t('events.viewDetails')}
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '2rem' }}>
                            No past events in this category.
                        </p>
                    )}
                </div>
            </section>

            {/* Registration Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            backgroundColor: 'rgba(0,0,0,0.7)',
                            zIndex: 2000,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '2rem'
                        }}
                        onClick={() => setShowModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                backgroundColor: 'white',
                                borderRadius: '8px',
                                maxWidth: '500px',
                                width: '100%',
                                maxHeight: '90vh',
                                overflow: 'auto'
                            }}
                        >
                            <div style={{ padding: '2rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                    <h2 style={{ fontSize: '1.5rem', color: 'var(--color-primary)' }}>Register for Event</h2>
                                    <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                                        <X size={24} />
                                    </button>
                                </div>

                                {selectedEvent && (
                                    <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#f1f5f9', borderRadius: '4px' }}>
                                        <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{selectedEvent.title}</h3>
                                        <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>{selectedEvent.date} • {selectedEvent.time}</p>
                                    </div>
                                )}

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <p style={{ color: 'var(--color-text-muted)', textAlign: 'center', marginBottom: '0.5rem' }}>
                                        Choose your preferred registration method:
                                    </p>

                                    {/* Google Form Registration */}
                                    <button
                                        onClick={() => handleGoogleFormRegistration(selectedEvent)}
                                        style={{
                                            padding: '1rem',
                                            borderRadius: '8px',
                                            border: '2px solid var(--color-primary)',
                                            backgroundColor: 'var(--color-primary)',
                                            color: 'white',
                                            fontSize: '1.1rem',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '0.5rem'
                                        }}
                                        onMouseOver={(e) => {
                                            e.target.style.transform = 'translateY(-2px)';
                                            e.target.style.boxShadow = 'var(--shadow-md)';
                                        }}
                                        onMouseOut={(e) => {
                                            e.target.style.transform = 'translateY(0)';
                                            e.target.style.boxShadow = 'none';
                                        }}
                                    >
                                        📝 Register via Online Form
                                    </button>

                                    <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                                        — or —
                                    </div>

                                    {/* WhatsApp Registration */}
                                    <button
                                        onClick={() => handleWhatsAppRegistration(selectedEvent)}
                                        style={{
                                            padding: '1rem',
                                            borderRadius: '8px',
                                            border: '2px solid #25D366',
                                            backgroundColor: '#25D366',
                                            color: 'white',
                                            fontSize: '1.1rem',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '0.5rem'
                                        }}
                                        onMouseOver={(e) => {
                                            e.target.style.transform = 'translateY(-2px)';
                                            e.target.style.boxShadow = 'var(--shadow-md)';
                                        }}
                                        onMouseOut={(e) => {
                                            e.target.style.transform = 'translateY(0)';
                                            e.target.style.boxShadow = 'none';
                                        }}
                                    >
                                        📱 Register via WhatsApp
                                    </button>

                                    <div style={{ 
                                        marginTop: '1rem', 
                                        padding: '1rem', 
                                        backgroundColor: '#f0f9ff', 
                                        borderRadius: '8px', 
                                        border: '1px solid #bae6fd' 
                                    }}>
                                        <h4 style={{ color: 'var(--color-primary)', marginBottom: '0.5rem', fontSize: '0.95rem' }}>
                                            📋 Registration is FREE & Easy!
                                        </h4>
                                        <ul style={{ margin: 0, paddingLeft: '1.5rem', color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                                            <li><strong>Online Form:</strong> Secure, instant confirmation</li>
                                            <li><strong>WhatsApp:</strong> Personal, direct communication</li>
                                            <li>Confirmation within 24 hours</li>
                                            <li>Bring valid ID on event day</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Events;
