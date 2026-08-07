import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Bell, BookOpen, Trophy, Users, Sparkles } from 'lucide-react';
import Screen from '../../components/layout/Screen.jsx';
import { groupListClasses, groupRowClasses } from '../../components/ui/surfaces.js';
import { cn } from '../../utils/cn.js';

const PREFS = [
  {
    key: 'exam_reminders',
    label: 'Exam reminders',
    desc: 'Get notified before scheduled practice sessions',
    Icon: BookOpen,
  },
  {
    key: 'live_cbt',
    label: 'Live CBT invites',
    desc: 'When a friend creates a session you can join',
    Icon: Users,
  },
  {
    key: 'achievements',
    label: 'Achievements',
    desc: 'Celebrate when you unlock new badges',
    Icon: Trophy,
  },
  {
    key: 'ai_suggestions',
    label: 'AI study tips',
    desc: 'Personalized revision recommendations',
    Icon: Sparkles,
  },
  { key: 'streak', label: 'Streak reminders', desc: 'Keep your study streak alive', Icon: Bell },
];

function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        // 44px hit area around a 24px track, so the switch stays visually light
        // without being fiddly to hit with a thumb.
        "tf-pressable relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-[var(--duration-sm)]",
        "after:absolute after:inset-x-0 after:top-1/2 after:h-11 after:-translate-y-1/2 after:content-['']",
        checked ? 'bg-primary' : 'bg-border',
      )}
    >
      <span
        className={cn(
          'pointer-events-none inline-block size-4 rounded-full bg-white shadow-sm transition-transform duration-[var(--duration-sm)] ease-[var(--transition-ease)]',
          checked ? 'translate-x-6' : 'translate-x-1',
        )}
      />
    </button>
  );
}

function NotificationPreferencesPage() {
  const [prefs, setPrefs] = useState(() =>
    Object.fromEntries(PREFS.map((p) => [p.key, true])),
  );

  const update = (key, val) => {
    setPrefs((prev) => ({ ...prev, [key]: val }));
  };

  return (
    <Screen width="sm">
      <div className="mb-6 flex items-center gap-2">
        <Link
          to="/settings"
          aria-label="Back to settings"
          className="tf-pressable -ml-2 flex size-10 shrink-0 items-center justify-center rounded-full text-muted active:bg-surface-strong active:text-foreground"
        >
          <ArrowLeft size={18} aria-hidden="true" />
        </Link>
        <h1 className="font-heading text-[1.375rem] font-extrabold leading-tight tracking-tight text-foreground-strong">
          Notifications
        </h1>
      </div>

      <div className={groupListClasses()}>
        {PREFS.map((pref) => (
          <div
            key={pref.key}
            className={groupRowClasses({ interactive: false, className: 'gap-3 py-3.5' })}
          >
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                <pref.Icon size={16} className="text-primary" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="text-[15px] font-medium leading-snug text-foreground-strong">
                  {pref.label}
                </p>
                <p className="mt-0.5 text-[12px] leading-snug text-muted">{pref.desc}</p>
              </div>
            </div>
            <Toggle
              checked={prefs[pref.key]}
              onChange={(val) => update(pref.key, val)}
              label={pref.label}
            />
          </div>
        ))}
      </div>

      <p className="mt-4 px-2 text-center text-[12px] leading-relaxed text-muted">
        Preferences are saved locally. Push notifications coming soon.
      </p>
    </Screen>
  );
}

export default NotificationPreferencesPage;
