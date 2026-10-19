import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Check, ChevronDown, CircleAlert, Download, FileUp, ListPlus, MoreHorizontal, Pencil, PenLine, Trash2, Users } from 'lucide-react';
import { Badge, Banner, Button, Card, Checkbox, ConfirmDialog, CopyField, DropdownMenu, EmptyState, Field, IconButton, Input, Modal, SegmentedControl, Select, SkeletonCard, StatusBadge, StickyActionBar, Switch, TabPanel, Tabs, useToast } from '../../../components/ui/index.js';
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

function Block({ title, text, children }) {
  return (
    <Card padding="lg" className="space-y-4">
      <div><h2 className="font-heading text-base font-bold text-foreground-strong">{title}</h2>{text && <p className="mt-1 text-sm text-muted">{text}</p>}</div>
      {children}
    </Card>
  );
}

function RulesTab({ exam, paidNeedsPayout, canLive, canCharge }) {
  const toast = useToast();
  const [f, setF] = useState({ mode: 'anytime', access: 'link', showCorrections: 'now', shuffleQuestions: true, shuffleOptions: true, negativeMarking: 0, attemptsAllowed: 1, ...exam });
  const dirty = JSON.stringify(f) !== JSON.stringify({ mode: 'anytime', access: 'link', showCorrections: 'now', shuffleQuestions: true, shuffleOptions: true, negativeMarking: 0, attemptsAllowed: 1, ...exam });
  const set = (patch) => setF((x) => ({ ...x, ...patch }));
  const save = useWsMutation((id, body) => wsApi.saveExam(id, body), { onSuccess: () => toast.success('Rules saved'), onError: (e) => toast.error('Could not save', e.message) });
  const [more, setMore] = useState(false);
  const paid = (f.priceMinor ?? 0) > 0;
  const date = f.startsAt ? f.startsAt.slice(0, 10) : '';
  const time = f.startsAt ? f.startsAt.slice(11, 16) : '09:00';
  const setStart = (d, t) => set({ startsAt: d ? `${d}T${t || '09:00'}` : '' });


  return (
    <div className="max-w-3xl space-y-5 pb-24">
      <Block title="Name and instructions">
        <Field label="Exam name"><Input value={f.title} maxLength={120} onChange={(e) => set({ title: e.target.value })} /></Field>
        <Field label="Instructions for students" hint="Shown before they start. Optional."><Input value={f.instructions ?? ''} onChange={(e) => set({ instructions: e.target.value })} placeholder="Answer all questions. No calculators." /></Field>
      </Block>

      <Block title="When can students take it?">
        <SegmentedControl label="Type" value={f.mode} onValueChange={(v) => set({ mode: v })} options={[{ value: 'anytime', label: 'Anytime' }, { value: 'live', label: canLive ? 'Live CBT' : 'Live CBT (Studio)', disabled: !canLive && f.mode !== 'live' }]} />
        {!canLive && <p className="rounded-xl bg-[var(--brand-lavender)] p-3 text-sm text-foreground">Live CBT, where everyone starts together at a set time, is part of the <Link to="/workspace/billing" className="font-semibold text-primary underline">Studio plan</Link>.</p>}
        {f.mode === 'live' ? (
          <div className="space-y-3">
            <p className="text-sm text-muted">Everyone starts together. Students can open the page a few minutes early and wait for the start.</p>
            <div className="grid gap-4 sm:grid-cols-2"><Field label="Date"><Input type="date" value={date} onChange={(e) => setStart(e.target.value, time)} /></Field><Field label="Start time"><Input type="time" value={time} onChange={(e) => setStart(date, e.target.value)} /></Field></div>
          </div>
        ) : <p className="text-sm text-muted">Students can start whenever they like, as long as the exam is live.</p>}
        <Field label="How long do they get? (minutes)"><Input type="number" min="1" max="360" value={f.durationMinutes} onChange={(e) => set({ durationMinutes: Number(e.target.value) })} /></Field>
      </Block>

      <Block title="Is it free?" text="This is the only thing students ever pay for.">
        <SegmentedControl label="Price" value={paid ? 'paid' : 'free'} onValueChange={(v) => set({ priceMinor: v === 'free' ? 0 : Math.max(f.priceMinor || 0, 100000) })} options={[{ value: 'free', label: 'Free' }, { value: 'paid', label: canCharge ? 'Paid' : 'Paid (Studio)', disabled: !canCharge && !paid }]} />
        {!canCharge && <p className="rounded-xl bg-[var(--brand-lavender)] p-3 text-sm text-foreground">Charging students for an exam, paid to your account, is part of the <Link to="/workspace/billing" className="font-semibold text-primary underline">Studio plan</Link>.</p>}
        {paid && <Field label="Fee per student (₦)" hint="Testflow takes a small share of each payment automatically; the rest goes to your payout account."><Input type="number" min="100" value={(f.priceMinor ?? 0) / 100} onChange={(e) => set({ priceMinor: Math.round(Number(e.target.value || 0) * 100) })} /></Field>}
        {paid && paidNeedsPayout && <Banner variant="warning" action={<Link to="/workspace/payments"><Button size="sm" variant="secondary">Add payout account</Button></Link>}>Add where your money should go before you make a paid exam live.</Banner>}
      </Block>

      <Block title="Who can take it?">
        <SegmentedControl label="Access" value={f.access} onValueChange={(v) => set({ access: v })} options={[{ value: 'link', label: 'Anyone with the link' }, { value: 'invited', label: 'Students I invited' }, { value: 'code', label: 'Needs a code' }]} />
        {f.access === 'code' && <Field label="Access code" hint="Give this to the students you want."><Input value={f.accessCode ?? ''} onChange={(e) => set({ accessCode: e.target.value })} /></Field>}
      </Block>

      <Block title="After they finish" text="What students see once they submit.">
        <Select aria-label="After they finish" value={f.showCorrections === 'never' ? 'score_only' : f.showCorrections} onValueChange={(v) => set({ showCorrections: v })} options={CORRECTIONS} />
        {f.showCorrections === 'hidden' && <p className="rounded-xl bg-surface-strong p-3 text-sm text-foreground">Students only see "Submitted. Your result has been recorded." Scores stay visible to you in Results.</p>}
      </Block>

      <Card padding="lg" className="space-y-0">
        <button type="button" onClick={() => setMore((m) => !m)} aria-expanded={more} className="flex w-full items-center justify-between gap-3 rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
          <span><span className="block font-heading text-base font-bold text-foreground-strong">More options</span><span className="block text-sm text-muted">Mixing, marking and attempts.</span></span>
          <ChevronDown size={20} className={`shrink-0 text-muted transition-transform ${more ? 'rotate-180' : ''}`} aria-hidden="true" />
        </button>
        {more && (
          <div className="mt-6 space-y-5 border-t border-border pt-6">
            <div className="flex items-center justify-between gap-4"><div><p className="text-sm font-semibold text-foreground-strong">Mix up the questions</p><p className="text-xs text-muted">Each student gets a different order.</p></div><Switch checked={f.shuffleQuestions} onCheckedChange={(v) => set({ shuffleQuestions: v })} aria-label="Mix up the questions" /></div>
            <div className="flex items-center justify-between gap-4"><div><p className="text-sm font-semibold text-foreground-strong">Mix up the answer options</p><p className="text-xs text-muted">A, B, C, D appear in a different order.</p></div><Switch checked={f.shuffleOptions} onCheckedChange={(v) => set({ shuffleOptions: v })} aria-label="Mix up the answer options" /></div>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Marks lost for a wrong answer" hint="0 means none." className="min-w-0"><Input type="number" min="0" step="0.25" value={f.negativeMarking} onChange={(e) => set({ negativeMarking: Number(e.target.value) })} /></Field>
              <Field label="Attempts allowed" hint="How many times a student can take it." className="min-w-0"><Input type="number" min="1" value={f.attemptsAllowed} onChange={(e) => set({ attemptsAllowed: Number(e.target.value) })} /></Field>
            </div>
          </div>
        )}
      </Card>
      <StickyActionBar dirty={dirty} onDiscard={() => setF({ mode: 'anytime', access: 'link', showCorrections: 'now', shuffleQuestions: true, shuffleOptions: true, negativeMarking: 0, attemptsAllowed: 1, ...exam })} onSave={() => save.mutate(f)} />
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
