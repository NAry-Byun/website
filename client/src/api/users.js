import apiClient from './client';

export const userAPI = {
  // Get all users
  getAll: async () => {
    return await apiClient.get('/users');
  },

  // Get user by id
  getById: async (id, email) => {
    return await apiClient.get(`/users/${id}?email=${email}`);
  },

  // Get user by email
  getByEmail: async (email) => {
    return await apiClient.get(`/users/email/${email}`);
  },

  // Create new user (register)
  register: async (userData) => {
    return await apiClient.post('/users', userData);
  },

  // Login user
  login: async (email, password) => {
    return await apiClient.post('/users/login', { email, password });
  },

  // Update user
  update: async (id, userData) => {
    return await apiClient.put(`/users/${id}`, userData);
  },

  // Delete user
  delete: async (id, email) => {
    return await apiClient.delete(`/users/${id}?email=${email}`);
  },
};
