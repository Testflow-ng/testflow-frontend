import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Calendar, Check, ChevronDown, CircleAlert, Clock, CreditCard, Download, Eye, EyeOff, FileText, FileUp, ListPlus, Lock, MoreHorizontal, Pencil, PenLine, Radio, RotateCcw, Shield, ShieldCheck, Sliders, Sparkles, Trash2, UserCheck, Users } from 'lucide-react';
import { Badge, Banner, Button, Card, Checkbox, ConfirmDialog, CopyField, DropdownMenu, EmptyState, Field, FileUpload, IconButton, Input, Modal, SegmentedControl, Select, SkeletonCard, StatusBadge, StickyActionBar, Switch, TabPanel, TagInput, Tabs, useToast } from '../../../components/ui/index.js';
import { cn } from '../../../utils/cn.js';
import StatCard from '../../../components/data/StatCard.jsx';
import DataTable from '../../../components/data/DataTable.jsx';
import MathText from '../../../components/MathText.jsx';
import Screen from '../../../components/layout/Screen.jsx';
import { ICON } from '../../../components/ui/iconProps.js';
import { formatMoney } from '../../../utils/money.js';
import { wsApi } from '../api.js';
import { usePlanFeatures } from '../usePlanFeatures.js';
import { useOrg } from '../OrgContext.js';
import { useBankQuestions, useDomains, useExam, useExamQuestions, useExamResults, useQuestionBanks, useWsMutation } from '../useWorkspace.js';
import { ImportModal, QuestionModal } from '../QuestionModals.jsx';
import { BLANK_QUESTION } from '../questionDefaults.js';
import { fmtDate } from '../../admin/screens/format.js';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const pullEmails = (text) => [...new Set(text.split(/[\s,;]+/).map((x) => x.trim().toLowerCase()).filter((x) => EMAIL.test(x)))];

/** The students allowed to see and sit an invited-only exam: typed in, or imported from a CSV of emails. */
function InvitedList({ value, onChange }) {
  const [file, setFile] = useState('');
  return (
    <div className="space-y-3">
      <TagInput label="Allowed students" max={5000} value={value} onChange={(v) => onChange([...new Set(v.map((x) => x.toLowerCase()).filter((x) => EMAIL.test(x)))])} placeholder="name@example.com, press Enter" />
      <FileUpload label="Import from CSV" accept="text/csv,text/plain,.csv" maxBytes={1024 * 1024} hint="One email per line, or comma separated" fileName={file || undefined} onRemove={() => setFile('')} onFile={async (f) => { setFile(f.name); onChange([...new Set([...value, ...pullEmails(await f.text())])]); }} />
      <p className="text-sm text-muted">{value.length} {value.length === 1 ? 'student' : 'students'} can take this exam. Only they will see it on your site, even if they sign up later.</p>
    </div>
  );
}

const TABS = [{ value: 'questions', label: 'Questions' }, { value: 'rules', label: 'Rules' }, { value: 'results', label: 'Results' }];

/** One exam: add its questions, set its rules, and see how students did. */
function ExamDetailScreen() {
  const { examId } = useParams();
  const { data: exam, isLoading } = useExam(examId);
  if (isLoading || !exam) return <Screen width="xl"><SkeletonCard className="mt-8 h-72" /></Screen>;
  return <Detail key={exam.updatedAt ?? exam.id} exam={exam} />;
}

function Detail({ exam }) {
  const toast = useToast();
  const { org } = useOrg();
  const domains = useDomains().data ?? [];
  const questions = useExamQuestions(exam.id).data ?? [];
  const [tab, setTab] = useState('questions');
  const host = domains.find((d) => d.type === 'custom' && d.status === 'active')?.hostname ?? domains.find((d) => d.type === 'subdomain')?.hostname ?? `${org.slug}.testflow.com.ng`;
  const { canLive, canCharge } = usePlanFeatures();
  const liveBlocked = exam.mode === 'live' && !canLive;
  const paidNeedsPayout = exam.priceMinor > 0 && org.payout?.status !== 'active';
  const paidBlocked = exam.priceMinor > 0 && !canCharge;

  const publish = useWsMutation((id, on) => wsApi.setExamPublished(id, exam.id, on), { onSuccess: (_r, on) => toast.success(on ? 'Exam is live' : 'Exam taken down'), onError: (e) => toast.error(e.code === 'PAYOUT_REQUIRED' ? 'Add a payout account first' : 'Could not update', e.message) });
  const live = exam.status === 'published';
  const ready = questions.length > 0 && !paidNeedsPayout && !liveBlocked && !paidBlocked;

  const checklist = [
    { done: questions.length > 0, label: 'Add at least one question' },
    { done: true, label: 'Set the rules' },
    { done: !paidNeedsPayout, label: paidNeedsPayout ? 'Add a payout account to charge a fee' : 'Choose free or paid' },
    ...(paidBlocked ? [{ done: false, label: 'Charging for exams needs the Studio plan' }] : []),
    ...(liveBlocked ? [{ done: false, label: 'Live CBT needs the Studio plan' }] : []),
  ];

  return (
    <Screen width="full">
      <Link to="/workspace/exams" className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-foreground-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"><ArrowLeft {...ICON} size={15} /> All exams</Link>
      <header className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="font-heading text-[1.75rem] font-extrabold leading-tight tracking-tight text-foreground-strong">{exam.title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-2"><StatusBadge status={live ? 'published' : 'draft'} /><Badge variant={exam.mode === 'live' ? 'lavender' : 'outline'}>{exam.mode === 'live' ? 'Live CBT' : 'Anytime'}</Badge><Badge variant={exam.priceMinor ? 'lime' : 'outline'}>{exam.priceMinor ? formatMoney(exam.priceMinor) : 'Free'}</Badge></div>
        </div>
        <Button size="lg" variant={live ? 'outline' : 'primary'} loading={publish.isPending} disabled={!live && !ready} onClick={() => publish.mutate(!live)}>{live ? 'Take it down' : 'Make it live'}</Button>
      </header>

      {!live && (
        <Card padding="md" className="mt-6">
          <p className="mb-3 text-sm font-semibold text-foreground-strong">Before students can take it</p>
          <ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
            {checklist.map((c) => (
              <li key={c.label} className="flex items-center gap-2.5 text-sm"><span className={`flex size-5 shrink-0 items-center justify-center rounded-full ${c.done ? 'bg-success text-white' : 'bg-warning/20 text-[#8a5a00]'}`}>{c.done ? <Check size={12} strokeWidth={3} aria-hidden="true" /> : <CircleAlert size={12} aria-hidden="true" />}</span><span className={c.done ? 'text-muted' : 'font-medium text-foreground-strong'}>{c.label}</span></li>
            ))}
          </ul>
        </Card>
      )}
      {liveBlocked && <Banner variant="warning" className="mt-6" action={<Link to="/workspace/billing"><Button size="sm" variant="secondary">See Studio</Button></Link>}>This exam is a Live CBT, which is part of the Studio plan. Switch it to Anytime, or upgrade, to make it live.</Banner>}
      {live && <div className="mt-6"><CopyField label="Send this link to your students" value={`https://${host}/exam/${exam.id}`} /></div>}

      <div className="mt-8"><Tabs idPrefix="exam" label="Exam sections" items={[{ ...TABS[0], count: questions.length }, TABS[1], TABS[2]]} value={tab} onValueChange={setTab} /></div>
      <div className="mt-6">
        <TabPanel idPrefix="exam" value="questions" active={tab}><QuestionsTab exam={exam} questions={questions} /></TabPanel>
        <TabPanel idPrefix="exam" value="rules" active={tab}><RulesTab exam={exam} paidNeedsPayout={paidNeedsPayout} canLive={canLive} canCharge={canCharge} /></TabPanel>
        <TabPanel idPrefix="exam" value="results" active={tab}><ResultsTab exam={exam} /></TabPanel>
      </div>
    </Screen>
  );
}

function QuestionsTab({ exam, questions }) {
  const toast = useToast();
  const { orgId } = useOrg();
  const [writing, setWriting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [picking, setPicking] = useState(false);
  const [editing, setEditing] = useState(null);
  const [removing, setRemoving] = useState(null);
  const del = useWsMutation((id, qid) => wsApi.deleteQuestion(id, qid), { onSuccess: () => toast.success('Question deleted') });
  const setQs = useWsMutation((id, ids) => wsApi.setExamQuestions(id, exam.id, ids), { onSuccess: () => toast.success('Updated'), onError: (e) => toast.error('Could not update', e.message) });

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { icon: PenLine, title: 'Write a question', text: 'Type it in. Add a picture if you need one.', onClick: () => setWriting(true) },
          { icon: FileUp, title: 'Import a file', text: 'Upload many at once from a CSV or JSON file.', onClick: () => setImporting(true) },
          { icon: ListPlus, title: 'From a question bank', text: 'Use a whole bank, or pick some of it.', onClick: () => setPicking(true) },
        ].map(({ icon: Icon, title, text, onClick }) => (
          <button key={title} type="button" onClick={onClick} className="tf-pressable flex items-start gap-3 rounded-[20px] border border-border bg-surface p-4 text-left transition-colors hover:border-border-strong hover:bg-surface-strong/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-lavender)] text-primary"><Icon {...ICON} size={18} /></span>
            <span><span className="block font-semibold text-foreground-strong">{title}</span><span className="block text-sm text-muted">{text}</span></span>
          </button>
        ))}
      </div>

      {questions.length === 0 ? (
        <EmptyState mood="thinking" title="No questions yet" description="Choose one of the three ways above to add your first question." />
      ) : (
        <ol className="space-y-2">
          {questions.map((q, i) => (
            <li key={q.id} className="flex items-start gap-3 rounded-2xl border border-border bg-surface p-4">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-surface-strong text-xs font-bold tabular-nums text-muted">{i + 1}</span>
              <div className="min-w-0 flex-1 text-[15px] leading-relaxed text-foreground-strong"><MathText>{q.stem}</MathText></div>
              <DropdownMenu placement="bottom-end" trigger={(p) => <IconButton aria-label={`Actions for question ${i + 1}`} size="sm" variant="ghost" {...p}><MoreHorizontal size={16} /></IconButton>} items={[
                { label: 'Edit', icon: Pencil, onSelect: () => setEditing({ ...BLANK_QUESTION, ...q, options: [...q.options], optionImages: q.optionImages ?? [] }) },
                { label: 'Remove from this exam', onSelect: () => setQs.mutate(questions.filter((x) => x.id !== q.id).map((x) => x.id)) },
                { separator: true },
                { label: 'Delete for good', icon: Trash2, danger: true, onSelect: () => setRemoving(q) },
              ]} />
            </li>
          ))}
        </ol>
      )}

      {editing && <QuestionModal key={editing.id} initial={editing} orgId={orgId} onClose={() => setEditing(null)} />}
      <ConfirmDialog open={Boolean(removing)} onOpenChange={(o) => !o && setRemoving(null)} tone="danger" title="Delete this question?" description="It is removed from this exam and your question bank, for good." confirmLabel="Delete" onConfirm={() => del.mutateAsync(removing.id)} />
      {writing && <QuestionModal initial={BLANK_QUESTION} examId={exam.id} orgId={orgId} onClose={() => setWriting(false)} />}
      <ImportModal open={importing} onOpenChange={setImporting} examId={exam.id} />
      {picking && <PickModal existing={questions.map((q) => q.id)} onClose={() => setPicking(false)} onAdd={(ids) => setQs.mutateAsync([...questions.map((q) => q.id), ...ids]).then(() => setPicking(false))} />}
    </div>
  );
}

/** Pick a question bank, then add all of it or only some questions to this exam. */
function PickModal({ existing, onClose, onAdd }) {
  const { data: banks } = useQuestionBanks();
  const [bankId, setBankId] = useState(null);
  const { data } = useBankQuestions(bankId, { limit: 200 });
  const [chosen, setChosen] = useState([]);
  const [busy, setBusy] = useState(false);
  const bank = banks?.find((x) => x.id === bankId);
  const list = (data?.items ?? []).filter((q) => !existing.includes(q.id));
  const toggle = (id) => setChosen((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]));
  const add = async (ids) => { setBusy(true); try { await onAdd(ids); } finally { setBusy(false); } };

  return (
    <Modal open onOpenChange={(o) => !o && onClose()} size="lg" title={bank ? bank.name : 'Choose a question bank'} description={bank ? 'Add the whole bank, or tick the ones you want.' : 'Pick one of your question banks.'}
      footer={bank ? (
        <><Button variant="ghost" onClick={() => { setBankId(null); setChosen([]); }}>Back</Button><Button variant="outline" loading={busy} disabled={!list.length} onClick={() => add(list.map((q) => q.id))}>Add all {list.length}</Button><Button loading={busy} disabled={!chosen.length} onClick={() => add(chosen)}>Add {chosen.length || ''} ticked</Button></>
      ) : <Button variant="ghost" onClick={onClose}>Cancel</Button>}>
      {!bank ? (
        !banks?.length ? <p className="py-10 text-center text-sm text-muted">You have no question banks yet. Create one in Question banks, then come back.</p> : (
          <ul className="space-y-2 py-1">{banks.map((b) => <li key={b.id}><button type="button" onClick={() => setBankId(b.id)} className="tf-pressable flex w-full items-center justify-between gap-3 rounded-2xl border border-border p-4 text-left hover:bg-surface-strong/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"><span><span className="block font-semibold text-foreground-strong">{b.name}</span>{b.description && <span className="block text-xs text-muted">{b.description}</span>}</span><Badge variant="outline">{b.questionCount ?? 0} questions</Badge></button></li>)}</ul>
        )
      ) : list.length === 0 ? <p className="py-10 text-center text-sm text-muted">Everything in this bank is already in the exam, or the bank is empty.</p> : (
        <ul className="space-y-2 py-1">{list.map((q) => <li key={q.id} className="rounded-xl border border-border p-3"><Checkbox checked={chosen.includes(q.id)} onChange={() => toggle(q.id)} label={<span className="line-clamp-2 text-sm"><MathText>{q.stem}</MathText></span>} /></li>)}</ul>
      )}
    </Modal>
  );
}

const CORRECTIONS = [
  { value: 'now', label: 'Show their score and corrections straight away' },
  { value: 'after_exam', label: 'Show their score now, corrections after the exam closes' },
  { value: 'score_only', label: 'Show only their score, no corrections' },
  { value: 'hidden', label: 'Show nothing. Just record it, only I see the results' },
];

function ChoiceCard({ selected, onClick, disabled, badge, title, description, children, className }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'group relative flex flex-col justify-between rounded-2xl border p-4 sm:p-5 text-left transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        selected
          ? 'border-primary bg-primary/[0.04] ring-1 ring-primary/25 shadow-sm'
          : 'border-border/80 bg-surface hover:border-border-strong hover:bg-surface-strong/30',
        disabled && 'cursor-not-allowed opacity-50 hover:border-border/80 hover:bg-surface',
        className,
      )}
    >
      <div>
        <div className="flex items-center justify-between gap-2">
          {badge ? (
            <span
              className={cn(
                'inline-flex items-center rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider',
                selected ? 'bg-primary/10 text-primary' : 'bg-surface-strong text-muted',
              )}
            >
              {badge}
            </span>
          ) : <span />}
          {selected && (
            <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
              <Check size={12} strokeWidth={3} aria-hidden="true" />
            </span>
          )}
        </div>
        <h4 className="mt-3.5 font-heading text-[15px] font-bold text-foreground-strong">
          {title}
        </h4>
        <p className="mt-1 text-xs leading-relaxed text-muted sm:text-[13px]">
          {description}
        </p>
      </div>
      {children && <div className="mt-3 pt-3 border-t border-border/60">{children}</div>}
    </button>
  );
}

function SectionBlock({ icon: Icon, title, subtitle, children, className }) {
  return (
    <Card padding="lg" className={cn('space-y-5 rounded-[28px] border-border/80 shadow-sm', className)}>
      <div className="flex items-start gap-3">
        {Icon && (
          <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-surface-strong text-muted">
            <Icon size={18} strokeWidth={1.75} aria-hidden="true" />
          </span>
        )}
        <div>
          <h3 className="font-heading text-base font-bold text-foreground-strong">{title}</h3>
          {subtitle && <p className="mt-0.5 text-sm text-muted">{subtitle}</p>}
        </div>
      </div>
      {children}
    </Card>
  );
}

function RulesTab({ exam, paidNeedsPayout, canLive, canCharge }) {
  const { hasStudio, liveCbtPerk } = usePlanFeatures();
  const toast = useToast();
  const baseDefaults = {
    mode: 'anytime',
    access: 'link',
    showCorrections: 'now',
    shuffleQuestions: true,
    shuffleOptions: true,
    negativeMarking: 0,
    attemptsAllowed: 1,
    paymentPolicy: 'per_session',
    ...exam,
  };
  const [f, setF] = useState(baseDefaults);
  const dirty = JSON.stringify(f) !== JSON.stringify(baseDefaults);
  const set = (patch) => setF((x) => ({ ...x, ...patch }));
  const save = useWsMutation((id, body) => wsApi.saveExam(id, body), {
    onSuccess: () => toast.success('Rules saved'),
    onError: (e) => toast.error('Could not save', e.message),
  });

  const paid = (f.priceMinor ?? 0) > 0;
  const date = f.startsAt ? f.startsAt.slice(0, 10) : '';
  const time = f.startsAt ? f.startsAt.slice(11, 16) : '09:00';
  const setStart = (d, t) => set({ startsAt: d ? `${d}T${t || '09:00'}` : '' });

  // Attempts tier: 1 = strict single, 2-10 = limited, >=20 = unlimited
  const attempts = f.attemptsAllowed ?? 1;
  const attemptTier = attempts === 1 ? 'single' : attempts >= 20 ? 'unlimited' : 'limited';

  return (
    <div className="max-w-4xl space-y-6 pb-24">
      {/* 1. Basic Exam Info */}
      <SectionBlock icon={Pencil} title="Exam Identity" subtitle="Title, student instructions, and duration.">
        <Field label="Exam title">
          <Input value={f.title} maxLength={120} onChange={(e) => set({ title: e.target.value })} placeholder="e.g. 2026 JAMB CBT Mock Exam" />
        </Field>
        <Field label="Instructions for students" hint="Shown on the confirmation screen before students click Start.">
          <Input value={f.instructions ?? ''} onChange={(e) => set({ instructions: e.target.value })} placeholder="Answer all questions. Submit before time runs out." />
        </Field>
        <Field label="Exam duration (minutes)" hint="Students get this countdown timer from when they begin.">
          <Input type="number" min="1" max="360" value={f.durationMinutes} onChange={(e) => set({ durationMinutes: Number(e.target.value) })} />
        </Field>
      </SectionBlock>

      {/* 2. When Can Students Take It? */}
      <SectionBlock icon={Calendar} title="Delivery Mode" subtitle="Choose how and when students sit this exam.">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <ChoiceCard
            badge="FLEXIBLE"
            title="Anytime Practice"
            description="Students can start and take the exam at their own convenience. Available 24/7 while published."
            selected={f.mode === 'anytime'}
            onClick={() => set({ mode: 'anytime' })}
          />
          <ChoiceCard
            badge={canLive ? 'SCHEDULED' : 'STUDIO'}
            title="Live CBT Session"
            description="Everyone starts together at a set date and time with a live synchronized countdown."
            selected={f.mode === 'live'}
            disabled={!canLive && f.mode !== 'live'}
            onClick={() => set({ mode: 'live' })}
          />
        </div>

        {canLive && !hasStudio && liveCbtPerk && (
          <p className="rounded-xl bg-[var(--brand-lavender)] p-3 text-sm text-foreground">
            Free with your Student Pass: <span className="font-semibold">{liveCbtPerk.remaining} of {liveCbtPerk.limit}</span> live CBTs left. <Link to="/workspace/billing" className="font-semibold text-primary underline">Studio</Link> removes the limit.
          </p>
        )}
        {!canLive && (
          <p className="rounded-xl bg-[var(--brand-lavender)] p-3 text-sm text-foreground">
            Live CBT, where everyone starts together at a set time, is part of the <Link to="/workspace/billing" className="font-semibold text-primary underline">Studio plan</Link>.
          </p>
        )}

        {f.mode === 'live' && (
          <div className="rounded-2xl border border-border/80 bg-surface-strong/30 p-4 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">Set Live Schedule</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Date"><Input type="date" value={date} onChange={(e) => setStart(e.target.value, time)} /></Field>
              <Field label="Start time"><Input type="time" value={time} onChange={(e) => setStart(date, e.target.value)} /></Field>
            </div>
          </div>
        )}
      </SectionBlock>

      {/* 3. Monetization & Payment Policy */}
      <SectionBlock icon={CreditCard} title="Pricing & Payment Policy" subtitle="Choose if students pay and how retakes are charged.">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <ChoiceCard
            badge="FREE"
            title="Free for Students"
            description="All eligible students can sit this exam without paying."
            selected={!paid}
            onClick={() => set({ priceMinor: 0 })}
          />
          <ChoiceCard
            badge={canCharge ? 'MONETIZED' : 'STUDIO'}
            title="Paid Exam Access"
            description="Students pay via Paystack before sitting. TestFlow splits 95% straight to your payout bank."
            selected={paid}
            disabled={!canCharge && !paid}
            onClick={() => set({ priceMinor: Math.max(f.priceMinor || 0, 100000) })}
          />
        </div>

        {!canCharge && (
          <p className="rounded-xl bg-[var(--brand-lavender)] p-3 text-sm text-foreground">
            Charging students for an exam, paid to your account, is part of the <Link to="/workspace/billing" className="font-semibold text-primary underline">Studio plan</Link>.
          </p>
        )}

        {paid && (
          <div className="space-y-5 rounded-2xl border border-border/80 bg-surface-strong/20 p-5">
            <Field label="Fee per student (₦)" hint="On a ₦1,000 payment: You receive ₦950 (TestFlow keeps 5%).">
              <Input type="number" min="100" value={(f.priceMinor ?? 0) / 100} onChange={(e) => set({ priceMinor: Math.round(Number(e.target.value || 0) * 100) })} />
            </Field>

            {paidNeedsPayout && (
              <Banner variant="warning" action={<Link to="/workspace/payments"><Button size="sm" variant="secondary">Add payout account</Button></Link>}>
                Add where your money should go in Payments before making this paid exam live.
              </Banner>
            )}

            <div>
              <p className="mb-2 text-sm font-semibold text-foreground-strong">Retake Payment Model</p>
              <p className="mb-3 text-xs text-muted">Choose whether each attempt requires a new payment or if one payment covers all attempts.</p>
              <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
                <ChoiceCard
                  badge="RECOMMENDED"
                  title="Pay Per Sitting"
                  description="Each exam session requires a payment. If a student wants to redo or retake, they must pay again for that session."
                  selected={(f.paymentPolicy ?? 'per_session') === 'per_session'}
                  onClick={() => set({ paymentPolicy: 'per_session' })}
                />
                <ChoiceCard
                  badge="BUNDLE"
                  title="Pay Once For All Tries"
                  description="One payment unlocks the exam and covers all allowed attempts without charging again."
                  selected={f.paymentPolicy === 'once'}
                  onClick={() => set({ paymentPolicy: 'once' })}
                />
              </div>
            </div>
          </div>
        )}
      </SectionBlock>

      {/* 4. Attempts Allowed (How Many Times Can A Student Take This?) */}
      <SectionBlock icon={RotateCcw} title="Attempts & Redo Policy" subtitle="Choose how many sessions a student can take.">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <ChoiceCard
            badge="RECOMMENDED"
            title="Single Attempt (1 Sitting)"
            description="Student takes it once. Once submitted, they cannot retake. Anytime they click it again, it says 'Submitted'."
            selected={attemptTier === 'single'}
            onClick={() => set({ attemptsAllowed: 1 })}
          />
          <ChoiceCard
            badge="LIMITED"
            title="Limited Retakes"
            description="Allow a set number of attempts (e.g. 2, 3, or 5 attempts per student)."
            selected={attemptTier === 'limited'}
            onClick={() => set({ attemptsAllowed: Math.max(2, Math.min(10, f.attemptsAllowed || 2)) })}
          />
          <ChoiceCard
            badge="PRACTICE"
            title="Unlimited Practice"
            description="Students can redo and practice this exam as many times as they want."
            selected={attemptTier === 'unlimited'}
            onClick={() => set({ attemptsAllowed: 50 })}
          />
        </div>

        {attemptTier === 'limited' && (
          <div className="max-w-xs pt-1">
            <Field label="Maximum attempts per student" hint="Between 2 and 10 attempts.">
              <Input
                type="number"
                min="2"
                max="10"
                value={f.attemptsAllowed}
                onChange={(e) => set({ attemptsAllowed: Math.max(2, Math.min(10, Number(e.target.value || 2))) })}
              />
            </Field>
          </div>
        )}
      </SectionBlock>

      {/* 5. After Submission & Result Visibility */}
      <SectionBlock icon={Eye} title="After They Submit" subtitle="Choose what students see once they click submit.">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <ChoiceCard
            badge="RECOMMENDED"
            title="Strict (Result Recorded Only)"
            description="Student only sees 'Submitted. Result recorded.' No score, answers, or corrections are leaked. Anytime they re-open, it stays locked as Submitted."
            selected={f.showCorrections === 'hidden'}
            onClick={() => set({ showCorrections: 'hidden' })}
          />
          <ChoiceCard
            badge="EVALUATION"
            title="Score Only"
            description="Students see their overall score and percentage, but all question corrections and answers remain hidden."
            selected={f.showCorrections === 'score_only'}
            onClick={() => set({ showCorrections: 'score_only' })}
          />
          <ChoiceCard
            badge="STUDY MODE"
            title="Immediate Corrections"
            description="Full review. Students see every question, their chosen answer, the correct answer, and full explanations."
            selected={f.showCorrections === 'now' || f.showCorrections === 'after_exam'}
            onClick={() => set({ showCorrections: 'now' })}
          />
        </div>

        {f.showCorrections === 'hidden' && (
          <p className="rounded-xl border border-border/80 bg-surface-strong/30 p-3.5 text-xs sm:text-sm text-foreground-strong">
            💡 <strong>Strict Exam Mode:</strong> Students only see <em>"Submitted. Your result has been recorded."</em> No correct answers or scores are revealed. You review the submissions privately in Results.
          </p>
        )}
      </SectionBlock>

      {/* 6. Who Can Take It? */}
      <SectionBlock icon={Users} title="Who Can Access This Exam?" subtitle="Control student eligibility and privacy.">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <ChoiceCard
            badge="PUBLIC"
            title="Anyone With Link"
            description="Any student registered on your CBT portal can access and sit this exam."
            selected={f.access === 'link'}
            onClick={() => set({ access: 'link' })}
          />
          <ChoiceCard
            badge="PRIVATE"
            title="Invited Emails Only"
            description="Only student email addresses explicitly added to your roster can see and take it."
            selected={f.access === 'invited'}
            onClick={() => set({ access: 'invited' })}
          />
          <ChoiceCard
            badge="PASSCODE"
            title="Access Code Required"
            description="Students must enter a secret access code you provide before they can start."
            selected={f.access === 'code'}
            onClick={() => set({ access: 'code' })}
          />
        </div>

        {f.access === 'invited' && <InvitedList value={f.allowedEmails ?? []} onChange={(allowedEmails) => set({ allowedEmails })} />}
        {f.access === 'code' && (
          <Field label="Secret Access Code" hint="Give this code to the students you want to permit.">
            <Input value={f.accessCode ?? ''} onChange={(e) => set({ accessCode: e.target.value })} placeholder="e.g. EXAM-2026" />
          </Field>
        )}
      </SectionBlock>

      {/* 7. Marking & Anti-Cheating Settings */}
      <SectionBlock icon={Sliders} title="Marking & Question Security" subtitle="Randomization, order mixing, and penalties.">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4 rounded-xl border border-border/70 p-4">
            <div>
              <p className="text-sm font-semibold text-foreground-strong">Mix up question order</p>
              <p className="text-xs text-muted">Each student receives questions in a completely different, randomized order.</p>
            </div>
            <Switch checked={f.shuffleQuestions} onCheckedChange={(v) => set({ shuffleQuestions: v })} aria-label="Mix up questions" />
          </div>

          <div className="flex items-center justify-between gap-4 rounded-xl border border-border/70 p-4">
            <div>
              <p className="text-sm font-semibold text-foreground-strong">Mix up answer options</p>
              <p className="text-xs text-muted">A, B, C, D options appear in randomized order for each question.</p>
            </div>
            <Switch checked={f.shuffleOptions} onCheckedChange={(v) => set({ shuffleOptions: v })} aria-label="Mix up options" />
          </div>

          <Field label="Marks lost for a wrong answer (Negative marking)" hint="0 means no penalty for guessing.">
            <Input type="number" min="0" step="0.25" value={f.negativeMarking} onChange={(e) => set({ negativeMarking: Number(e.target.value) })} />
          </Field>
        </div>
      </SectionBlock>

      {/* Security Reassurance Banner */}
      <div className="flex items-center gap-3 rounded-2xl border border-border/80 bg-surface-strong/30 p-4 text-xs text-muted leading-relaxed">
        <ShieldCheck size={18} className="shrink-0 text-primary" aria-hidden="true" />
        <span>All exam papers, student submissions, and attempt timestamps are cryptographically sealed upon submit.</span>
      </div>

      <StickyActionBar
        dirty={dirty}
        onDiscard={() => setF(baseDefaults)}
        onSave={() => save.mutate(f)}
      />
    </div>
  );
}

function ResultsTab({ exam }) {
  const { data, isLoading } = useExamResults(exam.id);
  if (isLoading) return <SkeletonCard className="h-48" />;
  const rows = (data?.items ?? []).map((r) => ({ ...r, id: r.id }));
  const t = data?.summary ?? {};
  const columns = [
    { key: 'student', header: 'Student', render: (r) => <span><span className="font-semibold text-foreground-strong">{r.studentName}</span><span className="block text-xs text-muted">{r.email}</span></span> },
    { key: 'scorePercent', header: 'Score', sortable: true, align: 'right', render: (r) => <Badge variant={r.scorePercent >= 70 ? 'success' : r.scorePercent >= 50 ? 'warning' : 'danger'}>{r.scorePercent}%</Badge> },
    { key: 'correct', header: 'Correct', align: 'right', render: (r) => `${r.correct}/${r.total}` },
    { key: 'timeMinutes', header: 'Time', align: 'right', render: (r) => `${r.timeMinutes} min` },
    { key: 'submittedAt', header: 'Submitted', render: (r) => fmtDate(r.submittedAt) },
  ];
  const exportCsv = () => {
    const csv = ['Student,Email,Score %,Correct,Total,Time (min),Submitted', ...rows.map((r) => [r.studentName, r.email, r.scorePercent, r.correct, r.total, r.timeMinutes, r.submittedAt].map((v) => `"${String(v ?? '').replaceAll('"', '""')}"`).join(','))].join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = `${exam.title}-results.csv`;
    a.click();
  };
  if (!rows.length) return <EmptyState icon={Users} title="Nobody has taken this exam yet" description="Make it live, then send the link to your students. Their scores show up here." />;
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard label="Students who took it" value={t.attempts ?? rows.length} icon={Users} tone="primary" />
        <StatCard label="Average score" value={`${t.average ?? 0}%`} tone="sage" />
        <StatCard label="Highest" value={`${t.highest ?? 0}%`} tone="accent" />
        <StatCard label="Lowest" value={`${t.lowest ?? 0}%`} tone="warning" />
      </div>
      <div className="flex justify-end"><Button variant="outline" size="sm" onClick={exportCsv} leadingIcon={<Download {...ICON} size={15} />}>Download as a spreadsheet</Button></div>
      <DataTable caption="Results" columns={columns} rows={rows} pageSize={12} initialSort={{ key: 'scorePercent', dir: 'desc' }} emptyMessage="No results." />
    </div>
  );
}

export default ExamDetailScreen;
