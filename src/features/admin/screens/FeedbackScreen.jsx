import { useState } from 'react';
import { MessageSquare, Star } from 'lucide-react';
import { Badge, Button, Card, EmptyState, Field, Modal, Select, StatusBadge, Tabs, Textarea, useToast } from '../../../components/ui/index.js';
import StatCard from '../../../components/data/StatCard.jsx';
import Screen, { PageHeader } from '../../../components/layout/Screen.jsx';
import { adminApi } from '../api.js';
import { useAdminMutation, useFeedback } from '../useAdmin.js';
import { LoadError, TableSkeleton } from './shared.jsx';
import { timeAgo } from './format.js';

const KINDS = [{ value: '', label: 'All kinds' }, { value: 'rating', label: 'Ratings' }, { value: 'bug', label: 'Problems' }, { value: 'idea', label: 'Ideas' }];
const STATUS_ICON = { open: 'pending', in_review: 'in_progress', resolved: 'verified' };

/** What students send from Settings: ratings, problems and ideas. The reply is what the student sees. */
function FeedbackScreen() {
  const toast = useToast();
  const [status, setStatus] = useState('open');
  const [kind, setKind] = useState('');
  const [replying, setReplying] = useState(null);
  const [text, setText] = useState('');
  const { data, isLoading, error } = useFeedback({ status: status === 'all' ? undefined : status, kind: kind || undefined, limit: 50 });

  const update = useAdminMutation(({ entry, next, reply }) => adminApi.updateFeedback(entry.id, { status: next, reply }), {
    onSuccess: (_r, v) => { toast.success(v.next === 'resolved' ? 'Reply sent' : 'Updated'); setReplying(null); setText(''); },
    onError: (e) => toast.error('Could not update', e.message),
  });

  const c = data?.counts ?? {};
  const tabs = [{ value: 'open', label: 'Open', count: c.open }, { value: 'in_review', label: 'In review', count: c.in_review }, { value: 'resolved', label: 'Answered', count: c.resolved }, { value: 'all', label: 'All', count: c.total }];

  return (
    <Screen width="xl">
      <PageHeader title="Feedback" subtitle="Ratings, problems and ideas from students." />
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <StatCard label="Waiting for you" value={c.open ?? 0} icon={MessageSquare} tone="accent" />
        <StatCard label="Average rating" value={c.averageRating ?? '-'} icon={Star} tone="primary" trendLabel={c.ratedCount ? `from ${c.ratedCount} ratings` : undefined} />
        <StatCard label="All feedback" value={c.total ?? 0} icon={MessageSquare} tone="sage" />
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <Tabs idPrefix="feedback" label="Status" items={tabs} value={status} onValueChange={setStatus} />
        <div className="w-44"><Select aria-label="Kind" value={kind} onValueChange={setKind} options={KINDS} /></div>
      </div>

      <div className="mt-6">
        {error ? <LoadError error={error} what="feedback" /> : isLoading ? <TableSkeleton rows={4} /> : !data?.feedback?.length ? (
          <EmptyState mood="happy" title="Nothing to answer" description="New feedback from students shows up here." />
        ) : (
          <ul className="space-y-4">
            {data.feedback.map((e) => (
              <li key={e.id}>
                <Card padding="lg" className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={STATUS_ICON[e.status] ?? 'draft'} label={e.status === 'in_review' ? 'In review' : e.status === 'resolved' ? 'Answered' : 'Open'} />
                    <Badge variant="lavender">{e.kind}</Badge>
                    {e.screen && <Badge variant="outline">{e.screen}</Badge>}
                    {e.rating != null && <span className="inline-flex items-center gap-1 text-sm font-semibold text-foreground-strong"><Star size={14} className="fill-current text-warning" aria-hidden="true" />{e.rating}/5</span>}
                    <span className="ml-auto text-xs text-muted">{timeAgo(e.createdAt)}</span>
                  </div>
                  <p className="text-[15px] leading-relaxed text-foreground-strong">{e.message}</p>
                  {e.reply && <p className="rounded-xl bg-[var(--brand-lavender)] p-3 text-sm text-foreground"><span className="font-semibold">Your reply: </span>{e.reply}</p>}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <p className="text-xs text-muted">{e.student?.username ? `@${e.student.username}` : e.student?.matricNumber ?? 'A student'}</p>
                    <div className="flex gap-2">
                      {e.status === 'open' && <Button size="sm" variant="outline" onClick={() => update.mutate({ entry: e, next: 'in_review', reply: e.reply ?? '' })}>Start review</Button>}
                      {e.status !== 'resolved' ? <Button size="sm" onClick={() => { setReplying(e); setText(e.reply ?? ''); }}>Reply and close</Button> : <Button size="sm" variant="ghost" onClick={() => update.mutate({ entry: e, next: 'open', reply: e.reply ?? '' })}>Reopen</Button>}
                    </div>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Modal open={Boolean(replying)} onOpenChange={(o) => !o && setReplying(null)} title="Reply to the student" description="They see this in their app."
        footer={<><Button variant="ghost" onClick={() => setReplying(null)}>Cancel</Button><Button loading={update.isPending} disabled={text.trim().length < 2} onClick={() => update.mutate({ entry: replying, next: 'resolved', reply: text.trim() })}>Send and close</Button></>}>
        <div className="space-y-3 py-1"><p className="rounded-xl bg-surface-strong p-3 text-sm text-foreground">{replying?.message}</p><Field label="Your reply"><Textarea rows={4} value={text} onChange={(e) => setText(e.target.value)} /></Field></div>
      </Modal>
    </Screen>
  );
}

export default FeedbackScreen;
