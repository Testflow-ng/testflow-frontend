import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Bell, BookOpen, Trophy, Users, Sparkles } from 'lucide-react';

const PREFS = [
  { key: 'exam_reminders', label: 'Exam reminders', desc: 'Get notified before scheduled practice sessions', Icon: BookOpen },
  { key: 'live_cbt', label: 'Live CBT invites', desc: 'When a friend creates a session you can join', Icon: Users },
  { key: 'achievements', label: 'Achievements', desc: 'Celebrate when you unlock new badges', Icon: Trophy },
  { key: 'ai_suggestions', label: 'AI study tips', desc: 'Personalized revision recommendations', Icon: Sparkles },
  { key: 'streak', label: 'Streak reminders', desc: 'Keep your study streak alive', Icon: Bell },
];

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ${
        checked ? 'bg-primary' : 'bg-border'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
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
    <section className="mx-auto w-full max-w-lg flex-1 px-5 pb-28 pt-6 lg:pb-8">
      <div className="mb-6 flex items-center gap-3">
        <Link
          to="/settings"
          className="flex h-8 w-8 items-center justify-center rounded-full text-muted hover:bg-surface-strong hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <h1 className="font-heading text-xl font-extrabold tracking-tight text-foreground-strong">
          Notifications
        </h1>
      </div>

      <div className="rounded-2xl border border-border bg-surface">
        {PREFS.map((pref, i) => (
          <div
            key={pref.key}
            className={`flex items-center gap-4 px-5 py-4 ${
              i < PREFS.length - 1 ? 'border-b border-border' : ''
            }`}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <pref.Icon className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground-strong">{pref.label}</p>
              <p className="mt-0.5 text-xs text-muted">{pref.desc}</p>
            </div>
            <Toggle checked={prefs[pref.key]} onChange={(val) => update(pref.key, val)} />
          </div>
        ))}
      </div>

      <p className="mt-4 text-center text-xs text-muted">
        Preferences are saved locally. Push notifications coming soon.
      </p>
    </section>
  );
}

export default NotificationPreferencesPage;
