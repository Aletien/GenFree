import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollRestoration = () => {
    const { pathname } = useLocation();
    const prevPathnameRef = useRef(pathname);

    useEffect(() => {
        // Only scroll if the pathname actually changed
        if (prevPathnameRef.current !== pathname) {
            // Use setTimeout to ensure the page is fully rendered before scrolling
            const scrollToTop = () => {
                window.scrollTo({
                    top: 0,
                    left: 0,
                    behavior: 'instant'
                });
            };
            
            // Immediate scroll
            scrollToTop();
            
            // Additional scroll after a brief delay to handle dynamic content
            setTimeout(scrollToTop, 50);
            
            prevPathnameRef.current = pathname;
        }
    }, [pathname]);

    return null;
};

export default ScrollRestoration;
