import { useQuery } from '@tanstack/react-query';
import apiClient from '../../api/client.js';
import { examApi } from './api.js';

/**
 * The marked paper for a session .read by the result page *and* the report sheet.
 *
 * Both screens use one query key, so opening the report from the result renders
 * the paper that is already in the cache instead of fetching it twice. That
 * matters most for Post-UTME, where fetching the result marks the attempt as a
 * side effect: a second key there would submit the paper a second time.
 *
 * `isPostUtme` is part of the key because the two payloads are not the same
 * shape .the Post-UTME response carries a scaled `totalScore` out of 40, which
 * is normalised here so every consumer sees a percentage.
 */
export function useExamResult(id, isPostUtme = false) {
  return useQuery({
    queryKey: ['examResult', id, isPostUtme],
    queryFn: async () => {
      if (isPostUtme) {
        const { data } = await apiClient.post(`/api/post-utme/${id}/submit`);
        return {
          ...data.session,
          score: Math.round((data.session.totalScore / 40) * 100),
          correctCount: data.session.totalScore,
          subjectCode: 'POST-UTME',
        };
      }
      return examApi.result(id);
    },
    retry: false,
    refetchOnWindowFocus: false,
  });
}

export default useExamResult;
