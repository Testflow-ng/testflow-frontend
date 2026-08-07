import { Link } from 'react-router-dom';
import { Bell, ChevronRight, HelpCircle, Lock, LogOut, Moon, Shield, User } from 'lucide-react';
import { useAuth } from '../auth/useAuth.js';
import Avatar from '../../components/ui/Avatar.jsx';
import ThemeToggle from '../../components/ThemeToggle.jsx';
import Screen, { ScreenHeader } from '../../components/layout/Screen.jsx';
import { groupListClasses, groupRowClasses, listRowClasses } from '../../components/ui/surfaces.js';
import { cn } from '../../utils/cn.js';

function SettingsPage() {
  const { user, logout } = useAuth();

  return (
    <Screen width="lg">
      <ScreenHeader title="Settings" />

      {/* Profile card */}
      <Link to="/profile" className={listRowClasses({ className: 'mt-6 gap-3.5 p-4' })}>
        <Avatar name={user.fullName} size="md" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-semibold leading-snug text-foreground-strong">
            {user.fullName}
          </p>
          <p className="mt-0.5 truncate text-[13px] leading-snug text-muted">{user.email}</p>
        </div>
        <ChevronRight size={18} className="shrink-0 text-muted" aria-hidden="true" />
      </Link>

      <SettingsGroup title="Preferences">
        <div className={groupRowClasses({ interactive: false })}>
          <div className="flex items-center gap-3">
            <Moon size={18} className="shrink-0 text-muted" aria-hidden="true" />
            <span className="text-[15px] font-medium text-foreground-strong">Dark mode</span>
          </div>
          <ThemeToggle />
        </div>
        <SettingsRow
          icon={<Bell size={18} aria-hidden="true" />}
          label="Notifications"
          to="/settings/notifications"
        />
      </SettingsGroup>

      <SettingsGroup title="Account">
        <SettingsRow icon={<User size={18} aria-hidden="true" />} label="Edit profile" to="/profile" />
        {/*
          Both of these used to land on /profile with nothing open, so "Change
          password" was a row that appeared to do nothing. The hash opens the
          matching dialog on arrival.
        */}
        <SettingsRow
          icon={<Lock size={18} aria-hidden="true" />}
          label="Change password"
          to="/profile#security"
        />
        <SettingsRow
          icon={<Shield size={18} aria-hidden="true" />}
          label="Privacy"
          sublabel="Coming soon"
          disabled
        />
      </SettingsGroup>

      <SettingsGroup title="Support">
        <SettingsRow
          icon={<HelpCircle size={18} aria-hidden="true" />}
          label="Help center"
          sublabel="Coming soon"
          disabled
        />
      </SettingsGroup>

      <button
        type="button"
        onClick={logout}
        className="tf-pressable mt-8 flex min-h-12 w-full items-center justify-center gap-2 rounded-full border border-danger/20 bg-danger/5 text-[15px] font-semibold text-danger active:bg-danger/10"
      >
        <LogOut size={16} aria-hidden="true" />
        Sign out
      </button>

      <p className="mt-6 text-center text-[11px] text-muted">TestFlow v1.0 by Eddyrus Media</p>
    </Screen>
  );
}

/** Titled group of rows. The iOS grouped-list pattern: quiet caps-label above
 *  a single bordered block with hairline dividers. */
function SettingsGroup({ title, children }) {
  return (
    <section className="mt-7">
      <h2 className="mb-2 px-1 text-[11px] font-bold uppercase tracking-[0.16em] text-muted">
        {title}
      </h2>
      <div className={groupListClasses()}>{children}</div>
    </section>
  );
}

function SettingsRow({ icon, label, sublabel, to, disabled }) {
  const content = (
    <>
      <div className="flex min-w-0 items-center gap-3">
        <span className="shrink-0 text-muted">{icon}</span>
        <span
          className={cn(
            'truncate text-[15px] font-medium',
            disabled ? 'text-muted' : 'text-foreground-strong',
          )}
        >
          {label}
        </span>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {sublabel && <span className="text-[13px] text-muted">{sublabel}</span>}
        <ChevronRight size={16} className="text-muted" aria-hidden="true" />
      </div>
    </>
  );

  if (to && !disabled) {
    return (
      <Link to={to} className={groupRowClasses()}>
        {content}
      </Link>
    );
  }

  return (
    <div
      className={groupRowClasses({
        interactive: false,
        className: disabled ? 'pointer-events-none opacity-50' : undefined,
      })}
    >
      {content}
    </div>
  );
}

export default SettingsPage;
