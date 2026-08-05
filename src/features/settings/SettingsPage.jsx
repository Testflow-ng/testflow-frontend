import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  ChevronRight,
  HelpCircle,
  Lock,
  LogOut,
  Moon,
  Shield,
  User,
} from 'lucide-react';
import { useAuth } from '../auth/useAuth.js';
import Avatar from '../../components/ui/Avatar.jsx';
import ThemeToggle from '../../components/ThemeToggle.jsx';
import { cn } from '../../utils/cn.js';

function SettingsPage() {
  const { user, logout } = useAuth();

  return (
    <section className="mx-auto w-full max-w-2xl flex-1 px-5 pb-28 pt-6 lg:pb-8">
      <h1 className="font-heading text-2xl font-extrabold tracking-tight text-foreground-strong">
        Settings
      </h1>

      {/* Profile card */}
      <Link
        to="/profile"
        className="mt-6 flex items-center gap-4 rounded-2xl border border-border bg-surface p-4 transition-colors hover:bg-surface-strong"
      >
        <Avatar name={user.fullName} size="md" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-foreground-strong truncate">
            {user.fullName}
          </p>
          <p className="text-xs text-muted truncate">{user.email}</p>
        </div>
        <ChevronRight size={18} className="shrink-0 text-muted" />
      </Link>

      {/* Preferences */}
      <div className="mt-8">
        <p className="text-xs font-bold uppercase tracking-widest text-muted mb-3">
          Preferences
        </p>
        <div className="divide-y divide-border rounded-2xl border border-border bg-surface overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3.5">
            <div className="flex items-center gap-3">
              <Moon size={18} className="text-muted" />
              <span className="text-sm font-medium text-foreground-strong">
                Dark mode
              </span>
            </div>
            <ThemeToggle />
          </div>
          <SettingsRow
            icon={<Bell size={18} />}
            label="Notifications"
            to="/settings/notifications"
          />
        </div>
      </div>

      {/* Account */}
      <div className="mt-6">
        <p className="text-xs font-bold uppercase tracking-widest text-muted mb-3">
          Account
        </p>
        <div className="divide-y divide-border rounded-2xl border border-border bg-surface overflow-hidden">
          <SettingsRow
            icon={<User size={18} />}
            label="Edit profile"
            to="/profile"
          />
          <SettingsRow
            icon={<Lock size={18} />}
            label="Change password"
            to="/profile"
          />
          <SettingsRow
            icon={<Shield size={18} />}
            label="Privacy"
            sublabel="Coming soon"
            disabled
          />
        </div>
      </div>

      {/* Support */}
      <div className="mt-6">
        <p className="text-xs font-bold uppercase tracking-widest text-muted mb-3">
          Support
        </p>
        <div className="divide-y divide-border rounded-2xl border border-border bg-surface overflow-hidden">
          <SettingsRow
            icon={<HelpCircle size={18} />}
            label="Help center"
            sublabel="Coming soon"
            disabled
          />
        </div>
      </div>

      {/* Sign out */}
      <button
        type="button"
        onClick={logout}
        className="mt-8 flex w-full items-center justify-center gap-2 rounded-full border border-danger/20 bg-danger/5 py-3 text-sm font-bold text-danger transition-colors hover:bg-danger/10"
      >
        <LogOut size={16} />
        Sign out
      </button>

      <p className="mt-6 text-center text-[10px] text-muted">
        TestFlow v1.0 by Eddyrus Media
      </p>
    </section>
  );
}

function SettingsRow({ icon, label, sublabel, to, disabled }) {
  const content = (
    <>
      <div className="flex items-center gap-3">
        <span className="text-muted">{icon}</span>
        <span
          className={cn(
            'text-sm font-medium',
            disabled ? 'text-muted' : 'text-foreground-strong',
          )}
        >
          {label}
        </span>
      </div>
      <div className="flex items-center gap-2">
        {sublabel && (
          <span className="text-[10px] text-muted">{sublabel}</span>
        )}
        <ChevronRight size={16} className="text-muted" />
      </div>
    </>
  );

  const classes =
    'flex items-center justify-between px-4 py-3.5 transition-colors hover:bg-surface-strong';

  if (to && !disabled) {
    return (
      <Link to={to} className={classes}>
        {content}
      </Link>
    );
  }

  return (
    <div className={cn(classes, disabled && 'opacity-50 pointer-events-none')}>
      {content}
    </div>
  );
}

export default SettingsPage;
