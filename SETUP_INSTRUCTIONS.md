# 🚀 GenFree Network Django Backend Setup

## Step 1: Backend Setup (Manual)

Since Python isn't configured in the current environment, please follow these steps manually:

### 1. **Prerequisites**
```bash
# Install Python 3.9+ from python.org
# Install PostgreSQL (optional, SQLite works for development)
# Install Redis (for caching and real-time features)
```

### 2. **Backend Setup Commands**
```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
copy .env.example .env
# Edit .env with your settings (especially Flutterwave keys)

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

### 3. **Verify Setup**
- Backend API: http://localhost:8000/api/
- Admin Panel: http://localhost:8000/admin/
- API Docs: http://localhost:8000/api/schema/swagger-ui/

Once backend is running, proceed with React integration below.