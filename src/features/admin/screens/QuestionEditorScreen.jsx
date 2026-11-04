import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Banner, Button, Card, Field, Input, Select, SkeletonCard, Switch, useToast } from '../../../components/ui/index.js';
import QuestionEditor from '../../../components/everybody/QuestionEditor.jsx';
import { questionProblems } from '../../../components/everybody/questionRules.js';
import Screen, { PageHeader } from '../../../components/layout/Screen.jsx';
import { useSubjects } from '../../subjects/useSubjects.js';
import { adminApi } from '../api.js';
import { useAdminMutation } from '../useAdmin.js';
import { LoadError } from './shared.jsx';

const BLANK = { stem: '', options: ['', '', '', ''], correctIndex: 0, topic: '', difficulty: 'medium', explanation: '', subject: '', isActive: true, isShareable: false, shareTitle: '' };

function QuestionEditorScreen() {
  const { id } = useParams();
  const { data: existing, isLoading, error } = useQuery({ queryKey: ['admin', 'question', id], queryFn: () => adminApi.getQuestion(id), enabled: Boolean(id) });

  if (id && isLoading) return <Screen width="lg"><SkeletonCard className="h-96" /></Screen>;
  if (id && error) return <Screen width="lg"><LoadError error={error} what="the question" /></Screen>;

  const initial = existing
    ? { ...BLANK, ...existing, options: [...existing.options], subject: existing.subject?.code ?? existing.subject ?? '', topic: existing.topic ?? '', explanation: existing.explanation ?? '', shareTitle: existing.shareTitle ?? '' }
    : BLANK;
  return <Form key={id ?? 'new'} id={id} initial={initial} />;
}

function Form({ id, initial }) {
  const navigate = useNavigate();
  const toast = useToast();
  const { data: subjects } = useSubjects();
  const [q, setQ] = useState(initial);
  const [error, setError] = useState(null);
  const set = (patch) => setQ((v) => ({ ...v, ...patch }));

  const save = useAdminMutation(
    () => {
      const body = {
        subject: q.subject, stem: q.stem.trim(), options: q.options.map((o) => o.trim()).filter(Boolean), correctIndex: q.correctIndex,
        topic: q.topic.trim() || undefined, difficulty: q.difficulty, explanation: q.explanation.trim() || undefined,
        isActive: q.isActive, isShareable: q.isShareable, shareTitle: q.isShareable ? q.shareTitle.trim() || undefined : undefined,
      };
      return id ? adminApi.updateQuestion(id, body) : adminApi.createQuestion(body);
    },
    { onSuccess: () => { toast.success(id ? 'Question saved' : 'Question created'); navigate('/admin/questions'); }, onError: (e) => setError(e.message || 'Could not save the question.') },
  );

  const problems = [...questionProblems(q), ...(q.subject ? [] : ['Choose a subject.'])];
  const subjectOptions = (subjects ?? []).map((s) => ({ value: s.code, label: `${s.code} · ${s.title}` }));

  return (
    <Screen width="xl">
      <PageHeader back="/admin/questions" eyebrow="Questions" title={id ? 'Edit question' : 'New question'} subtitle="Maths works with $...$. The preview shows what students will see." />
      <div className="mt-8 space-y-6">
        {error && <Banner variant="danger">{error}</Banner>}
        <Card padding="lg" className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Subject" required><Select value={q.subject} onValueChange={(v) => set({ subject: v })} options={subjectOptions} placeholder="Choose a subject" /></Field>
            <Field label="Topic" hint="Optional"><Input value={q.topic} onChange={(e) => set({ topic: e.target.value })} /></Field>
          </div>
          <QuestionEditor value={q} onChange={(next) => set(next)} />
        </Card>

        <Card padding="lg" className="space-y-4">
          <h2 className="font-heading text-base font-bold text-foreground-strong">Visibility</h2>
          <div className="flex items-center justify-between gap-4"><div><p className="text-sm font-semibold text-foreground-strong">Show to students</p><p className="text-xs text-muted">Hidden questions stay in the bank but never appear in exams.</p></div><Switch checked={q.isActive} onCheckedChange={(v) => set({ isActive: v })} aria-label="Show to students" /></div>
          <div className="flex items-center justify-between gap-4"><div><p className="text-sm font-semibold text-foreground-strong">Public share page</p><p className="text-xs text-muted">Lets anyone open this question from a link and answer it.</p></div><Switch checked={q.isShareable} onCheckedChange={(v) => set({ isShareable: v })} aria-label="Public share page" /></div>
          {q.isShareable && <Field label="Share title" hint="Shown on the shared card."><Input value={q.shareTitle} maxLength={200} onChange={(e) => set({ shareTitle: e.target.value })} /></Field>}
        </Card>

        <div className="flex flex-wrap items-center justify-end gap-3">
          {problems.length > 0 && <p className="mr-auto text-sm text-muted">{problems[0]}</p>}
          <Button variant="ghost" onClick={() => navigate('/admin/questions')}>Cancel</Button>
          <Button loading={save.isPending} disabled={problems.length > 0} onClick={() => { setError(null); save.mutate(); }}>{id ? 'Save changes' : 'Create question'}</Button>
        </div>
      </div>
    </Screen>
  );
}

export default QuestionEditorScreen;
