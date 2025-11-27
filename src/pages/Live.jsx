import { useEffect } from 'react';
import MultiPlatformLiveStream from '../components/MultiPlatformLiveStream';

const Live = () => {
    // Ensure page starts from top when Live component mounts
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return <MultiPlatformLiveStream />;
};

export default Live;