import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { BarChart3, Eye, EyeOff, FileUp, MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-react';
import { Badge, Button, ConfirmDialog, DropdownMenu, IconButton, Modal, SearchField, SegmentedControl, Select, useToast } from '../../../components/ui/index.js';
import DataTable from '../../../components/data/DataTable.jsx';
import { BrandBarChart } from '../../../components/data/charts.jsx';
import MathText from '../../../components/MathText.jsx';
import BulkImport from '../../../components/everybody/BulkImport.jsx';
import { validateQuestionRow } from '../../../components/everybody/questionRules.js';
import Screen, { PageHeader } from '../../../components/layout/Screen.jsx';
import { useSubjects } from '../../subjects/useSubjects.js';
import { adminApi } from '../api.js';
import { useAdminMutation, useAdminQuestions } from '../useAdmin.js';
import { LoadError, TableSkeleton } from './shared.jsx';

const LIMIT = 15;
const LEVEL_TONE = { easy: 'success', medium: 'warning', hard: 'danger' };
const LETTERS = 'ABCDEF';

function QuestionsScreen() {
  const toast = useToast();
  const navigate = useNavigate();
  const { data: subjects } = useSubjects();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [subject, setSubject] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [importing, setImporting] = useState(false);
  const [stats, setStats] = useState(null);
  const [confirm, setConfirm] = useState(null); // { ids, clear }

  const { data, isLoading, error } = useAdminQuestions({ page, limit: LIMIT, search: search || undefined, subject: subject || undefined, difficulty: difficulty || undefined });
  const toggle = useAdminMutation(({ ids, isActive }) => adminApi.bulkToggleQuestions(ids, isActive), { onSuccess: () => toast.success('Visibility updated') });
  const del = useAdminMutation((ids) => adminApi.bulkDeleteQuestions(ids), { onSuccess: () => toast.success('Questions deleted') });
  const bulk = useAdminMutation((rows) => adminApi.bulkCreateQuestions(rows), { onSuccess: (r) => toast.success('Questions imported', r?.message) });

  const reset = (fn) => (v) => { fn(v); setPage(1); };
  const subjectOptions = [{ value: '', label: 'All subjects' }, ...(subjects ?? []).map((s) => ({ value: s.code, label: `${s.code} · ${s.title}` }))];

  const columns = [
    { key: 'stem', header: 'Question', render: (q) => <span className="line-clamp-2 max-w-[34rem] text-foreground-strong"><MathText>{q.stem}</MathText></span> },
    { key: 'subject', header: 'Subject', render: (q) => <Badge variant="lavender">{q.subject?.code ?? '-'}</Badge> },
    { key: 'difficulty', header: 'Level', render: (q) => <Badge variant={LEVEL_TONE[q.difficulty] ?? 'outline'}>{q.difficulty}</Badge> },
    { key: 'isActive', header: 'Shown', render: (q) => (q.isActive ? <Badge variant="success">Live</Badge> : <Badge variant="outline">Hidden</Badge>) },
  ];

  return (
    <Screen width="full">
      <PageHeader
        title="Questions"
        subtitle="The question bank every exam draws from."
        action={<><Button variant="outline" size="sm" onClick={() => setImporting(true)} leadingIcon={<FileUp size={15} />}>Import</Button><Link to="/admin/questions/new"><Button size="sm" leadingIcon={<Plus size={15} />}>New question</Button></Link></>}
      />

      <div className="mt-6 space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <SearchField className="max-w-sm flex-1" value={search} onChange={(e) => reset(setSearch)(e.target.value)} onClear={() => reset(setSearch)('')} placeholder="Search question text" />
          <div className="w-64"><Select aria-label="Subject" value={subject} onValueChange={reset(setSubject)} options={subjectOptions} /></div>
          <SegmentedControl label="Difficulty" size="sm" value={difficulty} onValueChange={reset(setDifficulty)} options={[{ value: '', label: 'All' }, { value: 'easy', label: 'Easy' }, { value: 'medium', label: 'Medium' }, { value: 'hard', label: 'Hard' }]} />
        </div>

        {error ? <LoadError error={error} what="questions" /> : isLoading ? <TableSkeleton /> : (
          <DataTable
            caption="Questions"
            selectable
            columns={columns}
            rows={(data?.items ?? []).map((q) => ({ ...q, id: q.id ?? q._id }))}
            emptyMessage="No questions match."
            server={{ page: data?.page ?? page, pageCount: data?.pages ?? 1, total: data?.total ?? 0, onPageChange: setPage, sort: null, onSortChange: () => {} }}
            bulkActions={({ selectedIds, clear }) => (
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => { toggle.mutate({ ids: selectedIds, isActive: true }); clear(); }}>Show</Button>
                <Button size="sm" variant="outline" onClick={() => { toggle.mutate({ ids: selectedIds, isActive: false }); clear(); }}>Hide</Button>
                <Button size="sm" variant="danger" onClick={() => setConfirm({ ids: selectedIds, clear })}>Delete</Button>
              </div>
            )}
            rowActions={(q) => (
              <DropdownMenu placement="bottom-end" trigger={(p) => <IconButton aria-label="Question actions" size="sm" variant="ghost" {...p}><MoreHorizontal size={16} /></IconButton>}
                items={[
                  { label: 'Edit', icon: Pencil, onSelect: () => navigate(`/admin/questions/${q.id}/edit`) },
                  { label: 'Responses', icon: BarChart3, onSelect: () => setStats(q) },
                  { label: q.isActive ? 'Hide from students' : 'Show to students', icon: q.isActive ? EyeOff : Eye, onSelect: () => toggle.mutate({ ids: [q.id], isActive: !q.isActive }) },
                  { separator: true },
                  { label: 'Delete', icon: Trash2, danger: true, onSelect: () => setConfirm({ ids: [q.id] }) },
                ]} />
            )}
          />
        )}
      </div>

      <Modal open={importing} onOpenChange={setImporting} size="lg" title="Import questions" description="A JSON list. Each item needs subject (the code), stem, options and correctIndex.">
        <BulkImport label="Choose the JSON file" columns={[{ key: 'subject', header: 'Subject' }, { key: 'stem', header: 'Question' }]} validateRow={validateAdminRow} onImport={async (rows) => { await bulk.mutateAsync(rows); setImporting(false); }} />
      </Modal>
      <ConfirmDialog open={Boolean(confirm)} onOpenChange={(o) => !o && setConfirm(null)} tone="danger" title={`Delete ${confirm?.ids.length} question${confirm?.ids.length === 1 ? '' : 's'}?`} description="They are removed from the bank for good." confirmLabel="Delete" onConfirm={async () => { await del.mutateAsync(confirm.ids); confirm.clear?.(); }} />
      <Responses question={stats} onClose={() => setStats(null)} />
    </Screen>
  );
}

function validateAdminRow(r) {
  const out = validateQuestionRow(r);
  if (!String(r.subject ?? '').trim()) out.push('Missing subject code');
  return out;
}

function Responses({ question, onClose }) {
  const { data, isLoading, error } = useQuery({ queryKey: ['admin', 'qstats', question?.id], queryFn: () => adminApi.getQuestionAnalytics(question.id), enabled: Boolean(question) });
  const opts = question?.options ?? [];
  const chart = opts.map((_, i) => ({ name: LETTERS[i], value: data?.options?.find((o) => o._id === i)?.count ?? 0 }));
  const right = data?.accuracy?.find((a) => a._id === true)?.count ?? 0;
  return (
    <Modal open={Boolean(question)} onOpenChange={(o) => !o && onClose()} size="lg" title="Responses" description="From the public share page for this question.">
      {isLoading ? <TableSkeleton rows={3} /> : error ? <LoadError error={error} what="the responses" /> : !data?.total ? <p className="py-8 text-center text-sm text-muted">Nobody has answered this question from a shared link yet.</p> : (
        <div className="space-y-4 py-1">
          <p className="text-sm text-muted"><span className="font-heading text-2xl font-extrabold text-foreground-strong">{data.total}</span> responses, {Math.round((right / data.total) * 100)}% correct.</p>
          <BrandBarChart label="Answers chosen" data={chart} height={220} highlightLast={false} />
          <p className="text-xs text-muted">Correct option: {LETTERS[question.correctIndex]}</p>
        </div>
      )}
    </Modal>
  );
}

export default QuestionsScreen;
