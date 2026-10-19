import { useState } from 'react';
import { CheckCircle2, Flag, Pencil, RotateCcw, Trash2, XCircle } from 'lucide-react';
import { Badge, Button, Card, ConfirmDialog, EmptyState, Field, Modal, SkeletonCard, StatusBadge, Tabs, Textarea, useToast } from '../../../components/ui/index.js';
import MathText from '../../../components/MathText.jsx';
import PlanLock from '../../../components/everybody/PlanLock.jsx';
import { usePlanFeatures } from '../usePlanFeatures.js';
import Screen, { PageHeader } from '../../../components/layout/Screen.jsx';
import { wsApi } from '../api.js';
import { useOrg } from '../OrgContext.js';
import { useFlags, useWsMutation } from '../useWorkspace.js';
import { QuestionModal } from '../QuestionModals.jsx';
import { BLANK_QUESTION } from '../questionDefaults.js';
import { timeAgo } from '../../admin/screens/format.js';

const LETTERS = 'ABCDEF';
const REASONS = { wrong_answer: 'Wrong answer', unclear: 'Unclear', typo: 'Typo', other: 'Other' };

/** Questions your students reported. Edit or delete the question, then close the report. */
function ReportsScreen() {
  const toast = useToast();
  const { orgId } = useOrg();
  const { data, isLoading } = useFlags();
  const [tab, setTab] = useState('open');
  const [editing, setEditing] = useState(null);
  const [removing, setRemoving] = useState(null);
  const [deciding, setDeciding] = useState(null);
  const [note, setNote] = useState('');

  const decide = useWsMutation((id, v) => wsApi.updateFlag(id, v.flag.id, { status: v.status, resolution: v.resolution }), { onSuccess: () => { toast.success('Updated'); setDeciding(null); setNote(''); }, onError: (e) => toast.error('Could not update', e.message) });
  const del = useWsMutation((id, qid) => wsApi.deleteQuestion(id, qid), { onSuccess: () => toast.success('Question deleted') });

  const counts = data?.counts ?? {};
  const flags = (data?.items ?? []).filter((f) => f.status === tab);
  const tabs = [{ value: 'open', label: 'Open', count: counts.open }, { value: 'resolved', label: 'Fixed', count: counts.resolved }, { value: 'dismissed', label: 'Dismissed', count: counts.dismissed }];

  const { canReports } = usePlanFeatures();
  return (
    <Screen width="xl">
      <PageHeader title="Reported questions" subtitle="Students tell you when a question looks wrong or unclear." />
      <PlanLock locked={!canReports} plan="Pro" title="Reported questions are part of Pro" description="Let students flag a question that looks wrong, and fix it from here." className="mt-8">
      <div className="mt-6"><Tabs idPrefix="orgflags" label="Report status" items={tabs} value={tab} onValueChange={setTab} /></div>
      <div className="mt-6">
        {isLoading ? <SkeletonCard className="h-40" /> : flags.length === 0 ? (
          <EmptyState icon={Flag} title={tab === 'open' ? 'No open reports' : 'Nothing here'} description={tab === 'open' ? 'When a student reports a question you will see it here.' : 'Reports you close show up here.'} />
        ) : (
          <ul className="space-y-4">
            {flags.map((f) => {
              const q = f.question;
              return (
                <li key={f.id}>
                  <Card padding="lg" className="space-y-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={f.status === 'open' ? 'pending' : f.status === 'resolved' ? 'verified' : 'archived'} label={f.status === 'open' ? 'Open' : f.status === 'resolved' ? 'Fixed' : 'Dismissed'} />
                      <Badge variant="warning">{REASONS[f.reason] ?? f.reason}</Badge>
                      {f.examTitle && <Badge variant="outline">{f.examTitle}</Badge>}
                      {f.reportCount > 1 && <Badge variant="danger">{f.reportCount} reports</Badge>}
                      <span className="ml-auto text-xs text-muted">{timeAgo(f.createdAt)}</span>
                    </div>
                    {q ? (
                      <div className="rounded-2xl bg-surface-strong/50 p-4">
                        <div className="text-[15px] leading-relaxed text-foreground-strong"><MathText>{q.stem}</MathText></div>
                        <ol className="mt-3 space-y-1.5 text-sm">{q.options.map((o, i) => <li key={i} className={i === q.correctIndex ? 'font-semibold text-score-good' : 'text-muted'}>{LETTERS[i]}. <MathText>{String(o)}</MathText>{i === q.correctIndex ? '  (marked correct)' : ''}</li>)}</ol>
                      </div>
                    ) : <p className="text-sm text-muted">This question was deleted.</p>}
                    {f.note && <p className="rounded-xl border border-border p-3 text-sm text-foreground-strong"><span className="text-muted">Student wrote: </span>{f.note}</p>}
                    {f.resolution && <p className="text-sm text-muted">Your note: {f.resolution}</p>}
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="text-xs text-muted">Reported by {f.studentName ?? 'a student'}</p>
                      <div className="flex flex-wrap gap-2">
                        {q && <Button size="sm" variant="outline" leadingIcon={<Pencil size={14} />} onClick={() => setEditing({ ...BLANK_QUESTION, ...q, options: [...q.options], optionImages: q.optionImages ?? [] })}>Edit</Button>}
                        {q && <Button size="sm" variant="ghost" className="text-danger" leadingIcon={<Trash2 size={14} />} onClick={() => setRemoving(q)}>Delete question</Button>}
                        {f.status === 'open' ? (
                          <>
                            <Button size="sm" variant="ghost" leadingIcon={<XCircle size={14} />} onClick={() => { setDeciding({ flag: f, status: 'dismissed' }); setNote(''); }}>Dismiss</Button>
                            <Button size="sm" leadingIcon={<CheckCircle2 size={14} />} onClick={() => { setDeciding({ flag: f, status: 'resolved' }); setNote(''); }}>Mark fixed</Button>
                          </>
                        ) : <Button size="sm" variant="outline" leadingIcon={<RotateCcw size={14} />} onClick={() => decide.mutate({ flag: f, status: 'open', resolution: f.resolution ?? '' })}>Reopen</Button>}
                      </div>
                    </div>
                  </Card>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {editing && <QuestionModal key={editing.id} initial={editing} orgId={orgId} onClose={() => setEditing(null)} />}
      <ConfirmDialog open={Boolean(removing)} onOpenChange={(o) => !o && setRemoving(null)} tone="danger" title="Delete this question?" description="It is removed from every exam and your question bank, for good." confirmLabel="Delete" onConfirm={() => del.mutateAsync(removing.id)} />
      <Modal open={Boolean(deciding)} onOpenChange={(o) => !o && setDeciding(null)} title={deciding?.status === 'resolved' ? 'Mark as fixed' : 'Dismiss this report'} description={deciding?.status === 'resolved' ? 'Say what you changed.' : 'Say why the question is fine.'}
        footer={<><Button variant="ghost" onClick={() => setDeciding(null)}>Cancel</Button><Button loading={decide.isPending} disabled={note.trim().length < 3} onClick={() => decide.mutate({ flag: deciding.flag, status: deciding.status, resolution: note.trim() })}>{deciding?.status === 'resolved' ? 'Mark fixed' : 'Dismiss'}</Button></>}>
        <div className="py-1"><Field label="Note" hint="At least 3 characters."><Textarea rows={4} value={note} onChange={(e) => setNote(e.target.value)} /></Field></div>
      </Modal>
      </PlanLock>
    </Screen>
  );
}

export default ReportsScreen;
