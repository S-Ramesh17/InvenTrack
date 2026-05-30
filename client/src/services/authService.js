import api from './api';

export const loginUser = (credentials) => api.post('/api/auth/login', credentials);
export const registerUser = (data) => api.post('/api/auth/register', data);
