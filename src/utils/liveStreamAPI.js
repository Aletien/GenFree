// Live Stream API utilities for integration with social media platforms

// YouTube Live Stream API
export const checkYouTubeLiveStatus = async (channelId, apiKey) => {
    try {
        const response = await fetch(
            `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}&eventType=live&type=video&key=${apiKey}`
        );
        const data = await response.json();
        return {
            isLive: data.items && data.items.length > 0,
            liveVideoId: data.items?.[0]?.id?.videoId,
            title: data.items?.[0]?.snippet?.title,
            viewerCount: null // Requires additional API call
        };
    } catch (error) {
        console.error('YouTube Live Status Error:', error);
        return { isLive: false, error: error.message };
    }
};

// Facebook Live Stream API
export const checkFacebookLiveStatus = async (pageId, accessToken) => {
    try {
        const response = await fetch(
            `https://graph.facebook.com/${pageId}/live_videos?access_token=${accessToken}`
        );
        const data = await response.json();
        const liveVideos = data.data?.filter(video => video.status === 'LIVE');
        
        return {
            isLive: liveVideos && liveVideos.length > 0,
            liveVideoId: liveVideos?.[0]?.id,
            title: liveVideos?.[0]?.title,
            viewerCount: liveVideos?.[0]?.live_views
        };
    } catch (error) {
        console.error('Facebook Live Status Error:', error);
        return { isLive: false, error: error.message };
    }
};

// Instagram Live Stream API (Limited - Instagram doesn't provide robust live API)
export const checkInstagramLiveStatus = async (userId, accessToken) => {
    try {
        // Instagram Basic Display API has limited live stream detection
        // This is a simplified implementation
        const response = await fetch(
            `https://graph.instagram.com/${userId}/media?access_token=${accessToken}&fields=media_type,media_url,timestamp`
        );
        const data = await response.json();
        
        // Instagram doesn't easily expose live status, so this is approximate
        const recentMedia = data.data?.[0];
        const isRecentVideo = recentMedia?.media_type === 'VIDEO';
        const isRecent = new Date() - new Date(recentMedia?.timestamp) < 3600000; // 1 hour
        
        return {
            isLive: false, // Instagram doesn't provide live status easily
            isRecent: isRecentVideo && isRecent,
            lastPost: recentMedia
        };
    } catch (error) {
        console.error('Instagram Live Status Error:', error);
        return { isLive: false, error: error.message };
    }
};

// TikTok doesn't provide public APIs for live status
export const checkTikTokLiveStatus = async () => {
    // TikTok doesn't provide public APIs for live stream detection
    return { 
        isLive: false, 
        message: 'TikTok live status requires manual update or third-party service'
    };
};

// Combined live status checker for all platforms
export const checkAllPlatformsLiveStatus = async (config) => {
    const {
        youtube: { channelId, apiKey: youtubeApiKey },
        facebook: { pageId, accessToken: facebookToken },
        instagram: { userId, accessToken: instagramToken }
    } = config;

    const [youtube, facebook, instagram] = await Promise.allSettled([
        checkYouTubeLiveStatus(channelId, youtubeApiKey),
        checkFacebookLiveStatus(pageId, facebookToken),
        checkInstagramLiveStatus(userId, instagramToken)
    ]);

    return {
        youtube: youtube.status === 'fulfilled' ? youtube.value : { isLive: false, error: youtube.reason },
        facebook: facebook.status === 'fulfilled' ? facebook.value : { isLive: false, error: facebook.reason },
        instagram: instagram.status === 'fulfilled' ? instagram.value : { isLive: false, error: instagram.reason },
        tiktok: { isLive: false, manual: true }
    };
};

// Live stream embed URL generators
export const generateEmbedUrls = (platformData) => {
    const embeds = {};

    // YouTube embed
    if (platformData.youtube.isLive && platformData.youtube.liveVideoId) {
        embeds.youtube = `https://www.youtube.com/embed/${platformData.youtube.liveVideoId}?autoplay=1&mute=0`;
    }

    // Facebook embed
    if (platformData.facebook.isLive && platformData.facebook.liveVideoId) {
        embeds.facebook = `https://www.facebook.com/plugins/video.php?href=https://www.facebook.com/facebook/videos/${platformData.facebook.liveVideoId}/`;
    }

    // Instagram (direct link only)
    if (platformData.instagram.isLive) {
        embeds.instagram = 'https://instagram.com/YOUR_HANDLE/live'; // Direct link to profile
    }

    return embeds;
};

// Notification system for live alerts
export const subscribeLiveNotifications = async (platform, userId) => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
        try {
            const registration = await navigator.serviceWorker.ready;
            const permission = await Notification.requestPermission();
            
            if (permission === 'granted') {
                const subscription = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: 'YOUR_VAPID_PUBLIC_KEY' // Replace with your VAPID key
                });

                // Send subscription to your server
                await fetch('/api/subscribe-notifications', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        subscription,
                        platform,
                        userId
                    })
                });

                return { success: true, message: `Subscribed to ${platform} live notifications` };
            }
        } catch (error) {
            console.error('Notification subscription error:', error);
            return { success: false, error: error.message };
        }
    }
    return { success: false, error: 'Notifications not supported' };
};

// Configuration template for API keys
export const createLiveStreamConfig = () => {
    return {
        youtube: {
            channelId: process.env.REACT_APP_YOUTUBE_CHANNEL_ID || 'YOUR_YOUTUBE_CHANNEL_ID',
            apiKey: process.env.REACT_APP_YOUTUBE_API_KEY || 'YOUR_YOUTUBE_API_KEY'
        },
        facebook: {
            pageId: process.env.REACT_APP_FACEBOOK_PAGE_ID || 'YOUR_FACEBOOK_PAGE_ID',
            accessToken: process.env.REACT_APP_FACEBOOK_ACCESS_TOKEN || 'YOUR_FACEBOOK_ACCESS_TOKEN'
        },
        instagram: {
            userId: process.env.REACT_APP_INSTAGRAM_USER_ID || 'YOUR_INSTAGRAM_USER_ID',
            accessToken: process.env.REACT_APP_INSTAGRAM_ACCESS_TOKEN || 'YOUR_INSTAGRAM_ACCESS_TOKEN'
        }
    };
};