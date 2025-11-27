import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import WhatsAppWidget from './WhatsAppWidget';
import ScrollToTop from './ScrollToTop';
import ScrollRestoration from './ScrollRestoration';
import AdminAccess from './AdminAccess';
import LiveNotification from './LiveNotification';
import { useLiveStatus } from '../hooks/useLiveStatus';

const Layout = () => {
    const { isAnyLive, activePlatform } = useLiveStatus();

    const handleJoinLiveStream = (liveData) => {
        if (liveData?.platform === 'youtube') {
            window.open('https://youtube.com/@genfree/live', '_blank');
        } else if (liveData?.platform === 'facebook') {
            window.open('https://facebook.com/genfree/live', '_blank');
        } else if (liveData?.platform === 'instagram') {
            window.open('https://instagram.com/genfree', '_blank');
        } else {
            // Fallback to live page
            window.location.href = '/live';
        }
    };

    return (
        <div style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text)', minHeight: '100vh' }}>
            <ScrollRestoration />
            <Navbar />
            <main>
                <Outlet />
            </main>
            <Footer />
            <WhatsAppWidget />
            <ScrollToTop />
            <AdminAccess />
            <LiveNotification
                isLive={isAnyLive}
                liveData={activePlatform}
                onJoin={handleJoinLiveStream}
            />
        </div>
    );
};

export default Layout;
