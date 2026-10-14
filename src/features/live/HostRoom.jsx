import { useState } from 'react';
import { Check, Download, Play, UserCheck, X } from 'lucide-react';
import { Badge, Button, ConfirmDialog, CopyField, StatusBadge, useToast } from '../../components/ui/index.js';
import Screen, { PageHeader } from '../../components/layout/Screen.jsx';
import StatCard from '../../components/data/StatCard.jsx';
import DataTable from '../../components/data/DataTable.jsx';
import ExamTimer from '../../components/exam/ExamTimer.jsx';
import { ICON } from '../../components/ui/iconProps.js';
import { downloadCsv, liveApi } from './api.js';
import { useLiveAction, useRemaining } from './useLive.js';
import HostResults from './HostResults.jsx';

function useHostAction(code, toast, fn, ok) {
  return useLiveAction(code, fn, { onSuccess: () => ok && toast.success(ok) });
}

const message = (e) => e?.message ?? 'Something went wrong.';

function HostRoom({ room, code }) {
  const toast = useToast();
  const [confirm, setConfirm] = useState(null);
  const remaining = useRemaining(room.status === 'in_progress' ? room.endsAt : null, room.serverTime);

  const approve = useHostAction(code, toast, (id) => liveApi.approve(code, id));
  const reject = useHostAction(code, toast, (id) => liveApi.reject(code, id));
  const approveAll = useHostAction(code, toast, () => liveApi.approveAll(code), 'Everyone approved');
  const start = useHostAction(code, toast, () => liveApi.start(code), 'Exam started');
  const end = useHostAction(code, toast, () => liveApi.end(code), 'Exam ended');
  const publish = useHostAction(code, toast, () => liveApi.publish(code), 'Results published');
  const cancel = useHostAction(code, toast, () => liveApi.cancel(code), 'Session cancelled');

  const run = (m) => m.mutate(undefined, { onError: (e) => toast.error(message(e)) });
  const runFor = (m, id) => m.mutate(id, { onError: (e) => toast.error(message(e)) });

  const lobby = ['waiting', 'ready'].includes(room.status);
  const afterExam = ['completed', 'results_published'].includes(room.status);

  const columns = [
    { key: 'displayName', header: 'Name', sortable: true, render: (r) => (
      <span><span className="font-semibold text-foreground-strong">{r.displayName}</span>{r.email && <span className="block text-xs text-muted">{r.email}</span>}</span>
    ) },
    { key: 'status', header: 'Entry', render: (r) => <StatusBadge status={r.status} /> },
    { key: 'attemptStatus', header: 'Attempt', render: (r) => (r.status === 'approved' ? <StatusBadge status={r.attemptStatus} /> : <span className="text-muted">-</span>) },
  ];

  return (
    <Screen width="full">
      <PageHeader
        back="/live"
        eyebrow="Host room"
        title={room.title}
        subtitle={`${room.numQuestions} questions · ${room.durationMinutes} min${room.maxParticipants ? ` · up to ${room.maxParticipants} people` : ''}`}
        action={<StatusBadge status={room.status} />}
      />

      {room.status === 'cancelled' ? (
        <p className="mt-6 text-muted">This session was cancelled.</p>
      ) : (
        <div className="mt-6 space-y-6">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <div className="space-y-3 rounded-[20px] border border-border bg-surface p-5">
              <CopyField label="Join code" value={room.shareCode} />
              <CopyField label="Invite link" value={room.shareUrl} />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <StatCard label="Waiting" value={room.pendingCount} icon={UserCheck} tone="accent" />
              <StatCard label="Approved" value={room.approvedCount} icon={Check} tone="sage" />
              <StatCard label="In room" value={room.participantCount} icon={UserCheck} tone="primary" />
            </div>
          </div>

          {room.status === 'in_progress' && remaining != null && (
            <div className="flex flex-wrap items-center justify-between gap-4 rounded-[20px] bg-[var(--brand-lavender)] p-5">
              <div>
                <p className="font-heading text-lg font-bold text-foreground-strong">Exam in progress</p>
                <p className="text-sm text-foreground">Everyone is on the same server clock.</p>
              </div>
              <ExamTimer secondsLeft={remaining} totalSeconds={room.durationMinutes * 60} />
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {lobby && (
              <>
                <Button variant="outline" onClick={() => run(approveAll)} disabled={room.pendingCount === 0} loading={approveAll.isPending} leadingIcon={<UserCheck {...ICON} />}>Approve all</Button>
                <Button onClick={() => run(start)} disabled={room.approvedCount === 0} loading={start.isPending} leadingIcon={<Play {...ICON} />}>Start exam</Button>
                <Button variant="ghost" className="text-danger" onClick={() => setConfirm('cancel')}>Cancel session</Button>
              </>
            )}
            {room.status === 'in_progress' && <Button variant="outline" onClick={() => setConfirm('end')}>End exam now</Button>}
            {room.status === 'completed' && <Button onClick={() => run(publish)} loading={publish.isPending}>Publish results</Button>}
            {afterExam && <Button variant="outline" onClick={() => downloadCsv(code).catch((e) => toast.error(message(e)))} leadingIcon={<Download {...ICON} />}>Export CSV</Button>}
          </div>

          {!afterExam && (
            <section aria-labelledby="people">
              <h2 id="people" className="mb-3 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-muted">
                People <Badge variant="outline">{room.participants.length}</Badge>
              </h2>
              <DataTable
                caption="Participants"
                columns={columns}
                rows={room.participants.map((p) => ({ ...p, id: p.userId }))}
                emptyMessage="Nobody has asked to join yet. Share the code."
                rowActions={(r) =>
                  r.status === 'pending' ? (
                    <div className="flex gap-1.5">
                      <Button size="sm" onClick={() => runFor(approve, r.userId)} leadingIcon={<Check {...ICON} />}>Approve</Button>
                      <Button size="sm" variant="ghost" onClick={() => runFor(reject, r.userId)} leadingIcon={<X {...ICON} />}>Reject</Button>
                    </div>
                  ) : null
                }
              />
            </section>
          )}

          {afterExam && <HostResults code={code} />}
        </div>
      )}

      <ConfirmDialog
        open={confirm === 'cancel'}
        onOpenChange={(o) => !o && setConfirm(null)}
        title="Cancel this session?"
        description="Everyone in the room is told it is off. This cannot be undone."
        confirmLabel="Cancel session"
        tone="danger"
        onConfirm={() => cancel.mutateAsync()}
      />
      <ConfirmDialog
        open={confirm === 'end'}
        onOpenChange={(o) => !o && setConfirm(null)}
        title="End the exam now?"
        description="Anyone still writing is submitted as they are."
        confirmLabel="End exam"
        tone="danger"
        onConfirm={() => end.mutateAsync()}
      />
    </Screen>
  );
}

export default HostRoom;
