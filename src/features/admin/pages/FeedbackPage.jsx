import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, ChevronLeft, Eye, MessageSquare, RotateCcw } from 'lucide-react';
import {
  Alert,
  Badge,
  Button,
  EmptyState,
  Modal,
  SegmentedControl,
  Spinner,
  StarRating,
  StatusBadge,
  Textarea,
  useToast,
} from '../../../components/ui/index.js';
import { sheetClasses } from '../../../components/ui/surfaces.js';
import { feedbackKind } from '../../feedback/kinds.js';
import { adminApi } from '../api.js';

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
 * What students sent from Settings.
 *
 * The other end of `/settings/feedback`: ratings, problems and ideas, with who sent them and
 * where on TestFlow they were. There are three states, and only one of them means done:
 * acknowledged is "we have read this and it is real", resolved is "it is dealt with", and
 * the reply is the part the student actually sees.
 *
 * Not the same queue as `/admin/reports`: that one is about *questions* being wrong.
 */
function FeedbackPage() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState('open');
  const [resolving, setResolving] = useState(null);
  const [reply, setReply] = useState('');

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['adminFeedback'],
    queryFn: () => adminApi.listFeedback(),
  });

  const update = useMutation({
    mutationFn: ({ entry, nextStatus, note }) =>
      adminApi.updateFeedback(entry.id, { status: nextStatus, reply: note }),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({ queryKey: ['adminFeedback'] });
      toast.success(
        variables.nextStatus === 'resolved'
          ? 'Marked resolved'
          : variables.nextStatus === 'in_review'
            ? 'Marked in review'
            : 'Reopened',
        variables.nextStatus === 'resolved' ? 'The student sees your reply.' : undefined,
      );
      setResolving(null);
      setReply('');
    },
    onError: (err) => toast.error('That did not save', err?.message ?? 'Please try again.'),
  });

  const entries = data?.feedback ?? [];
  const counts = data?.counts ?? { open: 0, in_review: 0, resolved: 0, total: 0, averageRating: null };
  const visible = entries.filter((entry) => entry.status === status);

  const openResolve = (entry) => {
    setReply(entry.reply ?? '');
    setResolving(entry);
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
            Feedback
          </h1>
          <p className="mt-1 text-sm text-muted">
            What students sent from Settings.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size={26} label="Loading feedback" />
        </div>
      ) : isError ? (
        <Alert variant="danger">{error?.message ?? 'The feedback could not be loaded.'}</Alert>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <SegmentedControl
              label="Filter feedback"
              value={status}
              onValueChange={setStatus}
              size="sm"
              options={[
                { value: 'open', label: `Open ${counts.open}` },
                { value: 'in_review', label: `In review ${counts.in_review}` },
                { value: 'resolved', label: `Resolved ${counts.resolved}` },
              ]}
            />
            {counts.averageRating != null && (
              <span className="flex items-center gap-2 text-xs font-semibold text-muted">
                <StarRating value={Math.round(counts.averageRating)} readOnly size={13} />
                {counts.averageRating} average from {counts.total}
              </span>
            )}
          </div>

          {visible.length === 0 ? (
            <EmptyState
              className="mt-3"
              icon={MessageSquare}
              title={
                status === 'open'
                  ? 'Nothing waiting'
                  : status === 'in_review'
                    ? 'Nothing being looked at'
                    : 'Nothing resolved yet'
              }
              description={
                status === 'open'
                  ? 'When a student sends feedback or reports a problem from Settings, it lands here.'
                  : 'Entries move here once you decide what to do with them.'
              }
            />
          ) : (
            <ol className="mt-3 flex flex-col gap-3">
              {visible.map((entry) => {
                const kindCfg = feedbackKind(entry.kind);
                return (
                  <li key={entry.id} className={sheetClasses({ className: 'p-5' })}>
                    <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2">
                      <div className="flex min-w-0 flex-wrap items-center gap-2">
                        <Badge variant={kindCfg.variant}>{kindCfg.label}</Badge>
                        <StatusBadge status={entry.status} />
                        {entry.rating ? <StarRating value={entry.rating} readOnly size={14} /> : null}
                        <span className="text-xs text-muted">{formatWhen(entry.createdAt)}</span>
                      </div>

                      <div className="flex shrink-0 flex-wrap items-center gap-1">
                        {entry.status === 'open' ? (
                          <Button
                            variant="outline"
                            size="sm"
                            leadingIcon={<Eye size={15} aria-hidden="true" />}
                            onClick={() => update.mutate({ entry, nextStatus: 'in_review', note: entry.reply ?? '' })}
                          >
                            Acknowledge
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            leadingIcon={<RotateCcw size={15} aria-hidden="true" />}
                            onClick={() => update.mutate({ entry, nextStatus: 'open', note: entry.reply ?? '' })}
                          >
                            Reopen
                          </Button>
                        )}
                        {entry.status !== 'resolved' && (
                          <Button
                            size="sm"
                            leadingIcon={<Check size={15} aria-hidden="true" />}
                            onClick={() => openResolve(entry)}
                          >
                            Resolve
                          </Button>
                        )}
                      </div>
                    </div>

                    <p className="mt-3 whitespace-pre-line text-[15px] leading-relaxed text-foreground-strong">
                      {entry.message}
                    </p>

                    <div className="mt-3 rounded-[16px] border border-border bg-surface-strong/40 p-3.5">
                      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-muted">
                        From {entry.student?.fullName ?? 'a student'}
                        {entry.student?.matricNumber ? ` · ${entry.student.matricNumber}` : ''}
                        {entry.student?.username ? ` · @${entry.student.username}` : ''}
                      </p>
                      {entry.screen ? (
                        <p className="mt-1.5 text-sm text-foreground-strong">Screen: {entry.screen}</p>
                      ) : null}
                      {entry.reply ? (
                        <p className="mt-2 border-t border-border pt-2 text-[13px] leading-relaxed text-muted">
                          <b className="text-foreground">Reply.</b> {entry.reply}
                        </p>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </>
      )}

      <Modal
        open={Boolean(resolving)}
        onOpenChange={(open) => {
          if (!open) setResolving(null);
        }}
        title="Resolve this feedback"
        description="Your reply is shown to the student on the Settings → Feedback page. A note here is optional, but it is the only thing they hear back."
        footer={
          <>
            <Button variant="ghost" onClick={() => setResolving(null)} disabled={update.isPending}>
              Cancel
            </Button>
            <Button
              loading={update.isPending}
              onClick={() =>
                update.mutate({
                  entry: resolving,
                  nextStatus: 'resolved',
                  note: reply.trim(),
                })
              }
            >
              Mark resolved
            </Button>
          </>
        }
      >
        <div className="py-1">
          <label
            htmlFor="feedback-reply"
            className="mb-1.5 block text-sm font-medium text-foreground-strong"
          >
            Reply <span className="font-normal text-muted">(optional, but useful)</span>
          </label>
          <Textarea
            id="feedback-reply"
            rows={3}
            maxLength={500}
            value={reply}
            onChange={(event) => setReply(event.target.value)}
            placeholder="Fixed in the latest release .the timer keeps counting in the background now."
          />
        </div>
      </Modal>
    </div>
  );
}

export default FeedbackPage;
