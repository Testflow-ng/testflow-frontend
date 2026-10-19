import apiClient from '../../api/client.js';

export const billingApi = {
  products: () => apiClient.get('/api/billing/ad-free/products').then((res) => res.data.products),
  entitlement: () => apiClient.get('/api/billing/entitlement').then((res) => res.data.entitlement),
  checkout: (planKey, idempotencyKey) => apiClient.post('/api/billing/ad-free/checkout', { planKey, idempotencyKey }).then((res) => res.data.purchase),
  status: (reference) => apiClient.get('/api/billing/ad-free/status', { params: reference ? { reference } : {} }).then((res) => res.data),
  cancel: (reference) => apiClient.post('/api/billing/ad-free/cancel', { reference }).then((res) => res.data.purchase),
};
