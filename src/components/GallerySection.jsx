import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const GallerySection = () => {
    const [selectedImage, setSelectedImage] = useState(null);
    const [activeFilter, setActiveFilter] = useState('All');

    const galleryItems = [
        {
            id: 1,
            image: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=800',
            title: 'Worship Night',
            category: 'Worship'
        },
        {
            id: 2,
            image: 'https://images.unsplash.com/photo-1509099863731-ef4bff19e808?w=800',
            title: 'Community Outreach',
            category: 'Outreaches'
        },
        {
            id: 3,
            image: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800',
            title: 'Charity Drive',
            category: 'Charity'
        },
        {
            id: 4,
            image: 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=800',
            title: 'Youth Camp',
            category: 'Camps'
        },
        {
            id: 5,
            image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800',
            title: 'Leadership Training',
            category: 'Leadership'
        },
        {
            id: 6,
            image: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=800',
            title: 'Praise Session',
            category: 'Worship'
        },
        {
            id: 7,
            image: 'https://images.unsplash.com/photo-1509099863731-ef4bff19e808?w=800',
            title: 'Street Ministry',
            category: 'Outreaches'
        },
        {
            id: 8,
            image: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800',
            title: 'Food Distribution',
            category: 'Charity'
        }
    ];

    const categories = ['All', 'Worship', 'Outreaches', 'Charity', 'Camps', 'Leadership'];

    const filteredItems = activeFilter === 'All'
        ? galleryItems
        : galleryItems.filter(item => item.category === activeFilter);

    return (
        <section style={{ padding: '5rem 0', backgroundColor: '#f1f5f9' }}>
            <div className="container">
                <h2 className="section-title">Our Gallery</h2>
                <p style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 3rem', color: 'var(--color-text-muted)', fontSize: '1.1rem' }}>
                    Moments captured from our various activities and events.
                </p>

                {/* Filter Buttons */}
                <div style={{
                    display: 'flex',
                    gap: '1rem',
                    justifyContent: 'center',
                    marginBottom: '3rem',
                    flexWrap: 'wrap'
                }}>
                    {categories.map(category => (
                        <button
                            key={category}
                            onClick={() => setActiveFilter(category)}
                            style={{
                                padding: '0.75rem 1.5rem',
                                borderRadius: '50px',
                                border: activeFilter === category ? '2px solid var(--color-accent)' : '2px solid #cbd5e1',
                                backgroundColor: activeFilter === category ? 'var(--color-accent)' : 'white',
                                color: activeFilter === category ? 'white' : 'var(--color-text)',
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

                {/* Gallery Grid */}
                <motion.div
                    layout
                    style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                        gap: '1.5rem'
                    }}
                >
                    <AnimatePresence>
                        {filteredItems.map(item => (
                            <motion.div
                                key={item.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.3 }}
                                onClick={() => setSelectedImage(item)}
                                style={{
                                    position: 'relative',
                                    height: '300px',
                                    borderRadius: '8px',
                                    overflow: 'hidden',
                                    cursor: 'pointer',
                                    boxShadow: 'var(--shadow-md)'
                                }}
                            >
                                <img
                                    src={item.image}
                                    alt={item.title}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                        transition: 'transform 0.3s'
                                    }}
                                    onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                                    onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                                />
                                <div style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    left: 0,
                                    right: 0,
                                    padding: '1rem',
                                    background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
                                    color: 'white'
                                }}>
                                    <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{item.title}</h3>
                                    <p style={{ fontSize: '0.85rem', opacity: 0.9 }}>{item.category}</p>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </motion.div>

                {/* Lightbox */}
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
                            <button
                                onClick={() => setSelectedImage(null)}
                                style={{
                                    position: 'absolute',
                                    top: '2rem',
                                    right: '2rem',
                                    background: 'rgba(255,255,255,0.2)',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: '50px',
                                    height: '50px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    color: 'white'
                                }}
                            >
                                <X size={24} />
                            </button>
                            <motion.img
                                initial={{ scale: 0.8 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0.8 }}
                                src={selectedImage.image}
                                alt={selectedImage.title}
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
        </section>
    );
};

export default GallerySection;
