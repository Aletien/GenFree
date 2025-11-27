import Hero from '../components/Hero';
import ActivityCard from '../components/ActivityCard';
import GallerySection from '../components/GallerySection';
import FadeIn from '../components/FadeIn';
import Testimonials from '../components/Testimonials';
import SocialMediaIntegration from '../components/SocialMediaIntegration';
import { Heart, Users, Music } from 'lucide-react';

const Home = () => {
    return (
        <div>
            <Hero />

            <section style={{ backgroundColor: 'var(--color-white)', padding: '5rem 0' }}>
                <div className="container" style={{ textAlign: 'center', maxWidth: '800px' }}>
                    <FadeIn>
                        <h2 className="section-title" style={{ marginBottom: '1.5rem' }}>Our Vision</h2>
                        <p style={{ fontSize: '1.25rem', lineHeight: 1.8, color: 'var(--color-text-muted)' }}>
                            To see a generation ignited with passion for God, equipped for leadership, and compassionate towards the needy.
                            We envision a world where young people are the catalysts for positive change in their communities, walking in the true freedom that comes from Christ.
                        </p>
                    </FadeIn>
                </div>
            </section>

            <section style={{ padding: '5rem 0' }}>
                <div className="container">
                    <FadeIn direction="up">
                        <h2 className="section-title">Our Core Pillars</h2>
                    </FadeIn>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                        <FadeIn delay={0.1}>
                            <ActivityCard
                                title="Charity"
                                description="Extending a helping hand to those in need through community support and resource distribution."
                                icon={Heart}
                                color="var(--color-primary)"
                                link="/activities#charity"
                            />
                        </FadeIn>
                        <FadeIn delay={0.2}>
                            <ActivityCard
                                title="Outreaches"
                                description="Taking the message of freedom beyond the four walls to schools, streets, and communities."
                                icon={Users}
                                color="var(--color-accent)"
                                link="/activities#outreaches"
                            />
                        </FadeIn>
                        <FadeIn delay={0.3}>
                            <ActivityCard
                                title="Worship Sessions"
                                description="Gathering to lift up the name of Jesus in spirit and in truth through powerful worship experiences."
                                icon={Music}
                                color="var(--color-primary-light)"
                                link="/activities#worship"
                            />
                        </FadeIn>
                    </div>
                </div>
            </section>

            <FadeIn>
                <GallerySection />
            </FadeIn>

            <Testimonials />

            <FadeIn>
                <SocialMediaIntegration showLiveIndicators={true} />
            </FadeIn>

            <section style={{ backgroundColor: 'var(--color-white)', padding: '5rem 0' }}>
                <div className="container" style={{ textAlign: 'center' }}>
                    <FadeIn>
                        <h2 className="section-title">Join the Network</h2>
                        <p style={{ maxWidth: '700px', margin: '0 auto 2rem', fontSize: '1.1rem', color: 'var(--color-text-muted)' }}>
                            We believe in a generation that is free to lead, free to serve, and free to worship.
                            Connect with us on our social platforms to stay updated with our latest events and content.
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                            <a href="/contact" className="btn btn-primary">Get Involved</a>
                            <a href="/live" className="btn btn-secondary">Watch Live</a>
                        </div>
                    </FadeIn>
                </div>
            </section>
        </div>
    );
};

export default Home;
