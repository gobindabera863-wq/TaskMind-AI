import api from './api';

export const register = async (userData) => {
  const response = await api.post('/auth/register', userData);
  return response.data;
};

export const verifyOTP = async (email, otp) => {
  const response = await api.post('/auth/verify-otp', { email, otp });
  if (response.data.token) {
    localStorage.setItem('taskmind_token', response.data.token);
    localStorage.setItem('taskmind_user', JSON.stringify(response.data));
  }
  return response.data;
};

export const resendOTP = async (email) => {
  const response = await api.post('/auth/resend-otp', { email });
  return response.data;
};

export const login = async (userData) => {
  const response = await api.post('/auth/login', userData);
  if (response.data.token) {
    localStorage.setItem('taskmind_token', response.data.token);
    localStorage.setItem('taskmind_user', JSON.stringify(response.data));
  }
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('taskmind_token');
  localStorage.removeItem('taskmind_user');
};

export const getMe = async () => {
  const response = await api.get('/auth/me');
  return response.data;
};
