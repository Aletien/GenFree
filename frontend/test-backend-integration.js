/**
 * Frontend Integration Test Suite
 * Tests React components against backend API endpoints
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8000/ws';

class FrontendBackendTester {
    constructor() {
        this.results = [];
        this.authToken = null;
    }

    log(component, test, success, details = '') {
        const result = {
            component,
            test,
            success,
            details,
            timestamp: new Date().toISOString()
        };
        this.results.push(result);
        
        const status = success ? '✅' : '❌';
        console.log(`${status} ${component} - ${test}`);
        if (details && !success) {
            console.log(`   Details: ${details}`);
        }
    }

    async testAPI(endpoint, method = 'GET', data = null, requiresAuth = false) {
        try {
            const headers = {
                'Content-Type': 'application/json',
            };

            if (requiresAuth && this.authToken) {
                headers.Authorization = `Bearer ${this.authToken}`;
            }

            const config = {
                method,
                headers,
            };

            if (data && method !== 'GET') {
                config.body = JSON.stringify(data);
            }

            const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
            
            return {
                success: response.ok,
                status: response.status,
                data: response.ok ? await response.json() : null,
                error: response.ok ? null : `HTTP ${response.status}`
            };
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    async authenticate() {
        console.log('\n🔐 Testing Authentication...');
        
        // Test registration
        const userData = {
            email: `test_${Date.now()}@example.com`,
            password: 'TestPassword123!',
            first_name: 'Test',
            last_name: 'User'
        };

        const registerResult = await this.testAPI('/auth/register/', 'POST', userData);
        
        if (registerResult.success && registerResult.data?.tokens) {
            this.authToken = registerResult.data.tokens.access;
            this.log('Authentication', 'User Registration', true, 'Registered successfully');
            return true;
        }

        // Try login if registration fails
        const loginData = {
            email: 'test@example.com',
            password: 'testpassword'
        };

        const loginResult = await this.testAPI('/auth/login/', 'POST', loginData);
        
        if (loginResult.success && loginResult.data?.tokens) {
            this.authToken = loginResult.data.tokens.access;
            this.log('Authentication', 'User Login', true, 'Logged in successfully');
            return true;
        }

        this.log('Authentication', 'Auth Flow', false, 'Could not authenticate');
        return false;
    }

    async testLiveStreamComponent() {
        console.log('\n📺 Testing LiveStream Component...');

        // Test live status
        const statusResult = await this.testAPI('/livestream/streams/status/');
        const hasRequiredFields = statusResult.success && 
            statusResult.data?.hasOwnProperty('is_live') &&
            statusResult.data?.hasOwnProperty('current_stream');
        
        this.log('LiveStream.jsx', 'Status Endpoint', hasRequiredFields, 
            hasRequiredFields ? 'All required fields present' : 'Missing required fields');

        // Test analytics
        const analyticsResult = await this.testAPI('/livestream/streams/analytics/');
        this.log('LiveStream.jsx', 'Analytics Endpoint', analyticsResult.success, 
            analyticsResult.error || 'Analytics data retrieved');

        // Test WebSocket connection
        this.testLiveStreamWebSocket();
    }

    testLiveStreamWebSocket() {
        return new Promise((resolve) => {
            try {
                const ws = new WebSocket(`${WS_BASE_URL}/stream/test-stream/`);
                
                ws.onopen = () => {
                    ws.send(JSON.stringify({ type: 'heartbeat' }));
                };

                ws.onmessage = (event) => {
                    const data = JSON.parse(event.data);
                    if (data.type === 'pong' || data.type === 'connection_established') {
                        this.log('LiveStream.jsx', 'WebSocket Connection', true, 'Connected successfully');
                        ws.close();
                        resolve(true);
                    }
                };

                ws.onerror = (error) => {
                    this.log('LiveStream.jsx', 'WebSocket Connection', false, 'Connection failed');
                    resolve(false);
                };

                // Timeout after 5 seconds
                setTimeout(() => {
                    if (ws.readyState === WebSocket.CONNECTING) {
                        ws.close();
                        this.log('LiveStream.jsx', 'WebSocket Connection', false, 'Connection timeout');
                        resolve(false);
                    }
                }, 5000);

            } catch (error) {
                this.log('LiveStream.jsx', 'WebSocket Connection', false, error.message);
                resolve(false);
            }
        });
    }

    async testChatComponent() {
        console.log('\n💬 Testing Chat Component...');

        // Test chat rooms
        const roomsResult = await this.testAPI('/chat/rooms/');
        this.log('ChatSystem.jsx', 'Chat Rooms', roomsResult.success, 
            roomsResult.error || `Retrieved ${roomsResult.data?.length || 0} rooms`);

        // Test messages
        const messagesResult = await this.testAPI('/chat/messages/?limit=10');
        this.log('ChatSystem.jsx', 'Messages Endpoint', messagesResult.success,
            messagesResult.error || 'Messages retrieved');

        // Test send message (requires auth)
        if (this.authToken) {
            const messageData = {
                content: 'Test message from frontend integration test',
                message_type: 'text'
            };
            const sendResult = await this.testAPI('/chat/messages/', 'POST', messageData, true);
            this.log('ChatSystem.jsx', 'Send Message', sendResult.success,
                sendResult.error || 'Message sent successfully');
        }

        // Test chat stats
        const statsResult = await this.testAPI('/chat/messages/stats/');
        this.log('ChatSystem.jsx', 'Chat Statistics', statsResult.success,
            statsResult.error || 'Statistics retrieved');
    }

    async testDonationComponent() {
        console.log('\n💰 Testing Donation Component...');

        // Test campaigns
        const campaignsResult = await this.testAPI('/donations/campaigns/');
        this.log('DonationSystem.jsx', 'Campaigns Endpoint', campaignsResult.success,
            campaignsResult.error || `Retrieved ${campaignsResult.data?.length || 0} campaigns`);

        // Test donation stats
        const statsResult = await this.testAPI('/donations/donations/stats/');
        const hasRequiredStats = statsResult.success &&
            statsResult.data?.hasOwnProperty('total_raised') &&
            statsResult.data?.hasOwnProperty('total_donations');
        
        this.log('DonationSystem.jsx', 'Statistics', hasRequiredStats,
            hasRequiredStats ? 'All stats available' : 'Missing required statistics');

        // Test payment initialization
        const paymentData = {
            amount: 1000,
            currency: 'UGX',
            donor_name: 'Test Donor',
            donor_email: 'test@example.com',
            is_anonymous: false
        };
        const paymentResult = await this.testAPI('/donations/donations/initialize_payment/', 'POST', paymentData);
        this.log('DonationSystem.jsx', 'Payment Init', paymentResult.success,
            paymentResult.error || 'Payment initialization working');
    }

    async testAnalyticsComponent() {
        console.log('\n📊 Testing Analytics Component...');

        // Test event tracking
        const eventData = {
            event_type: 'button_click',
            event_name: 'Test Button Click',
            page_url: window.location.href,
            event_category: 'testing'
        };
        const eventResult = await this.testAPI('/analytics/track/event/', 'POST', eventData);
        this.log('AnalyticsTracker.jsx', 'Event Tracking', eventResult.success,
            eventResult.error || 'Event tracked successfully');

        // Test page view tracking
        const pageViewData = {
            url: window.location.href,
            title: document.title,
            referrer: document.referrer
        };
        const pageViewResult = await this.testAPI('/analytics/track/pageview/', 'POST', pageViewData);
        this.log('AnalyticsTracker.jsx', 'Page View Tracking', pageViewResult.success,
            pageViewResult.error || 'Page view tracked successfully');

        // Test dashboard
        const dashboardResult = await this.testAPI('/analytics/events/dashboard/');
        this.log('AnalyticsTracker.jsx', 'Dashboard Data', dashboardResult.success,
            dashboardResult.error || 'Dashboard data retrieved');
    }

    async testEventsComponent() {
        console.log('\n🎪 Testing Events Component...');

        // Test events list
        const eventsResult = await this.testAPI('/events/events/');
        this.log('Events Component', 'Events List', eventsResult.success,
            eventsResult.error || `Retrieved ${eventsResult.data?.length || 0} events`);

        // Test categories
        const categoriesResult = await this.testAPI('/events/categories/');
        this.log('Events Component', 'Categories', categoriesResult.success,
            categoriesResult.error || 'Categories retrieved');

        // Test calendar
        const now = new Date();
        const calendarResult = await this.testAPI(`/events/events/calendar/?year=${now.getFullYear()}&month=${now.getMonth() + 1}`);
        this.log('Events Component', 'Calendar View', calendarResult.success,
            calendarResult.error || 'Calendar data retrieved');

        // Test event stats
        const statsResult = await this.testAPI('/events/events/stats/');
        this.log('Events Component', 'Statistics', statsResult.success,
            statsResult.error || 'Event statistics retrieved');
    }

    async testCMSIntegration() {
        console.log('\n🏗️ Testing CMS Integration...');

        // Test site info
        const siteInfoResult = await this.testAPI('/cms/site-info/');
        this.log('CMS Components', 'Site Info', siteInfoResult.success,
            siteInfoResult.error || 'Site information retrieved');

        // Test pages
        const pagesResult = await this.testAPI('/cms/pages/');
        this.log('CMS Components', 'Pages', pagesResult.success,
            pagesResult.error || 'Pages retrieved');

        // Test search
        const searchResult = await this.testAPI('/cms/search/?q=test');
        this.log('CMS Components', 'Search', searchResult.success,
            searchResult.error || 'Search functionality working');
    }

    async runAllTests() {
        console.log('🚀 Starting Frontend-Backend Integration Tests');
        console.log('=' * 60);

        const startTime = Date.now();

        // Run authentication first
        await this.authenticate();

        // Run all component tests
        await this.testLiveStreamComponent();
        await this.testChatComponent();
        await this.testDonationComponent();
        await this.testAnalyticsComponent();
        await this.testEventsComponent();
        await this.testCMSIntegration();

        // Generate summary
        this.generateSummary(startTime);
    }

    generateSummary(startTime) {
        const duration = (Date.now() - startTime) / 1000;
        const total = this.results.length;
        const passed = this.results.filter(r => r.success).length;
        const failed = total - passed;

        console.log('\n' + '='.repeat(60));
        console.log('📋 FRONTEND INTEGRATION TEST SUMMARY');
        console.log('='.repeat(60));
        console.log(`⏱️ Duration: ${duration.toFixed(2)} seconds`);
        console.log(`📊 Total Tests: ${total}`);
        console.log(`✅ Passed: ${passed}`);
        console.log(`❌ Failed: ${failed}`);
        console.log(`📈 Success Rate: ${((passed/total)*100).toFixed(1)}%`);

        // Component breakdown
        const components = {};
        this.results.forEach(result => {
            if (!components[result.component]) {
                components[result.component] = { passed: 0, failed: 0 };
            }
            if (result.success) {
                components[result.component].passed++;
            } else {
                components[result.component].failed++;
            }
        });

        console.log('\n📱 COMPONENT BREAKDOWN:');
        console.log('-'.repeat(40));
        Object.entries(components).forEach(([comp, stats]) => {
            const compTotal = stats.passed + stats.failed;
            const rate = (stats.passed / compTotal) * 100;
            const status = rate === 100 ? '🟢' : rate >= 75 ? '🟡' : '🔴';
            console.log(`${status} ${comp}: ${stats.passed}/${compTotal} (${rate.toFixed(0)}%)`);
        });

        // Failed tests
        const failedTests = this.results.filter(r => !r.success);
        if (failedTests.length > 0) {
            console.log('\n❌ FAILED TESTS:');
            console.log('-'.repeat(40));
            failedTests.forEach(result => {
                console.log(`   ${result.component} - ${result.test}`);
                if (result.details) {
                    console.log(`      Error: ${result.details}`);
                }
            });
        }

        // Overall status
        if (passed === total) {
            console.log('\n🎉 ALL TESTS PASSED! Frontend-backend integration is complete!');
        } else if (passed >= total * 0.9) {
            console.log('\n🟡 MOSTLY WORKING! Minor issues to resolve.');
        } else {
            console.log('\n🔴 INTEGRATION ISSUES FOUND! Please check failed tests.');
        }

        // Store results globally for debugging
        window.integrationTestResults = {
            summary: { total, passed, failed, duration, successRate: (passed/total)*100 },
            components,
            detailedResults: this.results
        };

        console.log('\n💾 Results stored in window.integrationTestResults');
    }
}

// Export for use in React components
export default FrontendBackendTester;

// Auto-run if script is loaded directly
if (typeof window !== 'undefined' && window.document) {
    window.runIntegrationTests = async () => {
        const tester = new FrontendBackendTester();
        await tester.runAllTests();
    };
}