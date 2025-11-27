# 🚀 Production Deployment Guide

## **Deployment Strategy Overview**

We'll deploy both frontend and backend to production with these recommended combinations:

### **Option A: Heroku + Netlify (Recommended)**
- **Backend**: Heroku (Easy Django hosting)
- **Frontend**: Netlify (Current setup)
- **Database**: Heroku Postgres
- **Redis**: Heroku Redis

### **Option B: Railway + Vercel**
- **Backend**: Railway (Modern Django hosting)
- **Frontend**: Vercel (Fast React hosting)
- **Database**: Railway Postgres
- **Redis**: Railway Redis

### **Option C: AWS Full Stack**
- **Backend**: AWS Elastic Beanstalk
- **Frontend**: AWS S3 + CloudFront
- **Database**: AWS RDS
- **Redis**: AWS ElastiCache

## **🏆 RECOMMENDED: Heroku + Netlify Deployment**

### **Step 1: Deploy Backend to Heroku**

```bash
# 1. Install Heroku CLI
# Windows: Download from heroku.com/cli
# Mac: brew install heroku/brew/heroku
# Linux: Follow instructions on heroku.com

# 2. Login to Heroku
heroku login

# 3. Create Heroku app
cd backend
heroku create genfree-backend-app  # Choose unique name

# 4. Add addons
heroku addons:create heroku-postgresql:mini
heroku addons:create heroku-redis:mini

# 5. Set environment variables
heroku config:set DJANGO_SETTINGS_MODULE=genfree_backend.settings.production
heroku config:set SECRET_KEY=$(python -c 'from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())')
heroku config:set DEBUG=False
heroku config:set FLUTTERWAVE_SECRET_KEY=your-secret-key
heroku config:set FLUTTERWAVE_PUBLIC_KEY=your-public-key
heroku config:set FLUTTERWAVE_WEBHOOK_SECRET=your-webhook-secret
heroku config:set EMAIL_HOST_USER=your-email@gmail.com
heroku config:set EMAIL_HOST_PASSWORD=your-app-password

# 6. Deploy to Heroku
git add .
git commit -m "Deploy to Heroku"
git push heroku main

# 7. Run migrations
heroku run python manage.py migrate
heroku run python manage.py createsuperuser
heroku run python manage.py collectstatic --noinput

# 8. Open your backend
heroku open
```

### **Step 2: Update Frontend for Production**

```bash
# 1. Get your Heroku backend URL
# Example: https://genfree-backend-app.herokuapp.com

# 2. Update your .env file
cd ..  # Back to root directory
```

Create/update `.env`:
```env
# Production Backend URL
VITE_API_BASE_URL=https://your-heroku-app.herokuapp.com/api
VITE_WS_BASE_URL=wss://your-heroku-app.herokuapp.com/ws

# Flutterwave Public Key (same as backend)
VITE_FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_TEST-your-public-key

# Analytics
VITE_GOOGLE_ANALYTICS_ID=your-ga-id
```

### **Step 3: Deploy Frontend to Netlify**

```bash
# 1. Build with production settings
npm run build

# 2. Deploy to Netlify (you already have this set up)
# Option A: Drag and drop dist folder to Netlify dashboard
# Option B: Use Netlify CLI
npm install -g netlify-cli
netlify login
netlify deploy --prod --dir=dist

# 3. Set environment variables in Netlify dashboard
# Go to: Site settings → Environment variables
# Add:
# VITE_API_BASE_URL=https://your-heroku-app.herokuapp.com/api
# VITE_FLUTTERWAVE_PUBLIC_KEY=your-public-key
```

### **Step 4: Configure CORS and Domains**

Update your Heroku backend:
```bash
# Add your Netlify domain to allowed origins
heroku config:set ALLOWED_HOSTS=your-heroku-app.herokuapp.com,your-netlify-site.netlify.app,your-custom-domain.com
heroku config:set CORS_ALLOWED_ORIGINS=https://your-netlify-site.netlify.app,https://your-custom-domain.com
```

## **⚡ Quick Deploy Scripts**

### **Backend Deployment Script**
```bash
#!/bin/bash
# backend-deploy.sh

echo "🚀 Deploying Django Backend to Heroku"

# Set app name
APP_NAME="genfree-backend-$(date +%s)"
echo "Creating app: $APP_NAME"

# Create and configure Heroku app
heroku create $APP_NAME
heroku addons:create heroku-postgresql:mini -a $APP_NAME
heroku addons:create heroku-redis:mini -a $APP_NAME

# Set environment variables
heroku config:set DJANGO_SETTINGS_MODULE=genfree_backend.settings.production -a $APP_NAME
heroku config:set SECRET_KEY=$(openssl rand -base64 32) -a $APP_NAME
heroku config:set DEBUG=False -a $APP_NAME

# Prompt for Flutterwave keys
read -p "Enter Flutterwave Secret Key: " FW_SECRET
read -p "Enter Flutterwave Public Key: " FW_PUBLIC
read -p "Enter Flutterwave Webhook Secret: " FW_WEBHOOK

heroku config:set FLUTTERWAVE_SECRET_KEY=$FW_SECRET -a $APP_NAME
heroku config:set FLUTTERWAVE_PUBLIC_KEY=$FW_PUBLIC -a $APP_NAME
heroku config:set FLUTTERWAVE_WEBHOOK_SECRET=$FW_WEBHOOK -a $APP_NAME

# Deploy
git push heroku main

# Run setup
heroku run python manage.py migrate -a $APP_NAME
heroku run python manage.py collectstatic --noinput -a $APP_NAME

echo "✅ Backend deployed! URL: https://$APP_NAME.herokuapp.com"
echo "🔑 Create superuser: heroku run python manage.py createsuperuser -a $APP_NAME"
```

### **Frontend Deployment Script**
```bash
#!/bin/bash
# frontend-deploy.sh

echo "🌐 Deploying React Frontend to Netlify"

# Get backend URL
read -p "Enter your backend URL (e.g., https://your-app.herokuapp.com): " BACKEND_URL
read -p "Enter your Flutterwave public key: " FW_PUBLIC

# Update .env
cat > .env << EOF
VITE_API_BASE_URL=$BACKEND_URL/api
VITE_WS_BASE_URL=${BACKEND_URL/https:/wss:}/ws
VITE_FLUTTERWAVE_PUBLIC_KEY=$FW_PUBLIC
EOF

# Build and deploy
npm run build
netlify deploy --prod --dir=dist

echo "✅ Frontend deployed!"
echo "🔧 Don't forget to add environment variables in Netlify dashboard"
```

## **🔧 Alternative: Railway Deployment**

### **Railway Backend Setup**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
cd backend
railway init
railway add postgresql
railway add redis

# Set environment variables
railway variables set DJANGO_SETTINGS_MODULE=genfree_backend.settings.production
railway variables set SECRET_KEY=$(openssl rand -base64 32)
railway variables set DEBUG=False

# Deploy
railway up

# Run migrations
railway run python manage.py migrate
railway run python manage.py createsuperuser
```

## **🌟 Custom Domain Setup**

### **1. Backend Custom Domain (Heroku)**
```bash
# Add custom domain
heroku domains:add api.yourdomain.com -a your-app

# Configure DNS
# Create CNAME record: api.yourdomain.com → your-app.herokuapp.com

# Enable SSL
heroku certs:auto:enable -a your-app
```

### **2. Frontend Custom Domain (Netlify)**
```bash
# In Netlify dashboard:
# Site settings → Domain management → Add custom domain
# Follow DNS configuration instructions
```

## **🔍 Testing Production Deployment**

### **Backend Health Checks**
```bash
# Test API endpoints
curl https://your-backend-url.herokuapp.com/api/
curl https://your-backend-url.herokuapp.com/health/
curl https://your-backend-url.herokuapp.com/api/events/

# Check admin panel
open https://your-backend-url.herokuapp.com/admin/
```

### **Frontend Integration Tests**
- ✅ Visit your Netlify site
- ✅ Test donation flow end-to-end
- ✅ Test user registration/login
- ✅ Test live chat functionality
- ✅ Verify all API calls work
- ✅ Check console for errors

## **📊 Production Monitoring**

### **Set up monitoring:**
1. **Heroku Metrics**: Built-in app metrics
2. **Sentry**: Error tracking (add SENTRY_DSN to env vars)
3. **Google Analytics**: Website analytics
4. **Uptime Robot**: Website uptime monitoring

### **Performance Optimization:**
1. **Enable gzip compression**: Already configured
2. **CDN**: Netlify provides global CDN
3. **Database optimization**: Index optimization in Django
4. **Caching**: Redis caching enabled

---

**🎉 Your production deployment is now live and ready to serve your global ministry community!**