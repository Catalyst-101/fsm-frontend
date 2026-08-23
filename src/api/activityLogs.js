import axios from 'axios';

const API_URL = '/api/v1/activity-logs';

export const getAllLogs = async (params = {}) => {
  const response = await axios.get(API_URL, { params });
  return response.data;
};

export const getActivityById = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
};

export const reversePayment = async (id) => {
  const response = await axios.post(`${API_URL}/${id}/reverse-payment`);
  return response.data;
};
