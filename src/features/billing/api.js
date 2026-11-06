import apiClient from '../../api/client.js';

export const billingApi = {
  products: () => apiClient.get('/api/billing/ad-free/products').then((res) => res.data.products),
  entitlement: () => apiClient.get('/api/billing/entitlement').then((res) => res.data.entitlement),
  checkout: (planKey, idempotencyKey) => apiClient.post('/api/billing/ad-free/checkout', { planKey, paymentMethod: 'paystack_bank_transfer', idempotencyKey }).then((res) => res.data.purchase),
  checkoutStatus: (reference) => apiClient.get('/api/billing/ad-free/checkout-status', { params: { reference } }).then((res) => res.data.purchase ?? res.data),
  status: (reference) => apiClient.get('/api/billing/ad-free/status', { params: reference ? { reference } : {} }).then((res) => res.data),
  refreshStatus: (reference) => apiClient.get('/api/billing/ad-free/status', { params: { reference, refresh: true } }).then((res) => res.data),
  cancel: (reference) => apiClient.post('/api/billing/ad-free/cancel', { reference }).then((res) => res.data.purchase),
  purchases: () => apiClient.get('/api/billing/ad-free/purchases').then((res) => res.data.purchases),
};
