import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, ChevronRight, Compass, CreditCard, HelpCircle, Lock, LogOut, MessageSquare, Moon, Shield, User } from 'lucide-react';
import { useAuth } from '../auth/useAuth.js';
import { Avatar, Badge, Button, ConfirmDialog } from '../../components/ui/index.js';
import ThemeToggle from '../../components/ThemeToggle.jsx';
import { THEME_SWITCHING_ENABLED } from '../../theme.js';
import Screen, { PageHeader } from '../../components/layout/Screen.jsx';
import { groupListClasses, groupRowClasses, listRowClasses } from '../../components/ui/surfaces.js';
import { cn } from '../../utils/cn.js';
import { useTour } from '../tour/TourContext.js';

function SettingsPage() {
  const { user, logout } = useAuth();
  const [confirmOut, setConfirmOut] = useState(false);
  const { start: startTour } = useTour();

  return (
    <Screen width="lg">
      <PageHeader title="Settings" subtitle="Your account and preferences." />

      <Link to="/profile" className={listRowClasses({ className: 'mt-6 gap-3.5 p-4' })}>
        <Avatar name={user.fullName} size="md" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-semibold leading-snug text-foreground-strong">{user.fullName}</p>
          <p className="mt-0.5 truncate text-[13px] leading-snug text-muted">{user.email}</p>
        </div>
        <ChevronRight size={18} className="shrink-0 text-muted" aria-hidden="true" />
      </Link>

      <SettingsGroup title="Plan">
        <SettingsRow icon={<CreditCard size={18} aria-hidden="true" />} label="Student Pass: go ad-free" to="/billing" />
      </SettingsGroup>

      <SettingsGroup title="Preferences">
        {THEME_SWITCHING_ENABLED && (
          <div className={groupRowClasses({ interactive: false })}>
            <div className="flex items-center gap-3">
              <Moon size={18} className="shrink-0 text-muted" aria-hidden="true" />
              <span className="text-[15px] font-medium text-foreground-strong">Dark mode</span>
            </div>
            <ThemeToggle />
          </div>
        )}
        <SettingsRow icon={<Bell size={18} aria-hidden="true" />} label="Notifications" to="/settings/notifications" />
      </SettingsGroup>

      <SettingsGroup title="Account">
        <SettingsRow icon={<User size={18} aria-hidden="true" />} label="Edit profile" to="/profile" />
        <SettingsRow icon={<Lock size={18} aria-hidden="true" />} label="Change password" to="/profile#security" />
        <SettingsRow icon={<Shield size={18} aria-hidden="true" />} label="Privacy" to="/privacy" />
      </SettingsGroup>

      <SettingsGroup title="Support">
        <button type="button" onClick={startTour} className={groupRowClasses()}>
          <div className="flex min-w-0 items-center gap-3">
            <span className="shrink-0 text-muted"><Compass size={18} aria-hidden="true" /></span>
            <span className="truncate text-[15px] font-medium text-foreground-strong">Take the tour again</span>
          </div>
          <ChevronRight size={16} className="text-muted" aria-hidden="true" />
        </button>
        <SettingsRow icon={<HelpCircle size={18} aria-hidden="true" />} label="Help center" to="/help" />
        <SettingsRow icon={<MessageSquare size={18} aria-hidden="true" />} label="Send feedback" to="/settings/feedback" />
      </SettingsGroup>

      <Button
        variant="outline"
        size="lg"
        className="mt-8 w-full border-danger/30 text-danger hover:bg-danger/5"
        onClick={() => setConfirmOut(true)}
      >
        <LogOut size={16} aria-hidden="true" />
        Sign out
      </Button>

      <p className="mt-6 text-center text-[11px] text-muted">TestFlow v1.0 by Eddyrus Media</p>

      <ConfirmDialog
        open={confirmOut}
        onOpenChange={setConfirmOut}
        title="Sign out?"
        description="You will need to sign in again to take exams."
        confirmLabel="Sign out"
        tone="danger"
        onConfirm={logout}
      />
    </Screen>
  );
}

function SettingsGroup({ title, children }) {
  return (
    <section className="mt-7">
      <h2 className="mb-2 px-1 text-[11px] font-bold uppercase tracking-[0.16em] text-muted">{title}</h2>
      <div className={groupListClasses()}>{children}</div>
    </section>
  );
}

function SettingsRow({ icon, label, to, soon }) {
  const content = (
    <>
      <div className="flex min-w-0 items-center gap-3">
        <span className="shrink-0 text-muted">{icon}</span>
        <span className={cn('truncate text-[15px] font-medium', soon ? 'text-muted' : 'text-foreground-strong')}>
          {label}
        </span>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {soon ? <Badge variant="lavender">Soon</Badge> : <ChevronRight size={16} className="text-muted" aria-hidden="true" />}
      </div>
    </>
  );

  if (to && !soon) {
    return (
      <Link to={to} className={groupRowClasses()}>
        {content}
      </Link>
    );
  }
  return <div className={groupRowClasses({ interactive: false })}>{content}</div>;
}

export default SettingsPage;
