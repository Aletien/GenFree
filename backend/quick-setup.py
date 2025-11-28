#!/usr/bin/env python3
"""
Quick Setup Script for GenFree Network Django Backend
Handles common installation issues automatically
"""

import os
import sys
import subprocess
import platform

def run_command(command, description=""):
    """Run a command and handle errors gracefully."""
    print(f"📦 {description}" if description else f"⚡ {command}")
    
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        if result.stdout and result.stdout.strip():
            print(f"✅ {result.stdout.strip()}")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Error: {e}")
        if e.stderr:
            print(f"   Details: {e.stderr.strip()}")
        return False

def check_python_version():
    """Check Python version and compatibility."""
    version = sys.version_info
    print(f"🐍 Python version: {version.major}.{version.minor}.{version.micro}")
    
    if version < (3, 8):
        print("❌ Python 3.8+ is required. Please upgrade Python.")
        return False
    
    if version >= (3, 12):
        print("⚠️  Python 3.12+ detected. Using compatible packages.")
    
    return True

def install_minimal_packages():
    """Install minimal required packages."""
    print("📦 Installing minimal Django packages...")
    
    packages = [
        "Django>=4.2,<5.0",
        "djangorestframework>=3.14.0", 
        "django-cors-headers>=4.3.0",
        "djangorestframework-simplejwt>=5.3.0",
        "requests>=2.31.0",
        "python-decouple>=3.8",
        "drf-spectacular>=0.26.0",
        "django-filter>=23.3",
        "gunicorn>=21.0.0",
        "whitenoise>=6.6.0"
    ]
    
    for package in packages:
        if not run_command(f"pip install '{package}'", f"Installing {package.split('>=')[0]}"):
            print(f"❌ Failed to install {package}")
            return False
    
    return True

def create_env_file():
    """Create .env file with default settings."""
    if os.path.exists('.env'):
        print("✅ .env file already exists")
        return True
    
    env_content = """# Django Development Settings
SECRET_KEY=django-insecure-change-this-in-production-abc123def456ghi789jkl
DEBUG=True
DJANGO_SETTINGS_MODULE=genfree_backend.settings.development

# Database (SQLite for development)
USE_POSTGRES=False

# Flutterwave (Add your keys here)
FLUTTERWAVE_SECRET_KEY=FLWSECK_TEST-your-secret-key-here
FLUTTERWAVE_PUBLIC_KEY=FLWPUBK_TEST-your-public-key-here
FLUTTERWAVE_WEBHOOK_SECRET=your-webhook-secret-here

# Email (Optional for development)
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=noreply@genfree.org

# Redis (Optional - will use dummy cache if not available)
REDIS_URL=redis://localhost:6379
"""
    
    try:
        with open('.env', 'w') as f:
            f.write(env_content)
        print("✅ Created .env file with development settings")
        return True
    except Exception as e:
        print(f"❌ Error creating .env file: {e}")
        return False

def run_django_setup():
    """Run Django migrations and setup."""
    print("🗄️  Setting up Django database...")
    
    commands = [
        ("python manage.py makemigrations", "Creating migrations"),
        ("python manage.py migrate", "Applying migrations"),
        ("python manage.py collectstatic --noinput", "Collecting static files"),
    ]
    
    for command, description in commands:
        if not run_command(command, description):
            print(f"❌ Failed: {description}")
            return False
    
    return True

def create_superuser():
    """Prompt to create superuser."""
    print("👤 Creating superuser account...")
    print("Please enter details for admin account:")
    
    try:
        username = input("Username: ").strip()
        email = input("Email: ").strip()
        
        if not username or not email:
            print("❌ Username and email are required")
            return False
        
        # Create superuser with environment variable to avoid interactive prompt
        env = os.environ.copy()
        env['DJANGO_SUPERUSER_USERNAME'] = username
        env['DJANGO_SUPERUSER_EMAIL'] = email
        env['DJANGO_SUPERUSER_PASSWORD'] = 'admin123'  # Default password
        
        result = subprocess.run(
            ['python', 'manage.py', 'createsuperuser', '--noinput'],
            env=env,
            capture_output=True,
            text=True
        )
        
        if result.returncode == 0:
            print(f"✅ Superuser '{username}' created successfully")
            print("🔑 Default password: admin123 (change after first login)")
            return True
        else:
            print(f"❌ Error creating superuser: {result.stderr}")
            # Try interactive creation
            return run_command("python manage.py createsuperuser", "Creating superuser (interactive)")
    
    except KeyboardInterrupt:
        print("\n❌ Superuser creation cancelled")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_server():
    """Test if Django server can start."""
    print("🧪 Testing Django server...")
    
    # Just check if it can start without actually running
    return run_command("python manage.py check", "Django system check")

def main():
    """Main setup function."""
    print("🚀 GenFree Network Backend Quick Setup")
    print("=" * 45)
    
    # Check if we're in the right directory
    if not os.path.exists('manage.py'):
        print("❌ Error: manage.py not found. Please run this script from the backend directory.")
        return 1
    
    # Check Python version
    if not check_python_version():
        return 1
    
    # Upgrade pip first
    if not run_command("python -m pip install --upgrade pip", "Upgrading pip"):
        print("⚠️  Pip upgrade failed, continuing anyway...")
    
    # Install packages
    if not install_minimal_packages():
        print("❌ Package installation failed")
        return 1
    
    # Create environment file
    if not create_env_file():
        print("❌ Environment file creation failed")
        return 1
    
    # Run Django setup
    if not run_django_setup():
        print("❌ Django setup failed")
        return 1
    
    # Create superuser (optional)
    response = input("\n👤 Create superuser account? (Y/n): ").strip().lower()
    if response != 'n':
        create_superuser()
    
    # Test server
    if not test_server():
        print("❌ Django configuration test failed")
        return 1
    
    # Success!
    print("\n" + "=" * 50)
    print("🎉 SETUP COMPLETE!")
    print("=" * 50)
    print("\n✅ Next steps:")
    print("1. Start the server: python manage.py runserver")
    print("2. Open: http://localhost:8000/api/")
    print("3. Admin panel: http://localhost:8000/admin/")
    print("4. API docs: http://localhost:8000/api/schema/swagger-ui/")
    
    print("\n🔧 Configuration:")
    print("- Database: SQLite (development)")
    print("- Debug mode: Enabled") 
    print("- Environment: Development")
    
    print("\n💡 Tips:")
    print("- Add your Flutterwave keys to .env file")
    print("- Update SECRET_KEY for production")
    print("- Check SETUP_TROUBLESHOOTING.md for help")
    
    print("\n" + "=" * 50)
    return 0

if __name__ == "__main__":
    try:
        exit_code = main()
        sys.exit(exit_code)
    except KeyboardInterrupt:
        print("\n❌ Setup interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        sys.exit(1)