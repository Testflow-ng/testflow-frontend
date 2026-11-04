import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { CreditCard, Lock } from 'lucide-react';
import { Banner, Button, Card, Field, Input, ProgressBar, Spinner } from '../../components/ui/index.js';
import OptionRow from '../../components/exam/OptionRow.jsx';
import QuestionCard from '../../components/exam/QuestionCard.jsx';
import { formatMoney } from '../../utils/money.js';
import TenantShell from './TenantShell.jsx';
import { useTenant } from './TenantContext.js';
import { tenantApi } from './tenantApi.js';

const LETTERS = 'ABCDEF';
const clock = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

/** Start (or resume) an exam, pay for it first when it is priced, sit it, and go to the result. */
function TenantExamPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { hostname } = useTenant();
  const [phase, setPhase] = useState('starting'); // starting | pay | code | sitting | error
  const [info, setInfo] = useState(null); // payment details or an error message
  const [code, setCode] = useState('');
  const [attempt, setAttempt] = useState(null);
  const [answers, setAnswers] = useState({});
  const [current, setCurrent] = useState(0);
  const [left, setLeft] = useState(0);
  const [busy, setBusy] = useState(false);
  const submitted = useRef(false);

  const start = useCallback(async (accessCode) => {
    try {
      const a = await tenantApi.startExam(id, accessCode ? { accessCode } : {});
      setAttempt(a);
      setLeft(a.remainingSeconds);
      setPhase('sitting');
    } catch (e) {
      const c = e.code;
      if (c === 'PAYMENT_REQUIRED') { setInfo(e.data?.error?.details ?? {}); setPhase('pay'); }
      else if (c === 'INVALID_ACCESS_CODE') { setInfo(code ? 'That code is not correct.' : null); setPhase('code'); }
      else { setInfo(e.message || 'Could not start this exam.'); setPhase('error'); }
    }
  }, [id, code]);

  // Starting is a request, so its state changes happen after the response, not inside this effect.
  // eslint-disable-next-line react-hooks/set-state-in-effect, react-hooks/exhaustive-deps
  useEffect(() => { start(); }, []);

  const finish = useCallback(async () => {
    if (submitted.current || !attempt) return;
    submitted.current = true;
    setBusy(true);
    try {
      await tenantApi.submit(attempt.id);
      qc.invalidateQueries({ queryKey: ['tenant', hostname] });
      navigate(`/results/${attempt.id}`, { replace: true });
    } catch (e) {
      submitted.current = false;
      setBusy(false);
      setInfo(e.message || 'Could not submit. Try again.');
    }
  }, [attempt, hostname, navigate, qc]);

  // The server owns the clock; this only counts down what it said was left, and submits at zero.
  const finishRef = useRef(finish);
  useEffect(() => { finishRef.current = finish; }, [finish]);
  useEffect(() => {
    if (phase !== 'sitting') return undefined;
    const t = setInterval(() => {
      setLeft((n) => {
        if (n <= 1) { clearInterval(t); setTimeout(() => finishRef.current(), 0); return 0; }
        return n - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [phase]);

  const choose = (qid, index) => {
    setAnswers((a) => ({ ...a, [qid]: index }));
    tenantApi.saveAnswer(attempt.id, { questionId: qid, selectedIndex: index }).catch((e) => { if (e.code === 'EXAM_ENDED') finish(); });
  };

  const pay = async () => {
    setBusy(true);
    try {
      const out = await tenantApi.checkout(id, `${id}-${Date.now()}`);
      if (out.alreadyPaid || out.access) { setBusy(false); setPhase('starting'); start(); return; }
      window.location.assign(out.authorizationUrl);
    } catch (e) {
      setInfo(e.message || 'Could not start the payment.');
      setBusy(false);
    }
  };

  if (phase === 'starting') return <TenantShell><div className="flex justify-center py-20"><Spinner size="xl" className="text-primary" /></div></TenantShell>;
  if (phase === 'error') return <TenantShell back="/"><Banner variant="danger">{info}</Banner></TenantShell>;

  if (phase === 'pay') {
    return (
      <TenantShell back="/">
        <Card padding="lg" className="mx-auto max-w-[28rem] space-y-4 text-center">
          <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary"><CreditCard size={22} strokeWidth={1.5} aria-hidden="true" /></span>
          <h1 className="font-heading text-xl font-extrabold text-foreground-strong">Pay to start this exam</h1>
          <p className="text-sm text-muted">One payment gives you access. Your card details go to the payment provider, never to this site.</p>
          <p className="font-heading text-3xl font-extrabold text-foreground-strong">{formatMoney(info?.priceMinor ?? 0)}</p>
          <Button size="lg" className="w-full" loading={busy} onClick={pay}>Pay {formatMoney(info?.priceMinor ?? 0)}</Button>
        </Card>
      </TenantShell>
    );
  }

  if (phase === 'code') {
    return (
      <TenantShell back="/">
        <Card padding="lg" className="mx-auto max-w-[28rem] space-y-4">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary"><Lock size={22} strokeWidth={1.5} aria-hidden="true" /></span>
          <h1 className="font-heading text-xl font-extrabold text-foreground-strong">Enter the access code</h1>
          {info && <Banner variant="danger">{info}</Banner>}
          <Field label="Access code"><Input value={code} onChange={(e) => setCode(e.target.value)} autoComplete="off" /></Field>
          <Button size="lg" className="w-full" disabled={!code.trim()} onClick={() => { setPhase('starting'); start(code.trim()); }}>Start exam</Button>
        </Card>
      </TenantShell>
    );
  }

  const q = attempt.questions[current];
  const answered = Object.keys(answers).length;
  return (
    <TenantShell>
      <div className="mb-5 flex items-center justify-between gap-3">
        <h1 className="truncate font-heading text-lg font-extrabold text-foreground-strong">{attempt.examTitle}</h1>
        <span className={`rounded-full px-3 py-1 font-mono text-sm font-bold ${left < 60 ? 'bg-danger/10 text-danger' : 'bg-surface-strong text-foreground-strong'}`} role="timer" aria-label="Time left">{clock(left)}</span>
      </div>
      <ProgressBar value={answered} max={attempt.totalQuestions} size="sm" tone="accent" className="mb-5" />
      {info && <Banner variant="danger" className="mb-4">{info}</Banner>}
      <QuestionCard number={current + 1} total={attempt.totalQuestions} stem={q.stem}>
        {q.stemImageUrl && <img src={q.stemImageUrl} alt="" className="max-h-64 rounded-xl" />}
        {q.options.map((o, j) => (
          <OptionRow key={j} name={`q${q.id}`} label={LETTERS[j]} state={answers[q.id] === j ? 'selected' : 'idle'} onSelect={() => choose(q.id, j)}>{o}</OptionRow>
        ))}
      </QuestionCard>
      <div className="mt-5 flex items-center justify-between gap-3">
        <Button variant="outline" disabled={current === 0} onClick={() => setCurrent((c) => c - 1)}>Previous</Button>
        {current < attempt.totalQuestions - 1
          ? <Button onClick={() => setCurrent((c) => c + 1)}>Next</Button>
          : <Button loading={busy} onClick={finish}>Submit exam</Button>}
      </div>
      <p className="mt-4 text-center text-xs text-muted">{answered} of {attempt.totalQuestions} answered</p>
    </TenantShell>
  );
}

export default TenantExamPage;
