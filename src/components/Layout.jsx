import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import WhatsAppWidget from './WhatsAppWidget';
import ScrollToTop from './ScrollToTop';
import AdminAccess from './AdminAccess';

const Layout = () => {
    return (
        <div style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text)', minHeight: '100vh' }}>
            <Navbar />
            <main>
                <Outlet />
            </main>
            <Footer />
            <WhatsAppWidget />
            <ScrollToTop />
            <AdminAccess />
        </div>
    );
};

export default Layout;
