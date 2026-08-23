import api from './axios';

const API_URL = '/activity-logs';

export const getAllLogs = async (params = {}) => {
  const response = await api.get(API_URL, { params });
  return response.data;
};

export const getActivityById = async (id) => {
  const response = await api.get(`${API_URL}/${id}`);
  return response.data;
};

export const reversePayment = async (id) => {
  const response = await api.post(`${API_URL}/${id}/reverse-payment`);
  return response.data;
};
