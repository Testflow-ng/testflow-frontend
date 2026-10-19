import { useState } from 'react';
import { Link } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import { Badge, Button, SearchField, SegmentedControl, useToast } from '../../../components/ui/index.js';
import DataTable from '../../../components/data/DataTable.jsx';
import GroupManager from '../../../components/everybody/GroupManager.jsx';
import InviteDialog from '../../../components/everybody/InviteDialog.jsx';
import Screen, { PageHeader } from '../../../components/layout/Screen.jsx';
import { wsApi } from '../api.js';
import { useStudents, useWsMutation } from '../useWorkspace.js';
import { fmtDate } from '../../admin/screens/format.js';

function StudentsScreen() {
  const toast = useToast();
  const [tab, setTab] = useState('students');
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [invite, setInvite] = useState(false);
  const [groups, setGroups] = useState([{ id: 'g1', name: 'Everyone', memberIds: [] }]);
  const { data } = useStudents({ page, search: search || undefined, limit: 15 });
  const inviteMut = useWsMutation((id, body) => wsApi.invite(id, body), { onSuccess: () => toast.success('Invitations sent'), onError: (e) => toast.error('Could not invite', e.message) });

  const rows = (data?.items ?? []).map((s) => ({ ...s, id: s.id }));
  const people = rows.map((s) => ({ value: s.id, label: s.fullName }));
  const columns = [
    { key: 'fullName', header: 'Student', render: (s) => <span><span className="font-semibold text-foreground-strong">{s.fullName}</span><span className="block text-xs text-muted">{s.email}</span></span> },
    { key: 'status', header: 'Status', render: (s) => <Badge variant={s.status === 'active' ? 'success' : 'warning'}>{s.status === 'active' ? 'Joined' : 'Invited'}</Badge> },
    { key: 'attempts', header: 'Exams taken', align: 'right' },
    { key: 'average', header: 'Average', align: 'right', render: (s) => (s.average != null ? <Badge variant={s.average >= 70 ? 'success' : s.average >= 50 ? 'warning' : 'danger'}>{s.average}%</Badge> : <span className="text-muted">-</span>) },
    { key: 'joinedAt', header: 'Joined', render: (s) => fmtDate(s.joinedAt) },
  ];

  return (
    <Screen width="full">
      <PageHeader title="Students" subtitle="Invite people and sort them into groups." action={<Button size="sm" onClick={() => setInvite(true)} leadingIcon={<UserPlus size={15} />}>Invite students</Button>} />
      <div className="mt-6"><SegmentedControl label="View" size="sm" value={tab} onValueChange={setTab} options={[{ value: 'students', label: 'Students' }, { value: 'groups', label: 'Groups' }]} /></div>
      <div className="mt-6 space-y-4">
        {tab === 'students' ? (
          <>
            <SearchField className="max-w-sm" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} onClear={() => setSearch('')} placeholder="Search name or email" />
            <DataTable caption="Students" columns={columns} rows={rows} emptyMessage="No students yet. Invite your first ones, or share your exam link." rowActions={(s) => <Link to={`/workspace/students/${s.id}`}><Button size="sm" variant="ghost">See record</Button></Link>} server={{ page: data?.page ?? page, pageCount: Math.max(1, Math.ceil((data?.total ?? 0) / 15)), total: data?.total ?? 0, onPageChange: setPage, sort: null, onSortChange: () => {} }} />
          </>
        ) : (
          <GroupManager groups={groups} people={people} onCreate={(n) => setGroups((g) => [...g, { id: `g${Date.now()}`, name: n, memberIds: [] }])} onRename={(id, n) => setGroups((g) => g.map((x) => (x.id === id ? { ...x, name: n } : x)))} onDelete={(id) => setGroups((g) => g.filter((x) => x.id !== id))} onMembersChange={(id, ids) => setGroups((g) => g.map((x) => (x.id === id ? { ...x, memberIds: ids } : x)))} />
        )}
      </div>
      <InviteDialog open={invite} onOpenChange={setInvite} onInvite={(p) => inviteMut.mutateAsync(p)} />
    </Screen>
  );
}

export default StudentsScreen;
