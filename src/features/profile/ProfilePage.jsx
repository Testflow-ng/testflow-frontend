import { useCallback, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  ChevronRight,
  Edit2,
  Eye,
  EyeOff,
  History,
  Lock,
  LogOut,
  Moon,
  Plus,
  Save,
  Sun,
  TrendingUp,
  X,
} from 'lucide-react';
import { Alert, Avatar, Button, Input, Field, Modal } from '../../components/ui/index.js';
import {
  groupListClasses,
  groupRowClasses,
  listRowClasses,
} from '../../components/ui/surfaces.js';
import { authApi } from '../auth/api.js';
import { useAuth } from '../auth/useAuth.js';
import { cn } from '../../utils/cn.js';
import { useSubjects, useTogglePin } from '../subjects/useSubjects.js';
import { useTheme } from '../../hooks/useTheme.js';

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) : null;

const EMPTY_PASSWORD_FORM = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
};

function ProfilePage() {
  const { user, logout, refreshUser } = useAuth();
  const { isDark, toggle: toggleTheme } = useTheme();
  const { data: subjects } = useSubjects();
  const togglePin = useTogglePin();
  const location = useLocation();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(user.fullName);
  const [showOnLeaderboard, setShowOnLeaderboard] = useState(user.showOnLeaderboard !== false);
  const [isSaving, setIsSaving] = useState(false);
  const [editError, setEditError] = useState(null);
  const [showSubjectPicker, setShowSubjectPicker] = useState(false);

  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState(EMPTY_PASSWORD_FORM);
  const [passwordError, setPasswordError] = useState(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  /*
    Bug: the edit form's state was seeded from `user` once, on first render,
    and never again. Typing a new name, cancelling, and reopening the dialog
    brought back the abandoned draft rather than the saved value, so the form
    showed something that was not the user's name and a second Save would have
    committed it. Reseeding on open makes Cancel actually cancel.
  */
  const openEditor = useCallback(() => {
    setFullName(user.fullName);
    setShowOnLeaderboard(user.showOnLeaderboard !== false);
    setEditError(null);
    setIsEditing(true);
  }, [user.fullName, user.showOnLeaderboard]);

  /*
    Settings links here for "Change password", which previously just dropped the
    user on the profile with nothing open and no indication of what to do next.
    A `#security` hash opens the dialog on arrival.

    The hash is *derived* into the open state rather than copied into it by an
    effect. Mirroring it with setState would render once with the dialog closed
    and again with it open, and it would also fight the user: closing the dialog
    while the hash was still in the URL would immediately reopen it.
  */
  const isPasswordModalOpen = passwordModalOpen || location.hash === '#security';

  /* A typed-then-abandoned password sat in memory and the previous error stayed
     on screen the next time the dialog opened. Closing now clears both, and
     drops the hash so the dialog stays closed. */
  const closePasswordModal = useCallback(() => {
    setPasswordModalOpen(false);
    setPasswordForm(EMPTY_PASSWORD_FORM);
    setPasswordError(null);
    if (location.hash === '#security') {
      navigate(location.pathname, { replace: true });
    }
  }, [location.hash, location.pathname, navigate]);

  // The API strips `_id` and exposes `id`; the `s._id || s.id` fallback this
  // used to carry could never match and only masked which field was real.
  const pinnedIds = new Set(user.pinnedSubjects ?? []);
  const pinnedSubjects = subjects?.filter((s) => pinnedIds.has(s.id)) ?? [];
  const unpinnedSubjects = subjects?.filter((s) => !pinnedIds.has(s.id)) ?? [];

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setEditError(null);
    try {
      await authApi.updateProfile({ fullName, showOnLeaderboard });
      await refreshUser();
      setIsEditing(false);
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
      logout();
    } catch (err) {
      setPasswordError(err.message || 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleTogglePin = (subjectId) => {
    togglePin.mutate(subjectId);
  };

  return (
    <section className="mx-auto w-full max-w-2xl flex-1 tf-nav-clearance">
      <div className="relative">
        {/*
          A quiet brand band, and no image.

          The Eddyrus artwork is a 1254x1254 social-post graphic with its own
          busy background. Every way of forcing it into a wide banner failed on
          its own terms: `object-cover` sheared the wordmark off, `object-contain`
          centred it directly under the avatar, and moving it aside stamped its
          white backdrop as a hard rectangle on the tint. It is a square asset
          and this is a banner slot.

          It is also the wrong content. This is the student's own screen, the
          logo is already in the header two rows above, and the artwork now has
          a proper full-bleed home on the last onboarding screen. What belongs
          here is the person: their avatar, their name, their level.
        */}
        <div className="h-24 w-full rounded-b-3xl bg-primary/5 sm:h-32 sm:rounded-b-[2rem]" />

        {/*
          Avatar is 88px on phones (was 112px), which is half the cover height
          rather than most of it, so the identity block starts higher up the
          screen and less of the fold is spent on chrome.
        */}
        <div className="absolute -bottom-11 left-1/2 -translate-x-1/2 sm:-bottom-14">
          <div className="rounded-full border-4 border-background">
            <Avatar
              name={user.fullName}
              size="lg"
              className="size-[5.5rem] text-2xl sm:size-28 sm:text-3xl"
            />
          </div>
        </div>
      </div>

      {/* Identity block */}
      <div className="mt-14 text-center tf-gutter sm:mt-16">
        <div className="flex items-center justify-center gap-1">
          {/* `truncate` clipped a long single-word name to nothing readable. Wrapping
              shows the whole name; `break-words` stops one long token overflowing. */}
          <h1 className="min-w-0 break-words font-heading text-[1.625rem] font-extrabold leading-tight tracking-tight text-foreground-strong">
            {user.fullName}
          </h1>
          <button
            type="button"
            onClick={openEditor}
            aria-label="Edit profile"
            className="tf-pressable flex size-10 shrink-0 items-center justify-center rounded-full text-muted active:bg-surface-strong active:text-primary"
          >
            <Edit2 size={16} aria-hidden="true" />
          </button>
        </div>
        {user.username && (
          <p className="text-[13px] font-medium text-muted">@{user.username}</p>
        )}
        <p className="mt-1 text-[13px] text-muted">{user.email}</p>
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] text-primary">
            {user.role.replace('_', ' ')}
          </span>
          {user.createdAt && (
            <span className="inline-flex items-center rounded-full bg-surface-strong px-3 py-1 text-[11px] font-semibold text-muted">
              Since {formatDate(user.createdAt)}
            </span>
          )}
        </div>
      </div>

      <div className="mt-8 space-y-7 tf-gutter">
        {/* My Subjects */}
        <section>
          <div className="mb-2.5 flex items-center justify-between gap-3">
            <h2 className="px-1 text-[11px] font-bold uppercase tracking-[0.16em] text-muted">
              My subjects
            </h2>
            <button
              type="button"
              onClick={() => setShowSubjectPicker(true)}
              className="tf-pressable inline-flex h-8 items-center gap-1 rounded-full bg-primary/10 px-3 text-[12px] font-bold text-primary active:bg-primary/20"
            >
              <Plus size={14} aria-hidden="true" />
              Add
            </button>
          </div>
          {pinnedSubjects.length === 0 ? (
            <button
              type="button"
              onClick={() => setShowSubjectPicker(true)}
              className="tf-pressable flex min-h-[5.5rem] w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border text-[14px] font-medium text-muted active:border-primary/40 active:text-primary"
            >
              <BookOpen size={18} aria-hidden="true" />
              Choose your subjects
            </button>
          ) : (
            <div className="flex flex-wrap gap-2">
              {pinnedSubjects.map((s) => (
                <span
                  key={s.id}
                  className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-border bg-surface py-1 pl-3 pr-1 text-[13px] font-semibold text-foreground-strong"
                >
                  <span className="text-[11px] font-bold text-primary">{s.code}</span>
                  {s.title}
                  {/*
                    Remove was `opacity-0 group-hover:opacity-100` — unreachable
                    on touch. It is now always visible with a 32px target.
                  */}
                  <button
                    type="button"
                    onClick={() => handleTogglePin(s.id)}
                    aria-label={`Remove ${s.title}`}
                    className="tf-pressable flex size-7 items-center justify-center rounded-full text-muted active:bg-danger/10 active:text-danger"
                  >
                    <X size={14} aria-hidden="true" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </section>

        {/* Quick links */}
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          <Link to="/history" className={listRowClasses({ className: 'p-4' })}>
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
              <History size={18} aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-semibold leading-snug text-foreground-strong">
                Exam history
              </p>
              <p className="mt-0.5 text-[12px] leading-snug text-muted">Review past attempts</p>
            </div>
            <ChevronRight size={16} className="shrink-0 text-muted" aria-hidden="true" />
          </Link>
          <Link to="/progress" className={listRowClasses({ className: 'p-4' })}>
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-green-500/10 text-green-500">
              <TrendingUp size={18} aria-hidden="true" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-semibold leading-snug text-foreground-strong">
                My progress
              </p>
              <p className="mt-0.5 text-[12px] leading-snug text-muted">Track performance</p>
            </div>
            <ChevronRight size={16} className="shrink-0 text-muted" aria-hidden="true" />
          </Link>
        </div>

        {/* Account details */}
        <section>
          <h2 className="mb-2 px-1 text-[11px] font-bold uppercase tracking-[0.16em] text-muted">
            Account
          </h2>
          <dl className={groupListClasses()}>
            <Row label="Full name" value={user.fullName} />
            <Row label="Email" value={user.email} />
            {user.matricNumber && <Row label="Matric number" value={user.matricNumber} />}
            <Row
              label="Leaderboard"
              value={user.showOnLeaderboard !== false ? 'Visible' : 'Hidden'}
            />
            <button type="button" onClick={toggleTheme} className={groupRowClasses()}>
              <span className="flex items-center gap-3">
                {isDark ? (
                  <Sun size={16} className="text-muted" aria-hidden="true" />
                ) : (
                  <Moon size={16} className="text-muted" aria-hidden="true" />
                )}
                <span className="text-[15px] font-medium text-foreground-strong">
                  {isDark ? 'Light mode' : 'Dark mode'}
                </span>
              </span>
              <Switch checked={isDark} />
            </button>
            <button
              type="button"
              onClick={() => setPasswordModalOpen(true)}
              className={groupRowClasses()}
            >
              <span className="flex items-center gap-3">
                <Lock size={16} className="text-muted" aria-hidden="true" />
                <span className="text-[15px] font-medium text-foreground-strong">Security</span>
              </span>
              <ChevronRight size={16} className="text-muted" aria-hidden="true" />
            </button>
          </dl>
        </section>

        {/* Logout */}
        <button
          type="button"
          onClick={logout}
          className="tf-pressable flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-danger/20 text-[15px] font-semibold text-danger active:bg-danger/10"
        >
          <LogOut size={16} aria-hidden="true" />
          Sign out
        </button>
      </div>

      {/* Subject picker modal */}
      <Modal
        open={showSubjectPicker}
        onOpenChange={setShowSubjectPicker}
        title="Choose subjects"
        description="Pick the courses you are taking this semester"
      >
        <div className="flex flex-col gap-2 py-1">
          {unpinnedSubjects.length === 0 && pinnedSubjects.length > 0 && (
            <p className="py-6 text-center text-sm text-muted">All subjects added</p>
          )}
          {(subjects ?? []).map((s) => {
            const isPinned = pinnedIds.has(s.id);
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => handleTogglePin(s.id)}
                aria-pressed={isPinned}
                className={cn(
                  'tf-pressable flex min-h-14 w-full items-center justify-between gap-3 rounded-xl border p-3 text-left',
                  isPinned ? 'border-primary bg-primary/5' : 'border-border bg-surface',
                )}
              >
                <span className="min-w-0">
                  <span className="block truncate text-[14px] font-semibold text-foreground-strong">
                    {s.title}
                  </span>
                  <span className="mt-0.5 block text-[12px] font-bold text-muted">{s.code}</span>
                </span>
                <span
                  className={cn(
                    'flex size-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                    isPinned ? 'border-primary bg-primary text-white' : 'border-border',
                  )}
                >
                  {isPinned && <span className="text-[11px] font-bold">&#10003;</span>}
                </span>
              </button>
            );
          })}
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
            <Button variant="ghost" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button loading={isSaving} onClick={handleSaveProfile} leadingIcon={<Save size={16} />}>
              Save changes
            </Button>
          </>
        }
      >
        <div className="space-y-4 py-1">
          {editError && <Alert variant="danger">{editError}</Alert>}
          <Field label="Full name">
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
              autoComplete="name"
            />
          </Field>
          <Field
            label="Email address"
            hint="Email address cannot be changed for security reasons."
          >
            <Input value={user.email} disabled />
          </Field>
          <div className="pt-1">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-muted">
              Privacy
            </p>
            <button
              type="button"
              onClick={() => setShowOnLeaderboard(!showOnLeaderboard)}
              aria-pressed={showOnLeaderboard}
              className={cn(
                'tf-pressable flex w-full items-center justify-between gap-3 rounded-xl border p-4 text-left',
                showOnLeaderboard
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-border bg-surface text-muted',
              )}
            >
              <span className="flex min-w-0 items-center gap-3">
                {showOnLeaderboard ? (
                  <Eye size={18} className="shrink-0" aria-hidden="true" />
                ) : (
                  <EyeOff size={18} className="shrink-0" aria-hidden="true" />
                )}
                <span className="min-w-0">
                  <span className="block text-[14px] font-semibold">Show on leaderboards</span>
                  <span className="mt-0.5 block text-[12px] leading-snug opacity-80">
                    Whether other students can see your scores.
                  </span>
                </span>
              </span>
              <Switch checked={showOnLeaderboard} />
            </button>
          </div>
        </div>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        open={isPasswordModalOpen}
        onOpenChange={(next) => (next ? setPasswordModalOpen(true) : closePasswordModal())}
        title="Change password"
        description="Strengthen your account security"
      >
        <form id="change-password" onSubmit={handleChangePassword} className="space-y-4 py-1">
          {passwordError && <Alert variant="danger">{passwordError}</Alert>}
          <Field label="Current password">
            <Input
              type="password"
              required
              autoComplete="current-password"
              value={passwordForm.currentPassword}
              onChange={(e) =>
                setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))
              }
            />
          </Field>
          <Field label="New password">
            <Input
              type="password"
              required
              autoComplete="new-password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
            />
          </Field>
          <Field label="Confirm new password">
            <Input
              type="password"
              required
              autoComplete="new-password"
              value={passwordForm.confirmPassword}
              onChange={(e) =>
                setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))
              }
            />
          </Field>
          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="ghost"
              fullWidth
              className="sm:w-auto"
              onClick={closePasswordModal}
            >
              Cancel
            </Button>
            <Button type="submit" fullWidth className="sm:w-auto" loading={isChangingPassword}>
              Update password
            </Button>
          </div>
        </form>
      </Modal>
    </section>
  );
}

/** Shared toggle visual. Was duplicated inline twice with slightly different
 *  markup; one component keeps both switches identical. */
function Switch({ checked }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'relative block h-6 w-10 shrink-0 rounded-full transition-colors duration-[var(--duration-sm)]',
        checked ? 'bg-primary' : 'bg-muted/30',
      )}
    >
      <span
        className={cn(
          'absolute top-1 size-4 rounded-full bg-white shadow-sm transition-all duration-[var(--duration-sm)] ease-[var(--transition-ease)]',
          checked ? 'left-5' : 'left-1',
        )}
      />
    </span>
  );
}

function Row({ label, value }) {
  return (
    <div className={groupRowClasses({ interactive: false, className: 'gap-4' })}>
      <dt className="shrink-0 text-[13px] font-medium text-muted">{label}</dt>
      <dd className="truncate text-[14px] font-semibold text-foreground-strong">{value}</dd>
    </div>
  );
}

export default ProfilePage;
