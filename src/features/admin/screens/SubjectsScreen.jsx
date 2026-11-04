import { useState } from 'react';
import { MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-react';
import { Badge, Banner, Button, ConfirmDialog, DropdownMenu, Field, IconButton, Input, Modal, SearchField, Select, Switch, Textarea, useToast } from '../../../components/ui/index.js';
import DataTable from '../../../components/data/DataTable.jsx';
import Screen, { PageHeader } from '../../../components/layout/Screen.jsx';
import { useSubjects } from '../../subjects/useSubjects.js';
import { subjectSchema } from '../schemas.js';
import { adminApi } from '../api.js';
import { useAdminMutation } from '../useAdmin.js';
import { LoadError, TableSkeleton } from './shared.jsx';

const LEVELS = ['post-utme', '100', '200', '300', '400', '500'].map((v) => ({ value: v, label: v === 'post-utme' ? 'Post-UTME' : `${v} level` }));
const BLANK = { code: '', title: '', description: '', level: '100', department: '', isActive: true };

function SubjectsScreen() {
  const { data: subjects, isLoading, error } = useSubjects();
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(null); // subject, or {} for new
  const [remove, setRemove] = useState(null);
  const toast = useToast();
  const del = useAdminMutation(adminApi.deleteSubject, { onSuccess: () => toast.success('Subject deleted') });

  const needle = search.trim().toLowerCase();
  const rows = (subjects ?? []).filter((s) => !needle || s.code.toLowerCase().includes(needle) || s.title.toLowerCase().includes(needle)).map((s) => ({ ...s, id: s.id ?? s._id }));

  const columns = [
    { key: 'code', header: 'Code', sortable: true, render: (s) => <span className="font-mono font-bold text-foreground-strong">{s.code}</span> },
    { key: 'title', header: 'Title', sortable: true },
    { key: 'level', header: 'Level', sortable: true, render: (s) => <Badge variant="lavender">{s.level === 'post-utme' ? 'Post-UTME' : `${s.level}L`}</Badge> },
    { key: 'department', header: 'Department', render: (s) => s.department || <span className="text-muted">-</span> },
    { key: 'questionCount', header: 'Questions', sortable: true, align: 'right' },
    { key: 'isActive', header: 'Shown', render: (s) => (s.isActive === false ? <Badge variant="outline">Hidden</Badge> : <Badge variant="success">Live</Badge>) },
  ];

  return (
    <Screen width="full">
      <PageHeader title="Subjects" subtitle="The courses students practise." action={<Button size="sm" onClick={() => setEditing({})} leadingIcon={<Plus size={15} />}>New subject</Button>} />
      <div className="mt-6 space-y-4">
        <SearchField className="max-w-sm" value={search} onChange={(e) => setSearch(e.target.value)} onClear={() => setSearch('')} placeholder="Search code or title" />
        {error ? <LoadError error={error} what="subjects" /> : isLoading ? <TableSkeleton /> : (
          <DataTable caption="Subjects" columns={columns} rows={rows} pageSize={12} initialSort={{ key: 'code', dir: 'asc' }} emptyMessage="No subjects."
            rowActions={(s) => (
              <DropdownMenu placement="bottom-end" trigger={(p) => <IconButton aria-label={`Actions for ${s.code}`} size="sm" variant="ghost" {...p}><MoreHorizontal size={16} /></IconButton>}
                items={[{ label: 'Edit', icon: Pencil, onSelect: () => setEditing(s) }, { separator: true }, { label: 'Delete', icon: Trash2, danger: true, onSelect: () => setRemove(s) }]} />
            )} />
        )}
      </div>
      {editing && <SubjectForm key={editing.id ?? 'new'} subject={editing} onClose={() => setEditing(null)} />}
      <ConfirmDialog open={Boolean(remove)} onOpenChange={(o) => !o && setRemove(null)} tone="danger" title={`Delete ${remove?.code}?`} description="Its questions are removed with it. This cannot be undone." confirmLabel="Delete subject" onConfirm={() => del.mutateAsync(remove.id)} />
    </Screen>
  );
}

function SubjectForm({ subject, onClose }) {
  const toast = useToast();
  const isEdit = Boolean(subject.id);
  const [f, setF] = useState({ ...BLANK, ...subject, description: subject.description ?? '', department: subject.department ?? '' });
  const [problem, setProblem] = useState(null);
  const set = (k) => (v) => setF((x) => ({ ...x, [k]: v }));
  const save = useAdminMutation((body) => (isEdit ? adminApi.updateSubject(subject.id, body) : adminApi.createSubject(body)), {
    onSuccess: () => { toast.success(isEdit ? 'Subject saved' : 'Subject created'); onClose(); },
    onError: (e) => setProblem(e.message || 'Could not save.'),
  });

  const submit = (e) => {
    e.preventDefault();
    const parsed = subjectSchema.safeParse({ code: f.code, title: f.title, description: f.description, level: f.level, department: f.department, isActive: f.isActive });
    if (!parsed.success) return setProblem(parsed.error.issues[0].message);
    setProblem(null);
    save.mutate(parsed.data);
  };

  return (
    <Modal open onOpenChange={(o) => !o && onClose()} title={isEdit ? `Edit ${subject.code}` : 'New subject'} description="Code and level decide where it shows up."
      footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button type="submit" form="subject-form" loading={save.isPending}>{isEdit ? 'Save' : 'Create'}</Button></>}>
      <form id="subject-form" onSubmit={submit} className="space-y-4 py-1">
        {problem && <Banner variant="danger">{problem}</Banner>}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Code" hint={f.level === 'post-utme' ? 'Optional for Post-UTME' : 'e.g. MTH101'}><Input value={f.code} onChange={(e) => set('code')(e.target.value.toUpperCase())} maxLength={10} disabled={isEdit} /></Field>
          <Field label="Level"><Select value={f.level} onValueChange={set('level')} options={LEVELS} /></Field>
        </div>
        <Field label="Title" required><Input value={f.title} onChange={(e) => set('title')(e.target.value)} maxLength={160} /></Field>
        <Field label="Department" hint="Optional"><Input value={f.department} onChange={(e) => set('department')(e.target.value)} /></Field>
        <Field label="Description" hint="Optional"><Textarea rows={3} value={f.description} onChange={(e) => set('description')(e.target.value)} maxLength={500} /></Field>
        <div className="flex items-center justify-between gap-4 rounded-xl border border-border p-4"><div><p className="text-sm font-semibold text-foreground-strong">Show to students</p><p className="text-xs text-muted">Hidden subjects keep their questions.</p></div><Switch checked={f.isActive} onCheckedChange={set('isActive')} aria-label="Show to students" /></div>
      </form>
    </Modal>
  );
}

export default SubjectsScreen;
