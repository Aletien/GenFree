import ActivityCard from '../components/ActivityCard';
import { Music, Users, Tent, Heart, BookOpen, Church } from 'lucide-react';

const Activities = () => {
    const activities = [
        {
            title: "Outdoor Praise Encounters",
            description: "Monthly or quarterly large-scale worship experiences in open venues. Experience authentic encounters with God beyond traditional spaces.",
            icon: Music,
            color: "var(--color-accent)"
        },
        {
            title: "Equip & Empower Forums",
            description: "Thematic events for personal, spiritual, and professional growth. Pairing biblical truth with practical life skills.",
            icon: BookOpen,
            color: "#10b981"
        },
        {
            title: "Youth Camps & Retreats",
            description: "Weekend or holiday camps for discipleship and life coaching. Disconnect from the noise and reconnect with God.",
            icon: Tent,
            color: "#8b5cf6"
        },
        {
            title: "Freedom Nights",
            description: "Creative nights of music, testimony, and spiritual awakening. Reviving passion for the things of God through creative expression.",
            icon: Music,
            color: "#f59e0b"
        },
        {
            title: "Needy Missions",
            description: "Community outreaches for donations, feeding, and social support. Extending a helping hand to those in need.",
            icon: Heart,
            color: "#ef4444"
        },
        {
            title: "Church Growth Collabs",
            description: "Strategic partnerships for spiritual growth sessions, worship training, and revival weeks. Operating as a family, flexible and wide-reaching.",
            icon: Church,
            color: "#3b82f6"
        }
    ];

    return (
        <div className="container" style={{ padding: '4rem 1rem' }}>
            <h1 className="section-title">Living the Mission</h1>
            <p style={{ textAlign: 'center', maxWidth: '700px', margin: '0 auto 3rem', color: 'var(--color-text-muted)', fontSize: '1.1rem' }}>
                We believe this generation is craving authentic encounters with God beyond traditional spaces.
                Here's how we're making it happen.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
                {activities.map((activity) => (
                    <ActivityCard key={activity.title} {...activity} />
                ))}
            </div>

            <div style={{
                marginTop: '4rem',
                padding: '3rem',
                backgroundColor: 'var(--color-primary)',
                borderRadius: '4px',
                textAlign: 'center'
            }}>
                <h2 style={{ color: 'var(--color-white)', marginBottom: '1rem', fontSize: '2rem' }}>
                    We respond to the call of Isaiah 6:8
                </h2>
                <p style={{ color: 'var(--color-white)', fontSize: '1.2rem', fontStyle: 'italic', opacity: 0.9 }}>
                    "He has sent me to bind up the brokenhearted, to proclaim freedom for the captives."
                </p>
            </div>
        </div>
    );
};

export default Activities;
