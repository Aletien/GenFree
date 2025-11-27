#!/usr/bin/env python3
"""
Setup script for GenFree Network Django Backend
"""

import os
import sys
import subprocess
import secrets
import string
from pathlib import Path

def run_command(command, description=""):
    """Run a shell command and handle errors."""
    print(f"⚡ {description}" if description else f"⚡ Running: {command}")
    
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        if result.stdout:
            print(f"✅ {result.stdout.strip()}")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Error: {e}")
        if e.stderr:
            print(f"   Details: {e.stderr.strip()}")
        return False

def generate_secret_key():
    """Generate a secure Django secret key."""
    alphabet = string.ascii_letters + string.digits + '!@#$%^&*(-_=+)'
    return ''.join(secrets.choice(alphabet) for i in range(50))

def create_env_file():
    """Create .env file from template."""
    env_example = Path('.env.example')
    env_file = Path('.env')
    
    if env_file.exists():
        response = input("📝 .env file already exists. Overwrite? (y/N): ")
        if response.lower() != 'y':
            return False
    
    if not env_example.exists():
        print("❌ .env.example file not found!")
        return False
    
    print("📝 Creating .env file...")
    
    # Read template
    with open(env_example, 'r') as f:
        content = f.read()
    
    # Replace placeholder values
    secret_key = generate_secret_key()
    content = content.replace('your-very-secure-secret-key-here-change-in-production', secret_key)
    
    # Write new .env file
    with open(env_file, 'w') as f:
        f.write(content)
    
    print(f"✅ Created .env file with secure secret key")
    return True

def install_dependencies():
    """Install Python dependencies."""
    print("📦 Installing Python dependencies...")
    
    # Check if virtual environment exists
    venv_path = Path('venv')
    if not venv_path.exists():
        print("🐍 Creating virtual environment...")
        if not run_command(f"{sys.executable} -m venv venv", "Creating virtual environment"):
            return False
    
    # Activate virtual environment and install dependencies
    if sys.platform.startswith('win'):
        pip_cmd = "venv\\Scripts\\pip"
        python_cmd = "venv\\Scripts\\python"
    else:
        pip_cmd = "venv/bin/pip"
        python_cmd = "venv/bin/python"
    
    commands = [
        (f"{pip_cmd} install --upgrade pip", "Upgrading pip"),
        (f"{pip_cmd} install -r requirements.txt", "Installing dependencies"),
    ]
    
    for cmd, desc in commands:
        if not run_command(cmd, desc):
            return False
    
    return True

def setup_database():
    """Set up the database."""
    print("🗄️  Setting up database...")
    
    if sys.platform.startswith('win'):
        python_cmd = "venv\\Scripts\\python"
    else:
        python_cmd = "venv/bin/python"
    
    commands = [
        (f"{python_cmd} manage.py makemigrations", "Creating migrations"),
        (f"{python_cmd} manage.py migrate", "Running migrations"),
    ]
    
    for cmd, desc in commands:
        if not run_command(cmd, desc):
            return False
    
    return True

def create_superuser():
    """Create Django superuser."""
    print("👤 Creating superuser...")
    
    if sys.platform.startswith('win'):
        python_cmd = "venv\\Scripts\\python"
    else:
        python_cmd = "venv/bin/python"
    
    print("Please provide superuser details:")
    email = input("Email: ")
    username = input("Username: ")
    
    if not email or not username:
        print("❌ Email and username are required!")
        return False
    
    cmd = f"{python_cmd} manage.py createsuperuser --email {email} --username {username}"
    return run_command(cmd, "Creating superuser")

def collect_static():
    """Collect static files."""
    print("📁 Collecting static files...")
    
    if sys.platform.startswith('win'):
        python_cmd = "venv\\Scripts\\python"
    else:
        python_cmd = "venv/bin/python"
    
    return run_command(f"{python_cmd} manage.py collectstatic --noinput", "Collecting static files")

def check_system_requirements():
    """Check if system has required software."""
    print("🔍 Checking system requirements...")
    
    requirements = [
        ("python3", "Python 3.8+ is required"),
        ("pip", "pip is required"),
    ]
    
    for cmd, error_msg in requirements:
        if not run_command(f"which {cmd} || where {cmd}", f"Checking {cmd}"):
            print(f"❌ {error_msg}")
            return False
    
    print("✅ System requirements satisfied")
    return True

def print_success_message():
    """Print setup completion message."""
    print("\n" + "="*60)
    print("🎉 GenFree Network Backend Setup Complete!")
    print("="*60)
    print("\n📋 Next Steps:")
    print("1. Update .env file with your actual API keys and settings")
    print("2. Start the development server:")
    
    if sys.platform.startswith('win'):
        print("   venv\\Scripts\\python manage.py runserver")
    else:
        print("   venv/bin/python manage.py runserver")
    
    print("\n3. Visit http://localhost:8000/admin/ to access admin panel")
    print("4. API documentation: http://localhost:8000/api/schema/swagger-ui/")
    print("\n🔗 Frontend Integration:")
    print("   Update your React app's API base URL to: http://localhost:8000/api/")
    print("\n📚 Documentation:")
    print("   Check README.md for detailed setup and deployment instructions")
    print("\n" + "="*60)

def main():
    """Main setup function."""
    print("🚀 GenFree Network Backend Setup")
    print("=" * 40)
    
    # Change to script directory
    script_dir = Path(__file__).parent.absolute()
    os.chdir(script_dir)
    
    # Step 1: Check system requirements
    if not check_system_requirements():
        sys.exit(1)
    
    # Step 2: Create environment file
    create_env_file()
    
    # Step 3: Install dependencies
    if not install_dependencies():
        print("❌ Failed to install dependencies")
        sys.exit(1)
    
    # Step 4: Setup database
    if not setup_database():
        print("❌ Failed to setup database")
        sys.exit(1)
    
    # Step 5: Create superuser (optional)
    response = input("\n👤 Create superuser account? (Y/n): ")
    if response.lower() != 'n':
        create_superuser()
    
    # Step 6: Collect static files
    collect_static()
    
    # Success message
    print_success_message()

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n❌ Setup interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Setup failed with error: {e}")
        sys.exit(1)