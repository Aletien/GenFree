#!/usr/bin/env python
"""
Script to create Django migrations for all new apps.
"""
import os
import sys
import django
from pathlib import Path

# Add the backend directory to Python path
backend_dir = Path(__file__).resolve().parent
sys.path.insert(0, str(backend_dir))

# Set Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'genfree_backend.settings.development')

try:
    django.setup()
    
    from django.core.management import execute_from_command_line
    
    # List of new apps to create migrations for
    new_apps = [
        'livestream',
        'chat', 
        'analytics',
        'cms',
        'common',
        'donations',  # Also recreate for new models
        'events'      # Also recreate for new models
    ]
    
    print("Creating migrations for all apps...")
    
    for app in new_apps:
        try:
            print(f"\n📝 Creating migrations for {app}...")
            execute_from_command_line(['manage.py', 'makemigrations', app])
            print(f"✅ Migrations created for {app}")
        except Exception as e:
            print(f"❌ Error creating migrations for {app}: {e}")
    
    print("\n🔄 Creating general migrations...")
    try:
        execute_from_command_line(['manage.py', 'makemigrations'])
        print("✅ General migrations created")
    except Exception as e:
        print(f"❌ Error creating general migrations: {e}")
    
    print("\n✅ All migrations created successfully!")
    print("\nNext steps:")
    print("1. Run: python manage.py migrate")
    print("2. Create superuser: python manage.py createsuperuser")
    
except ImportError as e:
    print(f"❌ Django import error: {e}")
    print("Make sure Django is installed and all dependencies are available")
except Exception as e:
    print(f"❌ Unexpected error: {e}")