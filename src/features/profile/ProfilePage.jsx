import { useCallback, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BookOpen, ChevronRight, History, KeyRound, LogOut, Pencil, Plus, Save, TrendingUp, X } from 'lucide-react';
import {
  Alert,
  Avatar,
  Badge,
  Button,
  Card,
  Checkbox,
  ConfirmDialog,
  EmptyState,
  Field,
  IconButton,
  Input,
  KeyValueList,
  Modal,
  PasswordInput,
  Switch,
  useToast,
} from '../../components/ui/index.js';
import Screen, { PageHeader } from '../../components/layout/Screen.jsx';
import { authApi } from '../auth/api.js';
import { useAuth } from '../auth/useAuth.js';
import { useSubjects, useTogglePin } from '../subjects/useSubjects.js';

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) : null;

const EMPTY_PASSWORD_FORM = { currentPassword: '', newPassword: '', confirmPassword: '' };

function ProfilePage() {
  const { user, logout, refreshUser } = useAuth();
  const { data: subjects } = useSubjects();
  const togglePin = useTogglePin();
  const toast = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(user.fullName);
  const [username, setUsernameValue] = useState(user.username ?? '');
  const [showOnLeaderboard, setShowOnLeaderboard] = useState(user.showOnLeaderboard !== false);
  const [isSaving, setIsSaving] = useState(false);
  const [editError, setEditError] = useState(null);
  const [showSubjectPicker, setShowSubjectPicker] = useState(false);
  const [confirmOut, setConfirmOut] = useState(false);

  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState(EMPTY_PASSWORD_FORM);
  const [passwordError, setPasswordError] = useState(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Reseed the draft every time the editor opens so Cancel really cancels.
  const openEditor = useCallback(() => {
    setFullName(user.fullName);
    setUsernameValue(user.username ?? '');
    setShowOnLeaderboard(user.showOnLeaderboard !== false);
    setEditError(null);
    setIsEditing(true);
  }, [user.fullName, user.username, user.showOnLeaderboard]);

  // Settings links here with `#security`; derive the open state from the hash (no effect, no reopen loop).
  const isPasswordModalOpen = passwordModalOpen || location.hash === '#security';

  const closePasswordModal = useCallback(() => {
    setPasswordModalOpen(false);
    setPasswordForm(EMPTY_PASSWORD_FORM);
    setPasswordError(null);
    if (location.hash === '#security') navigate(location.pathname, { replace: true });
  }, [location.hash, location.pathname, navigate]);

  const pinnedIds = new Set(user.pinnedSubjects ?? []);
  const pinnedSubjects = subjects?.filter((s) => pinnedIds.has(s.id)) ?? [];

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setEditError(null);
    try {
      const handle = username.trim().toLowerCase();
      if (handle && handle !== user.username) {
        if (!/^[a-z0-9_]{3,20}$/.test(handle)) throw new Error('Username: 3 to 20 letters, numbers or underscores.');
        await authApi.setUsername(handle);
      }
      await authApi.updateProfile({ fullName, showOnLeaderboard });
      await refreshUser();
      setIsEditing(false);
      toast.success('Profile updated');
    } catch (err) {
      setEditError(err.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return setPasswordError('New passwords do not match');
    }
    setIsChangingPassword(true);
    setPasswordError(null);
    try {
      await authApi.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      closePasswordModal();
      toast.success('Password changed. Sign in again.');
      logout();
    } catch (err) {
      setPasswordError(err.message || 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const setPw = (key) => (e) => setPasswordForm((prev) => ({ ...prev, [key]: e.target.value }));

  const accountItems = [
    { label: 'Full name', value: user.fullName },
    { label: 'Email', value: user.email },
    ...(user.matricNumber ? [{ label: 'Matric number', value: user.matricNumber }] : []),
    {
      label: 'Leaderboard',
      value: <Badge variant={user.showOnLeaderboard !== false ? 'sage' : 'outline'}>{user.showOnLeaderboard !== false ? 'Visible' : 'Hidden'}</Badge>,
    },
  ];

  return (
    <Screen width="xl">
      <PageHeader title="Profile" subtitle="Your details, subjects and security." />

      <div className="mt-6 grid gap-6 lg:grid-cols-[19rem_minmax(0,1fr)] lg:items-start">
        <Card padding="lg" className="flex flex-col items-center text-center lg:sticky lg:top-6">
          <Avatar name={user.fullName} className="size-24 text-3xl" />
          <h2 className="mt-4 min-w-0 break-words font-heading text-xl font-extrabold leading-tight tracking-tight text-foreground-strong">
            {user.fullName}
          </h2>
          {user.username && <p className="mt-0.5 text-sm font-medium text-muted">@{user.username}</p>}
          <p className="mt-1 max-w-full truncate text-sm text-muted">{user.email}</p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <Badge variant="lavender" className="uppercase tracking-wider">{user.role.replace('_', ' ')}</Badge>
            {user.createdAt && <Badge variant="outline">Since {formatDate(user.createdAt)}</Badge>}
          </div>
          <Button variant="outline" className="mt-6 w-full" onClick={openEditor} leadingIcon={<Pencil size={15} />}>
            Edit profile
          </Button>
        </Card>

        <div className="space-y-6">
          <section aria-labelledby="my-subjects">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 id="my-subjects" className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted">My subjects</h2>
              <Button size="sm" variant="ghost" onClick={() => setShowSubjectPicker(true)} leadingIcon={<Plus size={14} />}>
                Add
              </Button>
            </div>
            {pinnedSubjects.length === 0 ? (
              <EmptyState
                icon={BookOpen}
                title="No subjects yet"
                description="Choose the courses you are taking and they show up in your sidebar."
                action={<Button onClick={() => setShowSubjectPicker(true)}>Choose subjects</Button>}
              />
            ) : (
              <Card padding="md" className="flex flex-wrap gap-2">
                {pinnedSubjects.map((s) => (
                  <span key={s.id} className="inline-flex min-h-9 items-center gap-2 rounded-full border border-border bg-background py-1 pl-3 pr-1 text-sm font-semibold text-foreground-strong">
                    <span className="text-[11px] font-bold text-primary">{s.code}</span>
                    {s.title}
                    <IconButton size="sm" variant="ghost" aria-label={`Remove ${s.title}`} onClick={() => togglePin.mutate(s.id)}>
                      <X size={14} aria-hidden="true" />
                    </IconButton>
                  </span>
                ))}
              </Card>
            )}
          </section>

          <div className="grid gap-3 sm:grid-cols-2">
            <QuickLink to="/history" icon={History} title="Exam history" hint="Review past attempts" />
            <QuickLink to="/progress" icon={TrendingUp} title="My progress" hint="Track performance" />
          </div>

          <section aria-labelledby="account">
            <h2 id="account" className="mb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-muted">Account</h2>
            <KeyValueList items={accountItems} />
          </section>

          <section aria-labelledby="security">
            <h2 id="security" className="mb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-muted">Security</h2>
            <Card className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-lavender)] text-primary">
                  <KeyRound size={18} aria-hidden="true" />
                </span>
                <div>
                  <p className="font-semibold text-foreground-strong">Password</p>
                  <p className="text-sm text-muted">You will be signed out after changing it.</p>
                </div>
              </div>
              <Button variant="outline" onClick={() => setPasswordModalOpen(true)}>Change password</Button>
            </Card>
          </section>

          <Button variant="outline" className="w-full border-danger/30 text-danger hover:bg-danger/5 lg:w-auto" onClick={() => setConfirmOut(true)} leadingIcon={<LogOut size={16} />}>
            Sign out
          </Button>
        </div>
      </div>

      <Modal open={showSubjectPicker} onOpenChange={setShowSubjectPicker} title="Choose subjects" description="Pick the courses you are taking this semester">
        <div className="flex flex-col gap-2 py-1">
          {(subjects ?? []).length === 0 && <p className="py-6 text-center text-sm text-muted">No subjects available yet.</p>}
          {(subjects ?? []).map((s) => (
            <div key={s.id} className="rounded-xl border border-border bg-surface p-3">
              <Checkbox label={s.title} hint={s.code} checked={pinnedIds.has(s.id)} onChange={() => togglePin.mutate(s.id)} />
            </div>
          ))}
        </div>
      </Modal>

      <Modal
        open={isEditing}
        onOpenChange={setIsEditing}
        title="Edit profile"
        description="Update your personal information"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
            <Button loading={isSaving} onClick={handleSaveProfile} leadingIcon={<Save size={16} />}>Save changes</Button>
          </>
        }
      >
        <div className="space-y-4 py-1">
          {editError && <Alert variant="danger">{editError}</Alert>}
          <Field label="Full name">
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Enter your full name" autoComplete="name" />
          </Field>
          <Field label="Username" hint="Shown in the Hall of Fame. 3 to 20 letters, numbers or underscores.">
            <Input value={username} onChange={(e) => setUsernameValue(e.target.value.replace(/\s/g, '_'))} placeholder="scholar_king" autoCapitalize="none" autoCorrect="off" spellCheck={false} maxLength={20} />
          </Field>
          <Field label="Email address" hint="Email address cannot be changed for security reasons.">
            <Input value={user.email} disabled />
          </Field>
          <div className="flex items-center justify-between gap-4 rounded-xl border border-border p-4">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground-strong">Show on leaderboards</p>
              <p className="mt-0.5 text-xs text-muted">Whether other students can see your scores.</p>
            </div>
            <Switch checked={showOnLeaderboard} onCheckedChange={setShowOnLeaderboard} aria-label="Show on leaderboards" />
          </div>
        </div>
      </Modal>

      <Modal open={isPasswordModalOpen} onOpenChange={(next) => (next ? setPasswordModalOpen(true) : closePasswordModal())} title="Change password" description="Strengthen your account security">
        <form onSubmit={handleChangePassword} className="space-y-4 py-1">
          {passwordError && <Alert variant="danger">{passwordError}</Alert>}
          <Field label="Current password">
            <PasswordInput required autoComplete="current-password" value={passwordForm.currentPassword} onChange={setPw('currentPassword')} />
          </Field>
          <Field label="New password">
            <PasswordInput required autoComplete="new-password" value={passwordForm.newPassword} onChange={setPw('newPassword')} />
          </Field>
          <Field label="Confirm new password">
            <PasswordInput required autoComplete="new-password" value={passwordForm.confirmPassword} onChange={setPw('confirmPassword')} />
          </Field>
          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="ghost" onClick={closePasswordModal}>Cancel</Button>
            <Button type="submit" loading={isChangingPassword}>Update password</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={confirmOut} onOpenChange={setConfirmOut} title="Sign out?" description="You will need to sign in again to take exams." confirmLabel="Sign out" tone="danger" onConfirm={logout} />
    </Screen>
  );
}

function QuickLink({ to, icon: Icon, title, hint }) {
  return (
    <Link to={to} className="tf-pressable flex items-center gap-3 rounded-[20px] border border-border bg-surface p-4 hover:border-border-strong hover:bg-surface-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
      <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-lavender)] text-primary">
        <Icon size={18} aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-semibold text-foreground-strong">{title}</span>
        <span className="block text-xs text-muted">{hint}</span>
      </span>
      <ChevronRight size={16} className="shrink-0 text-muted" aria-hidden="true" />
    </Link>
  );
}

export default ProfilePage;
