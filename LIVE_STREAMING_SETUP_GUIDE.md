# 🔴 Live Streaming & Social Media Integration Setup Guide

## 🎯 **What's Been Implemented**

Your website now has complete live streaming capabilities and social media integration:

### ✅ **Features Added:**
- **Live Streaming Page** (`/live`) - Multi-platform streaming interface
- **Social Media Integration** - YouTube, Facebook, Instagram, TikTok connections
- **Live Notifications** - Floating alerts when you go live
- **Real-time Status Detection** - Automatic live stream monitoring
- **Multi-platform Broadcasting** - Stream to all platforms simultaneously
- **Interactive Features** - Viewer counts, chat integration, notifications

## 🔧 **Setup Required (Replace Placeholders):**

### **1. Update Social Media URLs**

Replace these placeholders with your actual accounts:

#### **In LiveStream.jsx, SocialMediaIntegration.jsx, and Footer.jsx:**
```javascript
// Replace these URLs:
'https://youtube.com/@genfree' → 'https://youtube.com/@YOUR_ACTUAL_CHANNEL'
'https://facebook.com/genfree' → 'https://facebook.com/YOUR_PAGE_NAME'
'https://instagram.com/genfree' → 'https://instagram.com/YOUR_HANDLE'
'https://tiktok.com/@genfree' → 'https://tiktok.com/@YOUR_HANDLE'
```

### **2. Set Up API Keys for Live Detection**

Create a `.env` file in your project root:

```env
# YouTube Data API v3
REACT_APP_YOUTUBE_CHANNEL_ID=your_youtube_channel_id
REACT_APP_YOUTUBE_API_KEY=your_youtube_api_key

# Facebook Graph API
REACT_APP_FACEBOOK_PAGE_ID=your_facebook_page_id
REACT_APP_FACEBOOK_ACCESS_TOKEN=your_facebook_access_token

# Instagram Basic Display API
REACT_APP_INSTAGRAM_USER_ID=your_instagram_user_id
REACT_APP_INSTAGRAM_ACCESS_TOKEN=your_instagram_access_token
```

### **3. Get API Keys:**

#### **YouTube Data API:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable YouTube Data API v3
4. Create credentials (API Key)
5. Get your Channel ID from YouTube Studio

#### **Facebook Graph API:**
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create an app
3. Add Facebook Login product
4. Generate Page Access Token
5. Get your Page ID from Facebook Page settings

#### **Instagram Basic Display API:**
1. Same Facebook app as above
2. Add Instagram Basic Display product
3. Generate access token
4. Get User ID from Instagram

## 🚀 **How to Use the Live Streaming Features:**

### **For Ministry Leaders:**

#### **Going Live:**
1. **Start your stream** on YouTube/Facebook/Instagram
2. **Your website automatically detects** the live status
3. **Visitors see live notification** and can join instantly
4. **Multi-platform reach** - people can choose their preferred platform

#### **Manual Override:**
If automatic detection doesn't work, you can manually set live status:
```javascript
// In browser console:
window.goLive('youtube'); // or 'facebook', 'instagram', 'tiktok'
```

### **For Website Visitors:**

#### **Live Experience:**
- **Live notifications** appear when streams are active
- **Multiple viewing options** - choose YouTube, Facebook, Instagram, or TikTok
- **Real-time viewer counts** and engagement
- **Easy social following** with one-click buttons
- **Push notifications** for future streams (if enabled)

## 📱 **Platform-Specific Features:**

### **YouTube Live:**
- **Embedded player** with full controls
- **Live chat integration**
- **Viewer count display**
- **Automatic stream detection**

### **Facebook Live:**
- **Direct links** to Facebook stream
- **Page integration**
- **Community engagement**
- **Event scheduling**

### **Instagram Live:**
- **Story integration**
- **Direct profile links**
- **Behind-the-scenes content**
- **Mobile-first experience**

### **TikTok:**
- **Short-form content**
- **Youth engagement**
- **Viral potential**
- **Creative worship clips**

## 🔔 **Notification System:**

### **Push Notifications:**
- Users can **subscribe for live alerts**
- **Browser notifications** when you go live
- **Platform-specific** notification preferences
- **Service Worker** implementation ready

### **Setup Push Notifications:**
1. **Get VAPID keys** for web push
2. **Update service worker** configuration
3. **Implement server endpoint** for sending notifications
4. **Test notification flow**

## 📊 **Analytics & Engagement:**

### **Metrics Tracked:**
- **Live viewer counts** across platforms
- **Social media clicks** and engagement
- **Platform preferences** of your audience
- **Stream performance** analytics

### **Google Analytics Integration:**
The system tracks social media engagement:
```javascript
gtag('event', 'social_click', {
    'event_category': 'Social Media',
    'event_label': platform,
    'value': 1
});
```

## 🎥 **Streaming Workflow:**

### **Before Going Live:**
1. **Test your equipment** and internet connection
2. **Update stream titles** and descriptions
3. **Schedule notifications** for your community
4. **Prepare worship songs** and teaching materials

### **Going Live:**
1. **Start streaming** on your chosen platform(s)
2. **Website automatically detects** and shows live status
3. **Notifications sent** to subscribers
4. **Engage with viewers** across all platforms

### **After Stream:**
1. **Archive recordings** for later viewing
2. **Engage with comments** and feedback
3. **Share highlights** on social media
4. **Plan next streaming session**

## 🛠️ **Technical Implementation:**

### **Files Created:**
- `src/components/LiveStream.jsx` - Main streaming interface
- `src/components/SocialMediaIntegration.jsx` - Social platform integration
- `src/components/LiveNotification.jsx` - Live alert notifications
- `src/components/LiveStatusBadge.jsx` - Live status indicators
- `src/hooks/useLiveStatus.js` - Live status management
- `src/utils/liveStreamAPI.js` - API utilities for platforms
- `src/pages/Live.jsx` - Live streaming page

### **Key Features:**
- **Real-time status checking** every 30 seconds
- **Cross-platform compatibility** for all devices
- **Responsive design** for mobile and desktop
- **Error handling** for API failures
- **Fallback options** when APIs are unavailable

## 📋 **Testing Checklist:**

### **Before Launch:**
- [ ] Replace all placeholder URLs with actual social media links
- [ ] Set up API keys in `.env` file
- [ ] Test live detection with actual streams
- [ ] Verify social media links work correctly
- [ ] Test notification system
- [ ] Check mobile responsiveness
- [ ] Test with different browsers
- [ ] Verify analytics tracking

### **After Launch:**
- [ ] Monitor live detection accuracy
- [ ] Track social media engagement
- [ ] Gather user feedback
- [ ] Optimize based on usage patterns
- [ ] Update API keys as needed

## 🆘 **Troubleshooting:**

### **Common Issues:**

#### **Live Detection Not Working:**
- Check API keys are correctly set
- Verify social media accounts are public
- Check rate limits on APIs
- Use manual override as fallback

#### **Notifications Not Appearing:**
- Check browser notification permissions
- Verify service worker is registered
- Test with different browsers
- Check HTTPS requirement for notifications

#### **Social Links Not Working:**
- Verify URLs are correctly formatted
- Check social media account privacy settings
- Test links in incognito mode
- Update links if accounts change

## 🎯 **Next Steps:**

1. **Replace placeholder URLs** with your actual social media accounts
2. **Set up API keys** for automatic live detection
3. **Test the system** with a practice live stream
4. **Train your team** on how to use the features
5. **Promote the live streaming** to your community
6. **Monitor and optimize** based on engagement

## 🌟 **Advanced Features (Future Enhancements):**

- **Multi-camera switching** for professional streams
- **Scheduled stream announcements** with calendar integration
- **Interactive polls** during live sessions
- **Virtual backgrounds** and overlays
- **Stream recording** and automatic archiving
- **Donation integration** during live streams
- **Prayer request submission** during services
- **Breakout rooms** for small group discussions

---

**Your live streaming system is now ready!** 🎉

Start by updating the social media URLs and API keys, then test with a practice stream to ensure everything works perfectly for your congregation.