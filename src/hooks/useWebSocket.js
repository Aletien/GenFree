/**
 * WebSocket hook for real-time features
 * Connects React components to Django WebSocket endpoints
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import apiService from '../services/api';

export const useWebSocket = (endpoint, user = null) => {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const socketRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  const connect = useCallback(() => {
    if (socketRef.current?.readyState === WebSocket.OPEN) {
      return; // Already connected
    }

    try {
      const ws = apiService.createWebSocket(endpoint);
      
      ws.onopen = () => {
        console.log('WebSocket connected to:', endpoint);
        setIsConnected(true);
        setConnectionAttempts(0);
        
        // Send authentication if user is available
        if (user && apiService.isAuthenticated()) {
          ws.send(JSON.stringify({
            type: 'authenticate',
            token: localStorage.getItem('accessToken')
          }));
        }
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          switch (data.type) {
            case 'chat_message':
              setMessages(prev => [...prev, data.message]);
              break;
            case 'donation_update':
              // Handle donation updates
              if (window.updateDonations) {
                window.updateDonations(data.donation);
              }
              break;
            case 'live_status_update':
              // Handle live status changes
              if (window.updateLiveStatus) {
                window.updateLiveStatus(data.status);
              }
              break;
            case 'user_joined':
              console.log('User joined:', data.user);
              break;
            case 'user_left':
              console.log('User left:', data.user);
              break;
            case 'error':
              console.error('WebSocket error:', data.message);
              break;
            default:
              console.log('Received WebSocket message:', data);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        setIsConnected(false);
        
        // Attempt to reconnect if it wasn't a manual close
        if (event.code !== 1000 && connectionAttempts < 5) {
          const timeout = Math.min(1000 * Math.pow(2, connectionAttempts), 30000);
          console.log(`Reconnecting in ${timeout}ms...`);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            setConnectionAttempts(prev => prev + 1);
            connect();
          }, timeout);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      socketRef.current = ws;
      setSocket(ws);
      
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
    }
  }, [endpoint, user, connectionAttempts]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (socketRef.current) {
        socketRef.current.close(1000); // Normal closure
      }
    };
  }, [connect]);

  const sendMessage = useCallback((message, messageType = 'chat_message') => {
    if (socket && isConnected) {
      const payload = {
        type: messageType,
        ...message,
        timestamp: Date.now(),
        user_id: user?.id
      };
      
      try {
        socket.send(JSON.stringify(payload));
        return true;
      } catch (error) {
        console.error('Failed to send WebSocket message:', error);
        return false;
      }
    }
    return false;
  }, [socket, isConnected, user]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (socketRef.current) {
      socketRef.current.close(1000);
    }
    setSocket(null);
    setIsConnected(false);
  }, []);

  return {
    socket,
    messages,
    isConnected,
    sendMessage,
    disconnect,
    reconnect: connect
  };
};

// Hook specifically for live chat
export const useLiveChat = (user = null) => {
  return useWebSocket('/chat/live/', user);
};

// Hook for live stream updates
export const useLiveStream = () => {
  return useWebSocket('/stream/updates/');
};

// Hook for donation updates
export const useDonationUpdates = () => {
  return useWebSocket('/donations/live/');
};