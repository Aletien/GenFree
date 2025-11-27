import { useState, useEffect } from 'react';
import { checkAllPlatformsLiveStatus, createLiveStreamConfig } from '../utils/liveStreamAPI';

export const useLiveStatus = () => {
    const [liveStatus, setLiveStatus] = useState({
        isAnyLive: false,
        platforms: {
            youtube: { isLive: false },
            facebook: { isLive: false },
            instagram: { isLive: false },
            tiktok: { isLive: false }
        },
        activePlatform: null,
        lastChecked: null,
        isLoading: false,
        error: null
    });

    const config = createLiveStreamConfig();

    const checkLiveStatus = async () => {
        setLiveStatus(prev => ({ ...prev, isLoading: true, error: null }));

        try {
            // For demo purposes, simulate live status
            // In production, uncomment the line below and comment out the simulation
            // const platformStatus = await checkAllPlatformsLiveStatus(config);
            
            // Simulation for demo - replace with actual API calls
            const platformStatus = {
                youtube: { 
                    isLive: Math.random() > 0.8, 
                    liveVideoId: 'demo_video_id',
                    title: 'Sunday Worship Service',
                    viewerCount: Math.floor(Math.random() * 100) + 20
                },
                facebook: { 
                    isLive: Math.random() > 0.9,
                    title: 'Live Prayer Meeting',
                    viewerCount: Math.floor(Math.random() * 50) + 10
                },
                instagram: { 
                    isLive: Math.random() > 0.95,
                    isRecent: true 
                },
                tiktok: { 
                    isLive: false,
                    manual: true 
                }
            };

            const isAnyLive = Object.values(platformStatus).some(platform => platform.isLive);
            let activePlatform = null;

            if (isAnyLive) {
                // Prioritize YouTube for main streaming
                if (platformStatus.youtube.isLive) {
                    activePlatform = { platform: 'youtube', ...platformStatus.youtube };
                } else if (platformStatus.facebook.isLive) {
                    activePlatform = { platform: 'facebook', ...platformStatus.facebook };
                } else if (platformStatus.instagram.isLive) {
                    activePlatform = { platform: 'instagram', ...platformStatus.instagram };
                }
            }

            setLiveStatus({
                isAnyLive,
                platforms: platformStatus,
                activePlatform,
                lastChecked: new Date(),
                isLoading: false,
                error: null
            });

        } catch (error) {
            console.error('Error checking live status:', error);
            setLiveStatus(prev => ({
                ...prev,
                isLoading: false,
                error: error.message
            }));
        }
    };

    useEffect(() => {
        // Initial check
        checkLiveStatus();

        // Check every 30 seconds
        const interval = setInterval(checkLiveStatus, 30000);

        return () => clearInterval(interval);
    }, []);

    const refreshLiveStatus = () => {
        checkLiveStatus();
    };

    const goLive = (platform) => {
        // Manual override for going live
        setLiveStatus(prev => ({
            ...prev,
            platforms: {
                ...prev.platforms,
                [platform]: { 
                    ...prev.platforms[platform], 
                    isLive: true, 
                    title: 'Live Stream',
                    viewerCount: 1
                }
            },
            isAnyLive: true,
            activePlatform: { 
                platform, 
                ...prev.platforms[platform], 
                isLive: true,
                title: 'Live Stream' 
            }
        }));
    };

    const goOffline = (platform) => {
        setLiveStatus(prev => {
            const updatedPlatforms = {
                ...prev.platforms,
                [platform]: { ...prev.platforms[platform], isLive: false }
            };
            
            const isAnyLive = Object.values(updatedPlatforms).some(p => p.isLive);
            let activePlatform = null;
            
            if (isAnyLive) {
                const livePlatform = Object.entries(updatedPlatforms).find(([_, p]) => p.isLive);
                if (livePlatform) {
                    activePlatform = { platform: livePlatform[0], ...livePlatform[1] };
                }
            }

            return {
                ...prev,
                platforms: updatedPlatforms,
                isAnyLive,
                activePlatform
            };
        });
    };

    return {
        ...liveStatus,
        refreshLiveStatus,
        goLive,
        goOffline
    };
};