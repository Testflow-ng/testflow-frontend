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
    { label: 'Full name', value: user.fullName },
    { label: 'Email address', value: user.email },
    ...(user.matricNumber ? [{ label: 'Matric number', value: user.matricNumber }] : []),
    { label: 'Role', value: user.role === 'admin' ? 'Administrator' : 'Student' },
    ...(user.createdAt ? [{ label: 'Member since', value: formatDate(user.createdAt) }] : []),
  ];

  return (
    <section className="mx-auto w-full max-w-2xl lg:max-w-4xl flex-1 px-5 py-8">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-12">
        <Avatar name={user.fullName} size="lg" className="h-24 w-24 text-2xl" />
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-3xl font-bold text-foreground-strong">{user.fullName}</h1>
          <p className="mt-1 text-muted">{user.email}</p>
          <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-4">
            <span
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider',
                user.isEmailVerified ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning',
              )}
            >
              {user.isEmailVerified ? (
                <CheckCircle2 size={13} aria-hidden="true" />
              ) : (
                <AlertTriangle size={13} aria-hidden="true" />
              )}
              {user.isEmailVerified ? 'Verified' : 'Unverified'}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary">
              {user.role}
            </span>
          </div>
        </div>
        <div className="flex gap-3">
           <Button variant="outline" size="sm" onClick={logout}>
            Sign out
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-widest text-muted mb-4">Account Information</h2>
          <dl className="divide-y divide-border rounded-xl border border-border bg-surface overflow-hidden">
            {rows.map((row) => (
              <div key={row.label} className="flex items-center justify-between gap-4 px-5 py-4">
                <dt className="text-sm font-medium text-muted">{row.label}</dt>
                <dd className="truncate text-sm font-bold text-foreground-strong">{row.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="flex flex-col gap-6">
          {!user.isEmailVerified && (
            <div>
              <h2 className="text-sm font-bold uppercase tracking-widest text-muted mb-4">Account Security</h2>
              {resent ? (
                <Alert variant="info">If your account is unverified, a new link is on its way.</Alert>
              ) : (
                <div className="rounded-xl border border-warning/30 bg-warning/10 p-5">
                  <p className="text-sm font-medium text-warning">Your email is not verified yet. You cannot start taking exams until you verify your account.</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4 bg-surface"
                    loading={resending}
                    onClick={handleResend}
                  >
                    Resend verification email
                  </Button>
                </div>
              )}
            </div>
          )}

          <div>
             <h2 className="text-sm font-bold uppercase tracking-widest text-muted mb-4">Quick Links</h2>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Link to="/history" className="flex items-center gap-3 p-4 rounded-xl border border-border bg-surface hover:bg-surface-strong transition-colors">
                  <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 font-bold text-xs">H</div>
                  <span className="text-sm font-bold text-foreground-strong">Exam History</span>
                </Link>
                <Link to="/progress" className="flex items-center gap-3 p-4 rounded-xl border border-border bg-surface hover:bg-surface-strong transition-colors">
                  <div className="h-8 w-8 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 font-bold text-xs">P</div>
                  <span className="text-sm font-bold text-foreground-strong">My Progress</span>
                </Link>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default ProfilePage;
