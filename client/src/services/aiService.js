import api from './api';

export const getRecommendations = () => api.get('/api/ai/recommendations');
export const getProductInsight = (id) => api.get(`/api/ai/product-insight/${id}`);
