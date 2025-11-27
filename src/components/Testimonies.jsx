/**
 * Testimony System for Ministry Platform
 * Allows congregation to share testimonies and read others' testimonies
 */

import { useState, useEffect } from 'react';
import { Star, Heart, Share2, Calendar } from 'lucide-react';
import apiService from '../services/api';

const Testimonies = () => {
  const [testimonies, setTestimonies] = useState([]);
  const [newTestimony, setNewTestimony] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [category, setCategory] = useState('blessing');
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    { value: 'blessing', label: '✨ God\'s Blessing', color: '#FFD700' },
    { value: 'healing', label: '🙏 Divine Healing', color: '#00C851' },
    { value: 'provision', label: '💝 God\'s Provision', color: '#33B5E5' },
    { value: 'salvation', label: '💒 Salvation', color: '#FF6900' },
    { value: 'breakthrough', label: '⚡ Breakthrough', color: '#AA00FF' },
    { value: 'protection', label: '🛡️ Protection', color: '#FF5722' }
  ];

  useEffect(() => {
    loadTestimonies();
  }, []);

  const loadTestimonies = async () => {
    try {
      const data = await apiService.request('/testimonies/');
      setTestimonies(data.results || []);
    } catch (error) {
      console.error('Error loading testimonies:', error);
      // Load sample testimonies for demo
      setTestimonies([
        {
          id: 1,
          content: "God has been so faithful! After months of searching for employment, I finally got my dream job. His timing is perfect!",
          author_name: "Sarah K.",
          category: "blessing",
          created_at: "2024-01-15T10:00:00Z",
          likes: 12
        },
        {
          id: 2,
          content: "I was diagnosed with a serious illness, but through prayers and God's grace, I am completely healed. Glory to God!",
          author_name: "John M.",
          category: "healing", 
          created_at: "2024-01-10T15:30:00Z",
          likes: 25
        }
      ]);
    }
  };

  const submitTestimony = async () => {
    if (!newTestimony.trim() || !authorName.trim()) return;

    setIsSubmitting(true);
    try {
      const testimonyData = {
        content: newTestimony.trim(),
        author_name: authorName.trim(),
        category: category
      };

      const response = await apiService.request('/testimonies/', {
        method: 'POST',
        body: JSON.stringify(testimonyData)
      });

      // Add to local state
      setTestimonies(prev => [response, ...prev]);

      // Reset form
      setNewTestimony('');
      setAuthorName('');
      setCategory('blessing');
      setShowForm(false);

      alert('✨ Thank you for sharing your testimony! It will encourage others.');
    } catch (error) {
      console.error('Error submitting testimony:', error);
      alert('Error submitting testimony. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
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
        background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
        color: 'white',
        padding: '1.5rem',
        textAlign: 'center'
      }}>
        <Star size={32} style={{ marginBottom: '0.5rem' }} />
        <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.4rem' }}>
          Testimonies
        </h3>
        <p style={{ margin: 0, opacity: 0.9, fontSize: '0.9rem' }}>
          Share how God has blessed your life
        </p>
      </div>

      <div style={{ padding: '1.5rem' }}>
        {/* Share Testimony Button */}
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
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
            <Share2 size={20} />
            Share Your Testimony
          </button>
        )}

        {/* Testimony Form */}
        {showForm && (
          <div style={{
            backgroundColor: 'var(--color-bg)',
            padding: '1.5rem',
            borderRadius: '8px',
            marginBottom: '1.5rem',
            border: '1px solid var(--color-border)'
          }}>
            <h4 style={{ margin: '0 0 1rem 0', color: 'var(--color-primary)' }}>
              ✨ Share Your Testimony
            </h4>

            <input
              type="text"
              placeholder="Your name"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid var(--color-border)',
                borderRadius: '6px',
                marginBottom: '1rem',
                fontSize: '1rem'
              }}
            />

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem',
                border: '1px solid var(--color-border)',
                borderRadius: '6px',
                marginBottom: '1rem',
                fontSize: '1rem'
              }}
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>

            <textarea
              placeholder="Share how God has blessed you..."
              value={newTestimony}
              onChange={(e) => setNewTestimony(e.target.value)}
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
            />

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={submitTestimony}
                disabled={!newTestimony.trim() || !authorName.trim() || isSubmitting}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  backgroundColor: 'var(--color-primary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: 'bold'
                }}
              >
                {isSubmitting ? 'Sharing...' : 'Share Testimony'}
              </button>
              <button
                onClick={() => setShowForm(false)}
                style={{
                  padding: '0.75rem 1rem',
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderRadius: '6px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Testimonies List */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          maxHeight: '500px',
          overflowY: 'auto'
        }}>
          {testimonies.map((testimony) => (
            <div
              key={testimony.id}
              style={{
                padding: '1.5rem',
                backgroundColor: 'var(--color-bg)',
                borderRadius: '8px',
                border: '1px solid var(--color-border)',
                position: 'relative'
              }}
            >
              <div style={{ 
                position: 'absolute',
                top: '1rem',
                right: '1rem',
                fontSize: '1.5rem'
              }}>
                {categories.find(c => c.value === testimony.category)?.label.split(' ')[0] || '✨'}
              </div>

              <blockquote style={{
                margin: '0 0 1rem 0',
                fontSize: '1rem',
                lineHeight: '1.6',
                fontStyle: 'italic',
                color: 'var(--color-text)'
              }}>
                "{testimony.content}"
              </blockquote>

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <cite style={{
                  fontWeight: 'bold',
                  color: 'var(--color-primary)',
                  fontSize: '0.9rem'
                }}>
                  - {testimony.author_name}
                </cite>
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  fontSize: '0.8rem',
                  color: 'var(--color-text-muted)'
                }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Calendar size={12} />
                    {new Date(testimony.created_at).toLocaleDateString()}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Heart size={12} />
                    {testimony.likes || 0}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Testimonies;