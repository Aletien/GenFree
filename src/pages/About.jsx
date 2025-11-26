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

                {/* Why We Exist - Enhanced Design */}
                <div style={{ 
                    background: 'linear-gradient(135deg, #060606 0%, #161616 50%, #2D837A 100%)', 
                    borderRadius: '16px', 
                    padding: '4rem 2rem',
                    color: 'white',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    {/* Background Pattern */}
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        opacity: 0.1,
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                        zIndex: 1
                    }} />
                    
                    <div style={{ position: 'relative', zIndex: 2 }}>
                        <h2 style={{ 
                            marginBottom: '3rem', 
                            textAlign: 'center',
                            fontSize: 'clamp(2rem, 4vw, 2.5rem)',
                            fontWeight: 700,
                            color: 'white',
                            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
                        }}>
                            Why We Exist
                        </h2>
                        
                        <div style={{ 
                            display: 'grid', 
                            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
                            gap: '2rem',
                            maxWidth: '1200px',
                            margin: '0 auto'
                        }}>
                            {/* Gap Bridger */}
                            <div style={{
                                background: 'rgba(255,255,255,0.1)',
                                backdropFilter: 'blur(10px)',
                                borderRadius: '12px',
                                padding: '2rem',
                                border: '1px solid rgba(255,255,255,0.2)',
                                transition: 'all 0.3s ease'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'translateY(-5px)';
                                e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                            }}>
                                <div style={{ 
                                    width: '50px', 
                                    height: '50px', 
                                    backgroundColor: '#17a2b8', 
                                    borderRadius: '50%', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    marginBottom: '1rem',
                                    fontSize: '1.5rem',
                                    fontWeight: 'bold'
                                }}>🌉</div>
                                <h3 style={{ 
                                    fontSize: '1.3rem', 
                                    marginBottom: '0.75rem', 
                                    color: '#17a2b8',
                                    fontWeight: 600
                                }}>
                                    We are a gap-bridger
                                </h3>
                                <p style={{ 
                                    color: 'rgba(255,255,255,0.9)', 
                                    fontSize: '1.05rem',
                                    lineHeight: 1.6,
                                    margin: 0
                                }}>
                                    Between church and real life impact.
                                </p>
                            </div>

                            {/* Voice and Space */}
                            <div style={{
                                background: 'rgba(255,255,255,0.1)',
                                backdropFilter: 'blur(10px)',
                                borderRadius: '12px',
                                padding: '2rem',
                                border: '1px solid rgba(255,255,255,0.2)',
                                transition: 'all 0.3s ease'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'translateY(-5px)';
                                e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                            }}>
                                <div style={{ 
                                    width: '50px', 
                                    height: '50px', 
                                    backgroundColor: '#17a2b8', 
                                    borderRadius: '50%', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    marginBottom: '1rem',
                                    fontSize: '1.5rem',
                                    fontWeight: 'bold'
                                }}>📢</div>
                                <h3 style={{ 
                                    fontSize: '1.3rem', 
                                    marginBottom: '0.75rem', 
                                    color: '#17a2b8',
                                    fontWeight: 600
                                }}>
                                    We give voice and space
                                </h3>
                                <p style={{ 
                                    color: 'rgba(255,255,255,0.9)', 
                                    fontSize: '1.05rem',
                                    lineHeight: 1.6,
                                    margin: 0
                                }}>
                                    To believers who want to serve outside the pulpit.
                                </p>
                            </div>

                            {/* Revive Passion */}
                            <div style={{
                                background: 'rgba(255,255,255,0.1)',
                                backdropFilter: 'blur(10px)',
                                borderRadius: '12px',
                                padding: '2rem',
                                border: '1px solid rgba(255,255,255,0.2)',
                                transition: 'all 0.3s ease'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'translateY(-5px)';
                                e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                            }}>
                                <div style={{ 
                                    width: '50px', 
                                    height: '50px', 
                                    backgroundColor: '#17a2b8', 
                                    borderRadius: '50%', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    marginBottom: '1rem',
                                    fontSize: '1.5rem',
                                    fontWeight: 'bold'
                                }}>🔥</div>
                                <h3 style={{ 
                                    fontSize: '1.3rem', 
                                    marginBottom: '0.75rem', 
                                    color: '#17a2b8',
                                    fontWeight: 600
                                }}>
                                    We revive passion
                                </h3>
                                <p style={{ 
                                    color: 'rgba(255,255,255,0.9)', 
                                    fontSize: '1.05rem',
                                    lineHeight: 1.6,
                                    margin: 0
                                }}>
                                    For the things of God through creative expression.
                                </p>
                            </div>

                            {/* Empower Purpose */}
                            <div style={{
                                background: 'rgba(255,255,255,0.1)',
                                backdropFilter: 'blur(10px)',
                                borderRadius: '12px',
                                padding: '2rem',
                                border: '1px solid rgba(255,255,255,0.2)',
                                transition: 'all 0.3s ease'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'translateY(-5px)';
                                e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                            }}>
                                <div style={{ 
                                    width: '50px', 
                                    height: '50px', 
                                    backgroundColor: '#17a2b8', 
                                    borderRadius: '50%', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    marginBottom: '1rem',
                                    fontSize: '1.5rem',
                                    fontWeight: 'bold'
                                }}>⚡</div>
                                <h3 style={{ 
                                    fontSize: '1.3rem', 
                                    marginBottom: '0.75rem', 
                                    color: '#17a2b8',
                                    fontWeight: 600
                                }}>
                                    We empower purpose
                                </h3>
                                <p style={{ 
                                    color: 'rgba(255,255,255,0.9)', 
                                    fontSize: '1.05rem',
                                    lineHeight: 1.6,
                                    margin: 0
                                }}>
                                    Pairing biblical truth with practical life skills.
                                </p>
                            </div>

                            {/* Family */}
                            <div style={{
                                background: 'rgba(255,255,255,0.1)',
                                backdropFilter: 'blur(10px)',
                                borderRadius: '12px',
                                padding: '2rem',
                                border: '1px solid rgba(255,255,255,0.2)',
                                transition: 'all 0.3s ease',
                                gridColumn: 'span 1'
                            }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'translateY(-5px)';
                                e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                            }}>
                                <div style={{ 
                                    width: '50px', 
                                    height: '50px', 
                                    backgroundColor: '#17a2b8', 
                                    borderRadius: '50%', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center',
                                    marginBottom: '1rem',
                                    fontSize: '1.5rem',
                                    fontWeight: 'bold'
                                }}>👨‍👩‍👧‍👦</div>
                                <h3 style={{ 
                                    fontSize: '1.3rem', 
                                    marginBottom: '0.75rem', 
                                    color: '#17a2b8',
                                    fontWeight: 600
                                }}>
                                    We operate as a family
                                </h3>
                                <p style={{ 
                                    color: 'rgba(255,255,255,0.9)', 
                                    fontSize: '1.05rem',
                                    lineHeight: 1.6,
                                    margin: 0
                                }}>
                                    Flexible, passionate, and wide-reaching.
                                </p>
                            </div>
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
