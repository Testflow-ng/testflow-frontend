import apiClient from '../../api/client.js';

export const advertisingApi = {
  config: () => apiClient.get('/api/advertising/config').then((res) => res.data.advertising),
  eligibility: (placement) =>
    apiClient.get('/api/advertising/eligibility', { params: { placement, consent: 'unknown' } }).then((res) => res.data.eligibility),
};
