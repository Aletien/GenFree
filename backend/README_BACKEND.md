# 🐍 GenFree Network Django Backend

> Powerful Django REST API backend for the GenFree Network ministry platform with real-time features, payment processing, and comprehensive ministry management.

## 🌟 Features

### 🔐 **Authentication & User Management**
- Custom user model with ministry-specific fields
- JWT-based authentication with refresh tokens
- Social authentication (Google, Facebook)
- Role-based permissions (Ministers, Volunteers, Members)
- Comprehensive user profiles with ministry information
- Password reset and email verification

### 📅 **Event Management**
- Complete event lifecycle management
- Event categories and tagging
- Registration system with payment integration
- Live streaming integration
- Event feedback and analytics
- Automated reminders and notifications

### 💰 **Advanced Donation System**
- **Flutterwave Integration**: Full payment gateway support
- **Multiple Payment Methods**: Cards, Mobile Money, Bank Transfers, USSD
- **Campaign Management**: Targeted fundraising campaigns
- **Recurring Donations**: Automated subscription donations
- **Receipt Generation**: Automated PDF receipts and tax documentation
- **Analytics**: Donor insights and financial reporting

### 🔴 **Live Streaming Integration**
- Multi-platform streaming (YouTube, Facebook, TikTok)
- Live status detection and management
- Stream scheduling and automation
- Viewer analytics and engagement tracking
- Real-time chat integration

### 💬 **Real-time Chat System**
- WebSocket-based live chat
- User authentication and moderation
- Message persistence and history
- Emoji and reaction support
- Anti-spam and content filtering

### 📊 **Analytics & Reporting**
- User engagement metrics
- Donation analytics and trends
- Event attendance tracking
- Live streaming performance
- Financial reporting and insights

### 🌍 **Multi-language Support**
- Internationalization (i18n) ready
- Database-driven content translation
- API endpoint localization
- Admin interface translations

## 🚀 Quick Setup

### 1. **Clone and Setup**
```bash
# Clone the backend (if separate repo)
git clone https://github.com/your-username/genfree-backend.git
cd genfree-backend

# Or use the existing backend folder
cd backend

# Run automated setup
python setup.py
```

### 2. **Manual Setup** (Alternative)
```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# Linux/Mac:
source venv/bin/activate
# Windows:
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env
# Edit .env with your settings

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Collect static files
python manage.py collectstatic

# Start development server
python manage.py runserver
```

### 3. **Environment Configuration**
Update `.env` file with your settings:
```env
# Required
SECRET_KEY=your-secret-key
FLUTTERWAVE_SECRET_KEY=your-flutterwave-secret
FLUTTERWAVE_PUBLIC_KEY=your-flutterwave-public-key

# Database (PostgreSQL recommended for production)
DATABASE_URL=postgresql://user:pass@localhost/genfree_db

# Email
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password

# Redis (for caching and Celery)
REDIS_URL=redis://localhost:6379
```

## 📚 API Documentation

### 🔗 **API Endpoints**
The API is accessible at `http://localhost:8000/api/`

#### **Authentication**
```bash
POST /api/auth/register/          # User registration
POST /api/auth/login/             # User login
POST /api/auth/logout/            # User logout
POST /api/auth/token/refresh/     # Refresh JWT token
GET  /api/auth/profile/me/        # Get current user profile
PUT  /api/auth/profile/update/    # Update user profile
```

#### **Events**
```bash
GET    /api/events/               # List events
POST   /api/events/               # Create event (staff only)
GET    /api/events/{id}/          # Event details
PUT    /api/events/{id}/          # Update event
DELETE /api/events/{id}/          # Delete event
POST   /api/events/{id}/register/ # Register for event
GET    /api/events/live/          # Get current live events
```

#### **Donations**
```bash
GET  /api/donations/campaigns/           # List donation campaigns
POST /api/donations/campaigns/          # Create campaign
GET  /api/donations/campaigns/{id}/     # Campaign details
POST /api/donations/create/             # Create donation
POST /api/donations/payment/initialize/ # Initialize Flutterwave payment
POST /api/donations/webhook/flutterwave/ # Payment webhook
GET  /api/donations/receipts/           # List receipts
GET  /api/donations/stats/              # Donation statistics
```

#### **Live Streaming**
```bash
GET  /api/livestream/status/      # Get live status
POST /api/livestream/start/       # Start streaming (staff only)
POST /api/livestream/stop/        # Stop streaming (staff only)
GET  /api/livestream/analytics/   # Stream analytics
```

#### **Chat**
```bash
GET    /api/chat/messages/        # Get chat messages
POST   /api/chat/messages/        # Send message
DELETE /api/chat/messages/{id}/   # Delete message (moderators)
```

### 📖 **Interactive Documentation**
- **Swagger UI**: http://localhost:8000/api/schema/swagger-ui/
- **ReDoc**: http://localhost:8000/api/schema/redoc/
- **OpenAPI Schema**: http://localhost:8000/api/schema/

## 🔄 Frontend Integration

### 🌐 **API Base URL Configuration**
Update your React app's API configuration:

```javascript
// src/utils/api.js
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-backend-domain.com/api'
  : 'http://localhost:8000/api';

// Example API service
class APIService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.token = localStorage.getItem('accessToken');
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
      },
      ...options,
    };

    const response = await fetch(url, config);
    
    if (response.status === 401) {
      // Handle token refresh
      await this.refreshToken();
      return this.request(endpoint, options);
    }

    return response.json();
  }

  // Authentication
  async login(email, password) {
    return this.request('/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  // Events
  async getEvents() {
    return this.request('/events/');
  }

  async getLiveEvents() {
    return this.request('/events/live/');
  }

  // Donations
  async createDonation(donationData) {
    return this.request('/donations/create/', {
      method: 'POST',
      body: JSON.stringify(donationData),
    });
  }

  async initializePayment(paymentData) {
    return this.request('/donations/payment/initialize/', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }
}

export default new APIService();
```

### 🔄 **WebSocket Integration** (Real-time Chat)
```javascript
// src/hooks/useWebSocket.js
import { useEffect, useState } from 'react';

export const useWebSocket = (url, user) => {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const wsUrl = `ws://localhost:8000/ws/chat/live/`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      setIsConnected(true);
      console.log('WebSocket connected');
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'chat_message') {
        setMessages(prev => [...prev, data.message]);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      console.log('WebSocket disconnected');
    };

    setSocket(ws);

    return () => {
      ws.close();
    };
  }, [url, user]);

  const sendMessage = (message) => {
    if (socket && isConnected) {
      socket.send(JSON.stringify({
        type: 'chat_message',
        message: message,
        user: user.id
      }));
    }
  };

  return { messages, sendMessage, isConnected };
};
```

### 💳 **Updated Flutterwave Integration**
```javascript
// src/components/DonationSystem.jsx - Updated for backend integration
import { useState } from 'react';
import APIService from '../utils/api';

const DonationSystem = () => {
  const [loading, setLoading] = useState(false);

  const handleDonation = async (donationData) => {
    setLoading(true);
    
    try {
      // Step 1: Create donation record
      const donation = await APIService.createDonation(donationData);
      
      // Step 2: Initialize Flutterwave payment
      const paymentData = await APIService.initializePayment({
        donation_id: donation.id,
        amount: donationData.amount,
        currency: donationData.currency,
        donor_email: donationData.donor_email,
        redirect_url: `${window.location.origin}/donation/success`
      });
      
      // Step 3: Redirect to Flutterwave
      window.location.href = paymentData.payment_link;
      
    } catch (error) {
      console.error('Donation error:', error);
      // Handle error
    } finally {
      setLoading(false);
    }
  };

  // Rest of component...
};
```

## 🚀 Deployment

### 🔧 **Automated Deployment**
```bash
# Use the deployment script
python deploy.py

# Select your platform:
# 1. Heroku
# 2. Railway
# 3. DigitalOcean
# 4. AWS
# 5. Docker
```

### ☁️ **Platform-Specific Setup**

#### **Heroku**
```bash
# Install Heroku CLI and login
heroku login

# Create app
heroku create genfree-backend

# Add addons
heroku addons:create heroku-postgresql:mini
heroku addons:create heroku-redis:mini

# Set environment variables
heroku config:set DJANGO_SETTINGS_MODULE=genfree_backend.settings.production
heroku config:set SECRET_KEY=your-secret-key
heroku config:set FLUTTERWAVE_SECRET_KEY=your-key

# Deploy
git push heroku main

# Run migrations
heroku run python manage.py migrate
heroku run python manage.py createsuperuser
```

#### **Railway**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway add postgresql
railway add redis
railway up
```

#### **Docker**
```bash
# Build and run
docker-compose up --build

# Run migrations
docker-compose exec web python manage.py migrate
docker-compose exec web python manage.py createsuperuser
```

### 🌐 **Production Settings**
Ensure these settings for production:

```python
# settings/production.py
DEBUG = False
ALLOWED_HOSTS = ['your-domain.com', 'www.your-domain.com']

# Security
SECURE_SSL_REDIRECT = True
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True

# Database
DATABASES = {
    'default': dj_database_url.config(default=os.environ.get('DATABASE_URL'))
}

# Static files
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
```

## 🔧 Development

### 🏃‍♂️ **Running Background Tasks**
```bash
# In separate terminals:

# 1. Main Django server
python manage.py runserver

# 2. Celery worker (for background tasks)
celery -A genfree_backend worker --loglevel=info

# 3. Celery beat (for scheduled tasks)
celery -A genfree_backend beat --loglevel=info

# 4. Redis server
redis-server
```

### 🧪 **Testing**
```bash
# Run tests
python manage.py test

# Run specific app tests
python manage.py test apps.donations

# Coverage report
pip install coverage
coverage run --source='.' manage.py test
coverage report
coverage html
```

### 📊 **Database Management**
```bash
# Create migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Reset database (development only)
python manage.py flush

# Load sample data
python manage.py loaddata fixtures/sample_data.json

# Database shell
python manage.py dbshell

# Django shell
python manage.py shell
```

### 🔍 **Monitoring & Debugging**
```bash
# View logs
tail -f logs/django.log

# Monitor Celery tasks
celery -A genfree_backend flower  # Web UI at http://localhost:5555

# Database queries
python manage.py shell
>>> from django.db import connection
>>> print(connection.queries)
```

## 🛠️ Customization

### 🎨 **Adding New Apps**
```bash
# Create new Django app
python manage.py startapp new_feature

# Add to INSTALLED_APPS in settings
# Create models, views, serializers
# Add to main URLs
```

### 🔌 **Adding Payment Gateways**
Extend the payment system:
```python
# apps/donations/gateways/new_gateway.py
class NewPaymentGateway:
    def process_payment(self, amount, customer_data):
        # Implementation
        pass
```

### 📧 **Email Templates**
Customize email templates in `templates/emails/`:
- `welcome.html` - Welcome email
- `donation_receipt.html` - Donation receipt
- `event_reminder.html` - Event reminders

## 🔒 Security

### 🛡️ **Security Checklist**
- [x] HTTPS enforced in production
- [x] Secret key properly secured
- [x] Database credentials encrypted
- [x] CORS properly configured
- [x] Rate limiting implemented
- [x] Input validation and sanitization
- [x] SQL injection protection
- [x] XSS protection
- [x] CSRF protection
- [x] Secure headers configured

### 🔐 **API Security**
- JWT tokens with expiration
- Refresh token rotation
- Rate limiting per endpoint
- Input validation on all endpoints
- Permission-based access control

## 📞 Support & Troubleshooting

### 🐛 **Common Issues**

#### **Database Connection Error**
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Check connection settings
python manage.py dbshell
```

#### **Redis Connection Error**
```bash
# Check Redis is running
redis-cli ping

# Should return PONG
```

#### **Celery Tasks Not Running**
```bash
# Check Celery worker is running
celery -A genfree_backend inspect active

# Check Redis connection
celery -A genfree_backend inspect stats
```

#### **Payment Webhook Issues**
```bash
# Check webhook URL in Flutterwave dashboard
# Verify webhook signature validation
# Check logs for webhook events
```

### 📧 **Getting Help**
- **Issues**: [GitHub Issues](https://github.com/your-username/genfree-network/issues)
- **Email**: developer@genfree.org
- **Documentation**: Check API documentation at `/api/schema/swagger-ui/`

## 🤝 Contributing

### 🔄 **Development Workflow**
1. Fork the repository
2. Create feature branch: `git checkout -b feature/new-feature`
3. Make changes and add tests
4. Run test suite: `python manage.py test`
5. Commit changes: `git commit -m 'Add new feature'`
6. Push to branch: `git push origin feature/new-feature`
7. Create Pull Request

### 📋 **Code Standards**
- Follow PEP 8 style guide
- Write docstrings for all functions
- Add tests for new features
- Update API documentation

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ for God's glory and the advancement of His kingdom.**

> "Therefore go and make disciples of all nations..." - Matthew 28:19