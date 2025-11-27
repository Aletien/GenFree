/**
 * Enhanced Chat System with Django WebSocket Integration
 * Real-time chat for live streaming with backend persistence
 */

import { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle, Users, Shield, Settings } from 'lucide-react';
import { useLiveChat } from '../hooks/useWebSocket';
import apiService from '../services/api';

const EnhancedChatSystem = ({ eventId, isLive = false }) => {
  // State management
  const [userName, setUserName] = useState(localStorage.getItem('chatUserName') || '');
  const [newMessage, setNewMessage] = useState('');
  const [isJoined, setIsJoined] = useState(!!userName);
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isModerator, setIsModerator] = useState(false);

  // User from authentication
  const [currentUser, setCurrentUser] = useState(null);

  // WebSocket connection
  const { messages, isConnected, sendMessage } = useLiveChat(currentUser);
  
  // Refs
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Load current user if authenticated
  useEffect(() => {
    if (apiService.isAuthenticated()) {
      apiService.getCurrentUser()
        .then(user => {
          setCurrentUser(user);
          setUserName(user.first_name || user.username);
          setIsJoined(true);
          setIsModerator(user.is_staff || user.is_minister);
        })
        .catch(error => console.error('Error loading user:', error));
    }
  }, []);

  // Load chat history from backend
  useEffect(() => {
    const loadChatHistory = async () => {
      try {
        setIsLoading(true);
        const history = await apiService.getChatMessages(50);
        setChatHistory(history);
      } catch (error) {
        console.error('Error loading chat history:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isLive && eventId) {
      loadChatHistory();
    }
  }, [eventId, isLive]);

  // Merge WebSocket messages with history
  useEffect(() => {
    if (messages.length > 0) {
      setChatHistory(prev => [...prev, ...messages]);
    }
  }, [messages]);

  // Auto-scroll to bottom
  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  // Connection status handling
  useEffect(() => {
    if (isConnected && currentUser) {
      // Send user join notification
      sendMessage({
        type: 'user_joined',
        user: {
          id: currentUser.id,
          name: userName,
          is_moderator: isModerator
        }
      }, 'user_joined');
    }
  }, [isConnected, currentUser, userName, isModerator, sendMessage]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleJoinChat = async () => {
    if (!userName.trim()) return;

    setIsLoading(true);
    try {
      // Save username for guest users
      if (!currentUser) {
        localStorage.setItem('chatUserName', userName);
      }

      // Send join message via WebSocket
      if (isConnected) {
        sendMessage({
          type: 'user_joined',
          user: {
            name: userName,
            is_authenticated: !!currentUser,
            is_moderator: isModerator
          }
        }, 'user_joined');
      }

      setIsJoined(true);
    } catch (error) {
      console.error('Error joining chat:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !isConnected) return;

    const messageData = {
      message: newMessage.trim(),
      user_name: userName,
      user_id: currentUser?.id,
      event_id: eventId,
      is_authenticated: !!currentUser,
      is_moderator: isModerator,
      timestamp: new Date().toISOString()
    };

    try {
      // Send via WebSocket for real-time delivery
      const sent = sendMessage(messageData, 'chat_message');
      
      if (sent) {
        // Also save to backend for persistence
        if (currentUser) {
          await apiService.sendChatMessage(newMessage.trim(), userName);
        }

        setNewMessage('');
      } else {
        // Fallback: send directly to backend if WebSocket fails
        await apiService.sendChatMessage(newMessage.trim(), userName);
        setNewMessage('');
        
        // Reload messages to show the sent message
        const updatedMessages = await apiService.getChatMessages(10);
        setChatHistory(prev => [...prev, ...updatedMessages.slice(-1)]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!isModerator) return;

    try {
      await apiService.request(`/chat/messages/${messageId}/`, {
        method: 'DELETE'
      });
      
      setChatHistory(prev => prev.filter(msg => msg.id !== messageId));
    } catch (error) {
      console.error('Error deleting message:', error);
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getMessageStyle = (message) => {
    const isOwn = message.user_name === userName || message.user_id === currentUser?.id;
    const isMod = message.is_moderator;
    
    return {
      backgroundColor: isOwn ? 'var(--color-primary-bg)' : 
                       isMod ? 'var(--color-accent-bg)' : 'var(--color-surface)',
      border: isOwn ? '1px solid var(--color-primary)' :
              isMod ? '1px solid var(--color-accent)' : '1px solid var(--color-border)',
      borderRadius: '8px',
      padding: '0.75rem',
      marginBottom: '0.5rem',
      position: 'relative'
    };
  };

  // Show loading state
  if (isLoading && chatHistory.length === 0) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '200px',
        color: 'var(--color-text-muted)'
      }}>
        <div>Loading chat...</div>
      </div>
    );
  }

  // Show join form for non-authenticated users
  if (!isJoined) {
    return (
      <div style={{
        backgroundColor: 'var(--color-surface)',
        borderRadius: '12px',
        padding: '2rem',
        textAlign: 'center',
        border: '2px solid var(--color-primary)'
      }}>
        <MessageCircle size={48} style={{ color: 'var(--color-primary)', marginBottom: '1rem' }} />
        <h3 style={{ margin: '0 0 1rem 0', color: 'var(--color-primary)' }}>
          Join Live Chat
        </h3>
        <p style={{ margin: '0 0 1.5rem 0', color: 'var(--color-text-muted)' }}>
          Connect with other viewers during the live stream
        </p>
        
        <input
          type="text"
          placeholder="Enter your name to chat..."
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleJoinChat()}
          style={{
            width: '100%',
            padding: '0.75rem',
            marginBottom: '1rem',
            border: '1px solid var(--color-border)',
            borderRadius: '8px',
            fontSize: '1rem'
          }}
          maxLength={50}
          disabled={isLoading}
        />
        
        <button
          onClick={handleJoinChat}
          disabled={!userName.trim() || isLoading}
          style={{
            width: '100%',
            padding: '0.75rem',
            backgroundColor: 'var(--color-primary)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold',
            opacity: (!userName.trim() || isLoading) ? 0.5 : 1
          }}
        >
          {isLoading ? 'Joining...' : 'Join Chat'}
        </button>

        {!isConnected && (
          <p style={{ 
            marginTop: '0.5rem', 
            fontSize: '0.8rem', 
            color: 'var(--color-warning)' 
          }}>
            Connecting to chat server...
          </p>
        )}
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: 'var(--color-surface)',
      borderRadius: '12px',
      border: '2px solid var(--color-primary)',
      display: 'flex',
      flexDirection: 'column',
      height: '400px',
      overflow: 'hidden'
    }}>
      {/* Chat Header */}
      <div style={{
        padding: '1rem',
        borderBottom: '1px solid var(--color-border)',
        backgroundColor: 'var(--color-primary)',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <MessageCircle size={20} />
          <span style={{ fontWeight: 'bold' }}>Live Chat</span>
          {isConnected ? (
            <div style={{
              width: '8px',
              height: '8px',
              backgroundColor: '#00ff00',
              borderRadius: '50%',
              marginLeft: '0.5rem'
            }} />
          ) : (
            <div style={{
              width: '8px',
              height: '8px',
              backgroundColor: '#ff9500',
              borderRadius: '50%',
              marginLeft: '0.5rem'
            }} />
          )}
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Users size={16} />
          <span style={{ fontSize: '0.8rem' }}>{onlineUsers.length + 1}</span>
          {isModerator && <Shield size={16} />}
        </div>
      </div>

      {/* Messages Area */}
      <div
        ref={chatContainerRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {chatHistory.map((message, index) => (
          <div key={message.id || index} style={getMessageStyle(message)}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: '0.25rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{
                  fontWeight: 'bold',
                  color: message.is_moderator ? 'var(--color-accent)' : 'var(--color-primary)',
                  fontSize: '0.9rem'
                }}>
                  {message.user_name}
                  {message.is_moderator && <Shield size={12} style={{ marginLeft: '0.25rem' }} />}
                </span>
                <span style={{
                  fontSize: '0.7rem',
                  color: 'var(--color-text-muted)'
                }}>
                  {formatTimestamp(message.timestamp)}
                </span>
              </div>
              
              {isModerator && message.id && (
                <button
                  onClick={() => handleDeleteMessage(message.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-warning)',
                    cursor: 'pointer',
                    fontSize: '0.7rem'
                  }}
                >
                  ×
                </button>
              )}
            </div>
            
            <p style={{
              margin: '0',
              fontSize: '0.9rem',
              lineHeight: '1.4',
              color: 'var(--color-text)'
            }}>
              {message.message}
            </p>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div style={{
        padding: '1rem',
        borderTop: '1px solid var(--color-border)',
        display: 'flex',
        gap: '0.5rem'
      }}>
        <input
          type="text"
          placeholder={isConnected ? "Type a message..." : "Connecting..."}
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          disabled={!isConnected}
          style={{
            flex: 1,
            padding: '0.75rem',
            border: '1px solid var(--color-border)',
            borderRadius: '8px',
            fontSize: '0.9rem'
          }}
          maxLength={500}
        />
        
        <button
          onClick={handleSendMessage}
          disabled={!newMessage.trim() || !isConnected}
          style={{
            padding: '0.75rem',
            backgroundColor: 'var(--color-primary)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            opacity: (!newMessage.trim() || !isConnected) ? 0.5 : 1
          }}
        >
          <Send size={18} />
        </button>
      </div>

      {/* Connection Status */}
      {!isConnected && (
        <div style={{
          padding: '0.5rem',
          backgroundColor: 'var(--color-warning-bg)',
          color: 'var(--color-warning)',
          textAlign: 'center',
          fontSize: '0.8rem'
        }}>
          Reconnecting to chat...
        </div>
      )}
    </div>
  );
};

export default EnhancedChatSystem;