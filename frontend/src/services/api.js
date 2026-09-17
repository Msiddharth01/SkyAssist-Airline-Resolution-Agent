import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

export const fetchCustomers = () => api.get('/chat/customers').then((r) => r.data);

export const sendMessage = (customerId, message, sessionId) =>
  api.post('/chat/message', { customerId, message, sessionId }).then((r) => r.data);

export const resetSession = (sessionId) =>
  api.post('/chat/reset', { sessionId }).then((r) => r.data);

export const fetchAuditLog = () => api.get('/chat/audit').then((r) => r.data);

export default api;
