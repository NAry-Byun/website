import apiClient from './client';

export const productAPI = {
  // Get all products
  getAll: async () => {
    return await apiClient.get('/products');
  },

  // Get product by id
  getById: async (id, category) => {
    return await apiClient.get(`/products/${id}?category=${category}`);
  },

  // Create new product
  create: async (productData) => {
    return await apiClient.post('/products', productData);
  },

  // Update product
  update: async (id, productData) => {
    return await apiClient.put(`/products/${id}`, productData);
  },

  // Delete product
  delete: async (id, category) => {
    return await apiClient.delete(`/products/${id}?category=${category}`);
  },
};
