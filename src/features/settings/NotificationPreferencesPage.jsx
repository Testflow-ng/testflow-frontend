import { useState, useEffect } from 'react';
import { Bell, BookOpen, Trophy, Users, Sparkles, Smartphone, CheckCircle2, AlertCircle } from 'lucide-react';
import Screen, { PageHeader } from '../../components/layout/Screen.jsx';
import { Badge, Button, Card, Switch, useToast } from '../../components/ui/index.js';
import { groupListClasses, groupRowClasses } from '../../components/ui/surfaces.js';
import {
  getPermissionState,
  isPushSupported,
  registerPushDevice,
  sendTestPushNotification,
  fetchNotificationPreferences,
  saveNotificationPreferences,
} from '../notifications/pushManager.js';

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
  {
    key: 'streak',
    label: 'Streak reminders',
    desc: 'Keep your study streak alive',
    Icon: Bell,
  },
];

function NotificationPreferencesPage() {
  const toast = useToast();
  const [permission, setPermission] = useState(() => getPermissionState());
  const [isRegistering, setIsRegistering] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  const [prefs, setPrefs] = useState(() => {
    const defaults = Object.fromEntries(PREFS.map((p) => [p.key, true]));
    try {
      return { ...defaults, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') };
    } catch {
      return defaults;
    }
  });

  // Load preferences from backend on mount
  useEffect(() => {
    fetchNotificationPreferences()
      .then((data) => {
        if (data?.preferences) {
          setPrefs((prev) => ({ ...prev, ...data.preferences }));
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data.preferences));
          } catch {
            // ignore storage errors
          }
        }
      })
      .catch(() => {
        // Network offline or unauthenticated: stick with local cache
      });
  }, []);

  const update = async (key, val) => {
    const next = { ...prefs, [key]: val };
    setPrefs(next);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // storage unavailable
    }

    try {
      await saveNotificationPreferences(next);
    } catch {
      // Backend sync error: user choice is retained locally
    }
  };

  const handleEnablePush = async () => {
    setIsRegistering(true);
    try {
      const res = await registerPushDevice();
      setPermission(getPermissionState());
      if (res.granted) {
        toast.success(
          'Push notifications enabled!',
          'You will now receive alerts for Live CBT invites and study sessions.'
        );
      } else {
        toast.info(
          'Permission not granted',
          'Enable notifications in your browser address bar permissions.'
        );
      }
    } catch (err) {
      toast.error(
        'Could not enable push',
        err.message || 'Please check browser settings.'
      );
    } finally {
      setIsRegistering(false);
    }
  };

  const handleTestPush = async () => {
    setIsTesting(true);
    try {
      await sendTestPushNotification();
      toast.success(
        'Test push sent!',
        'Look out for a notification banner on your device.'
      );
    } catch (err) {
      toast.error(
        'Failed to send test push',
        err.message || 'Could not dispatch test notification.'
      );
    } finally {
      setIsTesting(false);
    }
  };

  const isGranted = permission === 'granted';
  const isDenied = permission === 'denied';
  const isSupported = isPushSupported();

  return (
    <Screen width="sm">
      <PageHeader back="/settings" title="Notifications" subtitle="Choose what you hear about." />

      {/* Push Notification Device Status Card */}
      <Card padding="md" className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3.5">
          <span className={`flex size-11 shrink-0 items-center justify-center rounded-2xl ${
            isGranted ? 'bg-success/10 text-success' : isDenied ? 'bg-danger/10 text-danger' : 'bg-primary/10 text-primary'
          }`}>
            <Smartphone size={20} aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-heading text-base font-bold text-foreground-strong">Push Notifications</p>
              <Badge variant={isGranted ? 'success' : isDenied ? 'danger' : 'lavender'}>
                {isGranted ? 'Active' : isDenied ? 'Blocked' : 'Off on this device'}
              </Badge>
            </div>
            <p className="mt-1 text-xs text-muted leading-relaxed">
              {isGranted
                ? 'Push notifications are active on this device. You will receive instant alerts.'
                : isDenied
                ? 'Notifications are blocked in your browser. Click the lock/info icon in the URL bar to allow.'
                : 'Turn on notifications to get real-time Live CBT invites, streak warnings, and badges.'}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 self-start sm:self-center">
          {isGranted ? (
            <Button
              size="sm"
              variant="outline"
              onClick={handleTestPush}
              loading={isTesting}
              leadingIcon={<CheckCircle2 size={14} className="text-success" />}
            >
              Send Test
            </Button>
          ) : isSupported && !isDenied ? (
            <Button
              size="sm"
              variant="primary"
              onClick={handleEnablePush}
              loading={isRegistering}
              leadingIcon={<Bell size={14} />}
            >
              Enable Push
            </Button>
          ) : isDenied ? (
            <Button
              size="sm"
              variant="outline"
              onClick={handleEnablePush}
              leadingIcon={<AlertCircle size={14} className="text-danger" />}
            >
              Retry
            </Button>
          ) : null}
        </div>
      </Card>

      {/* Preferences Group List */}
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
              checked={prefs[pref.key] !== false}
              onCheckedChange={(val) => update(pref.key, val)}
              aria-label={pref.label}
            />
          </div>
        ))}
      </div>
    </Screen>
  );
}

export default NotificationPreferencesPage;
