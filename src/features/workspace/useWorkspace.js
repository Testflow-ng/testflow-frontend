import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { wsApi } from './api.js';
import { useOrg } from './OrgContext.js';

const k = (...p) => ['ws', ...p];

export const useOrganizations = () => useQuery({ queryKey: k('orgs'), queryFn: wsApi.organizations, retry: false });

function scoped(name, fn, extra = {}) {
  return (params) => {
    const { orgId } = useOrg();
    return useQuery({ queryKey: k(orgId, name, params), queryFn: () => fn(orgId, params), placeholderData: keepPreviousData, ...extra });
  };
}
export const useSite = scoped('site', (id) => wsApi.site(id));
export const useExams = scoped('exams', wsApi.exams);
export const usePosts = scoped('posts', (id) => wsApi.posts(id));
/** One exam, and the things that belong to it. */
function useExamPart(name, fn, examId) {
  const { orgId } = useOrg();
  return useQuery({ queryKey: k(orgId, name, examId), queryFn: () => fn(orgId, examId), enabled: Boolean(examId) });
}
export const useExam = (examId) => useExamPart('exam', wsApi.exam, examId);
export const useExamQuestions = (examId) => useExamPart('exam-questions', wsApi.examQuestions, examId);
export const useExamResults = (examId) => useExamPart('exam-results', wsApi.examResults, examId);
export const useFlags = scoped('flags', (id) => wsApi.flags(id));
export const useQuestionBanks = scoped('question-banks', (id) => wsApi.questionBanks(id));
export const useBankQuestions = (bankId, params) => {
  const { orgId } = useOrg();
  return useQuery({ queryKey: k(orgId, 'bank-questions', bankId, params), queryFn: () => wsApi.bankQuestions(orgId, bankId, params), enabled: Boolean(bankId), placeholderData: keepPreviousData });
};
export const useQuestions = scoped('questions', wsApi.questions);
export const useStudents = scoped('students', wsApi.students);
export const useStudent = scoped('student', (id, studentId) => wsApi.student(id, studentId));
export const useBooks = scoped('books', (id) => wsApi.books(id));
export const useEarnings = scoped('earnings', (id) => wsApi.earnings(id));
export const usePayments = scoped('payments', wsApi.payments);
export const useDomains = scoped('domains', (id) => wsApi.domains(id));
export const useSubscription = scoped('subscription', (id) => wsApi.subscription(id), { retry: false });
export const useSubscriptionPayments = scoped('subpayments', (id) => wsApi.subscriptionPayments(id));
export const useBanks = () => useQuery({ queryKey: k('banks'), queryFn: wsApi.banks, staleTime: 3600000 });
export const usePlans = () => useQuery({ queryKey: k('plans'), queryFn: wsApi.plans });

/** A write that refreshes everything in this workspace afterwards. */
export function useWsMutation(fn, options = {}) {
  const qc = useQueryClient();
  const { orgId } = useOrg();
  return useMutation({
    mutationFn: (vars) => fn(orgId, vars),
    ...options,
    onSuccess: (...args) => {
      qc.invalidateQueries({ queryKey: ['ws'] });
      options.onSuccess?.(...args);
    },
  });
}
