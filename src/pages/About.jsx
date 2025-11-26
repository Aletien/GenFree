const About = () => {
    return (
        <div className="container" style={{ padding: '4rem 1rem' }}>
            <h1 className="section-title">About GenFree Network</h1>

            <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                <div className="card" style={{ marginBottom: '2rem' }}>
                    <h2 style={{ marginBottom: '1rem', color: 'var(--color-accent)' }}>Who We Are</h2>
                    <p style={{ marginBottom: '1rem', lineHeight: 1.7, fontSize: '1.05rem' }}>
                        Gen free exists to <strong>ignite spiritual passion, restore identity in Christ, and equip believers for impact</strong>.
                        We are not a church but a Spirit-led initiative, hosting open-air worship, outreach missions, and
                        life-equipping sessions to transform lives for God's glory.
                    </p>
                    <p style={{ lineHeight: 1.7, fontSize: '1.05rem' }}>
                        We believe this generation is craving authentic encounters with God beyond traditional spaces.
                        That's why we gather in the outdoors, in streets, parks, campuses, and villages to worship, learn, heal, and serve.
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
                    <div className="card">
                        <h2 style={{ marginBottom: '1rem', color: 'var(--color-accent)' }}>Our Vision</h2>
                        <p style={{ lineHeight: 1.7 }}>
                            To see a generation awakened to their freedom in Christ, healed and mobilized to transform society.
                        </p>
                    </div>

                    <div className="card">
                        <h2 style={{ marginBottom: '1rem', color: 'var(--color-accent)' }}>Mission</h2>
                        <p style={{ lineHeight: 1.7 }}>
                            To provide outdoor worship experiences, equipping forums, and outreach initiatives that spiritually, emotionally, and
                            socially empower Christians to live out their God-given purpose.
                        </p>
                    </div>
                </div>

                <div className="card" style={{ backgroundColor: '#e0f2f1' }}>
                    <h2 style={{ marginBottom: '1.5rem', color: 'var(--color-primary)', textAlign: 'center' }}>Why We Exist</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--color-accent)' }}>We are a gap-bridger;</h3>
                            <p style={{ color: 'var(--color-text)' }}>between church and real life impact.</p>
                        </div>
                        <div>
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--color-accent)' }}>We give voice and space;</h3>
                            <p style={{ color: 'var(--color-text)' }}>to believers who want to serve outside the pulpit.</p>
                        </div>
                        <div>
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--color-accent)' }}>We revive passion;</h3>
                            <p style={{ color: 'var(--color-text)' }}>for the things of God through creative expression.</p>
                        </div>
                        <div>
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--color-accent)' }}>We empower purpose;</h3>
                            <p style={{ color: 'var(--color-text)' }}>pairing biblical truth with practical life skills.</p>
                        </div>
                        <div>
                            <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--color-accent)' }}>We operate as a family;</h3>
                            <p style={{ color: 'var(--color-text)' }}>flexible, passionate, and wide-reaching.</p>
                        </div>
                    </div>
                </div>

                <div style={{ textAlign: 'center', marginTop: '3rem', padding: '2rem', backgroundColor: 'var(--color-primary)', borderRadius: '4px' }}>
                    <p style={{ fontSize: '1.5rem', fontStyle: 'italic', color: 'var(--color-white)', fontWeight: 600 }}>
                        "I'm free, and I'm moving in Christ!"
                    </p>
                </div>
            </div>
        </div>
    );
};

export default About;
