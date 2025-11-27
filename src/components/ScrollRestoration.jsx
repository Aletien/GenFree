import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollRestoration = () => {
    const { pathname } = useLocation();

    useEffect(() => {
        // Scroll to top when route changes
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'instant' // Use instant to avoid animation on route change
        });
    }, [pathname]);

    return null;
};

export default ScrollRestoration;
