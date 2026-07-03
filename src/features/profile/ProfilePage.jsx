import { useState } from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Alert, Avatar, Button } from '../../components/ui/index.js';
import { cn } from '../../utils/cn.js';
import { authApi } from '../auth/api.js';
import { useAuth } from '../auth/useAuth.js';

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString(undefined, { month: 'long', year: 'numeric' }) : null;

function ProfilePage() {
  const { user, logout } = useAuth();
  const [resent, setResent] = useState(false);
  const [resending, setResending] = useState(false);

  const handleResend = async () => {
    setResending(true);
    try {
      await authApi.resendVerification({ email: user.email });
    } finally {
      setResent(true);
      setResending(false);
    }
  };

  const rows = [
    ...(user.matricNumber ? [{ label: 'Matric number', value: user.matricNumber }] : []),
    { label: 'Role', value: user.role === 'admin' ? 'Administrator' : 'Student' },
    ...(user.createdAt ? [{ label: 'Member since', value: formatDate(user.createdAt) }] : []),
  ];

  return (
    <section className="mx-auto w-full max-w-xl flex-1 px-5 py-8">
      <div className="flex flex-col items-center text-center">
        <Avatar name={user.fullName} size="lg" />
        <h1 className="mt-4 text-xl font-semibold text-foreground-strong">{user.fullName}</h1>
        <p className="mt-0.5 text-sm text-muted">{user.email}</p>
        <span
          className={cn(
            'mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium',
            user.isEmailVerified ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning',
          )}
        >
          {user.isEmailVerified ? (
            <CheckCircle2 size={13} aria-hidden="true" />
          ) : (
            <AlertTriangle size={13} aria-hidden="true" />
          )}
          {user.isEmailVerified ? 'Email verified' : 'Email not verified'}
        </span>
      </div>

      {!user.isEmailVerified && (
        <div className="mt-6">
          {resent ? (
            <Alert variant="info">If your account is unverified, a new link is on its way.</Alert>
          ) : (
            <div className="rounded-lg border border-warning/30 bg-warning/10 p-4">
              <p className="text-sm text-warning">Verify your email to start taking exams.</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3"
                loading={resending}
                onClick={handleResend}
              >
                Resend verification email
              </Button>
            </div>
          )}
        </div>
      )}

      <h2 className="mt-8 text-sm font-semibold text-foreground-strong">Account details</h2>
      <dl className="mt-3 divide-y divide-border rounded-lg border border-border bg-surface">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-4 px-4 py-3">
            <dt className="text-sm text-muted">{row.label}</dt>
            <dd className="truncate text-sm font-medium text-foreground-strong">{row.value}</dd>
          </div>
        ))}
      </dl>

      <Button variant="outline" fullWidth className="mt-8" onClick={logout}>
        Sign out
      </Button>
    </section>
  );
}

export default ProfilePage;
