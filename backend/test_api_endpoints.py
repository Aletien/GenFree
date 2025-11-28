#!/usr/bin/env python
"""
Script to test API endpoints for frontend integration.
"""
import requests
import json
from datetime import datetime, timedelta

# Base API URL
BASE_URL = 'http://localhost:8000/api'

def test_endpoint(method, endpoint, data=None, headers=None):
    """Test an API endpoint and return response."""
    url = f"{BASE_URL}{endpoint}"
    
    try:
        if method.upper() == 'GET':
            response = requests.get(url, headers=headers)
        elif method.upper() == 'POST':
            response = requests.post(url, json=data, headers=headers)
        elif method.upper() == 'PUT':
            response = requests.put(url, json=data, headers=headers)
        elif method.upper() == 'DELETE':
            response = requests.delete(url, headers=headers)
        
        return {
            'status_code': response.status_code,
            'success': 200 <= response.status_code < 300,
            'data': response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text
        }
    except Exception as e:
        return {
            'status_code': 0,
            'success': False,
            'error': str(e)
        }

def run_api_tests():
    """Run comprehensive API endpoint tests."""
    
    print("🔍 Testing GenFree Network API Endpoints")
    print("=" * 50)
    
    # Test data
    test_results = []
    
    # Health check endpoints
    endpoints_to_test = [
        # Health and Info
        ('GET', '/health/', None, 'Health Check'),
        ('GET', '/health/info/', None, 'API Info'),
        
        # Authentication
        ('GET', '/auth/profile/', None, 'User Profile (requires auth)'),
        
        # Events
        ('GET', '/events/events/', None, 'List Events'),
        ('GET', '/events/categories/', None, 'Event Categories'),
        ('GET', '/events/speakers/', None, 'Speakers'),
        ('GET', '/events/events/stats/', None, 'Event Statistics'),
        ('GET', '/events/events/calendar/', None, 'Event Calendar'),
        
        # Donations
        ('GET', '/donations/campaigns/', None, 'Donation Campaigns'),
        ('GET', '/donations/donations/', None, 'List Donations'),
        ('GET', '/donations/donations/stats/', None, 'Donation Statistics'),
        
        # Livestream
        ('GET', '/livestream/streams/', None, 'Live Streams'),
        ('GET', '/livestream/streams/status/', None, 'Live Stream Status'),
        ('GET', '/livestream/streams/analytics/', None, 'Stream Analytics'),
        
        # Chat
        ('GET', '/chat/rooms/', None, 'Chat Rooms'),
        ('GET', '/chat/messages/', None, 'Chat Messages'),
        ('GET', '/chat/messages/stats/', None, 'Chat Statistics'),
        
        # Analytics
        ('GET', '/analytics/events/', None, 'Analytics Events'),
        ('GET', '/analytics/events/dashboard/', None, 'Analytics Dashboard'),
        
        # CMS
        ('GET', '/cms/pages/', None, 'CMS Pages'),
        ('GET', '/cms/posts/', None, 'Blog Posts'),
        ('GET', '/cms/categories/', None, 'Content Categories'),
        ('GET', '/cms/site-info/', None, 'Site Information'),
        ('GET', '/cms/search/?q=test', None, 'Content Search'),
    ]
    
    print("Testing endpoints...")
    print()
    
    for method, endpoint, data, description in endpoints_to_test:
        result = test_endpoint(method, endpoint, data)
        test_results.append((description, result))
        
        status_icon = "✅" if result['success'] else "❌"
        print(f"{status_icon} {description}")
        print(f"   {method} {endpoint}")
        print(f"   Status: {result['status_code']}")
        
        if not result['success']:
            if 'error' in result:
                print(f"   Error: {result['error']}")
            elif 'data' in result:
                print(f"   Response: {str(result['data'])[:100]}...")
        
        print()
    
    # Summary
    successful = sum(1 for _, result in test_results if result['success'])
    total = len(test_results)
    
    print("=" * 50)
    print(f"📊 Test Summary: {successful}/{total} endpoints successful")
    
    if successful == total:
        print("🎉 All endpoints are working correctly!")
    else:
        print("⚠️  Some endpoints need attention. Check the server is running and migrations are applied.")
    
    return test_results

def test_frontend_specific_endpoints():
    """Test specific endpoints that frontend components expect."""
    
    print("\n🖥️  Testing Frontend-Specific Integrations")
    print("=" * 50)
    
    frontend_tests = [
        # LiveStream.jsx expectations
        {
            'component': 'LiveStream.jsx',
            'endpoints': [
                ('GET', '/livestream/streams/status/'),
                ('GET', '/livestream/streams/analytics/'),
            ]
        },
        
        # ChatSystem.jsx expectations
        {
            'component': 'ChatSystem.jsx', 
            'endpoints': [
                ('GET', '/chat/messages/?limit=50'),
                ('GET', '/chat/rooms/'),
            ]
        },
        
        # DonationSystem.jsx expectations
        {
            'component': 'DonationSystem.jsx',
            'endpoints': [
                ('GET', '/donations/campaigns/'),
                ('GET', '/donations/donations/stats/'),
                ('POST', '/donations/donations/initialize_payment/'),
            ]
        },
        
        # AnalyticsTracker.jsx expectations
        {
            'component': 'AnalyticsTracker.jsx',
            'endpoints': [
                ('POST', '/analytics/track/event/'),
                ('POST', '/analytics/track/pageview/'),
                ('GET', '/analytics/events/dashboard/'),
            ]
        },
        
        # Events functionality expectations
        {
            'component': 'Events Pages',
            'endpoints': [
                ('GET', '/events/events/'),
                ('GET', '/events/events/calendar/'),
                ('POST', '/events/events/{slug}/register/'),
            ]
        },
    ]
    
    for test_group in frontend_tests:
        print(f"\n📱 {test_group['component']}")
        print("-" * 30)
        
        for method, endpoint in test_group['endpoints']:
            # Skip POST endpoints that require data for now
            if method == 'POST':
                print(f"⏩ {method} {endpoint} (Skipped - requires data)")
                continue
                
            result = test_endpoint(method, endpoint.replace('{slug}', 'test'))
            status_icon = "✅" if result['success'] else "❌"
            print(f"{status_icon} {method} {endpoint} - {result['status_code']}")

if __name__ == "__main__":
    print("Starting API endpoint tests...\n")
    
    # Run basic endpoint tests
    run_api_tests()
    
    # Run frontend-specific tests
    test_frontend_specific_endpoints()
    
    print("\n" + "=" * 50)
    print("🏁 API testing complete!")
    print("\nNote: Make sure the Django server is running on localhost:8000")
    print("Run: python manage.py runserver")