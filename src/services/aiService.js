import api from './api';

export const parseTaskNLP = async (prompt) => {
  const response = await api.post('/ai/parse-task', { prompt });
  return response.data;
};

export const getTaskBreakdown = async (title) => {
  const response = await api.post('/ai/breakdown', { title });
  return response.data;
};

export const getTaskPrioritization = async () => {
  const response = await api.post('/ai/prioritize');
  return response.data;
};

export const sendAIChat = async (message) => {
  const response = await api.post('/ai/chat', { message });
  return response.data;
};
