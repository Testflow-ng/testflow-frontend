import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Trophy } from 'lucide-react';
import { Flag } from 'lucide-react';
import { Badge, Button, Card, EmptyState, Field, Modal, ProgressBar, Select, SkeletonCard, Textarea, useToast } from '../../components/ui/index.js';
import MathText from '../../components/MathText.jsx';
import OptionRow from '../../components/exam/OptionRow.jsx';
import QuestionCard from '../../components/exam/QuestionCard.jsx';
import ResultSummary from '../../components/exam/ResultSummary.jsx';
import GoogleAdUnit from '../advertising/GoogleAdUnit.jsx';
import { fmtDate } from '../admin/screens/format.js';
import TenantShell from './TenantShell.jsx';
import { useTenant } from './TenantContext.js';
import { useTenantAds } from './useTenantAds.js';
import { tenantApi } from './tenantApi.js';

const LETTERS = 'ABCDEF';

/** A student's finished exams. */
export function TenantResultsList() {
  const { hostname } = useTenant();
  const navigate = useNavigate();
  const { data, isLoading } = useQuery({ queryKey: ['tenant', hostname, 'results'], queryFn: tenantApi.results });
  return (
    <TenantShell title="My results">
      {isLoading ? <SkeletonCard className="h-32" /> : !data?.length ? <EmptyState icon={Trophy} title="No results yet" description="Finish an exam and your score shows up here." /> : (
        <ul className="space-y-3">
          {data.map((r) => (
            <li key={r.id}>
              <button type="button" onClick={() => navigate(`/results/${r.id}`)} className="tf-pressable flex w-full items-center gap-4 rounded-[20px] border border-border bg-surface p-4 text-left hover:bg-surface-strong/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                <div className="min-w-0 flex-1"><p className="truncate font-semibold text-foreground-strong">{r.examTitle}</p><p className="text-xs text-muted">{fmtDate(r.submittedAt)}</p></div>
                {r.hidden || r.scorePercent == null ? <Badge variant="outline">Recorded</Badge> : <Badge variant={r.scorePercent >= 70 ? 'success' : r.scorePercent >= 50 ? 'warning' : 'danger'}>{r.scorePercent}%</Badge>}
              </button>
            </li>
          ))}
        </ul>
      )}
    </TenantShell>
  );
}

/** Corrections wait behind a short ad on plans that show ads. Studio skips it. */
function AdGate({ onDone }) {
  const ad = useTenantAds('before_corrections');
  const [left, setLeft] = useState(5);
  useEffect(() => { if (!ad.show) onDone(); }, [ad.show, onDone]);
  useEffect(() => { if (!ad.show) return undefined; const id = setInterval(() => setLeft((n) => Math.max(0, n - 1)), 1000); return () => clearInterval(id); }, [ad.show]);
  if (!ad.show) return null;
  return (
    <div className="mx-auto max-w-[34rem] space-y-5 py-8">
      <h1 className="text-center font-heading text-2xl font-extrabold tracking-tight text-foreground-strong">Your corrections are ready</h1>
      <Card padding="md"><p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">Advertisement</p><GoogleAdUnit publisherId={ad.publisherId} slotId={ad.slotId} minHeight={250} /></Card>
      <ProgressBar value={5 - left} max={5} size="sm" tone="accent" />
      <Button size="lg" className="w-full" disabled={left > 0} onClick={onDone}>{left > 0 ? `See corrections in ${left}s` : 'See my corrections'}</Button>
    </div>
  );
}

/** One result with its corrections (when the organiser allows them). */
export function TenantResultDetail() {
  const { id } = useParams();
  const { hostname } = useTenant();
  const [gateDone, setGateDone] = useState(false);
  const { data, isLoading } = useQuery({ queryKey: ['tenant', hostname, 'result', id], queryFn: () => tenantApi.result(id) });
  const ad = useTenantAds('before_corrections');
  const showGate = ad.show && !gateDone && data?.corrections;
  const [reporting, setReporting] = useState(null);

  return (
    <TenantShell title={data?.examTitle ?? 'Result'} back="/results">
      {isLoading ? <SkeletonCard className="h-48" /> : data?.hidden ? (
        <EmptyState icon={Trophy} title="Submitted" description="Your result has been recorded. Your organiser will share it with you." />
      ) : showGate ? <AdGate onDone={() => setGateDone(true)} /> : (
        <div className="space-y-6">
          <ResultSummary score={data.scorePercent} correct={data.correct} total={data.total} timeTaken={data.timeMinutes ? `${data.timeMinutes} min` : undefined} />
          {data.corrections ? (
            <section aria-labelledby="corr" className="space-y-4">
              <h2 id="corr" className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted">Corrections</h2>
              {data.corrections.map((c, i) => (
                <QuestionCard key={i} number={i + 1} total={data.corrections.length} stem={c.stem}>
                  {c.options.map((o, j) => <OptionRow key={j} name={`c${i}`} label={LETTERS[j]} disabled state={j === c.correctIndex ? (c.selectedIndex === j ? 'correct' : 'missed') : j === c.selectedIndex ? 'wrong' : 'idle'}>{o}</OptionRow>)}
                  {c.explanation && <p className="rounded-xl bg-surface-strong p-3 text-sm text-foreground"><MathText>{c.explanation}</MathText></p>}
                  {c.questionId && <button type="button" onClick={() => setReporting(c)} className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-foreground-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"><Flag size={14} aria-hidden="true" /> Report a problem with this question</button>}
                </QuestionCard>
              ))}
            </section>
          ) : <EmptyState icon={Trophy} title="Corrections are not available" description="Your organiser has not turned on corrections for this exam yet." />}
        </div>
      )}
      <ReportModal question={reporting} onClose={() => setReporting(null)} />
    </TenantShell>
  );
}

const REASONS = [{ value: 'wrong_answer', label: 'The answer marked correct is wrong' }, { value: 'unclear', label: 'The question is unclear' }, { value: 'typo', label: 'There is a typo' }, { value: 'other', label: 'Something else' }];

/** A student tells the organiser a question looks wrong. */
function ReportModal({ question, onClose }) {
  const toast = useToast();
  const [reason, setReason] = useState('wrong_answer');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const send = async () => {
    setBusy(true);
    try {
      await tenantApi.flagQuestion(question.questionId, { reason, note: note.trim() });
      toast.success('Thanks', 'Your organiser will look at it.');
      setNote('');
      onClose();
    } catch (e) {
      toast.error('Could not send', e.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <Modal open={Boolean(question)} onOpenChange={(o) => !o && onClose()} title="Report a problem" description="Tell your organiser what looks wrong."
      footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button loading={busy} onClick={send}>Send report</Button></>}>
      <div className="space-y-4 py-1"><Field label="What is wrong?"><Select value={reason} onValueChange={setReason} options={REASONS} /></Field><Field label="Anything to add?" hint="Optional"><Textarea rows={3} value={note} maxLength={500} onChange={(e) => setNote(e.target.value)} /></Field></div>
    </Modal>
  );
}

