# 🎨 GenFree Network Customization Guide

## **Complete Ministry Platform Customization**

Your platform is designed to be fully customizable for your ministry's unique needs. Here's how to tailor every aspect:

## 🎯 **1. Branding & Visual Identity**

### **Logo & Colors**
```css
/* Update in src/index.css */
:root {
  /* Primary Colors - Change these for your brand */
  --color-primary: #059669;      /* Main brand color */
  --color-accent: #10b981;       /* Secondary brand color */
  --color-secondary: #6366f1;    /* Tertiary color */
  
  /* Your Ministry Colors */
  --color-ministry-gold: #FFD700;
  --color-ministry-blue: #1E40AF;
  --color-ministry-red: #DC2626;
  
  /* Custom gradients */
  --gradient-primary: linear-gradient(135deg, var(--color-primary), var(--color-accent));
  --gradient-ministry: linear-gradient(135deg, #059669, #FFD700);
}
```

### **Replace Logo Files**
```bash
# Replace these files with your ministry logo:
public/logo.svg              # Main logo
public/manifest.json         # Update app name and icons
public/favicon.ico           # Browser tab icon

# Recommended logo sizes:
# - SVG format for scalability
# - PNG alternatives: 192x192, 512x512
# - Transparent background preferred
```

### **Update Site Information**
```javascript
// In public/manifest.json
{
  "name": "Your Ministry Name",
  "short_name": "YMN",
  "description": "Your ministry description",
  "theme_color": "#059669",
  "background_color": "#ffffff"
}
```

## 📝 **2. Content Customization**

### **Homepage Content**
```javascript
// Update src/data/hero.json
{
  "title": "Welcome to [Your Ministry Name]",
  "subtitle": "Your ministry tagline here",
  "description": "Your ministry mission statement...",
  "callToAction": {
    "primary": "Join Us Live",
    "secondary": "Learn More"
  },
  "backgroundVideo": "path/to/your/video.mp4"
}
```

### **About Page Content**
```javascript
// Update src/data/about.json
{
  "mission": "Your mission statement...",
  "vision": "Your vision statement...",
  "values": [
    "Value 1",
    "Value 2",
    "Value 3"
  ],
  "pastor": {
    "name": "Pastor Name",
    "bio": "Pastor biography...",
    "image": "path/to/pastor-photo.jpg"
  },
  "history": "Your ministry history...",
  "leadership": [
    {
      "name": "Leader Name",
      "role": "Role Title",
      "bio": "Leader bio...",
      "image": "path/to/photo.jpg"
    }
  ]
}
```

### **Footer Information**
```javascript
// Update src/components/Footer.jsx
const organizationInfo = {
  name: "Your Ministry Name",
  address: "Your Physical Address",
  phone: "+256 XXX XXX XXX",
  email: "info@yourministry.org",
  social: {
    facebook: "https://facebook.com/yourministry",
    youtube: "https://youtube.com/@yourministry",
    instagram: "https://instagram.com/yourministry",
    twitter: "https://twitter.com/yourministry"
  }
};
```

## 🎵 **3. Ministry-Specific Features**

### **Add Prayer Request System**
```jsx
// Create src/components/PrayerRequests.jsx
import { useState } from 'react';
import apiService from '../services/api';

const PrayerRequests = () => {
  const [request, setRequest] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);

  const submitPrayerRequest = async () => {
    try {
      await apiService.request('/prayer-requests/', {
        method: 'POST',
        body: JSON.stringify({
          message: request,
          is_anonymous: isAnonymous
        })
      });
      setRequest('');
      alert('Prayer request submitted. We will pray for you!');
    } catch (error) {
      console.error('Error submitting prayer request:', error);
    }
  };

  return (
    <div className="prayer-requests">
      <h3>🙏 Submit Prayer Request</h3>
      <textarea
        value={request}
        onChange={(e) => setRequest(e.target.value)}
        placeholder="Share your prayer request..."
        rows={4}
      />
      <label>
        <input
          type="checkbox"
          checked={isAnonymous}
          onChange={(e) => setIsAnonymous(e.target.checked)}
        />
        Submit anonymously
      </label>
      <button onClick={submitPrayerRequest}>Submit Request</button>
    </div>
  );
};

export default PrayerRequests;
```

### **Add Testimony System**
```jsx
// Create src/components/Testimonies.jsx
import { useState, useEffect } from 'react';
import apiService from '../services/api';

const Testimonies = () => {
  const [testimonies, setTestimonies] = useState([]);
  const [newTestimony, setNewTestimony] = useState('');
  const [authorName, setAuthorName] = useState('');

  useEffect(() => {
    loadTestimonies();
  }, []);

  const loadTestimonies = async () => {
    try {
      const data = await apiService.request('/testimonies/');
      setTestimonies(data);
    } catch (error) {
      console.error('Error loading testimonies:', error);
    }
  };

  const submitTestimony = async () => {
    try {
      await apiService.request('/testimonies/', {
        method: 'POST',
        body: JSON.stringify({
          content: newTestimony,
          author_name: authorName
        })
      });
      setNewTestimony('');
      setAuthorName('');
      loadTestimonies();
    } catch (error) {
      console.error('Error submitting testimony:', error);
    }
  };

  return (
    <div className="testimonies-section">
      <h3>✨ Share Your Testimony</h3>
      
      {/* Testimony Form */}
      <div className="testimony-form">
        <input
          type="text"
          placeholder="Your name"
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
        />
        <textarea
          placeholder="Share how God has blessed you..."
          value={newTestimony}
          onChange={(e) => setNewTestimony(e.target.value)}
          rows={4}
        />
        <button onClick={submitTestimony}>Share Testimony</button>
      </div>

      {/* Display Testimonies */}
      <div className="testimonies-list">
        {testimonies.map((testimony) => (
          <div key={testimony.id} className="testimony-card">
            <p>"{testimony.content}"</p>
            <cite>- {testimony.author_name}</cite>
            <small>{new Date(testimony.created_at).toLocaleDateString()}</small>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Testimonies;
```

### **Add Ministry Departments**
```jsx
// Create src/components/Departments.jsx
const Departments = () => {
  const departments = [
    {
      name: "Youth Ministry",
      description: "Empowering young people for God's purpose",
      leader: "Pastor Youth",
      meetingTime: "Saturdays 3:00 PM",
      contact: "youth@yourministry.org",
      image: "/images/youth.jpg"
    },
    {
      name: "Women's Ministry",
      description: "Building strong women of faith",
      leader: "Pastor Women",
      meetingTime: "Wednesdays 7:00 PM",
      contact: "women@yourministry.org",
      image: "/images/women.jpg"
    },
    {
      name: "Children's Ministry",
      description: "Training children in the way of the Lord",
      leader: "Pastor Children",
      meetingTime: "Sundays during service",
      contact: "children@yourministry.org",
      image: "/images/children.jpg"
    }
  ];

  return (
    <div className="departments-section">
      <h2>Ministry Departments</h2>
      <div className="departments-grid">
        {departments.map((dept, index) => (
          <div key={index} className="department-card">
            <img src={dept.image} alt={dept.name} />
            <h3>{dept.name}</h3>
            <p>{dept.description}</p>
            <div className="department-details">
              <p><strong>Leader:</strong> {dept.leader}</p>
              <p><strong>Meeting:</strong> {dept.meetingTime}</p>
              <p><strong>Contact:</strong> {dept.contact}</p>
            </div>
            <button>Join Department</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Departments;
```

## 💒 **4. Church-Specific Customizations**

### **Add Service Times**
```jsx
// Create src/components/ServiceTimes.jsx
const ServiceTimes = () => {
  const services = [
    {
      name: "Sunday Worship Service",
      time: "10:00 AM - 12:00 PM",
      description: "Main worship service with preaching and communion",
      location: "Main Sanctuary",
      type: "weekly"
    },
    {
      name: "Wednesday Bible Study",
      time: "7:00 PM - 8:30 PM", 
      description: "In-depth Bible study and prayer",
      location: "Fellowship Hall",
      type: "weekly"
    },
    {
      name: "Friday Night Prayer",
      time: "8:00 PM - 10:00 PM",
      description: "Intercession and worship night",
      location: "Prayer Room",
      type: "weekly"
    }
  ];

  return (
    <div className="service-times">
      <h3>📅 Service Times</h3>
      {services.map((service, index) => (
        <div key={index} className="service-card">
          <h4>{service.name}</h4>
          <p className="time">🕒 {service.time}</p>
          <p className="description">{service.description}</p>
          <p className="location">📍 {service.location}</p>
          <button>Set Reminder</button>
        </div>
      ))}
    </div>
  );
};
```

### **Add Bible Verse of the Day**
```jsx
// Create src/components/VerseOfTheDay.jsx
import { useState, useEffect } from 'react';

const VerseOfTheDay = () => {
  const [verse, setVerse] = useState(null);

  useEffect(() => {
    fetchVerseOfTheDay();
  }, []);

  const fetchVerseOfTheDay = async () => {
    // You can use Bible API or pre-defined verses
    const verses = [
      {
        text: "For I know the plans I have for you, declares the Lord, plans for welfare and not for evil, to give you a future and a hope.",
        reference: "Jeremiah 29:11"
      },
      {
        text: "And we know that in all things God works for the good of those who love him, who have been called according to his purpose.",
        reference: "Romans 8:28"
      }
    ];
    
    const todayVerse = verses[Math.floor(Math.random() * verses.length)];
    setVerse(todayVerse);
  };

  if (!verse) return null;

  return (
    <div className="verse-of-the-day">
      <h3>📖 Verse of the Day</h3>
      <blockquote>
        <p>"{verse.text}"</p>
        <cite>- {verse.reference}</cite>
      </blockquote>
      <button onClick={() => navigator.share && navigator.share({
        title: 'Verse of the Day',
        text: `"${verse.text}" - ${verse.reference}`
      })}>
        Share Verse
      </button>
    </div>
  );
};

export default VerseOfTheDay;
```

## 🎨 **5. Advanced UI Customizations**

### **Custom Theme Switcher**
```jsx
// Enhanced theme options
const ThemeCustomizer = () => {
  const themes = {
    default: {
      primary: '#059669',
      accent: '#10b981',
      background: '#ffffff'
    },
    royal: {
      primary: '#7C3AED',
      accent: '#A855F7',
      background: '#F8FAFC'
    },
    warm: {
      primary: '#DC2626',
      accent: '#EF4444',
      background: '#FEF7F0'
    },
    ocean: {
      primary: '#0EA5E9',
      accent: '#38BDF8',
      background: '#F0F9FF'
    }
  };

  const applyTheme = (themeName) => {
    const theme = themes[themeName];
    const root = document.documentElement;
    root.style.setProperty('--color-primary', theme.primary);
    root.style.setProperty('--color-accent', theme.accent);
    root.style.setProperty('--color-bg', theme.background);
  };

  return (
    <div className="theme-customizer">
      <h4>🎨 Choose Theme</h4>
      {Object.keys(themes).map(themeName => (
        <button 
          key={themeName}
          onClick={() => applyTheme(themeName)}
          className="theme-option"
          style={{ backgroundColor: themes[themeName].primary }}
        >
          {themeName}
        </button>
      ))}
    </div>
  );
};
```

### **Custom Animation Effects**
```css
/* Add to src/index.css */

/* Fade in animations */
.fade-in {
  animation: fadeIn 0.6s ease-in;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Slide in animations */
.slide-in-left {
  animation: slideInLeft 0.8s ease-out;
}

@keyframes slideInLeft {
  from { opacity: 0; transform: translateX(-100px); }
  to { opacity: 1; transform: translateX(0); }
}

/* Pulse effect for important elements */
.pulse {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

/* Hover effects */
.hover-lift {
  transition: transform 0.3s ease;
}

.hover-lift:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0,0,0,0.15);
}
```

## 🌍 **6. Multi-Language Customization**

### **Add Your Local Language**
```javascript
// Update src/i18n/translations.js
export const translations = {
  en: {
    // Existing English translations
  },
  sw: {
    // Swahili translations
    "welcome": "Karibu",
    "donate": "Changia",
    "events": "Matukio",
    "live": "Moja kwa moja"
  },
  fr: {
    // French translations
    "welcome": "Bienvenue",
    "donate": "Faire un don",
    "events": "Événements", 
    "live": "En direct"
  },
  // Add your local language
  lg: {
    // Luganda translations (example)
    "welcome": "Tukusanyukidde",
    "donate": "Waayo",
    "events": "Emikolo",
    "live": "Mu budde buno"
  }
};
```

## 📱 **7. Mobile App Features**

### **Add PWA Capabilities**
```javascript
// Update src/main.jsx
// Register service worker for offline functionality
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('SW registered: ', registration);
      })
      .catch(registrationError => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}
```

### **Add Push Notifications**
```javascript
// Create src/services/notifications.js
export const requestNotificationPermission = async () => {
  if ('Notification' in window) {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  return false;
};

export const sendEventReminder = (event) => {
  if (Notification.permission === 'granted') {
    new Notification(`Upcoming: ${event.title}`, {
      body: `Starting at ${event.time}`,
      icon: '/logo.svg',
      badge: '/logo.svg'
    });
  }
};
```

## 🎯 **Quick Customization Checklist**

### **Essential Customizations:**
- [ ] Update logo and favicon
- [ ] Change primary colors to match your brand
- [ ] Update ministry name throughout the app
- [ ] Add your contact information
- [ ] Update social media links
- [ ] Add your Flutterwave payment keys
- [ ] Customize homepage hero content

### **Content Customizations:**
- [ ] Write your ministry's about page
- [ ] Add your pastor's information
- [ ] Create your events calendar
- [ ] Add service times
- [ ] Write your mission/vision statements

### **Advanced Customizations:**
- [ ] Add prayer request system
- [ ] Implement testimony sharing
- [ ] Add ministry departments
- [ ] Create member portal
- [ ] Add sermon archive
- [ ] Implement Bible reading plans

---

**🎨 Your platform is now fully customized to reflect your ministry's unique identity and serve your community's specific needs!**