import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, ChevronLeft, ExternalLink, RotateCcw, ShieldCheck, X } from 'lucide-react';
import {
  Alert,
  Badge,
  Button,
  EmptyState,
  Modal,
  SegmentedControl,
  Spinner,
  StatusBadge,
  Textarea,
  buttonClasses,
  useToast,
} from '../../../components/ui/index.js';
import { sheetClasses } from '../../../components/ui/surfaces.js';
import MathText from '../../../components/MathText.jsx';
import OptionRow from '../../../components/exam/OptionRow.jsx';
import { flagReasonLabel } from '../../exam/flagReasons.js';
import { adminApi } from '../api.js';

const letter = (index) => String.fromCharCode(65 + index);

const formatWhen = (value) =>
  value
    ? new Date(value).toLocaleString('en-NG', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

/**
 * Reported questions, for review.
 *
 * The queue the students' reports land in. Each row is the whole question as they saw it:
 * stem, options, the marked answer and the explanation. Plus what they said was wrong, so a
 * decision can be made without opening the bank in another tab. That other tab is one click
 * away for the fix itself.
 *
 * "Resolved" and "dismissed" are different verdicts and stay separate: resolved means the
 * bank was changed, dismissed means the question was fine. Both are read by whoever sees the
 * report next, and a count of open reports on a single question is the strongest signal the
 * queue has.
 */
function FlaggedQuestionsPage() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState('open');
  const [action, setAction] = useState(null); // { flag, status }
  const [resolution, setResolution] = useState('');

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['questionFlags'],
    queryFn: () => adminApi.listQuestionFlags(),
  });

  const decide = useMutation({
    mutationFn: ({ flag, nextStatus, note }) =>
      adminApi.resolveQuestionFlag(flag.id, { status: nextStatus, resolution: note }),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: ['questionFlags'] });
      toast.success(
        variables.nextStatus === 'resolved' ? 'Marked resolved' : variables.nextStatus === 'open' ? 'Reopened' : 'Dismissed',
        variables.nextStatus === 'resolved'
          ? 'Remember to fix the question in the bank.'
          : undefined,
      );
      setAction(null);
      setResolution('');
    },
    onError: (err) => {
      toast.error('That decision did not save', err?.message ?? 'Please try again.');
    },
  });

  const flags = data?.flags ?? [];
  const counts = data?.counts ?? { open: 0, resolved: 0, dismissed: 0, questionCount: 0 };
  const visible = flags.filter((flag) => flag.status === status);

  const openAction = (flag, nextStatus) => {
    setResolution(flag.resolution ?? '');
    setAction({ flag, nextStatus });
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-5 py-8">
      <div className="mb-8 flex items-center gap-4">
        <Link
          to="/admin"
          aria-label="Back to the admin dashboard"
          className="inline-flex size-10 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:text-foreground-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <ChevronLeft size={20} aria-hidden="true" />
        </Link>
        <div>
          <h1 className="font-heading text-2xl font-extrabold tracking-tight text-foreground-strong sm:text-3xl">
            Reported questions
          </h1>
          <p className="mt-1 text-sm text-muted">
            What students say is wrong with a question.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size={26} label="Loading reports" />
        </div>
      ) : isError ? (
        <Alert variant="danger">{error?.message ?? 'The reports could not be loaded.'}</Alert>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <SegmentedControl
              label="Filter reports"
              value={status}
              onValueChange={setStatus}
              size="sm"
              options={[
                { value: 'open', label: `Open ${counts.open}` },
                { value: 'resolved', label: `Resolved ${counts.resolved}` },
                { value: 'dismissed', label: `Dismissed ${counts.dismissed}` },
              ]}
            />
            {counts.open > 0 && (
              <p className="text-xs font-semibold text-muted">
                {counts.questionCount} question{counts.questionCount === 1 ? '' : 's'} ever reported
              </p>
            )}
          </div>

          {visible.length === 0 ? (
            <EmptyState
              className="mt-3"
              icon={ShieldCheck}
              title={
                status === 'open'
                  ? 'No reports waiting'
                  : `Nothing ${status === 'resolved' ? 'resolved' : 'dismissed'} yet`
              }
              description={
                status === 'open'
                  ? 'When a student reports a question in a paper or in their corrections, it appears here.'
                  : 'Decisions you make on a report show up here.'
              }
            />
          ) : (
            <ol className="mt-3 flex flex-col gap-3">
              {visible.map((flag) => {
                const question = flag.question;
                return (
                  <li key={flag.id} className={sheetClasses({ className: 'p-5' })}>
                    <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
                      <div className="flex min-w-0 flex-wrap items-center gap-2">
                        <Badge variant="danger">{flagReasonLabel(flag.reason)}</Badge>
                        {flag.reportCount > 1 && (
                          <Badge variant="warning">{flag.reportCount} reports</Badge>
                        )}
                        {flag.status !== 'open' && <StatusBadge status={flag.status} />}
                        {question?.subjectCode && (
                          <span className="text-xs font-bold text-muted">{question.subjectCode}</span>
                        )}
                        <span className="text-xs text-muted">{formatWhen(flag.createdAt)}</span>
                      </div>

                      <div className="flex shrink-0 flex-wrap items-center gap-1">
                        <Link
                          to={`/admin/questions/${flag.questionId}/edit`}
                          className={buttonClasses({ variant: 'ghost', size: 'sm' })}
                        >
                          <ExternalLink size={15} aria-hidden="true" />
                          Open in bank
                        </Link>
                        {flag.status === 'open' ? (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openAction(flag, 'dismissed')}
                              leadingIcon={<X size={15} aria-hidden="true" />}
                            >
                              Dismiss
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => openAction(flag, 'resolved')}
                              leadingIcon={<Check size={15} aria-hidden="true" />}
                            >
                              Resolve
                            </Button>
                          </>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openAction(flag, 'open')}
                            leadingIcon={<RotateCcw size={15} aria-hidden="true" />}
                          >
                            Reopen
                          </Button>
                        )}
                      </div>
                    </div>

                    <MathText className="mt-3 block text-[15px] font-medium leading-relaxed text-foreground-strong">
                      {question?.stem ?? 'This question is no longer in the bank.'}
                    </MathText>

                    {question?.options?.length ? (
                      <div className="mt-4 space-y-2">
                        {question.options.map((option, index) => (
                          <OptionRow
                            key={index}
                            label={letter(index)}
                            name={`flagged-${flag.id}`}
                            disabled
                            state={index === question.correctOption ? 'answer' : 'idle'}
                          >
                            {option}
                          </OptionRow>
                        ))}
                      </div>
                    ) : null}

                    {question?.explanation && (
                      <Alert variant="info" className="mt-3 text-[13px] leading-relaxed">
                        <span className="font-bold text-foreground-strong">Explanation. </span>
                        <MathText className="inline">{question.explanation}</MathText>
                      </Alert>
                    )}

                    <div className="mt-3 rounded-[16px] border border-border bg-surface-strong/40 p-3.5">
                      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted">
                        Reported by {flag.student?.fullName ?? 'a student'}
                        {flag.student?.matricNumber ? ` · ${flag.student.matricNumber}` : ''}
                      </p>
                      {flag.note ? (
                        <p className="mt-1.5 text-sm leading-relaxed text-foreground-strong">
                          “{flag.note}”
                        </p>
                      ) : (
                        <p className="mt-1.5 text-sm text-muted">No note given.</p>
                      )}
                      {flag.status !== 'open' && flag.resolution && (
                        <p className="mt-2 border-t border-border pt-2 text-[13px] leading-relaxed text-muted">
                          <b className="text-foreground">Resolution.</b> {flag.resolution}
                        </p>
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </>
      )}

      <Modal
        open={Boolean(action)}
        onOpenChange={(open) => {
          if (!open) setAction(null);
        }}
        title={
          action?.nextStatus === 'resolved'
            ? 'Resolve this report'
            : action?.nextStatus === 'dismissed'
              ? 'Dismiss this report'
              : 'Reopen this report'
        }
        description={
          action?.nextStatus === 'resolved'
            ? 'Note what you changed in the bank. The next admin to read this sees it.'
            : action?.nextStatus === 'dismissed'
              ? 'Note why the question is fine, so the same report is not re-checked.'
              : 'Put this report back in the open queue.'
        }
        footer={
          <>
            <Button
              variant="ghost"
              onClick={() => setAction(null)}
              disabled={decide.isPending}
            >
              Cancel
            </Button>
            <Button
              loading={decide.isPending}
              onClick={() =>
                decide.mutate({
                  flag: action.flag,
                  nextStatus: action.nextStatus,
                  note: resolution.trim(),
                })
              }
            >
              {action?.nextStatus === 'resolved'
                ? 'Mark resolved'
                : action?.nextStatus === 'dismissed'
                  ? 'Dismiss'
                  : 'Reopen'}
            </Button>
          </>
        }
      >
        <div className="py-1">
          <label
            htmlFor="flag-resolution"
            className="mb-1.5 block text-sm font-medium text-foreground-strong"
          >
            Note{' '}
            <span className="font-normal text-muted">
              ({action?.nextStatus === 'open' ? 'optional' : 'optional, but useful'})
            </span>
          </label>
          <Textarea
            id="flag-resolution"
            rows={3}
            maxLength={500}
            value={resolution}
            onChange={(event) => setResolution(event.target.value)}
            placeholder="Fixed the answer key .option C was right."
          />
        </div>
      </Modal>
    </div>
  );
}

export default FlaggedQuestionsPage;
