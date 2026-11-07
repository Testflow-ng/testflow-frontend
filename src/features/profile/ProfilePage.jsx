import { useCallback, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Award,
  Bookmark,
  BookOpen,
  Building2,
  Camera,
  ChevronRight,
  History,
  KeyRound,
  Loader2,
  LogOut,
  MessageSquare,
  Pencil,
  Plus,
  Receipt,
  Save,
  ShieldAlert,
  Sparkles,
  Target,
  Trash2,
  TrendingUp,
  Trophy,
  Upload,
  X,
} from 'lucide-react';
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
import { groupListClasses, groupRowClasses } from '../../components/ui/surfaces.js';
import Screen, { PageHeader } from '../../components/layout/Screen.jsx';
import { cn } from '../../utils/cn.js';
import { authApi } from '../auth/api.js';
import { useAuth } from '../auth/useAuth.js';
import { useSubjects, useTogglePin } from '../subjects/useSubjects.js';
import { useOrganizations } from '../workspace/useWorkspace.js';

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) : null;

const EMPTY_PASSWORD_FORM = { currentPassword: '', newPassword: '', confirmPassword: '' };

function ProfilePage() {
  const { user, logout, refreshUser } = useAuth();
  const { data: subjects } = useSubjects();
  const { data: orgs } = useOrganizations();
  const org = Array.isArray(orgs) && orgs.length > 0 ? orgs[0] : null;
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

  const fileInputRef = useRef(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const handleAvatarFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Only JPG, PNG or WebP images are supported');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5 MB');
      return;
    }
    setIsUploadingAvatar(true);
    try {
      await authApi.uploadAvatar(file);
      await refreshUser();
      toast.success('Profile picture updated!');
    } catch (err) {
      toast.error('Failed to update picture', err.message);
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveAvatar = async () => {
    setIsUploadingAvatar(true);
    try {
      await authApi.deleteAvatar();
      await refreshUser();
      toast.success('Profile picture removed');
    } catch (err) {
      toast.error('Failed to remove picture', err.message);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

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
      <PageHeader title="Profile" subtitle="Your details, subjects and learning preferences." />

      <div className="mt-6 grid grid-cols-1 gap-6 w-full min-w-0 lg:grid-cols-[19rem_minmax(0,1fr)] lg:items-start">
        {/* Profile Card */}
        <Card padding="lg" className="flex w-full min-w-0 flex-col items-center text-center lg:sticky lg:top-6">
          <div className="relative group">
            <Avatar name={user.fullName} src={user.avatarUrl} className="size-24 text-3xl shadow-sm ring-4 ring-background" />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={handleAvatarFile}
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingAvatar}
              aria-label="Change profile photo"
              title="Change profile photo"
              className="absolute bottom-0 right-0 flex size-8 items-center justify-center rounded-full bg-primary text-white shadow-md ring-2 ring-background transition-transform hover:scale-110 active:scale-95 disabled:opacity-50"
            >
              {isUploadingAvatar ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Camera size={14} />
              )}
            </button>
          </div>
          <h2 className="mt-3.5 w-full min-w-0 break-words font-heading text-xl font-extrabold leading-tight tracking-tight text-foreground-strong">
            {user.fullName}
          </h2>
          {user.username && <p className="mt-0.5 w-full min-w-0 truncate text-sm font-medium text-muted">@{user.username}</p>}
          <p className="mt-1 w-full min-w-0 truncate text-xs text-muted">{user.email}</p>
          <div className="mt-3.5 flex flex-wrap justify-center gap-1.5">
            <Badge variant="lavender" className="uppercase tracking-wider text-[11px]">{user.role?.replace('_', ' ') || 'Student'}</Badge>
            {user.createdAt && <Badge variant="outline" className="text-[11px]">Since {formatDate(user.createdAt)}</Badge>}
          </div>
          <Button variant="outline" size="sm" className="mt-5 w-full font-semibold" onClick={openEditor} leadingIcon={<Pencil size={14} />}>
            Edit profile
          </Button>
        </Card>

        {/* Content Area */}
        <div className="w-full min-w-0 space-y-6">
          {/* My Subjects */}
          <section aria-labelledby="my-subjects" className="w-full min-w-0">
            <div className="mb-2.5 flex items-center justify-between gap-3">
              <h2 id="my-subjects" className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted">My subjects</h2>
              <Button size="sm" variant="ghost" onClick={() => setShowSubjectPicker(true)} leadingIcon={<Plus size={14} />}>
                Add
              </Button>
            </div>
            {pinnedSubjects.length === 0 ? (
              <EmptyState
                icon={BookOpen}
                title="No subjects yet"
                description="Choose the courses you are taking and they show up in your shortcuts."
                action={<Button size="sm" onClick={() => setShowSubjectPicker(true)}>Choose subjects</Button>}
              />
            ) : (
              <Card padding="sm" className="flex w-full min-w-0 flex-wrap gap-2">
                {pinnedSubjects.map((s) => (
                  <span key={s.id} className="inline-flex min-h-8 max-w-full items-center gap-1.5 rounded-full border border-border bg-background py-1 pl-3 pr-1 text-xs font-semibold text-foreground-strong shadow-xs">
                    <span className="shrink-0 font-bold text-primary">{s.code}</span>
                    <span className="truncate max-w-[140px] sm:max-w-[180px]">{s.title}</span>
                    <IconButton size="sm" variant="ghost" className="size-6 shrink-0 text-muted hover:text-foreground" aria-label={`Remove ${s.title}`} onClick={() => togglePin.mutate(s.id)}>
                      <X size={12} aria-hidden="true" />
                    </IconButton>
                  </span>
                ))}
              </Card>
            )}
          </section>

          {/* Study & Practice (2-column mobile grid, Live CBT removed per user request) */}
          <section aria-labelledby="study-practice" className="w-full min-w-0">
            <h2 id="study-practice" className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.16em] text-muted">
              Study &amp; Practice
            </h2>
            <div className="grid w-full min-w-0 grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-3">
              <StudyTile
                to="/progress"
                icon={TrendingUp}
                title="My progress"
                hint="Track performance"
              />
              <StudyTile
                to="/history"
                icon={History}
                title="Exam history"
                hint="Past CBT attempts"
              />
              <StudyTile
                to="/profile/bookmarks"
                icon={Bookmark}
                title="Saved questions"
                hint="Your question bank"
              />
              <StudyTile
                to="/hall-of-fame"
                icon={Trophy}
                title="Hall of Fame"
                hint="Top scores & rank"
              />
              <StudyTile
                to="/achievements"
                icon={Award}
                title="Achievements"
                hint="Badges you earned"
              />
              <StudyTile
                to="/ai-study"
                icon={Sparkles}
                title="AI Study"
                hint="AI explanations"
                tag="Soon"
              />
              <StudyTile
                to="/post-utme"
                icon={Target}
                title="Post-UTME"
                hint="Screening prep"
                tag="Soon"
                className="col-span-2 sm:col-span-1"
              />
            </div>
          </section>

          {/* Testflow for Everyone / Workspace */}
          <section aria-labelledby="everybody-workspace" className="w-full min-w-0">
            <div className="mb-2.5 flex items-center justify-between">
              <h2 id="everybody-workspace" className="text-[11px] font-bold uppercase tracking-[0.16em] text-muted">
                {org ? 'Workspace' : 'Testflow for Everyone'}
              </h2>
              <Link to={org ? '/workspace' : '/everybody'} className="text-xs font-semibold text-primary hover:underline">
                {org ? 'Open workspace' : 'Learn more'}
              </Link>
            </div>
            <Card className="flex w-full min-w-0 items-center justify-between gap-3 p-3.5 border-primary/20 bg-primary/[0.02]">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Building2 size={17} aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground-strong">
                    {org ? org.name : 'Run your own CBT Platform'}
                  </p>
                  <p className="truncate text-xs text-muted">
                    {org ? 'Manage exams, questions and students' : 'Create branded CBT exams for schools'}
                  </p>
                </div>
              </div>
              <Link to={org ? '/workspace' : '/everybody/start'} className="shrink-0">
                <Button variant="primary" size="sm">
                  {org ? 'Switch' : 'Launch'}
                </Button>
              </Link>
            </Card>
          </section>

          {/* Account Details */}
          <section aria-labelledby="account-details" className="w-full min-w-0">
            <h2 id="account-details" className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.16em] text-muted">
              Account Details
            </h2>
            <KeyValueList items={accountItems} />
          </section>

          {/* Security & Preferences (Settings removed per user request since it is in bottom nav) */}
          <section aria-labelledby="account-security" className="w-full min-w-0">
            <h2 id="account-security" className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.16em] text-muted">
              Account &amp; Security
            </h2>
            <div className={groupListClasses()}>
              <Link to="/billing/invoices" className={groupRowClasses()}>
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <Receipt size={17} className="text-muted shrink-0" aria-hidden="true" />
                  <span className="truncate text-sm font-medium text-foreground-strong">Invoices &amp; receipts</span>
                </div>
                <ChevronRight size={16} className="text-muted shrink-0" aria-hidden="true" />
              </Link>
              <button type="button" onClick={() => setPasswordModalOpen(true)} className={groupRowClasses()}>
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <KeyRound size={17} className="text-muted shrink-0" aria-hidden="true" />
                  <span className="truncate text-sm font-medium text-foreground-strong">Change password</span>
                </div>
                <ChevronRight size={16} className="text-muted shrink-0" aria-hidden="true" />
              </button>
              <Link to="/settings/feedback" className={groupRowClasses()}>
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <MessageSquare size={17} className="text-muted shrink-0" aria-hidden="true" />
                  <span className="truncate text-sm font-medium text-foreground-strong">Send feedback</span>
                </div>
                <ChevronRight size={16} className="text-muted shrink-0" aria-hidden="true" />
              </Link>
              {['admin', 'super_admin'].includes(user?.role) && (
                <Link to="/admin" className={groupRowClasses()}>
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <ShieldAlert size={17} className="text-muted shrink-0" aria-hidden="true" />
                    <span className="truncate text-sm font-medium text-foreground-strong">Admin portal</span>
                  </div>
                  <ChevronRight size={16} className="text-muted shrink-0" aria-hidden="true" />
                </Link>
              )}
            </div>
          </section>

          {/* Sign Out */}
          <Button
            variant="outline"
            className="w-full border-danger/30 text-danger hover:bg-danger/5 lg:w-auto"
            onClick={() => setConfirmOut(true)}
            leadingIcon={<LogOut size={16} />}
          >
            Sign out
          </Button>
        </div>
      </div>

      {/* Choose Subjects Modal */}
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

      {/* Edit Profile Modal */}
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

          {/* Avatar Manager */}
          <div className="flex items-center gap-4 rounded-2xl border border-border bg-surface-subtle/50 p-4">
            <Avatar name={user.fullName} src={user.avatarUrl} className="size-16 text-xl shadow-xs shrink-0" />
            <div className="min-w-0 flex-1 space-y-1">
              <p className="text-sm font-semibold text-foreground-strong">Profile Picture</p>
              <p className="text-xs text-muted">JPEG, PNG or WebP under 5 MB</p>
              <div className="flex flex-wrap gap-2 pt-1">
                <Button
                  size="sm"
                  variant="outline"
                  loading={isUploadingAvatar}
                  onClick={() => fileInputRef.current?.click()}
                  leadingIcon={<Upload size={14} />}
                >
                  {user.avatarUrl ? 'Change picture' : 'Upload picture'}
                </Button>
                {user.avatarUrl && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-danger hover:bg-danger/10"
                    loading={isUploadingAvatar}
                    onClick={handleRemoveAvatar}
                    leadingIcon={<Trash2 size={14} />}
                  >
                    Remove
                  </Button>
                )}
              </div>
            </div>
          </div>

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

      {/* Change Password Modal */}
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

function StudyTile({ to, icon: Icon, title, hint, tag, className }) {
  return (
    <Link
      to={to}
      className={cn(
        'tf-pressable group flex flex-col justify-between rounded-2xl border border-border bg-surface p-3 sm:p-3.5 transition-all hover:border-border-strong hover:bg-surface-strong/70 hover:shadow-xs active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[var(--brand-lavender)] text-primary transition-transform group-hover:scale-105">
          <Icon size={18} aria-hidden="true" />
        </span>
        {tag && (
          <Badge variant="lime" className="text-[10px] px-1.5 py-0 font-bold uppercase tracking-wider">
            {tag}
          </Badge>
        )}
      </div>
      <div className="mt-3 min-w-0">
        <p className="text-[13px] sm:text-[14px] font-bold tracking-tight text-foreground-strong group-hover:text-primary transition-colors">
          {title}
        </p>
        <p className="mt-0.5 truncate text-[11px] text-muted">
          {hint}
        </p>
      </div>
    </Link>
  );
}

export default ProfilePage;
