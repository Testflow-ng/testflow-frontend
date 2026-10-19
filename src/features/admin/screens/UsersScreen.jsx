import { useState } from 'react';
import { Gift, KeyRound, MoreHorizontal, Plus, ShieldAlert, ShieldCheck, Trash2, UserMinus, UserPlus } from 'lucide-react';
import {
  Badge, Banner, Button, ConfirmDialog, DropdownMenu, Field, IconButton, Input, Modal, PasswordInput, SearchField, SegmentedControl, Select, StatusBadge, useToast,
} from '../../../components/ui/index.js';
import DataTable from '../../../components/data/DataTable.jsx';
import Screen, { PageHeader } from '../../../components/layout/Screen.jsx';
import { useAuth } from '../../auth/useAuth.js';
import { adminApi } from '../api.js';
import { useAdminMutation, useAdmins, useStudents } from '../useAdmin.js';
import { LoadError, TableSkeleton } from './shared.jsx';
import { fmtDate } from './format.js';

const PAGE = 15;

function UsersScreen() {
  const { user } = useAuth();
  const isSuper = user?.role === 'super_admin';
  const [tab, setTab] = useState('students');

  return (
    <Screen width="full">
      <PageHeader title="Users" subtitle="Students, and the people who run Testflow." />
      <div className="mt-6">
        <SegmentedControl label="Who" size="sm" value={tab} onValueChange={setTab} options={[{ value: 'students', label: 'Students' }, ...(isSuper ? [{ value: 'admins', label: 'Admins' }] : [])]} />
      </div>
      <div className="mt-6">{tab === 'students' ? <Students isSuper={isSuper} /> : <Admins />}</div>
    </Screen>
  );
}

function Students({ isSuper }) {
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [reveal, setReveal] = useState(false);
  const [adding, setAdding] = useState(false);
  const [reset, setReset] = useState(null);
  const [grant, setGrant] = useState(null);
  const [remove, setRemove] = useState(null);
  const { data, isLoading, error } = useStudents({ page, search, limit: PAGE });

  const toggle = useAdminMutation(adminApi.toggleStudentStatus, { onSuccess: (u) => toast.success(u.isEmailVerified ? 'Student activated' : 'Student suspended') });
  const del = useAdminMutation(adminApi.deleteUser, { onSuccess: () => toast.success('Account deleted') });

  const mask = (email) => {
    if (reveal || !email) return email;
    const [n, d] = email.split('@');
    return `${n.slice(0, 2)}***@${d}`;
  };

  const columns = [
    { key: 'fullName', header: 'Student', render: (r) => <span><span className="font-semibold text-foreground-strong">{r.fullName}</span><span className="block text-xs text-muted">{mask(r.email)}</span></span> },
    { key: 'matricNumber', header: 'Matric', render: (r) => r.matricNumber ? (reveal ? r.matricNumber : `${r.matricNumber.slice(0, 3)}***`) : <span className="text-muted">-</span> },
    { key: 'isEmailVerified', header: 'Status', render: (r) => <StatusBadge status={r.isEmailVerified ? 'active' : 'suspended'} label={r.isEmailVerified ? 'Active' : 'Suspended'} /> },
    { key: 'createdAt', header: 'Joined', render: (r) => fmtDate(r.createdAt) },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SearchField className="max-w-sm flex-1" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} onClear={() => { setSearch(''); setPage(1); }} placeholder="Search name, email or matric" />
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setReveal((v) => !v)} aria-pressed={reveal}>{reveal ? 'Hide details' : 'Reveal details'}</Button>
          <Button size="sm" onClick={() => setAdding(true)} leadingIcon={<Plus size={15} />}>Add student</Button>
        </div>
      </div>

      {error ? <LoadError error={error} what="students" /> : isLoading ? <TableSkeleton /> : (
        <DataTable
          caption="Students"
          columns={columns}
          rows={(data?.items ?? []).map((s) => ({ ...s, id: s.id ?? s._id }))}
          emptyMessage={search ? 'No students match that search.' : 'No students yet.'}
          server={{ page: data?.page ?? page, pageCount: data?.pages ?? 1, total: data?.total ?? 0, onPageChange: setPage, sort: null, onSortChange: () => {} }}
          rowActions={(r) => (
            <DropdownMenu
              placement="bottom-end"
              trigger={(p) => <IconButton aria-label={`Actions for ${r.fullName}`} size="sm" variant="ghost" {...p}><MoreHorizontal size={16} /></IconButton>}
              items={[
                { label: 'Reset password', icon: KeyRound, onSelect: () => setReset(r) },
                { label: 'Give a Student Pass', icon: Gift, onSelect: () => setGrant(r) },
                { label: r.isEmailVerified ? 'Suspend' : 'Activate', icon: r.isEmailVerified ? ShieldAlert : ShieldCheck, onSelect: () => toggle.mutate(r.id) },
                ...(isSuper ? [{ separator: true }, { label: 'Delete account', icon: Trash2, danger: true, onSelect: () => setRemove(r) }] : []),
              ]}
            />
          )}
        />
      )}

      <AddStudent open={adding} onOpenChange={setAdding} />
      <ResetPassword student={reset} onClose={() => setReset(null)} />
      <GrantPass student={grant} onClose={() => setGrant(null)} />
      <ConfirmDialog open={Boolean(remove)} onOpenChange={(o) => !o && setRemove(null)} tone="danger" title={`Delete ${remove?.fullName}?`} description="This permanently deletes the account and their exam history. It cannot be undone." confirmLabel="Delete account" onConfirm={() => del.mutateAsync(remove.id)} />
    </div>
  );
}

function AddStudent({ open, onOpenChange }) {
  const toast = useToast();
  const empty = { fullName: '', email: '', matricNumber: '', password: '' };
  const [form, setForm] = useState(empty);
  const [error, setError] = useState(null);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const create = useAdminMutation(adminApi.createStudent, {
    onSuccess: () => { toast.success('Student added'); setForm(empty); setError(null); onOpenChange(false); },
    onError: (e) => setError(e.message || 'Could not add the student.'),
  });
  const ready = form.fullName.trim() && form.email.includes('@') && form.password.length >= 8;
  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Add a student" description="They can sign in right away with this password."
      footer={<><Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button><Button type="submit" form="add-student" loading={create.isPending} disabled={!ready}>Add student</Button></>}>
      <form id="add-student" onSubmit={(e) => { e.preventDefault(); create.mutate(form); }} className="space-y-4 py-1">
        {error && <Banner variant="danger">{error}</Banner>}
        <Field label="Full name" required><Input value={form.fullName} onChange={set('fullName')} autoComplete="off" /></Field>
        <Field label="Email" required><Input type="email" value={form.email} onChange={set('email')} autoComplete="off" /></Field>
        <Field label="Matric number" hint="Optional"><Input value={form.matricNumber} onChange={set('matricNumber')} /></Field>
        <Field label="Temporary password" hint="At least 8 characters." required><PasswordInput value={form.password} onChange={set('password')} autoComplete="new-password" /></Field>
      </form>
    </Modal>
  );
}

function ResetPassword({ student, onClose }) {
  const toast = useToast();
  const [password, setPassword] = useState('');
  const mutate = useAdminMutation(({ id, password: p }) => adminApi.resetStudentPassword(id, p), {
    onSuccess: () => { toast.success('Password reset'); setPassword(''); onClose(); },
    onError: (e) => toast.error('Could not reset', e.message),
  });
  return (
    <Modal open={Boolean(student)} onOpenChange={(o) => !o && onClose()} title="Reset password" description={student ? `Set a new password for ${student.fullName}.` : ''}
      footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button type="submit" form="reset-pw" loading={mutate.isPending} disabled={password.length < 8}>Reset password</Button></>}>
      <form id="reset-pw" onSubmit={(e) => { e.preventDefault(); mutate.mutate({ id: student.id, password }); }} className="py-1">
        <Field label="New password" hint="At least 8 characters. Tell the student to change it after signing in."><PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" /></Field>
      </form>
    </Modal>
  );
}

const PASS_KEYS = [
  { value: 'ad_free', label: 'Ad-free' },
  { value: 'library', label: 'Library access' },
  { value: 'live_cbt_host', label: 'Host Live CBT' },
];

/** Support tool: hand-give or take back part of the Student Pass. */
function GrantPass({ student, onClose }) {
  const toast = useToast();
  const [key, setKey] = useState('ad_free');
  const [days, setDays] = useState('30');
  const act = useAdminMutation(({ revoke }) => (revoke ? adminApi.revokeEntitlement(student.id, { key, reason: 'support' }) : adminApi.grantEntitlement(student.id, { key, durationDays: Number(days) })), {
    onSuccess: () => { toast.success('Pass updated'); onClose(); },
    onError: (e) => toast.error('Could not update the pass', e.message),
  });
  return (
    <Modal open={Boolean(student)} onOpenChange={(o) => !o && onClose()} title="Student Pass" description={student ? `Give ${student.fullName} access, or take it back.` : ''}
      footer={<><Button variant="ghost" onClick={onClose}>Close</Button><Button variant="outline" leadingIcon={<UserMinus size={15} />} loading={act.isPending && act.variables?.revoke} onClick={() => act.mutate({ revoke: true })}>Revoke</Button><Button leadingIcon={<UserPlus size={15} />} loading={act.isPending && !act.variables?.revoke} onClick={() => act.mutate({ revoke: false })}>Grant</Button></>}>
      <div className="space-y-4 py-1">
        <Field label="Access"><Select value={key} onValueChange={setKey} options={PASS_KEYS} /></Field>
        <Field label="Days" hint="How long the access lasts when granting."><Input type="number" min="1" max="3650" value={days} onChange={(e) => setDays(e.target.value)} /></Field>
      </div>
    </Modal>
  );
}

function Admins() {
  const toast = useToast();
  const { data, isLoading, error } = useAdmins(true);
  const [email, setEmail] = useState('');
  const [demote, setDemote] = useState(null);
  const [creating, setCreating] = useState(false);
  const promote = useAdminMutation(adminApi.promoteAdmin, { onSuccess: () => { toast.success('Promoted to admin'); setEmail(''); }, onError: (e) => toast.error('Could not promote', e.message) });
  const demoteMut = useAdminMutation(adminApi.demoteAdmin, { onSuccess: () => toast.success('Admin removed') });

  const columns = [
    { key: 'fullName', header: 'Admin', render: (r) => <span><span className="font-semibold text-foreground-strong">{r.fullName}</span><span className="block text-xs text-muted">{r.email}</span></span> },
    { key: 'role', header: 'Role', render: (r) => <Badge variant={r.role === 'super_admin' ? 'lime' : 'lavender'}>{r.role.replace('_', ' ')}</Badge> },
  ];

  return (
    <div className="space-y-4">
      <form onSubmit={(e) => { e.preventDefault(); promote.mutate(email.trim()); }} className="flex max-w-xl flex-wrap items-end gap-2">
        <Field label="Promote a student to admin" className="min-w-[16rem] flex-1"><Input type="email" placeholder="student@email.com" value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
        <Button type="submit" loading={promote.isPending} disabled={!email.includes('@')}>Promote</Button>
        <Button type="button" variant="outline" onClick={() => setCreating(true)}>Create admin</Button>
      </form>
      {error ? <LoadError error={error} what="the admin list" /> : isLoading ? <TableSkeleton rows={3} /> : (
        <DataTable caption="Admins" columns={columns} rows={(data ?? []).map((a) => ({ ...a, id: a.id ?? a._id }))} emptyMessage="No admins."
          rowActions={(r) => r.role === 'super_admin' ? null : <Button size="sm" variant="ghost" className="text-danger" onClick={() => setDemote(r)}>Remove</Button>} />
      )}
      <ConfirmDialog open={Boolean(demote)} onOpenChange={(o) => !o && setDemote(null)} tone="danger" title={`Remove ${demote?.fullName} as admin?`} description="They become a normal student again." confirmLabel="Remove admin" onConfirm={() => demoteMut.mutateAsync(demote.id)} />
      <CreateAdmin open={creating} onOpenChange={setCreating} />
    </div>
  );
}

function CreateAdmin({ open, onOpenChange }) {
  const toast = useToast();
  const [form, setForm] = useState({ fullName: '', email: '', password: '' });
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const create = useAdminMutation(adminApi.createAdmin, { onSuccess: () => { toast.success('Admin created'); setForm({ fullName: '', email: '', password: '' }); onOpenChange(false); }, onError: (e) => toast.error('Could not create', e.message) });
  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Create an admin" description="A new account with admin access."
      footer={<><Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button><Button type="submit" form="create-admin" loading={create.isPending} disabled={!form.fullName || !form.email.includes('@') || form.password.length < 8}>Create admin</Button></>}>
      <form id="create-admin" onSubmit={(e) => { e.preventDefault(); create.mutate(form); }} className="space-y-4 py-1">
        <Field label="Full name"><Input value={form.fullName} onChange={set('fullName')} /></Field>
        <Field label="Email"><Input type="email" value={form.email} onChange={set('email')} /></Field>
        <Field label="Password" hint="At least 8 characters."><PasswordInput value={form.password} onChange={set('password')} autoComplete="new-password" /></Field>
      </form>
    </Modal>
  );
}

export default UsersScreen;
