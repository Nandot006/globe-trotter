const API_URL = 'http://localhost:5000/api';

export const api = {
  // Trips
  getTrips: async (params?: { user_id?: number; status?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.user_id) query.append('user_id', params.user_id.toString());
    if (params?.status) query.append('status', params.status);
    if (params?.search) query.append('search', params.search);
    
    const response = await fetch(`${API_URL}/trips?${query}`, {
      credentials: 'include',
    });
    return response.json();
  },

  getTrip: async (tripId: number) => {
    const response = await fetch(`${API_URL}/trips/${tripId}`, {
      credentials: 'include',
    });
    return response.json();
  },

  createTrip: async (tripData: any) => {
    const response = await fetch(`${API_URL}/trips`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(tripData),
    });
    return response.json();
  },

  updateTrip: async (tripId: number, tripData: any) => {
    const response = await fetch(`${API_URL}/trips/${tripId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(tripData),
    });
    return response.json();
  },

  deleteTrip: async (tripId: number) => {
    const response = await fetch(`${API_URL}/trips/${tripId}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    return response.json();
  },

  // Itinerary
  addItinerarySection: async (tripId: number, sectionData: any) => {
    const response = await fetch(`${API_URL}/itinerary/${tripId}/sections`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(sectionData),
    });
    return response.json();
  },

  addActivity: async (sectionId: number, activityData: any) => {
    const response = await fetch(`${API_URL}/itinerary/sections/${sectionId}/activities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(activityData),
    });
    return response.json();
  },

  // Cities
  getCities: async (params?: { featured?: boolean; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.featured) query.append('featured', '1');
    if (params?.search) query.append('search', params.search);
    
    const response = await fetch(`${API_URL}/cities?${query}`, {
      credentials: 'include',
    });
    return response.json();
  },

  getCityActivities: async (cityId: number) => {
    const response = await fetch(`${API_URL}/cities/${cityId}/activities`, {
      credentials: 'include',
    });
    return response.json();
  },

  // Community
  getCommunityPosts: async () => {
    const response = await fetch(`${API_URL}/community/posts`, {
      credentials: 'include',
    });
    return response.json();
  },

  createCommunityPost: async (postData: any) => {
    const response = await fetch(`${API_URL}/community/posts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(postData),
    });
    return response.json();
  },

  getPostComments: async (postId: number) => {
    const response = await fetch(`${API_URL}/community/posts/${postId}/comments`, {
      credentials: 'include',
    });
    return response.json();
  },

  addComment: async (postId: number, commentData: any) => {
    const response = await fetch(`${API_URL}/community/posts/${postId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(commentData),
    });
    return response.json();
  },

  // Admin
  getAdminStats: async () => {
    const response = await fetch(`${API_URL}/admin/stats`, {
      credentials: 'include',
    });
    return response.json();
  },

  getAllUsers: async () => {
    const response = await fetch(`${API_URL}/admin/users`, {
      credentials: 'include',
    });
    return response.json();
  },

  // Users
  getUser: async (userId: number) => {
    const response = await fetch(`${API_URL}/users/${userId}`, {
      credentials: 'include',
    });
    return response.json();
  },

  updateUser: async (userId: number, userData: any) => {
    const response = await fetch(`${API_URL}/users/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(userData),
    });
    return response.json();
  },
};
