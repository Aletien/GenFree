/**
 * Push Notification System for Ministry Platform
 * Handles event reminders, prayer alerts, and ministry updates
 */

import { useState, useEffect } from 'react';
import { Bell, BellOff, Calendar, Heart, MessageCircle } from 'lucide-react';
import apiService from '../services/api';

const NotificationSystem = () => {
  const [notifications, setNotifications] = useState([]);
  const [isEnabled, setIsEnabled] = useState(false);
  const [settings, setSettings] = useState({
    events: true,
    prayers: true,
    donations: true,
    chat: false,
    testimonies: true
  });

  useEffect(() => {
    checkNotificationPermission();
    loadNotificationSettings();
  }, []);

  const checkNotificationPermission = () => {
    if ('Notification' in window) {
      setIsEnabled(Notification.permission === 'granted');
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setIsEnabled(permission === 'granted');
      
      if (permission === 'granted') {
        // Send welcome notification
        new Notification('GenFree Network', {
          body: 'Notifications enabled! You\'ll receive updates about events and prayers.',
          icon: '/logo.svg',
          badge: '/logo.svg'
        });
      }
    }
  };

  const loadNotificationSettings = async () => {
    try {
      if (apiService.isAuthenticated()) {
        const userSettings = await apiService.request('/notifications/settings/');
        setSettings(userSettings);
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  };

  const updateNotificationSettings = async (newSettings) => {
    try {
      if (apiService.isAuthenticated()) {
        await apiService.request('/notifications/settings/', {
          method: 'PATCH',
          body: JSON.stringify(newSettings)
        });
      }
      setSettings(newSettings);
    } catch (error) {
      console.error('Error updating notification settings:', error);
    }
  };

  // Notification types
  const notificationTypes = [
    {
      key: 'events',
      label: 'Event Reminders',
      description: 'Get notified before events start',
      icon: <Calendar size={16} />,
      color: '#059669'
    },
    {
      key: 'prayers',
      label: 'Prayer Requests',
      description: 'New prayer requests from the community',
      icon: <Heart size={16} />,
      color: '#DC2626'
    },
    {
      key: 'donations',
      label: 'Donation Updates',
      description: 'Campaign milestones and thank you messages',
      icon: <Bell size={16} />,
      color: '#7C3AED'
    },
    {
      key: 'chat',
      label: 'Chat Messages',
      description: 'Messages during live streams',
      icon: <MessageCircle size={16} />,
      color: '#059669'
    },
    {
      key: 'testimonies',
      label: 'New Testimonies',
      description: 'When someone shares a testimony',
      icon: <Heart size={16} />,
      color: '#F59E0B'
    }
  ];

  const handleSettingChange = (key) => {
    const newSettings = { ...settings, [key]: !settings[key] };
    updateNotificationSettings(newSettings);
  };

  return (
    <div style={{
      backgroundColor: 'var(--color-surface)',
      borderRadius: '12px',
      border: '2px solid var(--color-primary)',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: 'var(--color-primary)',
        color: 'white',
        padding: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Bell size={24} />
          <h3 style={{ margin: 0 }}>Notifications</h3>
        </div>
        <div style={{
          padding: '0.25rem 0.75rem',
          backgroundColor: isEnabled ? '#00C851' : '#FF6B6B',
          borderRadius: '12px',
          fontSize: '0.8rem',
          fontWeight: 'bold'
        }}>
          {isEnabled ? 'ON' : 'OFF'}
        </div>
      </div>

      <div style={{ padding: '1.5rem' }}>
        {/* Enable Notifications */}
        {!isEnabled && (
          <div style={{
            backgroundColor: '#FFF3CD',
            border: '1px solid #FFC107',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '1.5rem'
          }}>
            <h4 style={{ margin: '0 0 0.5rem 0', color: '#856404' }}>
              Enable Notifications
            </h4>
            <p style={{ margin: '0 0 1rem 0', color: '#856404', fontSize: '0.9rem' }}>
              Stay connected with your faith community. Get notified about events, prayers, and important updates.
            </p>
            <button
              onClick={requestNotificationPermission}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#FFC107',
                color: '#856404',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Enable Notifications
            </button>
          </div>
        )}

        {/* Notification Settings */}
        {isEnabled && (
          <div>
            <h4 style={{ 
              margin: '0 0 1rem 0', 
              color: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <Bell size={18} />
              Notification Preferences
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {notificationTypes.map((type) => (
                <div
                  key={type.key}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '1rem',
                    backgroundColor: 'var(--color-bg)',
                    borderRadius: '8px',
                    border: '1px solid var(--color-border)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: type.color + '20',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: type.color
                    }}>
                      {type.icon}
                    </div>
                    <div>
                      <h5 style={{ 
                        margin: '0 0 0.25rem 0', 
                        fontSize: '1rem',
                        color: 'var(--color-text)'
                      }}>
                        {type.label}
                      </h5>
                      <p style={{ 
                        margin: 0, 
                        fontSize: '0.8rem', 
                        color: 'var(--color-text-muted)' 
                      }}>
                        {type.description}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleSettingChange(type.key)}
                    style={{
                      width: '48px',
                      height: '24px',
                      borderRadius: '12px',
                      border: 'none',
                      cursor: 'pointer',
                      backgroundColor: settings[type.key] ? '#00C851' : '#DDD',
                      position: 'relative',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      backgroundColor: 'white',
                      position: 'absolute',
                      top: '2px',
                      left: settings[type.key] ? '26px' : '2px',
                      transition: 'all 0.3s ease'
                    }} />
                  </button>
                </div>
              ))}
            </div>

            {/* Test Notification */}
            <button
              onClick={() => {
                if (isEnabled) {
                  new Notification('Test Notification', {
                    body: 'Your notifications are working perfectly! 🙏',
                    icon: '/logo.svg'
                  });
                }
              }}
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: 'var(--color-accent)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                marginTop: '1rem',
                fontWeight: 'bold'
              }}
            >
              Send Test Notification
            </button>
          </div>
        )}

        {/* Notification History */}
        <div style={{ marginTop: '1.5rem' }}>
          <h4 style={{ 
            margin: '0 0 1rem 0', 
            color: 'var(--color-primary)',
            fontSize: '1rem' 
          }}>
            Recent Notifications
          </h4>
          
          <div style={{
            maxHeight: '200px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem'
          }}>
            {/* Sample notification items */}
            <div style={{
              padding: '0.75rem',
              backgroundColor: 'var(--color-bg)',
              borderRadius: '6px',
              border: '1px solid var(--color-border)',
              fontSize: '0.9rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>🔔 Sunday Service starting in 15 minutes</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>2 min ago</span>
              </div>
            </div>
            
            <div style={{
              padding: '0.75rem',
              backgroundColor: 'var(--color-bg)',
              borderRadius: '6px',
              border: '1px solid var(--color-border)',
              fontSize: '0.9rem'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>🙏 New prayer request from Sarah</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>1 hour ago</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationSystem;