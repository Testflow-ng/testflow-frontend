import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Banner, Button, Field, Input, Modal, SegmentedControl, Select, Slider, Switch, useToast } from '../../components/ui/index.js';
import { useSubjects } from '../subjects/useSubjects.js';
import { liveApi } from './api.js';

const DIFFICULTY = [
  { value: 'mixed', label: 'Mixed' },
  { value: 'easy', label: 'Easy' },
  { value: 'medium', label: 'Medium' },
  { value: 'hard', label: 'Hard' },
];

const initial = { title: '', subject: '', numQuestions: 20, durationMinutes: 20, maxParticipants: 10, difficulty: 'mixed', shuffleQuestions: true, shuffleOptions: true, allowReview: true, negativeMarking: '0' };

/** Host form. On success we go straight to the room, where the share code and the approvals live. */
function CreateSessionModal({ open, onOpenChange }) {
  const navigate = useNavigate();
  const toast = useToast();
  const { data: subjects } = useSubjects();
  const [form, setForm] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const set = (key) => (value) => setForm((f) => ({ ...f, [key]: value }));

  const subjectOptions = (subjects ?? []).filter((s) => (s.questionCount ?? 0) > 0).map((s) => ({ value: s.code, label: `${s.code} · ${s.title}` }));
  const invalid = form.title.trim().length < 3 || !form.subject;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const exam = await liveApi.create({
        title: form.title.trim(),
        subject: form.subject,
        numQuestions: form.numQuestions,
        durationMinutes: form.durationMinutes,
        maxParticipants: form.maxParticipants,
        difficulty: form.difficulty,
        shuffleQuestions: form.shuffleQuestions,
        shuffleOptions: form.shuffleOptions,
        allowReview: form.allowReview,
        negativeMarking: Number(form.negativeMarking),
      });
      toast.success('Session created');
      onOpenChange(false);
      setForm(initial);
      navigate(`/live/${exam.shareCode}`);
    } catch (err) {
      setError(err.message || 'Could not create the session.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      size="lg"
      title="Create a live session"
      description="Pick a subject and the rules. You will get a code to share."
      dismissible={!busy}
      footer={
        <>
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={busy}>Cancel</Button>
          <Button type="submit" form="create-live" loading={busy} disabled={invalid}>Create session</Button>
        </>
      }
    >
      <form id="create-live" onSubmit={submit} className="space-y-5 py-1">
        {error && <Banner variant="danger">{error}</Banner>}
        <Field label="Session title" required>
          <Input value={form.title} onChange={(e) => set('title')(e.target.value)} placeholder="MTH101 mock, Friday night" maxLength={200} />
        </Field>
        <Field label="Subject" required hint={subjectOptions.length ? undefined : 'No subject with questions is available yet.'}>
          <Select value={form.subject} onValueChange={set('subject')} options={subjectOptions} placeholder="Choose a subject" />
        </Field>
        <Slider label="Questions" min={5} max={100} step={5} value={form.numQuestions} onValueChange={set('numQuestions')} />
        <Slider label="Time" min={5} max={120} step={5} value={form.durationMinutes} onValueChange={set('durationMinutes')} format={(v) => `${v} min`} />
        <Slider label="Max participants" min={2} max={30} value={form.maxParticipants} onValueChange={set('maxParticipants')} />
        <div>
          <p className="mb-2 text-sm font-medium text-foreground-strong">Difficulty</p>
          <SegmentedControl label="Difficulty" size="sm" options={DIFFICULTY} value={form.difficulty} onValueChange={set('difficulty')} />
        </div>
        <Field label="Negative marking" hint="Marks taken off for each wrong answer.">
          <Select value={form.negativeMarking} onValueChange={set('negativeMarking')} options={['0', '0.25', '0.5', '1'].map((v) => ({ value: v, label: v === '0' ? 'None' : `-${v}` }))} />
        </Field>
        <div className="divide-y divide-border rounded-2xl border border-border">
          {[
            ['shuffleQuestions', 'Shuffle questions', 'Everyone gets a different order.'],
            ['shuffleOptions', 'Shuffle answer options', 'Options appear in a different order.'],
            ['allowReview', 'Allow review', 'Show corrections once results are out.'],
          ].map(([key, label, hint]) => (
            <div key={key} className="flex items-center justify-between gap-4 p-4">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground-strong">{label}</p>
                <p className="text-xs text-muted">{hint}</p>
              </div>
              <Switch checked={form[key]} onCheckedChange={set(key)} aria-label={label} />
            </div>
          ))}
        </div>
      </form>
    </Modal>
  );
}

export default CreateSessionModal;
