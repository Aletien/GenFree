import { useState } from 'react';
import { Settings, Edit3, Upload, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdminAccess = () => {
    const [showAdmin, setShowAdmin] = useState(false);

    // Check if we're in development or if admin access is enabled
    const isDev = import.meta.env.DEV;
    const adminEnabled = isDev || localStorage.getItem('genFreeAdmin') === 'true';

    if (!adminEnabled) return null;

    return (
        <>
            {/* Floating Admin Button */}
            <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={() => setShowAdmin(!showAdmin)}
                style={{
                    position: 'fixed',
                    bottom: '2rem',
                    left: '2rem',
                    backgroundColor: '#6366f1',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '50px',
                    height: '50px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 4px 20px rgba(99, 102, 241, 0.4)',
                    zIndex: 1000,
                    transition: 'all 0.3s ease'
                }}
                onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#4f46e5';
                    e.currentTarget.style.transform = 'scale(1.1)';
                }}
                onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = '#6366f1';
                    e.currentTarget.style.transform = 'scale(1)';
                }}
                title="Admin Panel"
            >
                <Settings size={20} />
            </motion.button>

            {/* Admin Panel */}
            <AnimatePresence>
                {showAdmin && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        style={{
                            position: 'fixed',
                            bottom: '5rem',
                            left: '2rem',
                            backgroundColor: 'white',
                            borderRadius: '12px',
                            padding: '1.5rem',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
                            zIndex: 1001,
                            minWidth: '280px',
                            border: '1px solid #e2e8f0'
                        }}
                    >
                        <h3 style={{ 
                            margin: '0 0 1rem 0', 
                            fontSize: '1.1rem', 
                            fontWeight: 600,
                            color: '#1e293b',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}>
                            <Settings size={18} />
                            Admin Panel
                        </h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <a
                                href="/admin/"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    padding: '0.75rem 1rem',
                                    backgroundColor: '#f8fafc',
                                    borderRadius: '8px',
                                    color: '#374151',
                                    textDecoration: 'none',
                                    fontSize: '0.9rem',
                                    fontWeight: 500,
                                    transition: 'background-color 0.2s',
                                    border: '1px solid #e2e8f0'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                            >
                                <Edit3 size={16} />
                                Content Editor
                            </a>

                            <div style={{
                                fontSize: '0.8rem',
                                color: '#64748b',
                                padding: '0.5rem',
                                backgroundColor: '#f8fafc',
                                borderRadius: '6px',
                                border: '1px solid #e2e8f0'
                            }}>
                                <strong>Quick Actions:</strong>
                                <ul style={{ margin: '0.5rem 0 0 0', paddingLeft: '1rem' }}>
                                    <li>Upload images & videos</li>
                                    <li>Edit page content</li>
                                    <li>Manage events</li>
                                    <li>Update testimonials</li>
                                </ul>
                            </div>

                            <div style={{
                                fontSize: '0.75rem',
                                color: '#94a3b8',
                                textAlign: 'center',
                                marginTop: '0.5rem'
                            }}>
                                CMS powered by Decap
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default AdminAccess;