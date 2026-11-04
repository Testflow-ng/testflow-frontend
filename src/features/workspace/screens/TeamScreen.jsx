import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { Badge, Button, Skeleton, useToast } from '../../../components/ui/index.js';
import DataTable from '../../../components/data/DataTable.jsx';
import InviteDialog from '../../../components/everybody/InviteDialog.jsx';
import Screen, { PageHeader } from '../../../components/layout/Screen.jsx';
import { wsApi } from '../api.js';
import { useMembers, useWsMutation } from '../useWorkspace.js';
import { fmtDate } from '../../admin/screens/format.js';

const ROLE_LABEL = { owner: 'Owner', admin: 'Admin', examiner: 'Examiner', student: 'Student' };

/** The people who help run the organisation. Students are not listed here: they sign in on the site. */
function TeamScreen() {
  const toast = useToast();
  const [invite, setInvite] = useState(false);
  const { data, isLoading, isError } = useMembers();
  const inviteMut = useWsMutation((id, body) => wsApi.invite(id, body), { onError: (e) => toast.error('Could not invite', e.message) });

  const rows = (data ?? []).filter((m) => m.role !== 'student').map((m) => ({ ...m, name: m.user?.fullName ?? 'Unknown', email: m.user?.email ?? '' }));
  const columns = [
    { key: 'name', header: 'Person', render: (m) => <span><span className="font-semibold text-foreground-strong">{m.name}</span><span className="block text-xs text-muted">{m.email}</span></span> },
    { key: 'role', header: 'Role', render: (m) => <Badge variant={m.role === 'owner' ? 'primary' : 'neutral'}>{ROLE_LABEL[m.role] ?? m.role}</Badge> },
    { key: 'status', header: 'Status', render: (m) => <Badge variant={m.status === 'active' ? 'success' : 'warning'}>{m.status === 'active' ? 'Active' : m.status}</Badge> },
    { key: 'joinedAt', header: 'Joined', render: (m) => fmtDate(m.joinedAt) },
  ];

  return (
    <Screen width="full">
      <PageHeader title="Team" subtitle="Admins and examiners who help you run the platform." action={<Button size="sm" onClick={() => setInvite(true)} leadingIcon={<UserPlus size={15} />}>Invite a teammate</Button>} />
      <div className="mt-6">
        {isLoading ? (
          <Skeleton className="h-40 w-full" />
        ) : isError ? (
          <p className="py-10 text-center text-muted">Could not load your team. Only owners and admins can see it.</p>
        ) : (
          <DataTable caption="Team" columns={columns} rows={rows} emptyMessage="Just you for now. Invite an admin to help run the platform." />
        )}
      </div>
      <InviteDialog open={invite} onOpenChange={setInvite} onInvite={(p) => inviteMut.mutateAsync(p)} />
    </Screen>
  );
}

export default TeamScreen;
