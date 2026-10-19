import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { adminApi } from './api.js';

const key = (...parts) => ['admin', ...parts];

export const useAdminStats = () => useQuery({ queryKey: key('stats'), queryFn: adminApi.getStats, refetchInterval: 30000 });
export const useActivity = (limit = 20) => useQuery({ queryKey: key('activity', limit), queryFn: () => adminApi.getActivityFeed({ limit }) });
export const useStudents = (params) => useQuery({ queryKey: key('students', params), queryFn: () => adminApi.listStudents(params), placeholderData: keepPreviousData });
export const useAdmins = (enabled) => useQuery({ queryKey: key('roster'), queryFn: adminApi.listAdmins, enabled });
export const useFlags = () => useQuery({ queryKey: key('flags'), queryFn: () => adminApi.listQuestionFlags({ limit: 200 }) });
export const useFeedback = (params) => useQuery({ queryKey: key('feedback', params), queryFn: () => adminApi.listFeedback(params), placeholderData: keepPreviousData });
export const useVerifications = (status) => useQuery({ queryKey: key('verifications', status), queryFn: () => adminApi.listVerifications({ status }) });
export const useAdminSettings = () => useQuery({ queryKey: key('settings'), queryFn: adminApi.getSettings });
export const useAdsOverview = () => useQuery({ queryKey: key('ads', 'overview'), queryFn: adminApi.adsOverview, retry: false });
export const useAdsCampaigns = (params) => useQuery({ queryKey: key('ads', 'campaigns', params), queryFn: () => adminApi.adsCampaigns(params), placeholderData: keepPreviousData });
export const useAdsPayments = (params) => useQuery({ queryKey: key('ads', 'payments', params), queryFn: () => adminApi.adsPayments(params), placeholderData: keepPreviousData });
export const useAdsSettings = () => useQuery({ queryKey: key('ads', 'settings'), queryFn: adminApi.adsSettings, retry: false });
export const useAdvertisingHealth = () => useQuery({ queryKey: key('ads', 'health'), queryFn: adminApi.advertisingHealth, retry: false });
export const useAdminQuestions = (params) => useQuery({ queryKey: key('questions', params), queryFn: () => adminApi.listQuestions(params), placeholderData: keepPreviousData });

/** A mutation that refreshes every admin query when it succeeds. */
export function useAdminMutation(fn, options = {}) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    ...options,
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: ['admin'] });
      options.onSuccess?.(...args);
    },
  });
}
