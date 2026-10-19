import { useState } from 'react';
import { Bell, BookOpen, Trophy, Users, Sparkles } from 'lucide-react';
import Screen, { PageHeader } from '../../components/layout/Screen.jsx';
import { Banner, Switch } from '../../components/ui/index.js';
import { groupListClasses, groupRowClasses } from '../../components/ui/surfaces.js';

const STORAGE_KEY = 'tf_notification_prefs';

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

function NotificationPreferencesPage() {
  const [prefs, setPrefs] = useState(() => {
    const defaults = Object.fromEntries(PREFS.map((p) => [p.key, true]));
    try {
      return { ...defaults, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') };
    } catch {
      return defaults;
    }
  });

  const update = (key, val) => {
    setPrefs((prev) => {
      const next = { ...prev, [key]: val };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* storage unavailable: the choice still applies for this visit */
      }
      return next;
    });
  };

  return (
    <Screen width="sm">
      <PageHeader back="/settings" title="Notifications" subtitle="Choose what you hear about." />

      <div className={groupListClasses({ className: 'mt-6' })}>
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
            <Switch
              checked={prefs[pref.key]}
              onCheckedChange={(val) => update(pref.key, val)}
              aria-label={pref.label}
            />
          </div>
        ))}
      </div>

      <Banner variant="info" className="mt-4">Preferences are saved on this device. Push notifications are coming soon.</Banner>
    </Screen>
  );
}

export default NotificationPreferencesPage;
