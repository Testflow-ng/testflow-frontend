import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge, Button, SearchField, SegmentedControl, useToast } from '../../../components/ui/index.js';
import DataTable from '../../../components/data/DataTable.jsx';
import AddStudentsDialog from '../../../components/everybody/AddStudentsDialog.jsx';
import GroupManager from '../../../components/everybody/GroupManager.jsx';
import Screen, { PageHeader } from '../../../components/layout/Screen.jsx';
import { UserPlus } from 'lucide-react';
import { wsApi } from '../api.js';
import { useStudents, useWsMutation } from '../useWorkspace.js';
import { fmtDate } from '../../admin/screens/format.js';

function StudentsScreen() {
  const [tab, setTab] = useState('students');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [groups, setGroups] = useState([{ id: 'g1', name: 'Everyone', memberIds: [] }]);
  const [adding, setAdding] = useState(false);
  const toast = useToast();
  const addMut = useWsMutation((id, emails) => wsApi.addStudents(id, emails), { onError: (e) => toast.error('Could not add students', e.code === 'PLAN_REQUIRED' ? e.message : e.message) });
  const statusMut = useWsMutation((id, { studentId, status }) => wsApi.setStudentStatus(id, studentId, status), {
    onSuccess: (_d, v) => toast.success(v.status === 'suspended' ? 'Student suspended' : 'Student reinstated', v.status === 'suspended' ? 'They can no longer sign in to your site.' : 'They can sign in again.'),
    onError: (e) => toast.error('Could not update the student', e.message),
  });
  const { data } = useStudents({ page, search: search || undefined, limit: 15 });

  const rows = (data?.items ?? []).map((s) => ({ ...s, id: s.id }));
  const people = rows.map((s) => ({ value: s.id, label: s.fullName }));
  const columns = [
    { key: 'fullName', header: 'Student', render: (s) => <span><span className="font-semibold text-foreground-strong">{s.fullName}</span><span className="block text-xs text-muted">{s.email}</span></span> },
    { key: 'status', header: 'Status', render: (s) => <Badge variant={s.status === 'active' ? 'success' : s.status === 'suspended' ? 'danger' : 'warning'}>{s.status === 'active' ? 'Joined' : s.status === 'suspended' ? 'Suspended' : 'Invited'}</Badge> },
    { key: 'attempts', header: 'Exams taken', align: 'right' },
    { key: 'average', header: 'Average', align: 'right', render: (s) => (s.average != null ? <Badge variant={s.average >= 70 ? 'success' : s.average >= 50 ? 'warning' : 'danger'}>{s.average}%</Badge> : <span className="text-muted">-</span>) },
    { key: 'joinedAt', header: 'Joined', render: (s) => fmtDate(s.joinedAt) },
  ];

  return (
    <Screen width="full">
      <PageHeader title="Students" subtitle="Anyone can join your site. Suspend a student to block their sign-in." action={<Button size="sm" onClick={() => setAdding(true)} leadingIcon={<UserPlus size={15} />}>Add students</Button>} />
      <div className="mt-6"><SegmentedControl label="View" size="sm" value={tab} onValueChange={setTab} options={[{ value: 'students', label: 'Students' }, { value: 'groups', label: 'Groups' }]} /></div>
      <div className="mt-6 space-y-4">
        {tab === 'students' ? (
          <>
            <SearchField className="max-w-sm" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} onClear={() => setSearch('')} placeholder="Search name or email" />
            <DataTable caption="Students" columns={columns} rows={rows} emptyMessage="No students yet. Share your site link and they can create an account." rowActions={(s) => (
              <span className="flex items-center justify-end gap-1">
                <Link to={`/workspace/students/${s.id}`}><Button size="sm" variant="ghost">See record</Button></Link>
                {s.status === 'suspended'
                  ? <Button size="sm" variant="outline" loading={statusMut.isPending && statusMut.variables?.studentId === s.id} onClick={() => statusMut.mutate({ studentId: s.id, status: 'active' })}>Reinstate</Button>
                  : <Button size="sm" variant="ghost" loading={statusMut.isPending && statusMut.variables?.studentId === s.id} onClick={() => statusMut.mutate({ studentId: s.id, status: 'suspended' })}>Suspend</Button>}
              </span>
            )} server={{ page: data?.page ?? page, pageCount: Math.max(1, Math.ceil((data?.total ?? 0) / 15)), total: data?.total ?? 0, onPageChange: setPage, sort: null, onSortChange: () => {} }} />
          </>
        ) : (
          <GroupManager groups={groups} people={people} onCreate={(n) => setGroups((g) => [...g, { id: `g${Date.now()}`, name: n, memberIds: [] }])} onRename={(id, n) => setGroups((g) => g.map((x) => (x.id === id ? { ...x, name: n } : x)))} onDelete={(id) => setGroups((g) => g.filter((x) => x.id !== id))} onMembersChange={(id, ids) => setGroups((g) => g.map((x) => (x.id === id ? { ...x, memberIds: ids } : x)))} />
        )}
      </div>
      <AddStudentsDialog open={adding} onOpenChange={setAdding} onAdd={(emails) => addMut.mutateAsync(emails)} />
    </Screen>
  );
}

export default StudentsScreen;
