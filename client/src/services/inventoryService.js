import api from './api';

export const stockIn = (data) => api.post('/api/inventory/stock-in', data);
export const stockOut = (data) => api.post('/api/inventory/stock-out', data);
