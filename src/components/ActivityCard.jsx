import { Link } from 'react-router-dom';

const ActivityCard = ({ title, description, icon: Icon, color, link }) => {
    const CardContent = (
        <div className="card" style={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            cursor: link ? 'pointer' : 'default',
            transition: 'transform 0.3s, box-shadow 0.3s'
        }}
            onMouseOver={(e) => link && (e.currentTarget.style.transform = 'translateY(-5px)')}
            onMouseOut={(e) => link && (e.currentTarget.style.transform = 'translateY(0)')}
        >
            <div style={{
                padding: '1rem',
                borderRadius: '50%',
                backgroundColor: `${color}15`,
                marginBottom: '1.5rem'
            }}>
                <Icon size={48} color={color} />
            </div>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: color }}>{title}</h3>
            <p style={{ color: 'var(--color-text-muted)', lineHeight: 1.7 }}>{description}</p>
        </div>
    );

    return link ? (
        <Link to={link} style={{ textDecoration: 'none', color: 'inherit' }}>
            {CardContent}
        </Link>
    ) : CardContent;
};

export default ActivityCard;
