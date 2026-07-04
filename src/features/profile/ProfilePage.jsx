import { useState } from 'react';
import { Edit2, Lock, Save, History, TrendingUp } from 'lucide-react';
import { Alert, Avatar, Button, Input, Field, Modal } from '../../components/ui/index.js';
import { authApi } from '../auth/api.js';
import { useAuth } from '../auth/useAuth.js';
import { Link } from 'react-router-dom';

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) : null;

function ProfilePage() {
  const { user, logout, refreshUser } = useAuth();

  // Edit Profile State
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(user.fullName);
  const [isSaving, setIsSaving] = useState(false);
  const [editError, setEditError] = useState(null);

  // Change Password State
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setEditError(null);
    try {
      await authApi.updateProfile({ fullName });
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
      // Backend signs user out on password change for security
      logout();
    } catch (err) {
      setPasswordError(err.message || 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const rows = [
    { label: 'Full name', value: user.fullName },
    { label: 'Email address', value: user.email },
    ...(user.matricNumber ? [{ label: 'Matric number', value: user.matricNumber }] : []),
    {
      label: 'Role',
      value:
        user.role === 'admin'
          ? 'Administrator'
          : user.role === 'super_admin'
            ? 'Super Admin'
            : 'Student',
    },
    ...(user.createdAt ? [{ label: 'Member since', value: formatDate(user.createdAt) }] : []),
  ];

  return (
    <section className="mx-auto w-full max-w-2xl lg:max-w-4xl flex-1 px-5 py-8">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-12">
        <Avatar
          name={user.fullName}
          size="lg"
          className="h-24 w-24 text-2xl border-4 border-primary/10 p-1"
        />
        <div className="flex-1 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-3">
            <h1 className="text-3xl font-black text-foreground-strong tracking-tight">
              {user.fullName}
            </h1>
            <button
              onClick={() => setIsEditing(true)}
              className="p-2 rounded-full hover:bg-surface-strong text-muted hover:text-primary transition-colors"
            >
              <Edit2 size={18} />
            </button>
          </div>
          <p className="mt-1 text-muted font-medium">{user.email}</p>
          <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-4">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary">
              {user.role.replace('_', ' ')}
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPasswordModalOpen(true)}
            leadingIcon={<Lock size={14} />}
          >
            Security
          </Button>
          <Button variant="ghost" size="sm" onClick={logout} className="text-danger hover:bg-danger/5">
            Logout
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-muted">
              Account Profile
            </h2>
          </div>
          <dl className="divide-y divide-border rounded-2xl border border-border bg-surface overflow-hidden shadow-sm">
            {rows.map((row) => (
              <div key={row.label} className="flex items-center justify-between gap-4 px-6 py-4">
                <dt className="text-xs font-bold text-muted uppercase tracking-wider">{row.label}</dt>
                <dd className="truncate text-sm font-bold text-foreground-strong">{row.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="flex flex-col gap-8">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-muted mb-4">
              Activity Portal
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link
                to="/history"
                className="group p-5 rounded-2xl border border-border bg-surface hover:border-primary/50 transition-all shadow-sm"
              >
                <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 transition-transform group-hover:scale-110">
                  <History size={20} />
                </div>
                <p className="mt-3 text-sm font-bold text-foreground-strong">Exam History</p>
                <p className="text-[10px] text-muted font-medium">Review your past attempts</p>
              </Link>
              <Link
                to="/progress"
                className="group p-5 rounded-2xl border border-border bg-surface hover:border-primary/50 transition-all shadow-sm"
              >
                <div className="h-10 w-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500 transition-transform group-hover:scale-110">
                  <TrendingUp size={20} />
                </div>
                <p className="mt-3 text-sm font-bold text-foreground-strong">My Progress</p>
                <p className="text-[10px] text-muted font-medium">Track your performance</p>
              </Link>
            </div>
          </div>
        </div>
      </div>

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

export default ProfilePage;
