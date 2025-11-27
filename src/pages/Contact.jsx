import { Mail, Phone, MapPin } from 'lucide-react';
import { useState } from 'react';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    // GenFree location - Update these coordinates to your actual location
    const location = {
        lat: 0.3476, // Kampala, Uganda latitude
        lng: 32.5825, // Kampala, Uganda longitude
        address: "Kampala, Uganda"
    };

    const handleGoogleFormContact = () => {
        // Google Form URL for contact messages
        // Replace with your actual contact form ID
        const formUrl = `https://forms.gle/YOUR_CONTACT_FORM_ID`;
        window.open(formUrl, '_blank');
    };

    const handleWhatsAppContact = () => {
        const message = `Hello GenFree Network! 🙏

I would like to get in touch with you.

*My Details:*
• Name: [Your full name]
• Email: [Your email address]
• Phone: [Your phone number]

*Message:*
[Please write your message, questions, or prayer requests here]

Thank you for your ministry! 
God bless you.`;
        
        // Replace with your actual WhatsApp number
        const whatsappNumber = '256700000000'; // Update with your Uganda number
        window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank');
    };

    const handleEmailContact = () => {
        const subject = 'Contact from GenFree Website';
        const body = `Hello GenFree Network,

My Details:
Name: [Your full name]
Phone: [Your phone number]

Message:
[Please write your message, questions, or prayer requests here]

Thank you for your ministry!
God bless you.`;
        
        const mailtoUrl = `mailto:info@genfree.org?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        window.location.href = mailtoUrl;
    };

    return (
        <div>
            {/* Page Header */}
            <div style={{
                background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #17a2b8 100%)',
                color: 'white',
                padding: '4rem 0',
                textAlign: 'center'
            }}>
                <div className="container">
                    <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', marginBottom: '1rem', color: 'white', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>Get In Touch</h1>
                    <p style={{ maxWidth: '600px', margin: '0 auto', opacity: 0.9, fontSize: 'clamp(1rem, 2vw, 1.1rem)', color: 'white', textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
                        We'd love to hear from you. Reach out to us with any questions or prayer requests.
                    </p>
                </div>
            </div>

            {/* Contact Content */}
            <section style={{ padding: '5rem 0' }}>
                <div className="container">
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem' }}>
                        {/* Contact Form */}
                        <div>
                            <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', color: 'var(--color-primary)' }}>Send Us a Message</h2>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <p style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
                                    We'd love to hear from you! Choose your preferred way to get in touch:
                                </p>

                                {/* Google Form Contact */}
                                <button
                                    onClick={handleGoogleFormContact}
                                    style={{
                                        padding: '1.25rem',
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
                                        gap: '0.75rem'
                                    }}
                                    onMouseOver={(e) => {
                                        e.target.style.transform = 'translateY(-2px)';
                                        e.target.style.boxShadow = 'var(--shadow-lg)';
                                    }}
                                    onMouseOut={(e) => {
                                        e.target.style.transform = 'translateY(0)';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                >
                                    📝 Send Message via Online Form
                                </button>

                                <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', fontSize: '0.9rem', margin: '0.5rem 0' }}>
                                    — or —
                                </div>

                                {/* WhatsApp Contact */}
                                <button
                                    onClick={handleWhatsAppContact}
                                    style={{
                                        padding: '1.25rem',
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
                                        gap: '0.75rem'
                                    }}
                                    onMouseOver={(e) => {
                                        e.target.style.transform = 'translateY(-2px)';
                                        e.target.style.boxShadow = 'var(--shadow-lg)';
                                    }}
                                    onMouseOut={(e) => {
                                        e.target.style.transform = 'translateY(0)';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                >
                                    📱 Contact us on WhatsApp
                                </button>

                                {/* Email Contact */}
                                <button
                                    onClick={handleEmailContact}
                                    style={{
                                        padding: '1.25rem',
                                        borderRadius: '8px',
                                        border: '2px solid var(--color-accent)',
                                        backgroundColor: 'var(--color-accent)',
                                        color: 'white',
                                        fontSize: '1.1rem',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.75rem'
                                    }}
                                    onMouseOver={(e) => {
                                        e.target.style.transform = 'translateY(-2px)';
                                        e.target.style.boxShadow = 'var(--shadow-lg)';
                                    }}
                                    onMouseOut={(e) => {
                                        e.target.style.transform = 'translateY(0)';
                                        e.target.style.boxShadow = 'none';
                                    }}
                                >
                                    📧 Send us an Email
                                </button>

                                <div style={{ 
                                    marginTop: '1.5rem', 
                                    padding: '1.25rem', 
                                    backgroundColor: '#f0f9ff', 
                                    borderRadius: '8px', 
                                    border: '1px solid #bae6fd' 
                                }}>
                                    <h4 style={{ color: 'var(--color-primary)', marginBottom: '0.75rem', fontSize: '1rem' }}>
                                        💬 What can you contact us about?
                                    </h4>
                                    <ul style={{ margin: 0, paddingLeft: '1.5rem', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                                        <li>General questions about our ministry</li>
                                        <li>Prayer requests and spiritual guidance</li>
                                        <li>Event inquiries and information</li>
                                        <li>Partnership and volunteer opportunities</li>
                                        <li>Technical support for the website</li>
                                        <li>Testimonies and feedback</li>
                                    </ul>
                                </div>

                                <div style={{ 
                                    marginTop: '1rem', 
                                    padding: '1.25rem', 
                                    backgroundColor: 'var(--color-surface)', 
                                    borderRadius: '8px', 
                                    borderLeft: '4px solid var(--color-primary)' 
                                }}>
                                    <h4 style={{ color: 'var(--color-primary)', marginBottom: '0.5rem', fontSize: '1rem' }}>
                                        🙏 Prayer Requests
                                    </h4>
                                    <p style={{ margin: 0, color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                                        Need prayer? We'd be honored to pray for you. Share your prayer requests through any of the contact methods above, 
                                        and our prayer team will lift you up in prayer.
                                    </p>
                                </div>

                                <div style={{ 
                                    marginTop: '1rem', 
                                    padding: '1rem', 
                                    backgroundColor: '#ecfdf5', 
                                    borderRadius: '8px', 
                                    border: '1px solid #a7f3d0',
                                    textAlign: 'center'
                                }}>
                                    <p style={{ margin: 0, color: 'var(--color-primary)', fontSize: '0.9rem', fontWeight: '600' }}>
                                        ⚡ We typically respond within 24 hours
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Contact Info & Map */}
                        <div>
                            <h2 style={{ fontSize: '2rem', marginBottom: '1.5rem', color: 'var(--color-primary)' }}>Contact Information</h2>

                            {/* Contact Details */}
                            <div style={{ marginBottom: '2rem' }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.5rem' }}>
                                    <div style={{
                                        backgroundColor: 'var(--color-accent)',
                                        color: 'white',
                                        padding: '0.75rem',
                                        borderRadius: '8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <MapPin size={24} />
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--color-primary)' }}>Address</h3>
                                        <p style={{ color: 'var(--color-text-muted)' }}>{location.address}</p>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1.5rem' }}>
                                    <div style={{
                                        backgroundColor: 'var(--color-accent)',
                                        color: 'white',
                                        padding: '0.75rem',
                                        borderRadius: '8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <Phone size={24} />
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--color-primary)' }}>Phone</h3>
                                        <p style={{ color: 'var(--color-text-muted)' }}>+256 XXX XXX XXX</p>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '2rem' }}>
                                    <div style={{
                                        backgroundColor: 'var(--color-accent)',
                                        color: 'white',
                                        padding: '0.75rem',
                                        borderRadius: '8px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center'
                                    }}>
                                        <Mail size={24} />
                                    </div>
                                    <div>
                                        <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--color-primary)' }}>Email</h3>
                                        <p style={{ color: 'var(--color-text-muted)' }}>info@genfree.org</p>
                                    </div>
                                </div>
                            </div>

                            {/* Map */}
                            <div style={{
                                borderRadius: '8px',
                                overflow: 'hidden',
                                boxShadow: 'var(--shadow-md)',
                                height: '400px',
                                border: '2px solid #e2e8f0'
                            }}>
                                <iframe
                                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${location.lng - 0.01},${location.lat - 0.01},${location.lng + 0.01},${location.lat + 0.01}&layer=mapnik&marker=${location.lat},${location.lng}`}
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    loading="lazy"
                                    title="GenFree Location Map"
                                />
                            </div>

                            <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                                <a
                                    href={`https://www.google.com/maps/search/?api=1&query=${location.lat},${location.lng}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-accent"
                                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                                >
                                    <MapPin size={18} />
                                    Open in Google Maps
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Contact;
