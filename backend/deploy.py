#!/usr/bin/env python3
"""
Deployment script for GenFree Network Django Backend
Supports multiple deployment platforms: Heroku, Railway, DigitalOcean, AWS
"""

import os
import sys
import subprocess
import json
from pathlib import Path

class DeploymentManager:
    """Manage deployment to various platforms."""
    
    def __init__(self):
        self.platforms = {
            'heroku': self.deploy_to_heroku,
            'railway': self.deploy_to_railway,
            'digitalocean': self.deploy_to_digitalocean,
            'aws': self.deploy_to_aws,
            'docker': self.create_docker_deployment,
        }
    
    def run_command(self, command, description=""):
        """Run a shell command and handle errors."""
        print(f"⚡ {description}" if description else f"⚡ Running: {command}")
        
        try:
            result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
            if result.stdout:
                print(f"✅ {result.stdout.strip()}")
            return True, result.stdout
        except subprocess.CalledProcessError as e:
            print(f"❌ Error: {e}")
            if e.stderr:
                print(f"   Details: {e.stderr.strip()}")
            return False, e.stderr
    
    def create_deployment_files(self):
        """Create common deployment files."""
        print("📝 Creating deployment files...")
        
        # Create Procfile for Heroku/Railway
        procfile_content = """web: gunicorn genfree_backend.wsgi --log-file -
worker: celery -A genfree_backend worker --loglevel=info
beat: celery -A genfree_backend beat --loglevel=info"""
        
        with open('Procfile', 'w') as f:
            f.write(procfile_content)
        
        # Create runtime.txt
        python_version = f"python-{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}"
        with open('runtime.txt', 'w') as f:
            f.write(python_version)
        
        # Create app.json for Heroku
        app_json = {
            "name": "GenFree Network Backend",
            "description": "Django backend for GenFree Network ministry platform",
            "image": "heroku/python",
            "repository": "https://github.com/your-username/genfree-network",
            "keywords": ["django", "ministry", "donation", "livestream"],
            "addons": [
                "heroku-postgresql:mini",
                "heroku-redis:mini"
            ],
            "env": {
                "SECRET_KEY": {
                    "description": "Django secret key",
                    "generator": "secret"
                },
                "DJANGO_SETTINGS_MODULE": {
                    "value": "genfree_backend.settings.production"
                },
                "FLUTTERWAVE_SECRET_KEY": {
                    "description": "Flutterwave secret key for payments"
                },
                "FLUTTERWAVE_PUBLIC_KEY": {
                    "description": "Flutterwave public key for payments"
                },
                "EMAIL_HOST_USER": {
                    "description": "SMTP email username"
                },
                "EMAIL_HOST_PASSWORD": {
                    "description": "SMTP email password"
                }
            },
            "scripts": {
                "postdeploy": "python manage.py migrate"
            }
        }
        
        with open('app.json', 'w') as f:
            json.dump(app_json, f, indent=2)
        
        print("✅ Deployment files created")
    
    def deploy_to_heroku(self):
        """Deploy to Heroku."""
        print("🚀 Deploying to Heroku...")
        
        # Check if Heroku CLI is installed
        success, _ = self.run_command("heroku --version", "Checking Heroku CLI")
        if not success:
            print("❌ Heroku CLI not found. Please install it from https://cli.heroku.com/")
            return False
        
        # Login to Heroku
        print("🔐 Please login to Heroku:")
        success, _ = self.run_command("heroku login", "Logging in to Heroku")
        if not success:
            return False
        
        # Create Heroku app
        app_name = input("Enter Heroku app name (or press Enter for auto-generated): ").strip()
        if app_name:
            cmd = f"heroku create {app_name}"
        else:
            cmd = "heroku create"
        
        success, output = self.run_command(cmd, "Creating Heroku app")
        if not success:
            return False
        
        # Set environment variables
        env_vars = [
            "DJANGO_SETTINGS_MODULE=genfree_backend.settings.production",
            "DEBUG=False",
        ]
        
        for var in env_vars:
            self.run_command(f"heroku config:set {var}", f"Setting {var.split('=')[0]}")
        
        # Add buildpacks
        self.run_command("heroku buildpacks:add heroku/python", "Adding Python buildpack")
        
        # Deploy
        self.run_command("git add .", "Adding files to git")
        self.run_command("git commit -m 'Deploy to Heroku'", "Committing changes")
        self.run_command("git push heroku main", "Deploying to Heroku")
        
        # Run migrations
        self.run_command("heroku run python manage.py migrate", "Running migrations")
        
        print("✅ Heroku deployment complete!")
        return True
    
    def deploy_to_railway(self):
        """Deploy to Railway."""
        print("🚀 Deploying to Railway...")
        
        # Check if Railway CLI is installed
        success, _ = self.run_command("railway --version", "Checking Railway CLI")
        if not success:
            print("❌ Railway CLI not found. Please install it: npm install -g @railway/cli")
            return False
        
        # Login to Railway
        success, _ = self.run_command("railway login", "Logging in to Railway")
        if not success:
            return False
        
        # Initialize project
        success, _ = self.run_command("railway init", "Initializing Railway project")
        if not success:
            return False
        
        # Add services
        self.run_command("railway add postgresql", "Adding PostgreSQL")
        self.run_command("railway add redis", "Adding Redis")
        
        # Deploy
        self.run_command("railway up", "Deploying to Railway")
        
        print("✅ Railway deployment complete!")
        return True
    
    def deploy_to_digitalocean(self):
        """Deploy to DigitalOcean App Platform."""
        print("🚀 Setting up DigitalOcean App Platform deployment...")
        
        app_spec = {
            "name": "genfree-network-backend",
            "services": [
                {
                    "name": "web",
                    "source_dir": "/",
                    "github": {
                        "repo": "your-username/genfree-network",
                        "branch": "main"
                    },
                    "run_command": "gunicorn genfree_backend.wsgi --log-file -",
                    "environment_slug": "python",
                    "instance_count": 1,
                    "instance_size_slug": "basic-xxs",
                    "http_port": 8080,
                    "routes": [{"path": "/"}]
                }
            ],
            "databases": [
                {
                    "name": "db",
                    "engine": "PG",
                    "version": "14"
                }
            ],
            "envs": [
                {"key": "DJANGO_SETTINGS_MODULE", "value": "genfree_backend.settings.production"},
                {"key": "DEBUG", "value": "False"}
            ]
        }
        
        with open('.do/app.yaml', 'w') as f:
            json.dump(app_spec, f, indent=2)
        
        print("✅ DigitalOcean app spec created at .do/app.yaml")
        print("📋 Next steps:")
        print("1. Go to https://cloud.digitalocean.com/apps")
        print("2. Create new app from GitHub")
        print("3. Use the generated app.yaml file")
        return True
    
    def deploy_to_aws(self):
        """Deploy to AWS Elastic Beanstalk."""
        print("🚀 Setting up AWS Elastic Beanstalk deployment...")
        
        # Create .ebextensions directory
        os.makedirs('.ebextensions', exist_ok=True)
        
        # Create Django configuration
        django_config = """option_settings:
  aws:elasticbeanstalk:container:python:
    WSGIPath: genfree_backend.wsgi:application
  aws:elasticbeanstalk:application:environment:
    DJANGO_SETTINGS_MODULE: genfree_backend.settings.production
    DEBUG: False
  aws:elasticbeanstalk:container:python:staticfiles:
    "/static/": "staticfiles/"
"""
        
        with open('.ebextensions/01_django.config', 'w') as f:
            f.write(django_config)
        
        print("✅ AWS Elastic Beanstalk configuration created")
        print("📋 Next steps:")
        print("1. Install EB CLI: pip install awsebcli")
        print("2. Initialize: eb init")
        print("3. Create environment: eb create")
        print("4. Deploy: eb deploy")
        return True
    
    def create_docker_deployment(self):
        """Create Docker deployment files."""
        print("🐳 Creating Docker deployment...")
        
        # Dockerfile
        dockerfile = """FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set work directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \\
    postgresql-client \\
    build-essential \\
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Copy project
COPY . /app/

# Collect static files
RUN python manage.py collectstatic --noinput

# Run the application
CMD ["gunicorn", "genfree_backend.wsgi:application", "--bind", "0.0.0.0:8000"]
"""
        
        with open('Dockerfile', 'w') as f:
            f.write(dockerfile)
        
        # Docker Compose
        docker_compose = """version: '3.8'

services:
  web:
    build: .
    command: gunicorn genfree_backend.wsgi:application --bind 0.0.0.0:8000
    volumes:
      - .:/app
    ports:
      - "8000:8000"
    depends_on:
      - db
      - redis
    environment:
      - DJANGO_SETTINGS_MODULE=genfree_backend.settings.production
      - DATABASE_URL=postgresql://postgres:password@db:5432/genfree_db
      - REDIS_URL=redis://redis:6379
    
  db:
    image: postgres:14
    environment:
      POSTGRES_DB: genfree_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data/
    
  redis:
    image: redis:7-alpine
    
  worker:
    build: .
    command: celery -A genfree_backend worker --loglevel=info
    volumes:
      - .:/app
    depends_on:
      - db
      - redis
    environment:
      - DJANGO_SETTINGS_MODULE=genfree_backend.settings.production
      - DATABASE_URL=postgresql://postgres:password@db:5432/genfree_db
      - REDIS_URL=redis://redis:6379

volumes:
  postgres_data:
"""
        
        with open('docker-compose.yml', 'w') as f:
            f.write(docker_compose)
        
        # .dockerignore
        dockerignore = """__pycache__
*.pyc
*.pyo
*.pyd
.git
.gitignore
README.md
Dockerfile
.dockerignore
.env
venv/
.venv/
"""
        
        with open('.dockerignore', 'w') as f:
            f.write(dockerignore)
        
        print("✅ Docker deployment files created")
        print("📋 Usage:")
        print("1. Build and run: docker-compose up --build")
        print("2. Run migrations: docker-compose exec web python manage.py migrate")
        print("3. Create superuser: docker-compose exec web python manage.py createsuperuser")
        return True
    
    def main(self):
        """Main deployment function."""
        print("🚀 GenFree Network Backend Deployment")
        print("=" * 50)
        
        # Change to script directory
        script_dir = Path(__file__).parent.absolute()
        os.chdir(script_dir)
        
        # Create common deployment files
        self.create_deployment_files()
        
        # Show platform options
        print("\n📋 Available deployment platforms:")
        for i, platform in enumerate(self.platforms.keys(), 1):
            print(f"{i}. {platform.title()}")
        
        while True:
            try:
                choice = input(f"\nSelect deployment platform (1-{len(self.platforms)}): ").strip()
                choice_idx = int(choice) - 1
                
                if 0 <= choice_idx < len(self.platforms):
                    platform = list(self.platforms.keys())[choice_idx]
                    print(f"\n🎯 Selected: {platform.title()}")
                    
                    success = self.platforms[platform]()
                    
                    if success:
                        print(f"\n🎉 {platform.title()} deployment setup complete!")
                    else:
                        print(f"\n❌ {platform.title()} deployment failed!")
                    
                    break
                else:
                    print("❌ Invalid choice. Please try again.")
            
            except (ValueError, KeyboardInterrupt):
                print("\n❌ Deployment cancelled")
                break

if __name__ == "__main__":
    manager = DeploymentManager()
    manager.main()