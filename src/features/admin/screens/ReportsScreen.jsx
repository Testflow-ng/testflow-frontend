import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Pencil, RotateCcw, XCircle } from 'lucide-react';
import { Badge, Button, Card, EmptyState, Field, Modal, StatusBadge, Tabs, TabPanel, Textarea, useToast } from '../../../components/ui/index.js';
import MathText from '../../../components/MathText.jsx';
import Screen, { PageHeader } from '../../../components/layout/Screen.jsx';
import { adminApi } from '../api.js';
import { useAdminMutation, useFlags } from '../useAdmin.js';
import { LoadError, TableSkeleton } from './shared.jsx';
import { timeAgo } from './format.js';

const LETTERS = 'ABCDEF';

/** Problems students reported in questions. Resolve means the bank was fixed; dismiss means it was fine. */
function ReportsScreen() {
  const toast = useToast();
  const { data, isLoading, error } = useFlags();
  const [tab, setTab] = useState('open');
  const [deciding, setDeciding] = useState(null); // { flag, status }
  const [note, setNote] = useState('');

  const decide = useAdminMutation(({ flag, status, resolution }) => adminApi.resolveQuestionFlag(flag.id, { status, resolution }), {
    onSuccess: (_r, v) => { toast.success(v.status === 'open' ? 'Report reopened' : v.status === 'resolved' ? 'Marked as fixed' : 'Report dismissed'); setDeciding(null); setNote(''); },
    onError: (e) => toast.error('Could not update', e.message),
  });

  const counts = data?.counts ?? {};
  const flags = (data?.flags ?? []).filter((f) => f.status === tab);
  const tabs = [{ value: 'open', label: 'Open', count: counts.open }, { value: 'resolved', label: 'Fixed', count: counts.resolved }, { value: 'dismissed', label: 'Dismissed', count: counts.dismissed }];

  const open = (flag, status) => { setDeciding({ flag, status }); setNote(flag.resolution ?? ''); };

  return (
    <Screen width="xl">
      <PageHeader title="Problems" subtitle="Questions students say are wrong or unclear." />
      <div className="mt-6"><Tabs idPrefix="reports" label="Report status" items={tabs} value={tab} onValueChange={setTab} /></div>

      <div className="mt-6">
        {error ? <LoadError error={error} what="reports" /> : isLoading ? <TableSkeleton rows={4} /> : (
          <TabPanel idPrefix="reports" value={tab} active={tab}>
            {flags.length === 0 ? (
              <EmptyState mood={tab === 'open' ? 'happy' : 'thinking'} title={tab === 'open' ? 'No open reports' : 'Nothing here'} description={tab === 'open' ? 'Every reported question has been looked at.' : 'Reports you decide on show up here.'} />
            ) : (
              <ul className="space-y-4">
                {flags.map((f) => {
                  const q = f.question;
                  return (
                    <li key={f.id}>
                      <Card padding="lg" className="space-y-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <StatusBadge status={f.status === 'open' ? 'pending' : f.status === 'resolved' ? 'verified' : 'archived'} label={f.status === 'open' ? 'Open' : f.status === 'resolved' ? 'Fixed' : 'Dismissed'} />
                          {q?.subjectCode && <Badge variant="lavender">{q.subjectCode}</Badge>}
                          {f.reason && <Badge variant="warning">{String(f.reason).replaceAll('_', ' ')}</Badge>}
                          {f.reportCount > 1 && <Badge variant="danger">{f.reportCount} reports</Badge>}
                          <span className="ml-auto text-xs text-muted">{timeAgo(f.createdAt)}</span>
                        </div>
                        {q ? (
                          <div className="rounded-2xl bg-surface-strong/50 p-4">
                            <div className="text-[15px] leading-relaxed text-foreground-strong"><MathText>{q.stem ?? ''}</MathText></div>
                            <ol className="mt-3 space-y-1.5 text-sm">
                              {(q.options ?? []).map((o, i) => (
                                <li key={i} className={i === q.correctOption ? 'font-semibold text-score-good' : 'text-muted'}>{LETTERS[i]}. <MathText>{String(o)}</MathText>{i === q.correctOption ? '  (marked correct)' : ''}</li>
                              ))}
                            </ol>
                          </div>
                        ) : <p className="text-sm text-muted">The question was removed from the bank.</p>}
                        {f.note && <p className="rounded-xl border border-border p-3 text-sm text-foreground-strong"><span className="text-muted">Student wrote: </span>{f.note}</p>}
                        {f.resolution && <p className="text-sm text-muted">Your note: {f.resolution}</p>}
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <p className="text-xs text-muted">Reported by {f.student?.username ? `@${f.student.username}` : f.student?.matricNumber ?? 'a student'}</p>
                          <div className="flex flex-wrap gap-2">
                            {f.questionId && <Link to={`/admin/questions/${f.questionId}/edit`}><Button size="sm" variant="outline" leadingIcon={<Pencil size={14} />}>Edit question</Button></Link>}
                            {f.status === 'open' ? (
                              <>
                                <Button size="sm" variant="ghost" leadingIcon={<XCircle size={14} />} onClick={() => open(f, 'dismissed')}>Dismiss</Button>
                                <Button size="sm" leadingIcon={<CheckCircle2 size={14} />} onClick={() => open(f, 'resolved')}>Mark fixed</Button>
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
          </TabPanel>
        )}
      </div>

      <Modal open={Boolean(deciding)} onOpenChange={(o) => !o && setDeciding(null)} title={deciding?.status === 'resolved' ? 'Mark as fixed' : 'Dismiss this report'} description={deciding?.status === 'resolved' ? 'Say what you changed. Other admins read this.' : 'Say why the question is fine as it is.'}
        footer={<><Button variant="ghost" onClick={() => setDeciding(null)}>Cancel</Button><Button loading={decide.isPending} disabled={note.trim().length < 3} onClick={() => decide.mutate({ flag: deciding.flag, status: deciding.status, resolution: note.trim() })}>{deciding?.status === 'resolved' ? 'Mark fixed' : 'Dismiss'}</Button></>}>
        <div className="py-1"><Field label="Note" hint="At least 3 characters."><Textarea rows={4} value={note} onChange={(e) => setNote(e.target.value)} /></Field></div>
      </Modal>
    </Screen>
  );
}

export default ReportsScreen;
