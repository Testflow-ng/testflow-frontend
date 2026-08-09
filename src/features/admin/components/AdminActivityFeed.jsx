import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../api.js';
import { Spinner, Alert } from '../../../components/ui/index.js';
import {
  UserPlus,
  Settings as SettingsIcon,
  FileText,
  Trash2,
  UserCheck,
  ShieldAlert,
  ArrowRightLeft,
  FileCheck,
  FileX,
  PlusCircle,
  Database,
  CheckCircle2
} from 'lucide-react';
import { cn } from '../../../utils/cn.js';

const ACTION_MAP = {
  CREATE_ADMIN: { icon: UserCheck, color: 'text-success', bg: 'bg-success/10', label: 'Admin Created' },
  CREATE_STUDENT: { icon: UserPlus, color: 'text-primary', bg: 'bg-primary/10', label: 'Student Created' },
  UPDATE_SETTINGS: { icon: SettingsIcon, color: 'text-info', bg: 'bg-info/10', label: 'Settings Updated' },
  EXPORT_RESULTS: { icon: FileText, color: 'text-secondary', bg: 'bg-secondary/10', label: 'Results Exported' },
  DELETE_USER: { icon: Trash2, color: 'text-danger', bg: 'bg-danger/10', label: 'User Deleted' },
  RESET_PASSWORD: { icon: ShieldAlert, color: 'text-warning', bg: 'bg-warning/10', label: 'Password Reset' },
  TOGGLE_USER_STATUS: { icon: ArrowRightLeft, color: 'text-amber-500', bg: 'bg-amber-500/10', label: 'Status Toggled' },
  SUBMIT_VERIFICATION: { icon: FileCheck, color: 'text-primary', bg: 'bg-primary/10', label: 'Verification Submitted' },
  APPROVE_VERIFICATION: { icon: CheckCircle2, color: 'text-success', bg: 'bg-success/10', label: 'Verification Approved' },
  REJECT_VERIFICATION: { icon: FileX, color: 'text-danger', bg: 'bg-danger/10', label: 'Verification Rejected' },
  BULK_DELETE_QUESTIONS: { icon: Trash2, color: 'text-danger', bg: 'bg-danger/10', label: 'Bulk Questions Deleted' },
  BULK_TOGGLE_QUESTIONS: { icon: ArrowRightLeft, color: 'text-amber-500', bg: 'bg-amber-500/10', label: 'Bulk Status Updated' },
  CREATE_SUBJECT: { icon: PlusCircle, color: 'text-success', bg: 'bg-success/10', label: 'Subject Created' },
  DELETE_SUBJECT: { icon: Trash2, color: 'text-danger', bg: 'bg-danger/10', label: 'Subject Deleted' },
  BULK_IMPORT: { icon: Database, color: 'text-primary', bg: 'bg-primary/10', label: 'Bulk Import' },
};

const DefaultIcon = FileText;

function timeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 5) return 'just now';
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + "y ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + "mo ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + "d ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + "h ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + "m ago";
  return Math.floor(seconds) + "s ago";
}

function AdminActivityFeed() {
  const { data: logs, isLoading, isError } = useQuery({
    queryKey: ['adminActivity'],
    queryFn: adminApi.getActivityFeed,
    refetchInterval: 60000,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Spinner size="md" />
      </div>
    );
  }

  if (isError) {
    return <Alert variant="danger">Failed to load activity feed.</Alert>;
  }

  if (!logs || logs.length === 0) {
    return (
      <div className="text-center py-10 text-muted italic text-sm">
        No recent administrative activity.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {logs.map((log) => {
        const config = ACTION_MAP[log.action] || {
          icon: DefaultIcon,
          color: 'text-muted',
          bg: 'bg-surface-strong',
          label: log.action.replace(/_/g, ' ')
        };
        const Icon = config.icon;

        return (
          <div key={log._id || log.id} className="group relative flex gap-4 pl-3">
            <div className="absolute left-[23px] top-10 h-full w-px bg-border group-last:hidden" />

            <div className={cn(
              "relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
              config.bg
            )}>
              <Icon className={cn("h-5 w-5", config.color)} />
            </div>

            <div className="flex-1 pb-6">
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-bold text-foreground-strong">
                    {config.label}
                  </h4>
                  <time className="text-[10px] font-black uppercase tracking-widest text-muted">
                    {timeAgo(log.createdAt)}
                  </time>
                </div>
                <p className="text-xs text-muted leading-relaxed">
                  <span className="font-bold text-foreground">{log.actor?.fullName || 'System'}</span>
                  {' '}performed this action{' '}
                  {log.metadata?.count ? `on ${log.metadata.count} items` : log.targetType ? `on a ${log.targetType}` : ''}
                </p>
                {log.metadata?.email && (
                  <span className="mt-1 self-start text-[10px] font-black text-primary bg-primary/5 px-1.5 py-0.5 rounded border border-primary/10">
                    {log.metadata.email}
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default AdminActivityFeed;
