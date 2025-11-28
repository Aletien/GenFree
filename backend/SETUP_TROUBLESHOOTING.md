# 🔧 Backend Setup Troubleshooting Guide

## ❌ **Issue: Package Version Conflicts**

You're encountering a cryptography version conflict. Here are **3 solutions** ordered by easiest first:

---

## 🚀 **Solution 1: Use Minimal Requirements (Recommended)**

```bash
# Navigate to backend directory
cd backend

# Use the minimal requirements file
pip install -r requirements-minimal.txt

# If that works, continue with setup
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

---

## 🔄 **Solution 2: Install Without Version Pinning**

```bash
# Navigate to backend directory
cd backend

# Create new virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Upgrade pip first
python -m pip install --upgrade pip

# Install packages without strict versions
pip install Django djangorestframework django-cors-headers
pip install djangorestframework-simplejwt requests python-decouple
pip install drf-spectacular django-filter gunicorn whitenoise

# Continue with setup
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

---

## 🛠️ **Solution 3: Fix Specific Version Issues**

```bash
# Check your Python version
python --version

# If Python 3.12+, use these commands:
pip install --upgrade pip
pip install Django==4.2.7
pip install djangorestframework==3.14.0
pip install django-cors-headers==4.3.1
pip install djangorestframework-simplejwt==5.3.0
pip install requests==2.31.0
pip install python-decouple==3.8
pip install drf-spectacular
pip install django-filter
pip install gunicorn
pip install whitenoise

# Continue with setup
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

---

## 🎯 **Quick Setup Script**

I'll create an automated script for you:

```bash
# Run this in your backend directory
python quick-setup.py
```

---

## ✅ **Verification Steps**

After successful installation, verify with:

```bash
# Check Django installation
python -c "import django; print(django.get_version())"

# Check if you can start server
python manage.py check

# Start the server
python manage.py runserver
```

You should see:
- ✅ No errors in terminal
- ✅ Server starts at http://127.0.0.1:8000/
- ✅ API accessible at http://127.0.0.1:8000/api/

---

## 🚨 **Still Having Issues?**

### **Common Problems & Solutions:**

1. **"No module named Django"**
   ```bash
   # Make sure virtual environment is activated
   # Windows: venv\Scripts\activate
   # Mac/Linux: source venv/bin/activate
   pip install Django
   ```

2. **"Permission denied"**
   ```bash
   # On Windows, run as administrator
   # On Mac/Linux, check file permissions
   chmod +x manage.py
   ```

3. **"Port already in use"**
   ```bash
   # Use different port
   python manage.py runserver 8001
   ```

4. **Database errors**
   ```bash
   # Delete database and recreate
   rm db.sqlite3
   python manage.py migrate
   ```

---

## 💡 **Development vs Production**

For **development** (local testing):
- ✅ Use SQLite (no PostgreSQL needed)
- ✅ Use minimal requirements
- ✅ DEBUG=True

For **production** (live deployment):
- ✅ Use PostgreSQL
- ✅ Use full requirements
- ✅ DEBUG=False

---

Let me know which solution works for you!