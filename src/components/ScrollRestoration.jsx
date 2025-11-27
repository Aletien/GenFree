import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollRestoration = () => {
    const { pathname } = useLocation();
    const prevPathnameRef = useRef(pathname);

    useEffect(() => {
        // Only scroll if the pathname actually changed
        if (prevPathnameRef.current !== pathname) {
            window.scrollTo({
                top: 0,
                left: 0,
                behavior: 'instant'
            });
            prevPathnameRef.current = pathname;
        }
    }, [pathname]);

    return null;
};

export default ScrollRestoration;
