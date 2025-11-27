# 🔗 Django + React Integration Guide

## Overview

This guide shows how to integrate your existing React frontend with the new Django backend for a powerful full-stack ministry platform.

## 🚀 Quick Integration Steps

### 1. **Update React Environment**

Add backend API configuration to your React `.env`:

```env
# Add to existing .env file
VITE_API_BASE_URL=http://localhost:8000/api
VITE_WS_BASE_URL=ws://localhost:8000/ws
```

### 2. **Install Additional Dependencies**

```bash
# In your React project root
npm install axios @reduxjs/toolkit react-redux
```

### 3. **Create API Service Layer**

```bash
# Create new API service file
mkdir -p src/services
touch src/services/api.js
```

### 4. **Start Backend Server**

```bash
# In backend directory
cd backend
python setup.py  # One-time setup
python manage.py runserver  # Start server on port 8000
```

### 5. **Update React Components**

Your existing components will work with enhanced backend data:
- **DonationSystem**: Now processes real payments via Django
- **ChatSystem**: Connects to Django WebSocket for real-time chat  
- **EventCard**: Loads events from Django database
- **LiveStream**: Gets live status from Django API

## 🔄 Migration Benefits

### Before (Static React)
- ✅ Beautiful UI/UX
- ❌ No real payments
- ❌ No user accounts  
- ❌ No real-time features
- ❌ No data persistence

### After (Django + React)
- ✅ Beautiful UI/UX
- ✅ Real Flutterwave payments
- ✅ User authentication & profiles
- ✅ Real-time chat & notifications
- ✅ Database with all ministry data
- ✅ Admin panel for content management
- ✅ Analytics & reporting
- ✅ Email notifications
- ✅ File uploads & media management

## 🎯 Next Steps

1. **Run Django setup**: `cd backend && python setup.py`
2. **Test API endpoints**: Visit `http://localhost:8000/api/schema/swagger-ui/`
3. **Update React components** to use real API data
4. **Deploy both frontend and backend**

Your ministry platform will be transformed into a professional, scalable application!

Would you like me to help you integrate specific components or deploy the system?