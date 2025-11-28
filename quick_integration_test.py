#!/usr/bin/env python
"""
Quick Integration Test - Fast verification of key components
Run this for a quick health check of frontend-backend integration
"""

import requests
import json
import sys
from datetime import datetime

def quick_test():
    """Quick test of critical integration points"""
    
    BASE_URL = 'http://localhost:8000/api'
    results = {'passed': 0, 'failed': 0, 'tests': []}
    
    def test(name, condition, details=""):
        if condition:
            print(f"✅ {name}")
            results['passed'] += 1
        else:
            print(f"❌ {name} - {details}")
            results['failed'] += 1
        results['tests'].append({'name': name, 'passed': condition, 'details': details})
    
    print("🚀 Quick Integration Test")
    print("=" * 30)
    
    # Test 1: Backend Health
    try:
        response = requests.get(f"{BASE_URL}/../health/", timeout=5)
        test("Backend Health", response.status_code == 200, f"HTTP {response.status_code}")
    except Exception as e:
        test("Backend Health", False, str(e))
    
    # Test 2: API Info
    try:
        response = requests.get(f"{BASE_URL}/../health/info/", timeout=5)
        test("API Info", response.status_code == 200, f"HTTP {response.status_code}")
    except Exception as e:
        test("API Info", False, str(e))
    
    # Test 3: LiveStream Status (Critical for LiveStream.jsx)
    try:
        response = requests.get(f"{BASE_URL}/livestream/streams/status/", timeout=5)
        data = response.json() if response.status_code == 200 else {}
        has_required = 'is_live' in data and 'viewer_count' in data
        test("LiveStream Status", response.status_code == 200 and has_required, 
             "Missing required fields" if response.status_code == 200 and not has_required else f"HTTP {response.status_code}")
    except Exception as e:
        test("LiveStream Status", False, str(e))
    
    # Test 4: Chat Rooms (Critical for ChatSystem.jsx)
    try:
        response = requests.get(f"{BASE_URL}/chat/rooms/", timeout=5)
        test("Chat Rooms", response.status_code == 200, f"HTTP {response.status_code}")
    except Exception as e:
        test("Chat Rooms", False, str(e))
    
    # Test 5: Donation Campaigns (Critical for DonationSystem.jsx)
    try:
        response = requests.get(f"{BASE_URL}/donations/campaigns/", timeout=5)
        test("Donation Campaigns", response.status_code == 200, f"HTTP {response.status_code}")
    except Exception as e:
        test("Donation Campaigns", False, str(e))
    
    # Test 6: Events List (Critical for Events pages)
    try:
        response = requests.get(f"{BASE_URL}/events/events/", timeout=5)
        test("Events List", response.status_code == 200, f"HTTP {response.status_code}")
    except Exception as e:
        test("Events List", False, str(e))
    
    # Test 7: Analytics Tracking (Critical for AnalyticsTracker.jsx)
    try:
        test_data = {
            "event_type": "page_view",
            "event_name": "Quick Test",
            "page_url": "http://localhost:3000/test"
        }
        response = requests.post(f"{BASE_URL}/analytics/track/event/", 
                               json=test_data, timeout=5)
        test("Analytics Tracking", response.status_code in [200, 201], f"HTTP {response.status_code}")
    except Exception as e:
        test("Analytics Tracking", False, str(e))
    
    # Test 8: Site Info (Critical for general components)
    try:
        response = requests.get(f"{BASE_URL}/cms/site-info/", timeout=5)
        test("Site Info", response.status_code == 200, f"HTTP {response.status_code}")
    except Exception as e:
        test("Site Info", False, str(e))
    
    # Summary
    total = results['passed'] + results['failed']
    success_rate = (results['passed'] / total * 100) if total > 0 else 0
    
    print("\n" + "=" * 30)
    print("📊 QUICK TEST SUMMARY")
    print(f"✅ Passed: {results['passed']}")
    print(f"❌ Failed: {results['failed']}")
    print(f"📈 Success: {success_rate:.1f}%")
    
    if success_rate == 100:
        print("🎉 ALL CRITICAL ENDPOINTS WORKING!")
        print("✨ Ready for full integration testing!")
        return True
    elif success_rate >= 75:
        print("🟡 MOSTLY WORKING! Some issues to fix.")
        return False
    else:
        print("🔴 CRITICAL ISSUES FOUND!")
        print("Fix these before running full integration tests:")
        for test in results['tests']:
            if not test['passed']:
                print(f"   - {test['name']}: {test['details']}")
        return False

def check_services():
    """Check if required services are running"""
    print("\n🔍 Checking Required Services")
    print("-" * 30)
    
    # Check Django
    try:
        response = requests.get('http://localhost:8000/health/', timeout=3)
        if response.status_code == 200:
            print("✅ Django Backend - Running")
        else:
            print(f"❌ Django Backend - HTTP {response.status_code}")
            return False
    except Exception:
        print("❌ Django Backend - Not running")
        print("   Start with: python manage.py runserver")
        return False
    
    # Check Redis (for WebSockets)
    try:
        import redis
        r = redis.Redis(host='localhost', port=6379, db=0)
        r.ping()
        print("✅ Redis - Running")
    except Exception:
        print("⚠️  Redis - Not running (WebSocket features will not work)")
        print("   Start with: redis-server")
    
    # Check Frontend (if accessible)
    try:
        response = requests.get('http://localhost:3000', timeout=3)
        if response.status_code == 200:
            print("✅ Frontend - Running")
        else:
            print("⚠️  Frontend - May not be running")
    except Exception:
        print("⚠️  Frontend - Not accessible")
        print("   Start with: npm run dev")
    
    return True

if __name__ == "__main__":
    print("⚡ GenFree Network - Quick Integration Test")
    print("This will test critical backend endpoints needed by frontend components\n")
    
    # Check services first
    if not check_services():
        sys.exit(1)
    
    # Run quick tests
    success = quick_test()
    
    print("\n🎯 Next Steps:")
    if success:
        print("1. Run full integration tests: python test_frontend_integration.py")
        print("2. Test frontend in browser: http://localhost:3000")
        print("3. Verify all components work as expected")
    else:
        print("1. Fix failed endpoints")
        print("2. Ensure Django migrations are applied: python manage.py migrate")
        print("3. Check Django settings configuration")
        print("4. Re-run this quick test")
    
    sys.exit(0 if success else 1)