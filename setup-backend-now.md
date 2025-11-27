# 🔧 Backend Setup Guide - Step by Step

## **Prerequisites Check**
Before we start, ensure you have:
- ✅ Python 3.8+ installed
- ✅ pip (Python package manager)
- ✅ Git installed

## **1. Quick Setup Commands**

Open your terminal/command prompt and run these commands:

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows PowerShell/CMD:
venv\Scripts\activate
# Windows Git Bash:
source venv/Scripts/activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create environment file
copy .env.example .env    # Windows
cp .env.example .env      # Mac/Linux
```

## **2. Configure Environment Variables**

Edit the `.env` file with these settings:

```env
# Django Settings
SECRET_KEY=your-very-secure-secret-key-here
DEBUG=True
DJANGO_SETTINGS_MODULE=genfree_backend.settings.development

# Database (SQLite for development)
USE_POSTGRES=False

# Flutterwave (IMPORTANT: Add your real keys)
FLUTTERWAVE_SECRET_KEY=FLWSECK_TEST-your-secret-key
FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_TEST-your-public-key
FLUTTERWAVE_WEBHOOK_SECRET=your-webhook-secret

# Email (Optional for development)
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=noreply@genfree.org

# Redis (Optional - install Redis or use dummy cache)
REDIS_URL=redis://localhost:6379
```

## **3. Initialize Database**

```bash
# Create database tables
python manage.py makemigrations
python manage.py migrate

# Create superuser account
python manage.py createsuperuser
# Enter: username, email, password

# Load sample data (optional)
python manage.py collectstatic --noinput
```

## **4. Start the Server**

```bash
# Start Django development server
python manage.py runserver

# You should see:
# Starting development server at http://127.0.0.1:8000/
```

## **5. Verify Setup**

Open your browser and check:
- ✅ **API Root**: http://localhost:8000/api/
- ✅ **Admin Panel**: http://localhost:8000/admin/
- ✅ **API Docs**: http://localhost:8000/api/schema/swagger-ui/

## **6. Test API Endpoints**

Try these in your browser or Postman:
```bash
GET http://localhost:8000/api/events/
GET http://localhost:8000/api/donations/campaigns/
GET http://localhost:8000/api/livestream/status/
```

## **✅ Success Indicators**
- Django server starts without errors
- Admin panel loads and you can login
- API endpoints return JSON data
- No red error messages in terminal

## **🚨 Common Issues & Solutions**

### **Python not found**
- Install Python from python.org
- Make sure it's added to PATH

### **Module not found errors**
```bash
# Make sure virtual environment is activated
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Reinstall requirements
pip install -r requirements.txt
```

### **Database errors**
```bash
# Reset database (development only)
rm db.sqlite3
python manage.py migrate
python manage.py createsuperuser
```

### **Port already in use**
```bash
# Use different port
python manage.py runserver 8001
```

---
**Once backend is running successfully, proceed to connect your React frontend!**