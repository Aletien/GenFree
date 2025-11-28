# GenFree Network API Documentation

## Base URL
```
Production: https://api.genfree.org
Development: http://localhost:8000/api
```

## Authentication
All authenticated endpoints require JWT token in the header:
```
Authorization: Bearer <your-jwt-token>
```

## Core Endpoints

### 🔐 Authentication (`/auth/`)

#### Login
```http
POST /auth/login/
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "remember_me": false
}
```

#### Register
```http
POST /auth/register/
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+256123456789"
}
```

#### Get User Profile
```http
GET /auth/profile/me/
Authorization: Bearer <token>
```

### 🎪 Events (`/events/`)

#### List Events
```http
GET /events/events/?category=worship&time=upcoming&featured=true
```

#### Get Event Details
```http
GET /events/events/{slug}/
```

#### Register for Event
```http
POST /events/events/{slug}/register/
Authorization: Bearer <token>
Content-Type: application/json

{
  "guest_name": "John Doe",
  "guest_email": "john@example.com",
  "special_requirements": "Wheelchair access needed"
}
```

#### Event Calendar
```http
GET /events/events/calendar/?year=2024&month=12
```

#### Event Statistics
```http
GET /events/events/stats/
```

### 💰 Donations (`/donations/`)

#### List Donation Campaigns
```http
GET /donations/campaigns/?featured=true&status=active
```

#### Get Campaign Details
```http
GET /donations/campaigns/{slug}/
```

#### Initialize Payment
```http
POST /donations/donations/initialize_payment/
Content-Type: application/json

{
  "amount": 50000,
  "currency": "UGX",
  "donor_name": "Jane Doe",
  "donor_email": "jane@example.com",
  "campaign_id": 123,
  "message": "God bless this work"
}
```

#### Donation Statistics
```http
GET /donations/donations/stats/
```

#### My Donations (Authenticated)
```http
GET /donations/donations/my_donations/
Authorization: Bearer <token>
```

### 📡 Live Streaming (`/livestream/`)

#### Get Live Status
```http
GET /livestream/streams/status/
```

Response:
```json
{
  "is_live": true,
  "current_stream": {
    "id": "uuid",
    "title": "Sunday Service",
    "platform": "youtube",
    "current_viewers": 150
  },
  "upcoming_streams": [...],
  "viewer_count": 150,
  "total_views_today": 500
}
```

#### Stream Analytics
```http
GET /livestream/streams/analytics/
```

#### Update Viewer Count (Internal)
```http
POST /livestream/streams/{id}/update_viewers/
Content-Type: application/json

{
  "viewer_count": 200
}
```

### 💬 Chat (`/chat/`)

#### Get Chat Rooms
```http
GET /chat/rooms/
```

#### Get Messages
```http
GET /chat/messages/?room=general&limit=50
```

#### Send Message
```http
POST /chat/messages/
Content-Type: application/json

{
  "room": "room-id",
  "content": "Hello everyone!",
  "message_type": "text"
}
```

#### Join Room
```http
POST /chat/rooms/{slug}/join/
```

#### Chat Statistics
```http
GET /chat/messages/stats/
```

### 📊 Analytics (`/analytics/`)

#### Track Event
```http
POST /analytics/track/event/
Content-Type: application/json

{
  "event_type": "button_click",
  "event_name": "Donation Button Clicked",
  "event_category": "engagement",
  "page_url": "https://genfree.org/donate",
  "custom_data": {"button_color": "blue"}
}
```

#### Track Page View
```http
POST /analytics/track/pageview/
Content-Type: application/json

{
  "url": "https://genfree.org/events",
  "title": "Events - GenFree Network",
  "referrer": "https://google.com"
}
```

#### Analytics Dashboard
```http
GET /analytics/events/dashboard/?start_date=2024-01-01&end_date=2024-12-31
```

### 🏗️ Content Management (`/cms/`)

#### Get Site Information
```http
GET /cms/site-info/
```

#### List Pages
```http
GET /cms/pages/?featured=true
```

#### Get Page
```http
GET /cms/pages/{slug}/
```

#### List Blog Posts
```http
GET /cms/posts/?category=announcements&featured=true
```

#### Search Content
```http
GET /cms/search/?q=youth+ministry
```

#### Get Navigation Menu
```http
GET /cms/menus/by_location/?location=main
```

## WebSocket Endpoints

### Chat WebSocket
```
ws://localhost:8000/ws/chat/{room_slug}/
```

Message types:
```json
// Send message
{
  "type": "chat_message",
  "content": "Hello everyone!"
}

// Typing indicator
{
  "type": "typing",
  "typing": true
}

// Reaction
{
  "type": "reaction",
  "message_id": "uuid",
  "reaction": "👍"
}
```

### Live Stream WebSocket
```
ws://localhost:8000/ws/stream/{stream_id}/
```

Message types:
```json
// Heartbeat
{
  "type": "heartbeat"
}

// Analytics event
{
  "type": "analytics",
  "event": "viewer_joined",
  "data": {"platform": "web"}
}
```

## Error Responses

All error responses follow this format:
```json
{
  "error": "Error message here",
  "code": "ERROR_CODE",
  "details": {
    "field_name": ["Field-specific error message"]
  }
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Rate Limiting

- Authentication endpoints: 5 requests per minute per IP
- General API: 100 requests per minute per user
- Analytics tracking: 1000 requests per minute per IP

## Pagination

List endpoints support pagination:
```http
GET /events/events/?page=2&limit=20
```

Response format:
```json
{
  "count": 100,
  "next": "http://api.genfree.org/events/events/?page=3",
  "previous": "http://api.genfree.org/events/events/?page=1",
  "results": [...]
}
```