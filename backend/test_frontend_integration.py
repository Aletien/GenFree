#!/usr/bin/env python
"""
Frontend Integration Testing Suite for GenFree Network
Tests all frontend components against their corresponding backend endpoints
"""

import requests
import json
import websocket
import threading
import time
from datetime import datetime
import uuid

class FrontendIntegrationTester:
    def __init__(self, api_base_url='http://localhost:8000/api', ws_base_url='ws://localhost:8000/ws'):
        self.api_base_url = api_base_url
        self.ws_base_url = ws_base_url
        self.auth_token = None
        self.test_results = []
        
    def log_test(self, component, test_name, success, details=""):
        """Log test result"""
        result = {
            'component': component,
            'test': test_name,
            'success': success,
            'details': details,
            'timestamp': datetime.now().isoformat()
        }
        self.test_results.append(result)
        
        status = "✅" if success else "❌"
        print(f"{status} {component} - {test_name}")
        if details and not success:
            print(f"   Details: {details}")
    
    def authenticate(self):
        """Create test user and authenticate"""
        print("\n🔐 Testing Authentication System...")
        
        # Test registration
        register_data = {
            "email": f"test_{uuid.uuid4().hex[:8]}@example.com",
            "password": "TestPassword123!",
            "first_name": "Test",
            "last_name": "User",
            "phone": "+256123456789"
        }
        
        try:
            response = requests.post(f"{self.api_base_url}/auth/register/", json=register_data)
            if response.status_code == 201:
                data = response.json()
                if 'tokens' in data:
                    self.auth_token = data['tokens']['access']
                    self.test_email = register_data['email']
                    self.log_test('Authentication', 'User Registration', True, "User created successfully")
                    return True
            
            # If registration fails, try login with existing user
            login_data = {
                "email": "test@example.com",
                "password": "testpassword"
            }
            response = requests.post(f"{self.api_base_url}/auth/login/", json=login_data)
            if response.status_code == 200:
                data = response.json()
                if 'tokens' in data:
                    self.auth_token = data['tokens']['access']
                    self.test_email = login_data['email']
                    self.log_test('Authentication', 'User Login', True, "Logged in successfully")
                    return True
                    
        except Exception as e:
            self.log_test('Authentication', 'Auth Flow', False, str(e))
            return False
        
        self.log_test('Authentication', 'Auth Flow', False, "Could not authenticate")
        return False
    
    def get_auth_headers(self):
        """Get authorization headers"""
        return {"Authorization": f"Bearer {self.auth_token}"} if self.auth_token else {}
    
    def test_livestream_component(self):
        """Test LiveStream.jsx integration"""
        print("\n📺 Testing LiveStream Component Integration...")
        
        # Test live status endpoint
        try:
            response = requests.get(f"{self.api_base_url}/livestream/streams/status/")
            if response.status_code == 200:
                data = response.json()
                expected_fields = ['is_live', 'current_stream', 'upcoming_streams', 'viewer_count']
                has_all_fields = all(field in data for field in expected_fields)
                self.log_test('LiveStream.jsx', 'Status Endpoint', has_all_fields, 
                            f"Response: {list(data.keys())}")
            else:
                self.log_test('LiveStream.jsx', 'Status Endpoint', False, 
                            f"Status code: {response.status_code}")
        except Exception as e:
            self.log_test('LiveStream.jsx', 'Status Endpoint', False, str(e))
        
        # Test analytics endpoint
        try:
            response = requests.get(f"{self.api_base_url}/livestream/streams/analytics/")
            if response.status_code == 200:
                data = response.json()
                expected_fields = ['total_streams', 'total_views', 'peak_viewers']
                has_analytics = any(field in data for field in expected_fields)
                self.log_test('LiveStream.jsx', 'Analytics Endpoint', has_analytics,
                            f"Analytics data available")
            else:
                self.log_test('LiveStream.jsx', 'Analytics Endpoint', False,
                            f"Status code: {response.status_code}")
        except Exception as e:
            self.log_test('LiveStream.jsx', 'Analytics Endpoint', False, str(e))
        
        # Test WebSocket connection
        self.test_livestream_websocket()
    
    def test_livestream_websocket(self):
        """Test livestream WebSocket connection"""
        try:
            ws_url = f"{self.ws_base_url}/stream/test-stream-id/"
            
            def on_message(ws, message):
                data = json.loads(message)
                if data.get('type') == 'connection_established':
                    self.log_test('LiveStream.jsx', 'WebSocket Connection', True,
                                "Connected and received initial data")
                    ws.close()
            
            def on_error(ws, error):
                self.log_test('LiveStream.jsx', 'WebSocket Connection', False, str(error))
            
            def on_open(ws):
                # Send heartbeat
                ws.send(json.dumps({'type': 'heartbeat'}))
            
            ws = websocket.WebSocketApp(ws_url,
                                      on_open=on_open,
                                      on_message=on_message,
                                      on_error=on_error)
            
            # Run WebSocket in separate thread with timeout
            def run_ws():
                ws.run_forever()
            
            ws_thread = threading.Thread(target=run_ws)
            ws_thread.daemon = True
            ws_thread.start()
            ws_thread.join(timeout=5)
            
        except Exception as e:
            self.log_test('LiveStream.jsx', 'WebSocket Connection', False, str(e))
    
    def test_chat_component(self):
        """Test ChatSystem.jsx integration"""
        print("\n💬 Testing Chat System Integration...")
        
        # Test chat rooms endpoint
        try:
            response = requests.get(f"{self.api_base_url}/chat/rooms/")
            if response.status_code == 200:
                self.log_test('ChatSystem.jsx', 'Chat Rooms Endpoint', True,
                            f"Retrieved {len(response.json())} rooms")
            else:
                self.log_test('ChatSystem.jsx', 'Chat Rooms Endpoint', False,
                            f"Status code: {response.status_code}")
        except Exception as e:
            self.log_test('ChatSystem.jsx', 'Chat Rooms Endpoint', False, str(e))
        
        # Test messages endpoint
        try:
            response = requests.get(f"{self.api_base_url}/chat/messages/?limit=10")
            if response.status_code == 200:
                self.log_test('ChatSystem.jsx', 'Messages Endpoint', True,
                            f"Retrieved messages successfully")
            else:
                self.log_test('ChatSystem.jsx', 'Messages Endpoint', False,
                            f"Status code: {response.status_code}")
        except Exception as e:
            self.log_test('ChatSystem.jsx', 'Messages Endpoint', False, str(e))
        
        # Test send message (requires auth)
        if self.auth_token:
            try:
                message_data = {
                    "content": "Test message from integration test",
                    "message_type": "text"
                }
                response = requests.post(f"{self.api_base_url}/chat/messages/", 
                                       json=message_data, headers=self.get_auth_headers())
                if response.status_code in [200, 201]:
                    self.log_test('ChatSystem.jsx', 'Send Message', True,
                                "Message sent successfully")
                else:
                    self.log_test('ChatSystem.jsx', 'Send Message', False,
                                f"Status code: {response.status_code}")
            except Exception as e:
                self.log_test('ChatSystem.jsx', 'Send Message', False, str(e))
        
        # Test chat stats
        try:
            response = requests.get(f"{self.api_base_url}/chat/messages/stats/")
            if response.status_code == 200:
                data = response.json()
                expected_fields = ['total_messages', 'active_users']
                has_stats = any(field in data for field in expected_fields)
                self.log_test('ChatSystem.jsx', 'Chat Statistics', has_stats,
                            "Stats endpoint working")
            else:
                self.log_test('ChatSystem.jsx', 'Chat Statistics', False,
                            f"Status code: {response.status_code}")
        except Exception as e:
            self.log_test('ChatSystem.jsx', 'Chat Statistics', False, str(e))
    
    def test_donation_component(self):
        """Test DonationSystem.jsx integration"""
        print("\n💰 Testing Donation System Integration...")
        
        # Test campaigns endpoint
        try:
            response = requests.get(f"{self.api_base_url}/donations/campaigns/")
            if response.status_code == 200:
                campaigns = response.json()
                self.log_test('DonationSystem.jsx', 'Campaigns Endpoint', True,
                            f"Retrieved {len(campaigns)} campaigns")
            else:
                self.log_test('DonationSystem.jsx', 'Campaigns Endpoint', False,
                            f"Status code: {response.status_code}")
        except Exception as e:
            self.log_test('DonationSystem.jsx', 'Campaigns Endpoint', False, str(e))
        
        # Test donation stats
        try:
            response = requests.get(f"{self.api_base_url}/donations/donations/stats/")
            if response.status_code == 200:
                data = response.json()
                expected_fields = ['total_raised', 'total_donations', 'average_donation']
                has_all_stats = all(field in data for field in expected_fields)
                self.log_test('DonationSystem.jsx', 'Donation Statistics', has_all_stats,
                            "All required stats available")
            else:
                self.log_test('DonationSystem.jsx', 'Donation Statistics', False,
                            f"Status code: {response.status_code}")
        except Exception as e:
            self.log_test('DonationSystem.jsx', 'Donation Statistics', False, str(e))
        
        # Test payment initialization
        try:
            payment_data = {
                "amount": 1000,
                "currency": "UGX",
                "donor_name": "Test Donor",
                "donor_email": "testdonor@example.com",
                "is_anonymous": False,
                "message": "Test donation"
            }
            response = requests.post(f"{self.api_base_url}/donations/donations/initialize_payment/",
                                   json=payment_data)
            if response.status_code in [200, 201]:
                data = response.json()
                if 'status' in data and data['status'] == 'success':
                    self.log_test('DonationSystem.jsx', 'Payment Initialization', True,
                                "Payment initialization working")
                else:
                    self.log_test('DonationSystem.jsx', 'Payment Initialization', False,
                                f"Unexpected response: {data}")
            else:
                self.log_test('DonationSystem.jsx', 'Payment Initialization', False,
                            f"Status code: {response.status_code}")
        except Exception as e:
            self.log_test('DonationSystem.jsx', 'Payment Initialization', False, str(e))
    
    def test_analytics_component(self):
        """Test AnalyticsTracker.jsx integration"""
        print("\n📊 Testing Analytics Tracker Integration...")
        
        # Test event tracking
        try:
            event_data = {
                "event_type": "page_view",
                "event_name": "Integration Test Page View",
                "event_category": "testing",
                "page_url": "http://localhost:3000/test",
                "page_title": "Integration Test Page"
            }
            response = requests.post(f"{self.api_base_url}/analytics/track/event/",
                                   json=event_data)
            if response.status_code in [200, 201]:
                self.log_test('AnalyticsTracker.jsx', 'Event Tracking', True,
                            "Event tracked successfully")
            else:
                self.log_test('AnalyticsTracker.jsx', 'Event Tracking', False,
                            f"Status code: {response.status_code}")
        except Exception as e:
            self.log_test('AnalyticsTracker.jsx', 'Event Tracking', False, str(e))
        
        # Test page view tracking
        try:
            pageview_data = {
                "url": "http://localhost:3000/test",
                "title": "Test Page",
                "referrer": "http://localhost:3000"
            }
            response = requests.post(f"{self.api_base_url}/analytics/track/pageview/",
                                   json=pageview_data)
            if response.status_code in [200, 201]:
                self.log_test('AnalyticsTracker.jsx', 'Page View Tracking', True,
                            "Page view tracked successfully")
            else:
                self.log_test('AnalyticsTracker.jsx', 'Page View Tracking', False,
                            f"Status code: {response.status_code}")
        except Exception as e:
            self.log_test('AnalyticsTracker.jsx', 'Page View Tracking', False, str(e))
        
        # Test dashboard endpoint
        try:
            response = requests.get(f"{self.api_base_url}/analytics/events/dashboard/")
            if response.status_code == 200:
                data = response.json()
                expected_fields = ['total_page_views', 'unique_visitors', 'total_sessions']
                has_dashboard = any(field in data for field in expected_fields)
                self.log_test('AnalyticsTracker.jsx', 'Dashboard Data', has_dashboard,
                            "Dashboard endpoint working")
            else:
                self.log_test('AnalyticsTracker.jsx', 'Dashboard Data', False,
                            f"Status code: {response.status_code}")
        except Exception as e:
            self.log_test('AnalyticsTracker.jsx', 'Dashboard Data', False, str(e))
    
    def test_events_component(self):
        """Test Events pages integration"""
        print("\n🎪 Testing Events Component Integration...")
        
        # Test events list
        try:
            response = requests.get(f"{self.api_base_url}/events/events/")
            if response.status_code == 200:
                events = response.json()
                self.log_test('Events Pages', 'Events List', True,
                            f"Retrieved {len(events)} events")
            else:
                self.log_test('Events Pages', 'Events List', False,
                            f"Status code: {response.status_code}")
        except Exception as e:
            self.log_test('Events Pages', 'Events List', False, str(e))
        
        # Test event categories
        try:
            response = requests.get(f"{self.api_base_url}/events/categories/")
            if response.status_code == 200:
                categories = response.json()
                self.log_test('Events Pages', 'Event Categories', True,
                            f"Retrieved {len(categories)} categories")
            else:
                self.log_test('Events Pages', 'Event Categories', False,
                            f"Status code: {response.status_code}")
        except Exception as e:
            self.log_test('Events Pages', 'Event Categories', False, str(e))
        
        # Test calendar endpoint
        try:
            current_date = datetime.now()
            response = requests.get(f"{self.api_base_url}/events/events/calendar/?year={current_date.year}&month={current_date.month}")
            if response.status_code == 200:
                data = response.json()
                if 'calendar' in data:
                    self.log_test('Events Pages', 'Calendar View', True,
                                "Calendar endpoint working")
                else:
                    self.log_test('Events Pages', 'Calendar View', False,
                                "Calendar data not found")
            else:
                self.log_test('Events Pages', 'Calendar View', False,
                            f"Status code: {response.status_code}")
        except Exception as e:
            self.log_test('Events Pages', 'Calendar View', False, str(e))
        
        # Test event statistics
        try:
            response = requests.get(f"{self.api_base_url}/events/events/stats/")
            if response.status_code == 200:
                data = response.json()
                expected_fields = ['total_events', 'upcoming_events', 'total_registrations']
                has_stats = any(field in data for field in expected_fields)
                self.log_test('Events Pages', 'Event Statistics', has_stats,
                            "Statistics endpoint working")
            else:
                self.log_test('Events Pages', 'Event Statistics', False,
                            f"Status code: {response.status_code}")
        except Exception as e:
            self.log_test('Events Pages', 'Event Statistics', False, str(e))
    
    def test_cms_integration(self):
        """Test CMS components integration"""
        print("\n🏗️ Testing CMS Integration...")
        
        # Test site info
        try:
            response = requests.get(f"{self.api_base_url}/cms/site-info/")
            if response.status_code == 200:
                data = response.json()
                expected_fields = ['site_title', 'tagline', 'features']
                has_site_info = any(field in data for field in expected_fields)
                self.log_test('CMS Components', 'Site Information', has_site_info,
                            "Site info endpoint working")
            else:
                self.log_test('CMS Components', 'Site Information', False,
                            f"Status code: {response.status_code}")
        except Exception as e:
            self.log_test('CMS Components', 'Site Information', False, str(e))
        
        # Test pages endpoint
        try:
            response = requests.get(f"{self.api_base_url}/cms/pages/")
            if response.status_code == 200:
                pages = response.json()
                self.log_test('CMS Components', 'Pages Endpoint', True,
                            f"Retrieved {len(pages)} pages")
            else:
                self.log_test('CMS Components', 'Pages Endpoint', False,
                            f"Status code: {response.status_code}")
        except Exception as e:
            self.log_test('CMS Components', 'Pages Endpoint', False, str(e))
        
        # Test search functionality
        try:
            response = requests.get(f"{self.api_base_url}/cms/search/?q=test")
            if response.status_code == 200:
                data = response.json()
                if 'query' in data:
                    self.log_test('CMS Components', 'Search Functionality', True,
                                "Search endpoint working")
                else:
                    self.log_test('CMS Components', 'Search Functionality', False,
                                "Search data format incorrect")
            else:
                self.log_test('CMS Components', 'Search Functionality', False,
                            f"Status code: {response.status_code}")
        except Exception as e:
            self.log_test('CMS Components', 'Search Functionality', False, str(e))
    
    def test_health_endpoints(self):
        """Test health and monitoring endpoints"""
        print("\n🔍 Testing Health & Monitoring...")
        
        # Test health check
        try:
            response = requests.get(f"{self.api_base_url}/../health/")
            if response.status_code == 200:
                data = response.json()
                if data.get('status') == 'healthy':
                    self.log_test('Health Check', 'API Health', True,
                                "Backend is healthy")
                else:
                    self.log_test('Health Check', 'API Health', False,
                                "Health status not healthy")
            else:
                self.log_test('Health Check', 'API Health', False,
                            f"Status code: {response.status_code}")
        except Exception as e:
            self.log_test('Health Check', 'API Health', False, str(e))
        
        # Test API info
        try:
            response = requests.get(f"{self.api_base_url}/../health/info/")
            if response.status_code == 200:
                data = response.json()
                if 'name' in data and 'version' in data:
                    self.log_test('Health Check', 'API Info', True,
                                f"API: {data.get('name')} v{data.get('version')}")
                else:
                    self.log_test('Health Check', 'API Info', False,
                                "API info incomplete")
            else:
                self.log_test('Health Check', 'API Info', False,
                            f"Status code: {response.status_code}")
        except Exception as e:
            self.log_test('Health Check', 'API Info', False, str(e))
    
    def run_all_tests(self):
        """Run complete integration test suite"""
        print("🚀 Starting Frontend Integration Tests")
        print("=" * 60)
        
        start_time = datetime.now()
        
        # Authenticate first
        auth_success = self.authenticate()
        
        # Run all component tests
        self.test_livestream_component()
        self.test_chat_component()
        self.test_donation_component()
        self.test_analytics_component()
        self.test_events_component()
        self.test_cms_integration()
        self.test_health_endpoints()
        
        # Generate summary
        self.generate_summary(start_time)
    
    def generate_summary(self, start_time):
        """Generate test summary"""
        end_time = datetime.now()
        duration = end_time - start_time
        
        # Count results
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result['success'])
        failed_tests = total_tests - passed_tests
        
        print("\n" + "=" * 60)
        print("📋 INTEGRATION TEST SUMMARY")
        print("=" * 60)
        
        print(f"⏱️  Duration: {duration.total_seconds():.2f} seconds")
        print(f"📊 Total Tests: {total_tests}")
        print(f"✅ Passed: {passed_tests}")
        print(f"❌ Failed: {failed_tests}")
        print(f"📈 Success Rate: {(passed_tests/total_tests*100):.1f}%")
        
        # Component breakdown
        components = {}
        for result in self.test_results:
            comp = result['component']
            if comp not in components:
                components[comp] = {'passed': 0, 'failed': 0}
            if result['success']:
                components[comp]['passed'] += 1
            else:
                components[comp]['failed'] += 1
        
        print("\n📱 COMPONENT BREAKDOWN:")
        print("-" * 40)
        for comp, stats in components.items():
            total = stats['passed'] + stats['failed']
            rate = stats['passed'] / total * 100
            status = "🟢" if rate == 100 else "🟡" if rate >= 75 else "🔴"
            print(f"{status} {comp}: {stats['passed']}/{total} ({rate:.0f}%)")
        
        # Failed tests detail
        failed_results = [r for r in self.test_results if not r['success']]
        if failed_results:
            print("\n❌ FAILED TESTS:")
            print("-" * 40)
            for result in failed_results:
                print(f"   {result['component']} - {result['test']}")
                if result['details']:
                    print(f"      Error: {result['details']}")
        
        # Overall status
        if passed_tests == total_tests:
            print("\n🎉 ALL TESTS PASSED! Frontend integration is complete!")
        elif passed_tests >= total_tests * 0.9:
            print("\n🟡 MOSTLY WORKING! Minor issues to resolve.")
        else:
            print("\n🔴 INTEGRATION ISSUES FOUND! Please check failed tests.")
        
        # Save detailed results
        with open('integration_test_results.json', 'w') as f:
            json.dump({
                'summary': {
                    'total_tests': total_tests,
                    'passed_tests': passed_tests,
                    'failed_tests': failed_tests,
                    'success_rate': passed_tests/total_tests*100,
                    'duration': duration.total_seconds(),
                    'timestamp': start_time.isoformat()
                },
                'components': components,
                'detailed_results': self.test_results
            }, f, indent=2)
        
        print(f"\n📄 Detailed results saved to: integration_test_results.json")

if __name__ == "__main__":
    # Check if custom URLs provided
    import sys
    api_url = sys.argv[1] if len(sys.argv) > 1 else 'http://localhost:8000/api'
    ws_url = sys.argv[2] if len(sys.argv) > 2 else 'ws://localhost:8000/ws'
    
    tester = FrontendIntegrationTester(api_url, ws_url)
    tester.run_all_tests()