import { useParams, Link, useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, Users, ArrowLeft, Play } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const EventDetails = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [selectedImage, setSelectedImage] = useState(null);

    // Mock event data - in real app, fetch by slug
    const eventsData = {
        'annual-worship-night': {
            title: "Annual Worship Night",
            date: "Dec 15, 2025",
            time: "6:00 PM - 9:00 PM",
            location: "Main Auditorium, City Center",
            description: "Join us for an unforgettable night of praise and worship as we lift up the name of Jesus.",
            fullDescription: "Experience a powerful evening of worship, prayer, and fellowship. This annual event brings together believers from across the city for a night of authentic worship and spiritual renewal. Featuring live worship bands, guest speakers, and opportunities for prayer ministry.",
            capacity: "500 people",
            organizer: "GenFree Worship Team",
            schedule: [
                { time: "6:00 PM", activity: "Doors Open & Registration" },
                { time: "6:30 PM", activity: "Opening Prayer & Welcome" },
                { time: "7:00 PM", activity: "Worship Session 1" },
                { time: "8:00 PM", activity: "Guest Speaker" },
                { time: "8:30 PM", activity: "Worship Session 2 & Prayer Ministry" }
            ],
            images: [
                'https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=800',
                'https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=800',
                'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=800'
            ],
            videos: [
                { title: "Last Year's Highlights", thumbnail: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=400', url: '#' }
            ]
        },
        'christmas-charity-drive': {
            title: "Christmas Charity Drive",
            date: "Dec 20, 2025",
            time: "10:00 AM - 4:00 PM",
            location: "Community Hall",
            description: "Spreading the joy of Christmas by distributing food and gifts to families in need.",
            fullDescription: "Join us in spreading Christmas joy to families in our community. We'll be distributing food packages, gifts for children, and sharing the love of Christ with those in need. Volunteers are welcome to help with packing, distribution, and prayer support.",
            capacity: "200 volunteers needed",
            organizer: "GenFree Outreach Ministry",
            schedule: [
                { time: "10:00 AM", activity: "Volunteer Briefing" },
                { time: "10:30 AM", activity: "Package Preparation" },
                { time: "12:00 PM", activity: "Distribution Begins" },
                { time: "3:00 PM", activity: "Closing Prayer" }
            ],
            images: [
                'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800',
                'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800'
            ],
            videos: []
        }
    };

    const event = eventsData[slug];

    if (!event) {
        return (
            <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
                <h1>Event Not Found</h1>
                <Link to="/events" className="btn btn-primary" style={{ marginTop: '2rem' }}>
                    Back to Events
                </Link>
            </div>
        );
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        alert('Registration submitted! We will contact you soon.');
    };

    return (
        <div>
            {/* Header */}
            <div style={{
                background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #17a2b8 100%)',
                color: 'white',
                padding: '3rem 0 2rem'
            }}>
                <div className="container">
                    <button
                        onClick={() => navigate('/events')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            background: 'none',
                            border: 'none',
                            color: 'white',
                            cursor: 'pointer',
                            marginBottom: '2rem',
                            fontSize: '1rem'
                        }}
                    >
                        <ArrowLeft size={20} />
                        Back to Events
                    </button>
                    <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', marginBottom: '1rem', color: 'white' }}>{event.title}</h1>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2rem', opacity: 0.9 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Calendar size={20} />
                            <span>{event.date}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Clock size={20} />
                            <span>{event.time}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <MapPin size={20} />
                            <span>{event.location}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container" style={{ padding: '4rem 1rem' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '3rem' }}>
                    {/* Left Column */}
                    <div>
                        {/* About */}
                        <section style={{ marginBottom: '3rem' }}>
                            <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--color-primary)' }}>About This Event</h2>
                            <p style={{ lineHeight: 1.8, fontSize: '1.1rem', color: 'var(--color-text)', marginBottom: '1rem' }}>
                                {event.fullDescription}
                            </p>
                            <div style={{ display: 'flex', gap: '2rem', marginTop: '2rem' }}>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-accent)', marginBottom: '0.5rem' }}>
                                        <Users size={20} />
                                        <strong>Capacity</strong>
                                    </div>
                                    <p>{event.capacity}</p>
                                </div>
                                <div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-accent)', marginBottom: '0.5rem' }}>
                                        <strong>Organizer</strong>
                                    </div>
                                    <p>{event.organizer}</p>
                                </div>
                            </div>
                        </section>

                        {/* Schedule */}
                        {event.schedule && (
                            <section style={{ marginBottom: '3rem' }}>
                                <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--color-primary)' }}>Event Schedule</h2>
                                <div style={{ backgroundColor: '#f8fafc', borderRadius: '8px', padding: '1.5rem' }}>
                                    {event.schedule.map((item, index) => (
                                        <div key={index} style={{
                                            display: 'flex',
                                            gap: '2rem',
                                            padding: '1rem 0',
                                            borderBottom: index < event.schedule.length - 1 ? '1px solid #e2e8f0' : 'none'
                                        }}>
                                            <div style={{ fontWeight: 700, color: 'var(--color-accent)', minWidth: '100px' }}>
                                                {item.time}
                                            </div>
                                            <div style={{ color: 'var(--color-text)' }}>
                                                {item.activity}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Image Gallery */}
                        {event.images && event.images.length > 0 && (
                            <section style={{ marginBottom: '3rem' }}>
                                <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--color-primary)' }}>Event Gallery</h2>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
                                    {event.images.map((img, index) => (
                                        <div
                                            key={index}
                                            onClick={() => setSelectedImage(img)}
                                            style={{
                                                height: '200px',
                                                borderRadius: '8px',
                                                overflow: 'hidden',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            <img
                                                src={img}
                                                alt={`Event ${index + 1}`}
                                                style={{
                                                    width: '100%',
                                                    height: '100%',
                                                    objectFit: 'cover',
                                                    transition: 'transform 0.3s'
                                                }}
                                                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                                                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                            />
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Videos */}
                        {event.videos && event.videos.length > 0 && (
                            <section style={{ marginBottom: '3rem' }}>
                                <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: 'var(--color-primary)' }}>Event Videos</h2>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
                                    {event.videos.map((video, index) => (
                                        <div key={index} style={{ borderRadius: '8px', overflow: 'hidden', backgroundColor: '#f1f5f9' }}>
                                            <div style={{ position: 'relative', height: '150px' }}>
                                                <img src={video.thumbnail} alt={video.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                <div style={{
                                                    position: 'absolute',
                                                    inset: 0,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    backgroundColor: 'rgba(0,0,0,0.3)'
                                                }}>
                                                    <Play size={48} color="white" />
                                                </div>
                                            </div>
                                            <div style={{ padding: '1rem' }}>
                                                <h3 style={{ fontSize: '1rem' }}>{video.title}</h3>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>

                    {/* Right Column - Registration */}
                    <div>
                        <div className="card" style={{ position: 'sticky', top: '6rem' }}>
                            <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: 'var(--color-primary)' }}>Register Now</h3>
                            <form onSubmit={handleSubmit}>
                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Full Name *</label>
                                    <input
                                        type="text"
                                        required
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                                    />
                                </div>

                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Email *</label>
                                    <input
                                        type="email"
                                        required
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                                    />
                                </div>

                                <div style={{ marginBottom: '1rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Phone Number *</label>
                                    <input
                                        type="tel"
                                        required
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                                    />
                                </div>

                                <div style={{ marginBottom: '1.5rem' }}>
                                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Additional Notes</label>
                                    <textarea
                                        rows="3"
                                        style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #cbd5e1', resize: 'vertical' }}
                                    />
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-primary"
                                    style={{ width: '100%', padding: '0.75rem' }}
                                >
                                    Submit Registration
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            {/* Image Lightbox */}
            <AnimatePresence>
                {selectedImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelectedImage(null)}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            backgroundColor: 'rgba(0,0,0,0.9)',
                            zIndex: 3000,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '2rem'
                        }}
                    >
                        <motion.img
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.8 }}
                            src={selectedImage}
                            alt="Event"
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                maxWidth: '90%',
                                maxHeight: '90%',
                                objectFit: 'contain',
                                borderRadius: '8px'
                            }}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default EventDetails;
