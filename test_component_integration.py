#!/usr/bin/env python
"""
Component-specific integration tests
Tests each React component against its backend endpoints
"""

import requests
import json
import time
from datetime import datetime

class ComponentIntegrationTester:
    def __init__(self, base_url='http://localhost:8000/api'):
        self.base_url = base_url
        self.auth_token = None
        
    def authenticate(self):
        """Quick authentication for testing"""
        login_data = {
            "email": "admin@genfree.org",
            "password": "admin123"
        }
        
        try:
            response = requests.post(f"{self.base_url}/auth/login/", json=login_data)
            if response.status_code == 200:
                data = response.json()
                if 'tokens' in data:
                    self.auth_token = data['tokens']['access']
                    return True
        except Exception as e:
            print(f"Auth failed: {e}")
        return False
    
    def get_headers(self):
        headers = {'Content-Type': 'application/json'}
        if self.auth_token:
            headers['Authorization'] = f'Bearer {self.auth_token}'
        return headers

    def test_livestream_jsx(self):
        """Test LiveStream.jsx component expectations"""
        print("\n🔴 Testing LiveStream.jsx Component")
        print("-" * 40)
        
        # Test 1: Live Status (required by LiveStream.jsx)
        try:
            response = requests.get(f"{self.base_url}/livestream/streams/status/")
            if response.status_code == 200:
                data = response.json()
                required_fields = ['is_live', 'current_stream', 'upcoming_streams', 'viewer_count']
                missing_fields = [field for field in required_fields if field not in data]
                
                if not missing_fields:
                    print("✅ Live Status API - All required fields present")
                else:
                    print(f"❌ Live Status API - Missing fields: {missing_fields}")
            else:
                print(f"❌ Live Status API - HTTP {response.status_code}")
        except Exception as e:
            print(f"❌ Live Status API - Error: {e}")
        
        # Test 2: Stream Analytics (for viewer insights)
        try:
            response = requests.get(f"{self.base_url}/livestream/streams/analytics/")
            if response.status_code == 200:
                print("✅ Stream Analytics API - Working")
            else:
                print(f"❌ Stream Analytics API - HTTP {response.status_code}")
        except Exception as e:
            print(f"❌ Stream Analytics API - Error: {e}")

    def test_chat_system_jsx(self):
        """Test ChatSystem.jsx component expectations"""
        print("\n💬 Testing ChatSystem.jsx Component")
        print("-" * 40)
        
        # Test 1: Chat Rooms
        try:
            response = requests.get(f"{self.base_url}/chat/rooms/")
            if response.status_code == 200:
                rooms = response.json()
                print(f"✅ Chat Rooms API - {len(rooms)} rooms available")
            else:
                print(f"❌ Chat Rooms API - HTTP {response.status_code}")
        except Exception as e:
            print(f"❌ Chat Rooms API - Error: {e}")
        
        # Test 2: Messages
        try:
            response = requests.get(f"{self.base_url}/chat/messages/?limit=50")
            if response.status_code == 200:
                print("✅ Chat Messages API - Working")
            else:
                print(f"❌ Chat Messages API - HTTP {response.status_code}")
        except Exception as e:
            print(f"❌ Chat Messages API - Error: {e}")
        
        # Test 3: Send Message (requires auth)
        if self.auth_token:
            try:
                message_data = {
                    "content": "Integration test message",
                    "message_type": "text"
                }
                response = requests.post(f"{self.base_url}/chat/messages/", 
                                       json=message_data, headers=self.get_headers())
                if response.status_code in [200, 201]:
                    print("✅ Send Message API - Working")
                else:
                    print(f"❌ Send Message API - HTTP {response.status_code}")
            except Exception as e:
                print(f"❌ Send Message API - Error: {e}")

    def test_donation_system_jsx(self):
        """Test DonationSystem.jsx component expectations"""
        print("\n💰 Testing DonationSystem.jsx Component")
        print("-" * 40)
        
        # Test 1: Donation Campaigns
        try:
            response = requests.get(f"{self.base_url}/donations/campaigns/")
            if response.status_code == 200:
                campaigns = response.json()
                print(f"✅ Donation Campaigns API - {len(campaigns)} campaigns")
            else:
                print(f"❌ Donation Campaigns API - HTTP {response.status_code}")
        except Exception as e:
            print(f"❌ Donation Campaigns API - Error: {e}")
        
        # Test 2: Donation Statistics
        try:
            response = requests.get(f"{self.base_url}/donations/donations/stats/")
            if response.status_code == 200:
                data = response.json()
                required_fields = ['total_raised', 'total_donations', 'average_donation']
                missing_fields = [field for field in required_fields if field not in data]
                
                if not missing_fields:
                    print("✅ Donation Stats API - All required fields present")
                else:
                    print(f"❌ Donation Stats API - Missing fields: {missing_fields}")
            else:
                print(f"❌ Donation Stats API - HTTP {response.status_code}")
        except Exception as e:
            print(f"❌ Donation Stats API - Error: {e}")
        
        # Test 3: Payment Initialization
        try:
            payment_data = {
                "amount": 10000,
                "currency": "UGX",
                "donor_name": "Test User",
                "donor_email": "test@example.com"
            }
            response = requests.post(f"{self.base_url}/donations/donations/initialize_payment/",
                                   json=payment_data)
            if response.status_code in [200, 201]:
                print("✅ Payment Initialization API - Working")
            else:
                print(f"❌ Payment Initialization API - HTTP {response.status_code}")
        except Exception as e:
            print(f"❌ Payment Initialization API - Error: {e}")

    def test_analytics_tracker_jsx(self):
        """Test AnalyticsTracker.jsx component expectations"""
        print("\n📊 Testing AnalyticsTracker.jsx Component")
        print("-" * 40)
        
        # Test 1: Event Tracking
        try:
            event_data = {
                "event_type": "page_view",
                "event_name": "Test Page View",
                "event_category": "testing",
                "page_url": "http://localhost:3000/test"
            }
            response = requests.post(f"{self.base_url}/analytics/track/event/",
                                   json=event_data)
            if response.status_code in [200, 201]:
                print("✅ Event Tracking API - Working")
            else:
                print(f"❌ Event Tracking API - HTTP {response.status_code}")
        except Exception as e:
            print(f"❌ Event Tracking API - Error: {e}")
        
        # Test 2: Page View Tracking
        try:
            pageview_data = {
                "url": "http://localhost:3000/test",
                "title": "Test Page"
            }
            response = requests.post(f"{self.base_url}/analytics/track/pageview/",
                                   json=pageview_data)
            if response.status_code in [200, 201]:
                print("✅ Page View Tracking API - Working")
            else:
                print(f"❌ Page View Tracking API - HTTP {response.status_code}")
        except Exception as e:
            print(f"❌ Page View Tracking API - Error: {e}")
        
        # Test 3: Dashboard Data
        try:
            response = requests.get(f"{self.base_url}/analytics/events/dashboard/")
            if response.status_code == 200:
                print("✅ Analytics Dashboard API - Working")
            else:
                print(f"❌ Analytics Dashboard API - HTTP {response.status_code}")
        except Exception as e:
            print(f"❌ Analytics Dashboard API - Error: {e}")

    def test_events_pages(self):
        """Test Events-related pages"""
        print("\n🎪 Testing Events Pages")
        print("-" * 40)
        
        # Test 1: Events List
        try:
            response = requests.get(f"{self.base_url}/events/events/")
            if response.status_code == 200:
                events = response.json()
                print(f"✅ Events List API - {len(events)} events")
            else:
                print(f"❌ Events List API - HTTP {response.status_code}")
        except Exception as e:
            print(f"❌ Events List API - Error: {e}")
        
        # Test 2: Event Categories
        try:
            response = requests.get(f"{self.base_url}/events/categories/")
            if response.status_code == 200:
                categories = response.json()
                print(f"✅ Event Categories API - {len(categories)} categories")
            else:
                print(f"❌ Event Categories API - HTTP {response.status_code}")
        except Exception as e:
            print(f"❌ Event Categories API - Error: {e}")
        
        # Test 3: Event Calendar
        try:
            now = datetime.now()
            response = requests.get(f"{self.base_url}/events/events/calendar/?year={now.year}&month={now.month}")
            if response.status_code == 200:
                print("✅ Event Calendar API - Working")
            else:
                print(f"❌ Event Calendar API - HTTP {response.status_code}")
        except Exception as e:
            print(f"❌ Event Calendar API - Error: {e}")

    def test_general_components(self):
        """Test general CMS and site components"""
        print("\n🏗️ Testing General Components")
        print("-" * 40)
        
        # Test 1: Site Information
        try:
            response = requests.get(f"{self.base_url}/cms/site-info/")
            if response.status_code == 200:
                data = response.json()
                required_fields = ['site_title', 'features']
                missing_fields = [field for field in required_fields if field not in data]
                
                if not missing_fields:
                    print("✅ Site Info API - All required fields present")
                else:
                    print(f"❌ Site Info API - Missing fields: {missing_fields}")
            else:
                print(f"❌ Site Info API - HTTP {response.status_code}")
        except Exception as e:
            print(f"❌ Site Info API - Error: {e}")
        
        # Test 2: Health Check
        try:
            response = requests.get(f"{self.base_url}/../health/")
            if response.status_code == 200:
                data = response.json()
                if data.get('status') == 'healthy':
                    print("✅ Health Check API - Healthy")
                else:
                    print("❌ Health Check API - Not healthy")
            else:
                print(f"❌ Health Check API - HTTP {response.status_code}")
        except Exception as e:
            print(f"❌ Health Check API - Error: {e}")

    def run_component_tests(self):
        """Run all component integration tests"""
        print("🧪 Component Integration Testing")
        print("=" * 50)
        print("Testing React components against backend APIs...")
        
        # Try to authenticate
        auth_success = self.authenticate()
        if auth_success:
            print("✅ Authentication successful")
        else:
            print("⚠️  Authentication failed - some tests may not work")
        
        # Run all component tests
        self.test_livestream_jsx()
        self.test_chat_system_jsx()
        self.test_donation_system_jsx()
        self.test_analytics_tracker_jsx()
        self.test_events_pages()
        self.test_general_components()
        
        print("\n" + "=" * 50)
        print("🏁 Component integration testing complete!")
        print("\nNext steps:")
        print("1. Fix any failed API endpoints")
        print("2. Run frontend development server")
        print("3. Test in browser with real user interactions")

if __name__ == "__main__":
    import sys
    api_url = sys.argv[1] if len(sys.argv) > 1 else 'http://localhost:8000/api'
    
    tester = ComponentIntegrationTester(api_url)
    tester.run_component_tests()