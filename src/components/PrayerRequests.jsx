/**
 * Prayer Request System for Ministry Platform
 * Allows congregation members to submit prayer requests
 */

import { useState, useEffect } from 'react';
import { Heart, Send, Eye, EyeOff, Clock } from 'lucide-react';
import apiService from '../services/api';

const PrayerRequests = () => {
  const [requests, setRequests] = useState([]);
  const [newRequest, setNewRequest] = useState('');
  const [requesterName, setRequesterName] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [category, setCategory] = useState('personal');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);

  const categories = [
    { value: 'personal', label: '🙏 Personal Prayer', icon: '💝' },
    { value: 'healing', label: '🏥 Healing', icon: '💊' },
    { value: 'family', label: '👨‍👩‍👧‍👦 Family', icon: '🏠' },
    { value: 'financial', label: '💰 Financial', icon: '💳' },
    { value: 'guidance', label: '🧭 Guidance', icon: '🛤️' },
    { value: 'thanksgiving', label: '🙌 Thanksgiving', icon: '✨' }
  ];

  useEffect(() => {
    loadPrayerRequests();
  }, []);

  const loadPrayerRequests = async () => {
    try {
      // Load public prayer requests (non-private ones)
      const data = await apiService.request('/prayer-requests/public/');
      setRequests(data.results || []);
    } catch (error) {
      console.error('Error loading prayer requests:', error);
    }
  };

  const submitPrayerRequest = async () => {
    if (!newRequest.trim()) return;

    setIsSubmitting(true);
    try {
      const requestData = {
        message: newRequest.trim(),
        requester_name: isAnonymous ? '' : requesterName.trim(),
        category: category,
        is_anonymous: isAnonymous,
        is_public: !isAnonymous, // Anonymous requests are private by default
      };

      await apiService.request('/prayer-requests/', {
        method: 'POST',
        body: JSON.stringify(requestData),
      });

      // Reset form
      setNewRequest('');
      setRequesterName('');
      setIsAnonymous(false);
      setCategory('personal');
      setShowSubmissionForm(false);

      // Reload requests if public
      if (!isAnonymous) {
        loadPrayerRequests();
      }

      // Show success message
      alert('🙏 Prayer request submitted. Our prayer team will lift you up in prayer!');
    } catch (error) {
      console.error('Error submitting prayer request:', error);
      alert('Error submitting prayer request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const requestTime = new Date(timestamp);
    const diffMinutes = Math.floor((now - requestTime) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes} minutes ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)} hours ago`;
    return `${Math.floor(diffMinutes / 1440)} days ago`;
  };

  const getCategoryIcon = (categoryValue) => {
    const category = categories.find(cat => cat.value === categoryValue);
    return category ? category.icon : '🙏';
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
        textAlign: 'center'
      }}>
        <Heart size={32} style={{ marginBottom: '0.5rem' }} />
        <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.4rem' }}>
          Prayer Requests
        </h3>
        <p style={{ margin: 0, opacity: 0.9, fontSize: '0.9rem' }}>
          Share your burdens and let our community pray with you
        </p>
      </div>

      {/* Content */}
      <div style={{ padding: '1.5rem' }}>
        {/* Submit Prayer Request Button */}
        {!showSubmissionForm && (
          <button
            onClick={() => setShowSubmissionForm(true)}
            style={{
              width: '100%',
              padding: '1rem',
              backgroundColor: 'var(--color-accent)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '1.1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              marginBottom: '1.5rem'
            }}
          >
            <Send size={20} />
            Submit Prayer Request
          </button>
        )}

        {/* Prayer Request Form */}
        {showSubmissionForm && (
          <div style={{
            backgroundColor: 'var(--color-bg)',
            padding: '1.5rem',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            border: '1px solid var(--color-border)'
          }}>
            <h4 style={{ margin: '0 0 1rem 0', color: 'var(--color-primary)' }}>
              🙏 Submit Your Prayer Request
            </h4>

            {/* Anonymous Toggle */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1rem',
              padding: '0.75rem',
              backgroundColor: isAnonymous ? 'var(--color-warning-bg)' : 'var(--color-surface)',
              borderRadius: '6px',
              border: '1px solid var(--color-border)'
            }}>
              <button
                onClick={() => setIsAnonymous(!isAnonymous)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: 'var(--color-text)'
                }}
              >
                {isAnonymous ? <EyeOff size={16} /> : <Eye size={16} />}
                {isAnonymous ? 'Anonymous Request' : 'Public Request'}
              </button>
            </div>

            {/* Name Field (if not anonymous) */}
            {!isAnonymous && (
              <input
                type="text"
                placeholder="Your name (optional)"
                value={requesterName}
                onChange={(e) => setRequesterName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid var(--color-border)',
                  borderRadius: '6px',
                  marginBottom: '1rem',
                  fontSize: '1rem'
                }}
              />
            )}

            {/* Category Selection */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{
                display: 'block',
                marginBottom: '0.5rem',
                fontWeight: 'bold',
                color: 'var(--color-text)'
              }}>
                Prayer Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid var(--color-border)',
                  borderRadius: '6px',
                  fontSize: '1rem'
                }}
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.icon} {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Prayer Request Text */}
            <textarea
              placeholder="Share your prayer request... God cares about every detail of your life."
              value={newRequest}
              onChange={(e) => setNewRequest(e.target.value)}
              rows={4}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid var(--color-border)',
                borderRadius: '6px',
                resize: 'vertical',
                fontSize: '1rem',
                marginBottom: '1rem'
              }}
              maxLength={500}
            />
            
            <div style={{ 
              fontSize: '0.8rem', 
              color: 'var(--color-text-muted)', 
              textAlign: 'right',
              marginBottom: '1rem' 
            }}>
              {newRequest.length}/500 characters
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={submitPrayerRequest}
                disabled={!newRequest.trim() || isSubmitting}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  backgroundColor: 'var(--color-primary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  opacity: (!newRequest.trim() || isSubmitting) ? 0.5 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                {isSubmitting ? (
                  <>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid white',
                      borderTop: '2px solid transparent',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }} />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    Submit Request
                  </>
                )}
              </button>
              
              <button
                onClick={() => setShowSubmissionForm(false)}
                style={{
                  padding: '0.75rem',
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>

            {isAnonymous && (
              <p style={{
                fontSize: '0.8rem',
                color: 'var(--color-text-muted)',
                fontStyle: 'italic',
                marginTop: '0.5rem',
                marginBottom: 0
              }}>
                🔒 Your request will be private and only seen by our prayer team.
              </p>
            )}
          </div>
        )}

        {/* Recent Prayer Requests */}
        <div>
          <h4 style={{
            margin: '0 0 1rem 0',
            color: 'var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <Clock size={18} />
            Recent Prayer Requests
          </h4>

          {requests.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '2rem',
              color: 'var(--color-text-muted)',
              fontStyle: 'italic'
            }}>
              <Heart size={32} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
              <p>No public prayer requests yet. Be the first to share!</p>
            </div>
          ) : (
            <div style={{
              maxHeight: '400px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              {requests.map((request) => (
                <div
                  key={request.id}
                  style={{
                    padding: '1rem',
                    backgroundColor: 'var(--color-bg)',
                    borderRadius: '8px',
                    border: '1px solid var(--color-border)',
                    position: 'relative'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '0.5rem'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '1.2rem' }}>
                        {getCategoryIcon(request.category)}
                      </span>
                      <span style={{
                        fontWeight: 'bold',
                        color: 'var(--color-text)',
                        fontSize: '0.9rem'
                      }}>
                        {request.requester_name || 'Anonymous'}
                      </span>
                    </div>
                    <span style={{
                      fontSize: '0.7rem',
                      color: 'var(--color-text-muted)'
                    }}>
                      {formatTimeAgo(request.created_at)}
                    </span>
                  </div>

                  <p style={{
                    margin: '0.5rem 0',
                    fontSize: '0.9rem',
                    lineHeight: '1.5',
                    color: 'var(--color-text)'
                  }}>
                    {request.message}
                  </p>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '0.75rem',
                    fontSize: '0.8rem',
                    color: 'var(--color-text-muted)'
                  }}>
                    <span>🙏 {request.prayer_count || 0} people praying</span>
                    <button
                      style={{
                        background: 'none',
                        border: '1px solid var(--color-primary)',
                        color: 'var(--color-primary)',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        fontSize: '0.7rem'
                      }}
                      onClick={() => {
                        // Add prayer interaction
                        alert('🙏 Added to your prayer list. Thank you for caring!');
                      }}
                    >
                      Pray
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default PrayerRequests;