import { useState, useEffect } from 'react';
import { Send, Bell, Mail, Users, CheckCircle2, History, AlertCircle } from 'lucide-react';
import { Badge, Button, Card, ConfirmDialog, EmptyState, Field, Input, Select, Textarea, useToast } from '../../../components/ui/index.js';
import Screen, { PageHeader } from '../../../components/layout/Screen.jsx';
import { api } from '../../../api/client.js';

const CHANNELS = [
  { value: 'all', label: 'Push & Email (Both)' },
  { value: 'push', label: 'Push Notification Only (FCM)' },
  { value: 'email', label: 'Email Only' },
];

const TARGETS = [
  { value: 'all', label: 'All Users' },
  { value: 'students', label: 'Students Only' },
  { value: 'plus', label: 'TestFlow Plus Subscribers' },
  { value: 'admins', label: 'Admins Only' },
];

function BroadcastScreen() {
  const toast = useToast();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [channel, setChannel] = useState('all');
  const [target, setTarget] = useState('all');
  const [linkUrl, setLinkUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [announcements, setAnnouncements] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

  const loadHistory = async () => {
    try {
      const { data } = await api.get('/api/notifications/announcements');
      setAnnouncements(data.announcements || []);
    } catch {
      // Ignore
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleBroadcast = (e) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      toast.error('Validation error', 'Please fill in both a title and message.');
      return;
    }
    setConfirmOpen(true);
  };

  const executeBroadcast = async () => {
    setIsSubmitting(true);
    try {
      const { data } = await api.post('/api/notifications/broadcast', {
        title,
        body,
        channel,
        target,
        linkUrl: linkUrl.trim() || undefined,
      });

      const recipientCount = data.announcement?.stats?.totalRecipients ?? 0;
      toast.success(
        'Broadcast Dispatched!',
        `Delivered to ${recipientCount} user${recipientCount === 1 ? '' : 's'}.`
      );

      setTitle('');
      setBody('');
      setLinkUrl('');
      loadHistory();
    } catch (err) {
      toast.error(
        'Broadcast Failed',
        err.response?.data?.error?.message || err.message || 'An error occurred while broadcasting.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Screen width="xl">
      <PageHeader
        title="Broadcast Announcements"
        subtitle="Send instant push notifications and emails to your students and users."
      />

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        {/* Composer Form */}
        <div className="lg:col-span-3">
          <Card padding="lg">
            <h2 className="font-heading text-lg font-bold text-foreground-strong flex items-center gap-2">
              <Send size={18} className="text-primary" />
              New Announcement
            </h2>
            <p className="mt-1 text-xs text-muted">
              Choose your audience, channel, and message. Delivery starts immediately.
            </p>

            <form onSubmit={handleBroadcast} className="mt-5 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Delivery Channel">
                  <Select
                    value={channel}
                    onValueChange={setChannel}
                    options={CHANNELS}
                  />
                </Field>

                <Field label="Target Audience">
                  <Select
                    value={target}
                    onValueChange={setTarget}
                    options={TARGETS}
                  />
                </Field>
              </div>

              <Field label="Announcement Title" required>
                <Input
                  placeholder="e.g. Live CBT Physics Exam Session Starting Soon!"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={120}
                />
              </Field>

              <Field label="Announcement Message" required>
                <Textarea
                  rows={4}
                  placeholder="Write your announcement details here..."
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  maxLength={2000}
                />
              </Field>

              <Field label="Action Link (Optional)">
                <Input
                  placeholder="e.g. /live or /billing"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                />
                <p className="mt-1 text-[11px] text-muted">
                  Users who tap the notification will be taken straight to this page.
                </p>
              </Field>

              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  loading={isSubmitting}
                  leadingIcon={<Send size={15} />}
                  className="w-full sm:w-auto"
                >
                  Broadcast Announcement
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Live Preview */}
        <div className="lg:col-span-2 space-y-4">
          <Card padding="md" className="border-dashed bg-muted/20">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted">Push Notification Preview</h3>
            <div className="mt-3 rounded-2xl border border-border bg-card p-3 shadow-sm">
              <div className="flex items-start gap-2.5">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground font-black text-sm">
                  TF
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-xs text-foreground-strong line-clamp-1">
                    {title || 'Announcement Title'}
                  </p>
                  <p className="mt-0.5 text-xs text-muted line-clamp-2">
                    {body || 'Your notification message preview will show up here.'}
                  </p>
                  <p className="mt-1.5 text-[10px] text-muted">testflow.com.ng · now</p>
                </div>
              </div>
            </div>
          </Card>

          <Card padding="md" className="border-dashed bg-muted/20">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted">Channel Overview</h3>
            <div className="mt-3 space-y-2 text-xs text-muted">
              <div className="flex items-center gap-2">
                <Bell size={14} className="text-primary" />
                <span><strong>FCM Push:</strong> Shows on Android, iOS PWA, and desktop browsers.</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={14} className="text-primary" />
                <span><strong>Email:</strong> Dispatches clean HTML emails via Resend server.</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Broadcast History */}
      <div className="mt-10">
        <h2 className="font-heading text-lg font-bold text-foreground-strong flex items-center gap-2 mb-4">
          <History size={18} className="text-primary" />
          Broadcast History
        </h2>

        {isLoadingHistory ? (
          <Card padding="md" className="text-center py-8 text-sm text-muted">Loading past broadcasts...</Card>
        ) : !announcements.length ? (
          <EmptyState
            title="No broadcasts yet"
            description="Announcements sent to students and users will be recorded here."
          />
        ) : (
          <div className="space-y-3">
            {announcements.map((a) => (
              <Card key={a.id || a._id} padding="md" className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-foreground-strong">{a.title}</p>
                    <Badge variant="lavender">{a.target}</Badge>
                    <Badge variant="outline">{a.channel}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-muted line-clamp-1">{a.body}</p>
                  <p className="mt-1 text-xs text-muted">
                    {new Date(a.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-3 border-t border-border pt-2 sm:border-0 sm:pt-0">
                  <div className="text-right text-xs">
                    <p className="font-semibold text-foreground-strong">{a.stats?.totalRecipients || 0} Recipients</p>
                    <p className="text-muted">
                      {a.stats?.pushSent ? `Push: ${a.stats.pushSent} ` : ''}
                      {a.stats?.emailSent ? `Email: ${a.stats.emailSent}` : ''}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Confirm Announcement Broadcast"
        description={`Are you sure you want to broadcast "${title}" to ${TARGETS.find((t) => t.value === target)?.label || target}? This will immediately dispatch notifications via ${CHANNELS.find((c) => c.value === channel)?.label || channel}.`}
        confirmLabel="Broadcast Now"
        cancelLabel="Cancel"
        tone="primary"
        onConfirm={executeBroadcast}
      />
    </Screen>
  );
}

export default BroadcastScreen;
