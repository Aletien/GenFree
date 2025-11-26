import FadeIn from './FadeIn';

const Testimonials = () => {
    const testimonials = [
        {
            id: 1,
            name: "Sarah Jenkins",
            role: "Youth Leader",
            quote: "GenFree has completely transformed my walk with God. The leadership training gave me the confidence to step out and serve my community.",
            image: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80"
        },
        {
            id: 2,
            name: "David Okonjo",
            role: "University Student",
            quote: "The worship sessions are electrifying! It's amazing to see so many young people passionate about Jesus. I've found a true family here.",
            image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80"
        },
        {
            id: 3,
            name: "Grace Liu",
            role: "Volunteer",
            quote: "Volunteering with the charity arm of GenFree taught me the true meaning of compassion. It's a blessing to be a blessing.",
            image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80"
        }
    ];

    return (
        <section style={{ padding: '5rem 0', backgroundColor: '#f1f5f9' }}>
            <div className="container">
                <FadeIn>
                    <h2 className="section-title">Voices of Freedom</h2>
                </FadeIn>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                    {testimonials.map((t, index) => (
                        <FadeIn key={t.id} delay={index * 0.1}>
                            <div className="card" style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                                <div style={{
                                    width: '80px',
                                    height: '80px',
                                    borderRadius: '50%',
                                    overflow: 'hidden',
                                    marginBottom: '1.5rem',
                                    border: '3px solid var(--color-accent)'
                                }}>
                                    <img src={t.image} alt={t.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>

                                <p style={{ fontStyle: 'italic', marginBottom: '1.5rem', color: 'var(--color-text)', lineHeight: 1.8 }}>"{t.quote}"</p>

                                <div style={{ marginTop: 'auto' }}>
                                    <h4 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{t.name}</h4>
                                    <span style={{ color: 'var(--color-accent)', fontSize: '0.9rem', fontWeight: 600, textTransform: 'uppercase' }}>{t.role}</span>
                                </div>
                            </div>
                        </FadeIn>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Testimonials;
