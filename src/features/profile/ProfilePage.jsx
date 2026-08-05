import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Edit2, Lock, Save, History, TrendingUp, Eye, EyeOff, BookOpen, LogOut, ChevronRight, Moon, Plus, Sun, X } from 'lucide-react';
import { Alert, Avatar, Button, Input, Field, Modal } from '../../components/ui/index.js';
import { authApi } from '../auth/api.js';
import { useAuth } from '../auth/useAuth.js';
import { cn } from '../../utils/cn.js';
import { useSubjects, useTogglePin } from '../subjects/useSubjects.js';
import { useTheme } from '../../hooks/useTheme.js';

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) : null;

function ProfilePage() {
  const { user, logout, refreshUser } = useAuth();
  const { isDark, toggle: toggleTheme } = useTheme();
  const { data: subjects } = useSubjects();
  const togglePin = useTogglePin();

  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(user.fullName);
  const [showOnLeaderboard, setShowOnLeaderboard] = useState(user.showOnLeaderboard !== false);
  const [isSaving, setIsSaving] = useState(false);
  const [editError, setEditError] = useState(null);
  const [showSubjectPicker, setShowSubjectPicker] = useState(false);

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const pinnedIds = new Set(user.pinnedSubjects ?? []);
  const pinnedSubjects = subjects?.filter((s) => pinnedIds.has(s._id || s.id)) ?? [];
  const unpinnedSubjects = subjects?.filter((s) => !pinnedIds.has(s._id || s.id)) ?? [];

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
      setIsPasswordModalOpen(false);
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
    <section className="mx-auto w-full max-w-2xl flex-1 pb-28 lg:pb-8">
      {/* Cover image + avatar */}
      <div className="relative">
        <div className="h-40 sm:h-52 w-full overflow-hidden rounded-b-3xl sm:rounded-b-[2rem]">
          <img
            src="/photos/cover-default.png"
            alt=""
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 rounded-b-3xl bg-gradient-to-t from-background/80 via-background/20 to-transparent sm:rounded-b-[2rem]" />
        </div>

        <div className="absolute -bottom-14 left-1/2 -translate-x-1/2">
          <div className="rounded-full border-4 border-background p-0.5">
            <Avatar
              name={user.fullName}
              size="lg"
              className="h-28 w-28 text-3xl"
            />
          </div>
        </div>
      </div>

      {/* Identity block */}
      <div className="mt-16 text-center px-5">
        <div className="flex items-center justify-center gap-2">
          <h1 className="text-2xl font-black tracking-tight text-foreground-strong">
            {user.fullName}
          </h1>
          <button
            onClick={() => setIsEditing(true)}
            className="rounded-full p-1.5 text-muted transition-colors hover:bg-surface-strong hover:text-primary"
          >
            <Edit2 size={14} />
          </button>
        </div>
        {user.username && (
          <p className="mt-0.5 text-sm font-medium text-muted">@{user.username}</p>
        )}
        <p className="mt-1 text-xs text-muted">{user.email}</p>
        <div className="mt-3 flex justify-center gap-2">
          <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary">
            {user.role.replace('_', ' ')}
          </span>
          {user.createdAt && (
            <span className="inline-flex items-center rounded-full bg-surface-strong px-3 py-1 text-[10px] font-bold text-muted">
              Since {formatDate(user.createdAt)}
            </span>
          )}
        </div>
      </div>

      <div className="mt-8 space-y-6 px-5">
        {/* My Subjects */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-muted">
              My Subjects
            </h2>
            <button
              onClick={() => setShowSubjectPicker(true)}
              className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-[10px] font-bold text-primary transition-colors hover:bg-primary/20"
            >
              <Plus size={12} />
              Add
            </button>
          </div>
          {pinnedSubjects.length === 0 ? (
            <button
              onClick={() => setShowSubjectPicker(true)}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border p-6 text-sm font-medium text-muted transition-colors hover:border-primary/30 hover:text-primary"
            >
              <BookOpen size={18} />
              Choose your subjects
            </button>
          ) : (
            <div className="flex flex-wrap gap-2">
              {pinnedSubjects.map((s) => (
                <span
                  key={s._id || s.id}
                  className="group inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1.5 text-xs font-bold text-foreground-strong transition-colors"
                >
                  <span className="text-[10px] font-bold text-primary">{s.code}</span>
                  {s.title}
                  <button
                    onClick={() => handleTogglePin(s._id || s.id)}
                    className="ml-0.5 rounded-full p-0.5 text-muted opacity-0 transition-opacity hover:text-danger group-hover:opacity-100"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Link
            to="/history"
            className="group flex items-center gap-3 rounded-2xl border border-border bg-surface p-4 transition-all hover:border-primary/30"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
              <History size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground-strong">Exam History</p>
              <p className="text-[10px] text-muted">Review past attempts</p>
            </div>
            <ChevronRight size={16} className="shrink-0 text-muted" />
          </Link>
          <Link
            to="/progress"
            className="group flex items-center gap-3 rounded-2xl border border-border bg-surface p-4 transition-all hover:border-primary/30"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-500/10 text-green-500">
              <TrendingUp size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground-strong">My Progress</p>
              <p className="text-[10px] text-muted">Track performance</p>
            </div>
            <ChevronRight size={16} className="shrink-0 text-muted" />
          </Link>
        </div>

        {/* Account details */}
        <div>
          <h2 className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-muted">
            Account
          </h2>
          <div className="divide-y divide-border rounded-2xl border border-border bg-surface overflow-hidden">
            <Row label="Full name" value={user.fullName} />
            <Row label="Email" value={user.email} />
            {user.matricNumber && <Row label="Matric number" value={user.matricNumber} />}
            <Row
              label="Leaderboard"
              value={user.showOnLeaderboard !== false ? 'Visible' : 'Hidden'}
            />
            <button
              onClick={toggleTheme}
              className="flex w-full items-center justify-between px-5 py-3.5 text-left transition-colors hover:bg-surface-strong"
            >
              <div className="flex items-center gap-2.5">
                {isDark ? <Sun size={14} className="text-muted" /> : <Moon size={14} className="text-muted" />}
                <span className="text-xs font-bold text-foreground-strong">
                  {isDark ? 'Light mode' : 'Dark mode'}
                </span>
              </div>
              <div
                className={cn(
                  'h-6 w-10 rounded-full relative transition-colors',
                  isDark ? 'bg-primary' : 'bg-muted/30',
                )}
              >
                <div
                  className={cn(
                    'absolute top-1 h-4 w-4 rounded-full bg-white transition-all shadow-sm',
                    isDark ? 'right-1' : 'left-1',
                  )}
                />
              </div>
            </button>
            <button
              onClick={() => setIsPasswordModalOpen(true)}
              className="flex w-full items-center justify-between px-5 py-3.5 text-left transition-colors hover:bg-surface-strong"
            >
              <div className="flex items-center gap-2.5">
                <Lock size={14} className="text-muted" />
                <span className="text-xs font-bold text-foreground-strong">Security</span>
              </div>
              <ChevronRight size={14} className="text-muted" />
            </button>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={logout}
          className="flex w-full items-center justify-center gap-2 rounded-full border border-danger/20 py-3 text-sm font-semibold text-danger transition-colors hover:bg-danger/5"
        >
          <LogOut size={16} />
          Sign out
        </button>
      </div>

      {/* Subject picker modal */}
      <Modal
        open={showSubjectPicker}
        onOpenChange={setShowSubjectPicker}
        title="Choose Subjects"
        description="Pick the courses you are taking this semester"
      >
        <div className="space-y-2 py-2 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
          {unpinnedSubjects.length === 0 && pinnedSubjects.length > 0 && (
            <p className="py-6 text-center text-sm text-muted">All subjects added</p>
          )}
          {(subjects ?? []).map((s) => {
            const isPinned = pinnedIds.has(s._id || s.id);
            return (
              <button
                key={s._id || s.id}
                onClick={() => handleTogglePin(s._id || s.id)}
                className={cn(
                  'flex w-full items-center justify-between rounded-xl border p-3 text-left transition-all',
                  isPinned
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-surface hover:border-primary/30',
                )}
              >
                <div className="min-w-0">
                  <p className="text-xs font-bold text-foreground-strong">{s.title}</p>
                  <p className="text-[10px] font-bold text-muted">{s.code}</p>
                </div>
                <div
                  className={cn(
                    'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                    isPinned
                      ? 'border-primary bg-primary text-white'
                      : 'border-border',
                  )}
                >
                  {isPinned && <span className="text-[10px] font-bold">&#10003;</span>}
                </div>
              </button>
            );
          })}
        </div>
      </Modal>

      {/* Edit Profile Modal */}
      <Modal
        open={isEditing}
        onOpenChange={setIsEditing}
        title="Edit Profile"
        description="Update your personal information"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button loading={isSaving} onClick={handleSaveProfile} leadingIcon={<Save size={16} />}>
              Save Changes
            </Button>
          </>
        }
      >
        <div className="space-y-4 pt-2">
          {editError && <Alert variant="danger">{editError}</Alert>}
          <Field label="Full Name">
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
            />
          </Field>
          <Field label="Email Address">
            <Input value={user.email} disabled className="bg-surface-strong" />
            <p className="text-[10px] text-muted mt-1.5 font-medium italic">
              Email address cannot be changed for security reasons.
            </p>
          </Field>
          <div className="pt-2">
            <label className="text-sm font-bold text-foreground-strong block mb-3 uppercase tracking-wider">
              Privacy Settings
            </label>
            <button
              type="button"
              onClick={() => setShowOnLeaderboard(!showOnLeaderboard)}
              className={cn(
                'w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all',
                showOnLeaderboard
                  ? 'border-primary bg-primary/5 text-primary'
                  : 'border-border bg-surface text-muted hover:border-border-strong',
              )}
            >
              <div className="flex items-center gap-3">
                {showOnLeaderboard ? <Eye size={20} /> : <EyeOff size={20} />}
                <div className="text-left">
                  <p className="text-sm font-bold">Show on Leaderboards</p>
                  <p className="text-[10px] opacity-80">Whether other students can see your scores.</p>
                </div>
              </div>
              <div
                className={cn(
                  'w-10 h-6 rounded-full relative transition-colors',
                  showOnLeaderboard ? 'bg-primary' : 'bg-muted/30',
                )}
              >
                <div
                  className={cn(
                    'absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-sm',
                    showOnLeaderboard ? 'right-1' : 'left-1',
                  )}
                />
              </div>
            </button>
          </div>
        </div>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        open={isPasswordModalOpen}
        onOpenChange={setIsPasswordModalOpen}
        title="Change Password"
        description="Strengthen your account security"
      >
        <form onSubmit={handleChangePassword} className="space-y-4 pt-2">
          {passwordError && <Alert variant="danger">{passwordError}</Alert>}
          <Field label="Current Password">
            <Input
              type="password"
              required
              value={passwordForm.currentPassword}
              onChange={(e) =>
                setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))
              }
            />
          </Field>
          <div className="h-px bg-border my-2" />
          <Field label="New Password">
            <Input
              type="password"
              required
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
            />
          </Field>
          <Field label="Confirm New Password">
            <Input
              type="password"
              required
              value={passwordForm.confirmPassword}
              onChange={(e) =>
                setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))
              }
            />
          </Field>
          <div className="pt-4 flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setIsPasswordModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={isChangingPassword}>
              Update Password
            </Button>
          </div>
        </form>
      </Modal>
    </section>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4 px-5 py-3.5">
      <dt className="text-xs font-bold text-muted">{label}</dt>
      <dd className="truncate text-sm font-bold text-foreground-strong">{value}</dd>
    </div>
  );
}

export default ProfilePage;
