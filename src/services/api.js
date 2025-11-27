/**
 * API Service for GenFree Network
 * Connects React frontend to Django backend
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';
const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8000/ws';

class APIService {
  constructor() {
    this.baseURL = API_BASE_URL;
    this.wsBaseURL = WS_BASE_URL;
    this.token = localStorage.getItem('accessToken');
  }

  // Helper method for API requests
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      // Handle token refresh for 401 errors
      if (response.status === 401 && this.token) {
        const refreshed = await this.refreshToken();
        if (refreshed) {
          // Retry original request with new token
          config.headers['Authorization'] = `Bearer ${this.token}`;
          return fetch(url, config).then(res => res.json());
        } else {
          // Redirect to login if refresh fails
          this.logout();
          window.location.href = '/login';
          return;
        }
      }

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // Authentication methods
  async login(email, password, rememberMe = false) {
    try {
      const response = await this.request('/auth/login/', {
        method: 'POST',
        body: JSON.stringify({ email, password, remember_me: rememberMe }),
      });

      if (response.tokens) {
        this.setTokens(response.tokens.access, response.tokens.refresh);
        return { success: true, user: response.user };
      }
      
      return { success: false, error: 'Invalid credentials' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async register(userData) {
    try {
      const response = await this.request('/auth/register/', {
        method: 'POST',
        body: JSON.stringify(userData),
      });

      if (response.tokens) {
        this.setTokens(response.tokens.access, response.tokens.refresh);
        return { success: true, user: response.user };
      }
      
      return { success: false, error: 'Registration failed' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async logout() {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      try {
        await this.request('/auth/logout/', {
          method: 'POST',
          body: JSON.stringify({ refresh_token: refreshToken }),
        });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    
    this.clearTokens();
  }

  async refreshToken() {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return false;

    try {
      const response = await fetch(`${this.baseURL}/auth/token/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        this.setTokens(data.access, refreshToken);
        return true;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
    }
    
    return false;
  }

  setTokens(accessToken, refreshToken) {
    this.token = accessToken;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
  }

  clearTokens() {
    this.token = null;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  isAuthenticated() {
    return !!this.token;
  }

  // User Profile methods
  async getCurrentUser() {
    return this.request('/auth/profile/me/');
  }

  async updateProfile(profileData) {
    return this.request('/auth/profile/update/', {
      method: 'PATCH',
      body: JSON.stringify(profileData),
    });
  }

  // Events methods
  async getEvents() {
    return this.request('/events/');
  }

  async getEvent(id) {
    return this.request(`/events/${id}/`);
  }

  async getLiveEvents() {
    return this.request('/events/live/');
  }

  async registerForEvent(eventId, registrationData) {
    return this.request(`/events/${eventId}/register/`, {
      method: 'POST',
      body: JSON.stringify(registrationData),
    });
  }

  // Donations methods
  async getDonationCampaigns() {
    return this.request('/donations/campaigns/');
  }

  async getCampaign(id) {
    return this.request(`/donations/campaigns/${id}/`);
  }

  async createDonation(donationData) {
    return this.request('/donations/create/', {
      method: 'POST',
      body: JSON.stringify(donationData),
    });
  }

  async initializePayment(paymentData) {
    return this.request('/donations/payment/initialize/', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }

  async getDonationStats() {
    return this.request('/donations/stats/');
  }

  async getUserDonations() {
    return this.request('/donations/my-donations/');
  }

  // Live Streaming methods
  async getLiveStatus() {
    return this.request('/livestream/status/');
  }

  async getStreamAnalytics() {
    return this.request('/livestream/analytics/');
  }

  // Chat methods
  async getChatMessages(limit = 50) {
    return this.request(`/chat/messages/?limit=${limit}`);
  }

  async sendChatMessage(message, userName) {
    return this.request('/chat/messages/', {
      method: 'POST',
      body: JSON.stringify({ message, user_name: userName }),
    });
  }

  // Analytics methods
  async getUserStats() {
    return this.request('/auth/stats/');
  }

  // WebSocket helper
  createWebSocket(endpoint) {
    const wsUrl = `${this.wsBaseURL}${endpoint}`;
    const ws = new WebSocket(wsUrl);
    
    // Add authentication token to WebSocket if available
    if (this.token) {
      ws.addEventListener('open', () => {
        ws.send(JSON.stringify({
          type: 'authentication',
          token: this.token
        }));
      });
    }

    return ws;
  }
}

// Create singleton instance
const apiService = new APIService();

export default apiService;