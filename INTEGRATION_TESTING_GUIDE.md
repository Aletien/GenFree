# 🧪 Integration Testing Guide - GenFree Network

## 🎯 **Testing Overview**

This guide will help you test the complete integration between your React frontend and Django backend to ensure all components work together seamlessly.

## 📋 **Pre-Testing Checklist**

### ✅ **Backend Requirements**
- [ ] Django backend server running on `http://localhost:8000`
- [ ] Database migrations applied
- [ ] Redis server running (for WebSocket features)
- [ ] Environment variables configured

### ✅ **Frontend Requirements**
- [ ] React development server running on `http://localhost:3000`
- [ ] Environment variables configured (`VITE_API_BASE_URL`, etc.)
- [ ] All dependencies installed

## 🚀 **Step-by-Step Testing Process**

### **Step 1: Backend Health Check**
```bash
# Navigate to backend directory
cd backend

# Check if server is running
curl http://localhost:8000/health/

# Expected response:
# {"status": "healthy", "service": "GenFree Network API"}
```

### **Step 2: Run Backend Integration Tests**
```bash
# Run comprehensive backend API tests
python test_frontend_integration.py

# Run component-specific tests
python test_component_integration.py
```

**Expected Output:**
```
🚀 Starting Frontend Integration Tests
==============================
🔐 Testing Authentication System...
✅ Authentication - User Registration
📺 Testing LiveStream Component Integration...
✅ LiveStream.jsx - Status Endpoint
✅ LiveStream.jsx - Analytics Endpoint
...
📋 INTEGRATION TEST SUMMARY
✅ Passed: 25/27 (92.6%)
```

### **Step 3: Frontend Integration Tests**

#### **Option A: Browser Console Testing**
1. Open your React app in browser: `http://localhost:3000`
2. Open browser developer tools (F12)
3. Run the integration test:

```javascript
// Import and run frontend integration tests
const script = document.createElement('script');
script.src = '/test-backend-integration.js';
document.head.appendChild(script);

// After script loads, run tests
setTimeout(() => {
    window.runIntegrationTests();
}, 2000);
```

#### **Option B: Component Testing in React**
Add this to your React app temporarily:

```jsx
// In src/components/TestIntegration.jsx
import { useEffect, useState } from 'react';
import FrontendBackendTester from '../test-backend-integration.js';

export default function TestIntegration() {
    const [results, setResults] = useState(null);
    const [testing, setTesting] = useState(false);

    const runTests = async () => {
        setTesting(true);
        const tester = new FrontendBackendTester();
        await tester.runAllTests();
        setResults(window.integrationTestResults);
        setTesting(false);
    };

    return (
        <div style={{ padding: '20px' }}>
            <h2>🧪 Integration Testing</h2>
            <button onClick={runTests} disabled={testing}>
                {testing ? 'Running Tests...' : 'Run Integration Tests'}
            </button>
            
            {results && (
                <div style={{ marginTop: '20px' }}>
                    <h3>Results:</h3>
                    <p>✅ Passed: {results.summary.passed}</p>
                    <p>❌ Failed: {results.summary.failed}</p>
                    <p>📈 Success Rate: {results.summary.successRate.toFixed(1)}%</p>
                </div>
            )}
        </div>
    );
}
```

### **Step 4: Manual Component Testing**

Test each major component manually:

#### **🔴 LiveStream Component**
1. Navigate to `/live` page
2. Check if live status appears
3. Verify viewer count updates
4. Test WebSocket connection (open Network tab)

#### **💬 Chat Component**
1. Open chat interface
2. Send a test message
3. Verify message appears in real-time
4. Test typing indicators

#### **💰 Donation Component**
1. Navigate to donation page
2. Select a campaign
3. Try payment initialization
4. Verify payment flow works

#### **📊 Analytics Component**
1. Navigate through different pages
2. Check browser console for analytics tracking
3. Verify events are being sent to backend

#### **🎪 Events Component**
1. Navigate to events page
2. Test event filtering
3. Try event registration
4. Check calendar view

## 🔍 **Troubleshooting Common Issues**

### **❌ Connection Refused Errors**
```
Error: connect ECONNREFUSED 127.0.0.1:8000
```
**Solution:**
- Ensure Django server is running: `python manage.py runserver`
- Check if port 8000 is available
- Verify `VITE_API_BASE_URL` in frontend `.env`

### **❌ CORS Errors**
```
Access to fetch at 'http://localhost:8000/api/' from origin 'http://localhost:3000' has been blocked by CORS policy
```
**Solution:**
- Add to Django `settings/base.py`:
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
```

### **❌ Authentication Errors**
```
{"detail": "Authentication credentials were not provided."}
```
**Solution:**
- Check JWT token is being sent in headers
- Verify token hasn't expired
- Test login endpoint manually

### **❌ WebSocket Connection Failed**
```
WebSocket connection failed
```
**Solution:**
- Ensure Redis is running: `redis-server`
- Check Django Channels configuration
- Verify WebSocket URL format

### **❌ Database Errors**
```
relation "app_model" does not exist
```
**Solution:**
- Run migrations: `python manage.py migrate`
- Create missing migrations: `python manage.py makemigrations`

## 📊 **Expected Test Results**

### **Perfect Integration (100% Pass Rate)**
```
📋 INTEGRATION TEST SUMMARY
⏱️ Duration: 15.2 seconds
📊 Total Tests: 32
✅ Passed: 32
❌ Failed: 0
📈 Success Rate: 100.0%

🎉 ALL TESTS PASSED! Frontend integration is complete!
```

### **Good Integration (90%+ Pass Rate)**
```
📋 INTEGRATION TEST SUMMARY
⏱️ Duration: 18.7 seconds
📊 Total Tests: 32
✅ Passed: 30
❌ Failed: 2
📈 Success Rate: 93.8%

🟡 MOSTLY WORKING! Minor issues to resolve.
```

### **Issues to Fix (<90% Pass Rate)**
```
📋 INTEGRATION TEST SUMMARY
⏱️ Duration: 12.1 seconds
📊 Total Tests: 32
✅ Passed: 25
❌ Failed: 7
📈 Success Rate: 78.1%

🔴 INTEGRATION ISSUES FOUND! Please check failed tests.
```

## 🛠️ **Fix Common Integration Issues**

### **1. Missing Backend Endpoints**
If tests show missing endpoints:
```bash
# Create missing URL patterns
# Add to respective apps/urls.py files
```

### **2. Serializer Validation Errors**
If data format issues:
```python
# Check serializer field requirements
# Update frontend data format to match
```

### **3. Permission Errors**
If authentication issues:
```python
# Check view permission classes
# Ensure proper JWT token handling
```

### **4. WebSocket Issues**
If real-time features fail:
```bash
# Check Redis connection
redis-cli ping

# Verify channel layers configuration
```

## 📈 **Performance Testing**

### **Load Testing**
```bash
# Install Apache Bench
sudo apt-get install apache2-utils

# Test API endpoints
ab -n 100 -c 10 http://localhost:8000/api/events/events/

# Expected: 95%+ requests succeed
```

### **WebSocket Stress Test**
```javascript
// Test multiple WebSocket connections
for (let i = 0; i < 10; i++) {
    const ws = new WebSocket('ws://localhost:8000/ws/chat/general/');
    ws.onopen = () => console.log(`Connection ${i} opened`);
}
```

## ✅ **Final Integration Checklist**

- [ ] All API endpoints return expected data
- [ ] Authentication flow works end-to-end
- [ ] WebSocket connections establish successfully
- [ ] Payment integration initializes correctly
- [ ] Analytics events are tracked
- [ ] Real-time features work (chat, live updates)
- [ ] Error handling works properly
- [ ] Performance is acceptable
- [ ] Mobile responsiveness maintained
- [ ] All console errors resolved

## 🎉 **Success Criteria**

Your integration is **COMPLETE** when:

1. **✅ 95%+ test pass rate**
2. **✅ All major features work in browser**
3. **✅ No critical console errors**
4. **✅ Real-time features functional**
5. **✅ Payment flow operational**

## 📞 **Getting Help**

If you encounter issues:

1. **Check test logs** for specific error messages
2. **Review Django server logs** for backend errors
3. **Inspect browser console** for frontend errors
4. **Verify environment variables** are set correctly
5. **Ensure all services** (Django, Redis, Frontend) are running

---

## 🚀 **Ready for Production**

Once integration testing passes, you're ready to:

1. **Deploy to staging environment**
2. **Run production tests**
3. **Configure monitoring**
4. **Go live!** 🎊

**Your GenFree Network is now fully integrated and ready to serve your community!**