# 🚀 GenFree Network - Complete Deployment Guide

## 📋 Prerequisites

### Required Software
- Python 3.9+
- PostgreSQL 12+
- Redis 6+ (for WebSocket channels)
- Node.js 16+ (for frontend)

### Environment Setup
```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # Linux/Mac
# OR
venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt
pip install -r requirements-analytics.txt
pip install channels channels-redis
```

## 🔧 Database Setup

### 1. PostgreSQL Configuration
```sql
-- Create database and user
CREATE DATABASE genfree_db;
CREATE USER genfree_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE genfree_db TO genfree_user;
```

### 2. Environment Variables
Create `.env` file in backend directory:
```env
# Django Settings
SECRET_KEY=your-very-secure-secret-key-here
DEBUG=False
ALLOWED_HOSTS=localhost,127.0.0.1,your-domain.com

# Database
DB_NAME=genfree_db
DB_USER=genfree_user
DB_PASSWORD=your_secure_password
DB_HOST=localhost
DB_PORT=5432

# Payment (Flutterwave)
FLUTTERWAVE_PUBLIC_KEY=FLWPUBK-xxxxxxxxxxxx
FLUTTERWAVE_SECRET_KEY=FLWSECK-xxxxxxxxxxxx
FLUTTERWAVE_WEBHOOK_SECRET=your_webhook_secret

# Email Settings
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
EMAIL_USE_TLS=True

# Redis (for WebSocket channels)
REDIS_URL=redis://localhost:6379/0

# Media/Static Files
MEDIA_ROOT=/path/to/media
STATIC_ROOT=/path/to/static
```

## 🗄️ Database Migrations

### Run All Migrations
```bash
# Navigate to backend directory
cd backend

# Create migrations for all apps
python manage.py makemigrations authentication
python manage.py makemigrations events  
python manage.py makemigrations donations
python manage.py makemigrations livestream
python manage.py makemigrations chat
python manage.py makemigrations analytics
python manage.py makemigrations cms
python manage.py makemigrations common

# Apply all migrations
python manage.py migrate

# Create superuser account
python manage.py createsuperuser
```

### Load Initial Data (Optional)
```bash
# Create initial site settings
python manage.py shell
```
```python
from apps.cms.models import SiteSettings
SiteSettings.objects.create(
    site_title="GenFree Network",
    tagline="Transforming Lives Through Faith",
    description="A community of believers spreading the Gospel",
    email="info@genfree.org",
    enable_donations=True,
    enable_events=True,
    enable_livestream=True
)
```

## 🔌 WebSocket Configuration

### 1. Install Redis
```bash
# Ubuntu/Debian
sudo apt-get install redis-server

# CentOS/RHEL
sudo yum install redis

# macOS
brew install redis

# Start Redis
redis-server
```

### 2. Update Django Settings
Add to `settings/base.py`:
```python
# Channels
ASGI_APPLICATION = 'genfree_backend.routing.application'

CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': {
            "hosts": [('127.0.0.1', 6379)],
        },
    },
}

# Add channels to INSTALLED_APPS
INSTALLED_APPS += ['channels']
```

## 💳 Payment Integration Setup

### 1. Flutterwave Account
1. Create account at https://flutterwave.com
2. Get API keys from dashboard
3. Set webhook URL: `https://yourdomain.com/api/donations/webhook/`

### 2. Test Payment Flow
```bash
# Run the payment test
python manage.py shell
```
```python
from apps.donations.views import FlutterwavePaymentGateway

gateway = FlutterwavePaymentGateway()
result = gateway.initialize_payment({
    'transaction_reference': 'TEST_001',
    'amount': 1000,
    'currency': 'UGX',
    'customer_email': 'test@example.com',
    'customer_name': 'Test User',
    'redirect_url': 'https://yourdomain.com/payment/success/'
})
print(result)
```

## 🖥️ Frontend Integration

### 1. Environment Variables
Create `.env` in frontend directory:
```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_WS_BASE_URL=ws://localhost:8000/ws
VITE_FLUTTERWAVE_PUBLIC_KEY=FLWPUBK-xxxxxxxxxxxx
```

### 2. Test API Endpoints
```bash
cd backend
python test_api_endpoints.py
```

## 🧪 Testing the Complete Integration

### 1. Start All Services
```bash
# Terminal 1: Redis
redis-server

# Terminal 2: Django Backend
cd backend
python manage.py runserver

# Terminal 3: Frontend Development Server
cd frontend
npm run dev

# Terminal 4: Celery (for background tasks)
cd backend
celery -A genfree_backend worker -l info
```

### 2. Test Each Component

#### Authentication
```bash
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123","first_name":"Test","last_name":"User"}'
```

#### Events
```bash
curl http://localhost:8000/api/events/events/
```

#### Live Streaming
```bash
curl http://localhost:8000/api/livestream/streams/status/
```

#### Chat
```bash
curl http://localhost:8000/api/chat/rooms/
```

#### Donations
```bash
curl http://localhost:8000/api/donations/campaigns/
```

#### Analytics
```bash
curl -X POST http://localhost:8000/api/analytics/track/event/ \
  -H "Content-Type: application/json" \
  -d '{"event_type":"page_view","event_name":"Homepage","page_url":"http://localhost:3000"}'
```

#### CMS
```bash
curl http://localhost:8000/api/cms/site-info/
```

### 3. Test WebSocket Connections
Open browser console on frontend and test:
```javascript
// Test chat WebSocket
const chatWs = new WebSocket('ws://localhost:8000/ws/chat/general/');
chatWs.onmessage = (event) => console.log('Chat:', JSON.parse(event.data));
chatWs.send(JSON.stringify({type: 'chat_message', content: 'Hello World!'}));

// Test livestream WebSocket  
const streamWs = new WebSocket('ws://localhost:8000/ws/stream/stream-id/');
streamWs.onmessage = (event) => console.log('Stream:', JSON.parse(event.data));
```

## 🔒 Production Deployment

### 1. Update Settings
```python
# settings/production.py
DEBUG = False
ALLOWED_HOSTS = ['your-domain.com', 'www.your-domain.com']

# Use environment variables for sensitive data
SECRET_KEY = os.environ.get('SECRET_KEY')
```

### 2. Static Files
```bash
python manage.py collectstatic --noinput
```

### 3. Gunicorn + Nginx
```bash
# Install gunicorn
pip install gunicorn

# Run with gunicorn
gunicorn genfree_backend.wsgi:application --bind 0.0.0.0:8000

# For WebSocket support, use Daphne
pip install daphne
daphne -b 0.0.0.0 -p 8000 genfree_backend.asgi:application
```

### 4. Nginx Configuration
```nginx
upstream backend {
    server 127.0.0.1:8000;
}

upstream websocket {
    server 127.0.0.1:8001;
}

server {
    listen 80;
    server_name your-domain.com;
    
    location /api/ {
        proxy_pass http://backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    location /ws/ {
        proxy_pass http://websocket;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
    
    location / {
        root /path/to/frontend/dist;
        try_files $uri $uri/ /index.html;
    }
}
```

## 📊 Monitoring & Logging

### 1. Django Logging
Add to settings:
```python
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': 'genfree.log',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['file'],
            'level': 'INFO',
            'propagate': True,
        },
    },
}
```

### 2. Health Check Monitoring
```bash
# Check API health
curl http://localhost:8000/health/

# Check database connectivity
python manage.py dbshell

# Check Redis connectivity
redis-cli ping
```

## ✅ Deployment Checklist

- [ ] Database created and configured
- [ ] Environment variables set
- [ ] All migrations applied
- [ ] Superuser created
- [ ] Redis server running
- [ ] Static files collected
- [ ] Payment gateway configured
- [ ] WebSocket connections tested
- [ ] All API endpoints working
- [ ] Frontend connected to backend
- [ ] SSL certificate installed (production)
- [ ] Backup strategy implemented
- [ ] Monitoring configured

## 🆘 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check PostgreSQL is running
   - Verify database credentials in .env

2. **WebSocket Connection Failed**
   - Ensure Redis is running
   - Check CHANNEL_LAYERS configuration
   - Verify WebSocket URL in frontend

3. **Payment Integration Issues**
   - Verify Flutterwave API keys
   - Check webhook URL configuration
   - Test with Flutterwave test keys first

4. **Static Files Not Loading**
   - Run `python manage.py collectstatic`
   - Check STATIC_URL and STATIC_ROOT settings
   - Verify Nginx configuration

5. **CORS Issues**
   - Update CORS settings in Django
   - Add frontend URL to CORS_ALLOWED_ORIGINS

## 📞 Support

For deployment assistance:
- Email: support@genfree.org
- Documentation: https://docs.genfree.org
- GitHub Issues: https://github.com/genfree/backend/issues

---

🎉 **Congratulations!** Your GenFree Network backend is now fully deployed and integrated!