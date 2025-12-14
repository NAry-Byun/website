import apiClient from './client';

export const orderAPI = {
  // Get all orders
  getAll: async () => {
    return await apiClient.get('/orders');
  },

  // Get order by id
  getById: async (id, userId) => {
    return await apiClient.get(`/orders/${id}?userId=${userId}`);
  },

  // Get orders by user id
  getByUserId: async (userId) => {
    return await apiClient.get(`/orders/user/${userId}`);
  },

  // Create new order
  create: async (orderData) => {
    return await apiClient.post('/orders', orderData);
  },

  // Update order
  update: async (id, orderData) => {
    return await apiClient.put(`/orders/${id}`, orderData);
  },

  // Delete order
  delete: async (id, userId) => {
    return await apiClient.delete(`/orders/${id}?userId=${userId}`);
  },
};
