import { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const WhatsAppWidget = () => {
    const [isOpen, setIsOpen] = useState(false);

    // Update this with your actual WhatsApp number (include country code without + or spaces)
    const whatsappNumber = '256XXXXXXXXX'; // Example: 256712345678 for Uganda
    const defaultMessage = 'Hello! I would like to know more about GenFree Network.';

    const handleWhatsAppClick = () => {
        const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(defaultMessage)}`;
        window.open(url, '_blank');
        setIsOpen(false);
    };

    return (
        <>
            {/* WhatsApp Button */}
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                style={{
                    position: 'fixed',
                    bottom: '2rem',
                    right: '2rem',
                    zIndex: 1000
                }}
            >
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    style={{
                        width: '60px',
                        height: '60px',
                        borderRadius: '50%',
                        backgroundColor: '#25D366',
                        border: 'none',
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(37, 211, 102, 0.4)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'transform 0.3s, box-shadow 0.3s'
                    }}
                    onMouseOver={(e) => {
                        e.currentTarget.style.transform = 'scale(1.1)';
                        e.currentTarget.style.boxShadow = '0 6px 20px rgba(37, 211, 102, 0.6)';
                    }}
                    onMouseOut={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(37, 211, 102, 0.4)';
                    }}
                >
                    {isOpen ? <X size={28} color="white" /> : <MessageCircle size={28} color="white" />}
                </button>
            </motion.div>

            {/* Chat Popup */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        transition={{ duration: 0.2 }}
                        style={{
                            position: 'fixed',
                            bottom: '6rem',
                            right: '2rem',
                            width: '320px',
                            backgroundColor: 'white',
                            borderRadius: '12px',
                            boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                            zIndex: 999,
                            overflow: 'hidden'
                        }}
                    >
                        {/* Header */}
                        <div style={{
                            background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                            padding: '1.5rem',
                            color: 'white'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{
                                    width: '50px',
                                    height: '50px',
                                    borderRadius: '50%',
                                    backgroundColor: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <MessageCircle size={28} color="#25D366" />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.25rem' }}>GenFree Network</h3>
                                    <p style={{ fontSize: '0.85rem', opacity: 0.9 }}>Typically replies instantly</p>
                                </div>
                            </div>
                        </div>

                        {/* Body */}
                        <div style={{ padding: '1.5rem' }}>
                            <div style={{
                                backgroundColor: '#f0f0f0',
                                padding: '1rem',
                                borderRadius: '8px',
                                marginBottom: '1rem'
                            }}>
                                <p style={{ fontSize: '0.95rem', color: '#333', lineHeight: 1.5 }}>
                                    👋 Hi there! How can we help you today?
                                </p>
                            </div>

                            <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '1rem' }}>
                                Click the button below to start a conversation with us on WhatsApp.
                            </p>

                            <button
                                onClick={handleWhatsAppClick}
                                style={{
                                    width: '100%',
                                    padding: '0.875rem',
                                    backgroundColor: '#25D366',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '8px',
                                    fontSize: '1rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem',
                                    transition: 'background-color 0.3s'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#128C7E'}
                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#25D366'}
                            >
                                <MessageCircle size={20} />
                                Start Chat
                            </button>
                        </div>

                        {/* Footer */}
                        <div style={{
                            padding: '0.75rem 1.5rem',
                            backgroundColor: '#f9f9f9',
                            borderTop: '1px solid #e0e0e0',
                            textAlign: 'center'
                        }}>
                            <p style={{ fontSize: '0.75rem', color: '#999' }}>
                                Powered by WhatsApp
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default WhatsAppWidget;
