import api from './api';

export const requestService = {
  async getRequests(params = {}) {
    const response = await api.get('/requests', { params });
    return response.data;
  },

  async getRequestById(id) {
    const response = await api.get(`/requests/${id}`);
    return response.data;
  },

  async createRequest(requestData) {
    const response = await api.post('/requests', requestData);
    return response.data;
  },

  async updateRequest(id, updateData) {
    const response = await api.put(`/requests/${id}`, updateData);
    return response.data;
  },

  async deleteRequest(id) {
    const response = await api.delete(`/requests/${id}`);
    return response.data;
  },
};
