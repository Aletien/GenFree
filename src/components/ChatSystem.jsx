import { useState, useEffect, useRef } from 'react';
import { Send, Smile, Heart, Trash2, Flag, Crown, Shield } from 'lucide-react';

const ChatSystem = ({ platform, streamId, isLive, moderatorMode = false }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [userName, setUserName] = useState('');
    const [isConnected, setIsConnected] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showQuickMessages, setShowQuickMessages] = useState(false);
    const [bannedUsers, setBannedUsers] = useState([]);
    const [messageError, setMessageError] = useState('');
    const messagesEndRef = useRef(null);
    
    // Quick message templates for easier commenting
    const quickMessages = [
        'Amen! 🙏',
        'Hallelujah! 🎉',
        'God bless! ❤️',
        'Praying for you! 🙌',
        'Thank you Pastor! 👏',
        'Beautiful worship! 🎵'
    ];
    
    // Emoji options - expanded for live streaming
    const emojis = ['😀', '😂', '😍', '🙏', '❤️', '👏', '🔥', '✨', '🎉', '👍', '😇', '🙌', '🎵', '📿', '⭐', '💫', '🕊️', '🌟'];
    
    // Sample messages for demo
    useEffect(() => {
        const sampleMessages = [
            { id: 1, user: 'John_Believer', message: 'Praise the Lord! 🙏', timestamp: Date.now() - 300000, likes: 5, platform: 'youtube' },
            { id: 2, user: 'Mary_Grace', message: 'Beautiful worship today ❤️', timestamp: Date.now() - 240000, likes: 8, platform: 'facebook' },
            { id: 3, user: 'David_Kenya', message: 'Watching from Nairobi! 🇰🇪', timestamp: Date.now() - 180000, likes: 3, platform: 'youtube' },
            { id: 4, user: 'Sarah_Faith', message: 'Amen! This message is blessing my heart 🔥', timestamp: Date.now() - 120000, likes: 12, platform: 'instagram' },
            { id: 5, user: 'Pastor_Mike', message: 'Welcome everyone! God bless you all 🙌', timestamp: Date.now() - 60000, likes: 25, platform: 'youtube', role: 'moderator' }
        ];
        setMessages(sampleMessages);
    }, []);

    // Auto scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Simulate live messages
    useEffect(() => {
        if (!isLive) return;
        
        const liveMessages = [
            'God is good all the time! 🙏',
            'Amazing grace! ✨',
            'Feeling blessed today ❤️',
            'Praying for everyone here 🙌',
            'This song touches my heart 😇',
            'Hallelujah! 🎉',
            'Watching with my family 👨‍👩‍👧‍👦',
            'Such a powerful message 🔥',
            'Thank you Pastor! 👏',
            'Amen and amen! 🙏',
            'Beautiful worship today! 🎵',
            'God bless this ministry 📿',
            'Joining from Uganda! 🇺🇬',
            'This is exactly what I needed to hear ⭐',
            'Tears of joy 😭❤️',
            'Holy Spirit is moving! 🕊️',
            'Can I get an Amen? 🙌',
            'Watching from work, God is everywhere! 💻',
            'My heart is full 💫',
            'Thank you for this blessing 🌟'
        ];
        
        const users = ['Grace_777', 'FaithfulOne', 'BlessedSoul', 'HopeInChrist', 'JoyfulHeart', 'PeaceMaker', 'LoveWins', 'Uganda_Faith', 'Kampala_Believer', 'Moses_K', 'Sarah_Praise', 'David_Worship', 'Ruth_Joy'];
        
        const interval = setInterval(() => {
            if (Math.random() > 0.7) { // 30% chance every 3 seconds
                const newMsg = {
                    id: Date.now(),
                    user: users[Math.floor(Math.random() * users.length)],
                    message: liveMessages[Math.floor(Math.random() * liveMessages.length)],
                    timestamp: Date.now(),
                    likes: Math.floor(Math.random() * 5),
                    platform: platform
                };
                setMessages(prev => [...prev.slice(-49), newMsg]); // Keep last 50 messages
            }
        }, 3000);

        return () => clearInterval(interval);
    }, [isLive, platform]);

    const handleSendMessage = () => {
        if (!newMessage.trim() || !userName.trim()) {
            setMessageError('Please enter a message');
            return;
        }
        
        if (newMessage.trim().length > 200) {
            setMessageError('Message too long (max 200 characters)');
            return;
        }
        
        const message = {
            id: Date.now(),
            user: userName,
            message: newMessage.trim(),
            timestamp: Date.now(),
            likes: 0,
            platform: platform,
            isOwn: true
        };
        
        setMessages(prev => [...prev, message]);
        setNewMessage('');
        setMessageError('');
        
        // Analytics tracking
        if (window.trackStreamEvent) {
            window.trackStreamEvent('chat_message', {
                platform: platform,
                messageLength: newMessage.trim().length
            });
        }
    };

    const handleLikeMessage = (messageId) => {
        setMessages(prev => 
            prev.map(msg => 
                msg.id === messageId 
                    ? { ...msg, likes: msg.likes + 1 }
                    : msg
            )
        );
    };

    const handleDeleteMessage = (messageId) => {
        setMessages(prev => prev.filter(msg => msg.id !== messageId));
    };

    const handleBanUser = (username) => {
        setBannedUsers(prev => [...prev, username]);
        setMessages(prev => prev.filter(msg => msg.user !== username));
    };

    const handleEmojiClick = (emoji) => {
        setNewMessage(prev => prev + emoji);
        setShowEmojiPicker(false);
        setMessageError('');
    };
    
    const handleQuickMessage = (message) => {
        setNewMessage(message);
        setShowQuickMessages(false);
        setMessageError('');
    };

    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const getUserRoleIcon = (role) => {
        switch (role) {
            case 'moderator': return <Shield size={12} style={{ color: '#4CAF50' }} />;
            case 'admin': return <Crown size={12} style={{ color: '#FFD700' }} />;
            default: return null;
        }
    };

    const getPlatformColor = (msgPlatform) => {
        const colors = {
            youtube: '#FF0000',
            facebook: '#1877F2',
            instagram: '#E4405F',
            tiktok: '#000000'
        };
        return colors[msgPlatform] || '#6B7280';
    };

    return (
        <div style={{
            height: '400px',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: 'white',
            borderRadius: '8px',
            border: '1px solid var(--color-border)',
            overflow: 'hidden'
        }}>
            {/* Chat Header */}
            <div style={{
                padding: '1rem',
                borderBottom: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-bg)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ margin: 0, fontSize: '1rem', color: 'var(--color-primary)' }}>
                        💬 Live Chat
                    </h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{
                            width: '8px',
                            height: '8px',
                            backgroundColor: isLive ? '#00ff00' : '#ff0000',
                            borderRadius: '50%'
                        }} />
                        <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                            {messages.length} messages
                        </span>
                    </div>
                </div>
            </div>

            {/* User Setup */}
            {!userName && (
                <div style={{ padding: '1rem', borderBottom: '1px solid var(--color-border)' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <input
                            type="text"
                            placeholder="Enter your name to chat..."
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                            style={{
                                flex: 1,
                                padding: '0.5rem',
                                border: '1px solid var(--color-border)',
                                borderRadius: '4px',
                                fontSize: '0.9rem'
                            }}
                            onKeyPress={(e) => e.key === 'Enter' && setIsConnected(true)}
                        />
                        <button
                            onClick={() => setIsConnected(true)}
                            disabled={!userName.trim()}
                            style={{
                                padding: '0.5rem 1rem',
                                backgroundColor: 'var(--color-primary)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                opacity: userName.trim() ? 1 : 0.5
                            }}
                        >
                            Join
                        </button>
                    </div>
                </div>
            )}

            {/* Messages */}
            <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '0.5rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem'
            }}>
                {messages.map((message) => (
                    <div
                        key={message.id}
                        style={{
                            padding: '0.5rem',
                            borderRadius: '6px',
                            backgroundColor: message.isOwn ? 'var(--color-primary-bg)' : 'var(--color-bg)',
                            border: `1px solid ${message.isOwn ? 'var(--color-primary)' : 'var(--color-border)'}`
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                <span style={{
                                    fontWeight: 'bold',
                                    fontSize: '0.8rem',
                                    color: getPlatformColor(message.platform)
                                }}>
                                    {message.user}
                                </span>
                                {getUserRoleIcon(message.role)}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>
                                    {formatTime(message.timestamp)}
                                </span>
                                {moderatorMode && !message.isOwn && (
                                    <>
                                        <button
                                            onClick={() => handleDeleteMessage(message.id)}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ff4444' }}
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                        <button
                                            onClick={() => handleBanUser(message.user)}
                                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ff8800' }}
                                        >
                                            <Flag size={12} />
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                        <p style={{ margin: '0 0 0.25rem 0', fontSize: '0.9rem', lineHeight: '1.3' }}>
                            {message.message}
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <button
                                onClick={() => handleLikeMessage(message.id)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.25rem',
                                    color: 'var(--color-text-muted)',
                                    fontSize: '0.7rem'
                                }}
                            >
                                <Heart size={12} />
                                {message.likes}
                            </button>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            {userName && (
                <div style={{
                    padding: '0.75rem',
                    borderTop: '1px solid var(--color-border)',
                    backgroundColor: 'var(--color-bg)'
                }}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
                        <div style={{ flex: 1 }}>
                            <textarea
                                value={newMessage}
                                onChange={(e) => {
                                    setNewMessage(e.target.value);
                                    setMessageError('');
                                }}
                                placeholder="Type your message... (200 char max)"
                                rows={2}
                                maxLength={200}
                                style={{
                                    width: '100%',
                                    padding: '0.5rem',
                                    border: `1px solid ${messageError ? '#ff4444' : 'var(--color-border)'}`,
                                    borderRadius: '4px',
                                    resize: 'none',
                                    fontSize: '0.9rem'
                                }}
                                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendMessage())}
                            />
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginTop: '0.25rem',
                                fontSize: '0.7rem'
                            }}>
                                {messageError ? (
                                    <span style={{ color: '#ff4444' }}>{messageError}</span>
                                ) : (
                                    <span style={{ color: 'var(--color-text-muted)' }}>
                                        {newMessage.length}/200
                                    </span>
                                )}
                                <button
                                    onClick={() => setShowQuickMessages(!showQuickMessages)}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: 'var(--color-primary)',
                                        cursor: 'pointer',
                                        fontSize: '0.7rem',
                                        textDecoration: 'underline'
                                    }}
                                >
                                    Quick Messages
                                </button>
                            </div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            <button
                                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                style={{
                                    padding: '0.5rem',
                                    backgroundColor: 'var(--color-secondary)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                            >
                                <Smile size={16} />
                            </button>
                            <button
                                onClick={handleSendMessage}
                                disabled={!newMessage.trim()}
                                style={{
                                    padding: '0.5rem',
                                    backgroundColor: 'var(--color-primary)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    opacity: newMessage.trim() ? 1 : 0.5
                                }}
                            >
                                <Send size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Quick Messages */}
                    {showQuickMessages && (
                        <div style={{
                            marginTop: '0.5rem',
                            padding: '0.5rem',
                            backgroundColor: 'white',
                            border: '1px solid var(--color-border)',
                            borderRadius: '6px',
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, 1fr)',
                            gap: '0.25rem'
                        }}>
                            {quickMessages.map((message, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleQuickMessage(message)}
                                    style={{
                                        padding: '0.5rem',
                                        border: '1px solid var(--color-border)',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '0.8rem',
                                        backgroundColor: 'var(--color-bg)',
                                        color: 'var(--color-text)',
                                        textAlign: 'center'
                                    }}
                                >
                                    {message}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Emoji Picker */}
                    {showEmojiPicker && (
                        <div style={{
                            marginTop: '0.5rem',
                            padding: '0.5rem',
                            backgroundColor: 'white',
                            border: '1px solid var(--color-border)',
                            borderRadius: '6px',
                            display: 'grid',
                            gridTemplateColumns: 'repeat(6, 1fr)',
                            gap: '0.25rem'
                        }}>
                            {emojis.map((emoji, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleEmojiClick(emoji)}
                                    style={{
                                        padding: '0.25rem',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontSize: '1.2rem',
                                        backgroundColor: 'transparent'
                                    }}
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ChatSystem;