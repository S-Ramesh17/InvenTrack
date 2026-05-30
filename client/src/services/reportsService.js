import api from './api';

export const getMovements = () => api.get('/api/reports/movements');
export const getSummary = () => api.get('/api/reports/summary');
