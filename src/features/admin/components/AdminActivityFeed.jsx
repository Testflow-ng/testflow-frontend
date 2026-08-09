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
  CheckCircle2,
  Clock,
  ExternalLink
} from 'lucide-react';
import { cn } from '../../../utils/cn.js';

const ACTION_MAP = {
  CREATE_ADMIN: { icon: UserCheck, color: 'text-success', bg: 'bg-success/10', label: 'Admin Created' },
  CREATE_STUDENT: { icon: UserPlus, color: 'text-primary', bg: 'bg-primary/10', label: 'Student Registered' },
  UPDATE_SETTINGS: { icon: SettingsIcon, color: 'text-info', bg: 'bg-info/10', label: 'Settings Updated' },
  EXPORT_RESULTS: { icon: FileText, color: 'text-secondary', bg: 'bg-secondary/10', label: 'Results Exported' },
  DELETE_USER: { icon: Trash2, color: 'text-danger', bg: 'bg-danger/10', label: 'User Deleted' },
  RESET_PASSWORD: { icon: ShieldAlert, color: 'text-warning', bg: 'bg-warning/10', label: 'Password Reset' },
  TOGGLE_USER_STATUS: { icon: ArrowRightLeft, color: 'text-amber-500', bg: 'bg-amber-500/10', label: 'Status Toggled' },
  SUBMIT_VERIFICATION: { icon: FileCheck, color: 'text-primary', bg: 'bg-primary/10', label: 'Receipt Uploaded' },
  APPROVE_VERIFICATION: { icon: CheckCircle2, color: 'text-success', bg: 'bg-success/10', label: 'Payment Approved' },
  REJECT_VERIFICATION: { icon: FileX, color: 'text-danger', bg: 'bg-danger/10', label: 'Payment Rejected' },
  BULK_DELETE_QUESTIONS: { icon: Trash2, color: 'text-danger', bg: 'bg-danger/10', label: 'Questions Purged' },
  BULK_TOGGLE_QUESTIONS: { icon: ArrowRightLeft, color: 'text-amber-500', bg: 'bg-amber-500/10', label: 'Batch Visibility' },
  CREATE_SUBJECT: { icon: PlusCircle, color: 'text-success', bg: 'bg-success/10', label: 'Subject Created' },
  UPDATE_SUBJECT: { icon: SettingsIcon, color: 'text-amber-500', bg: 'bg-amber-500/10', label: 'Subject Updated' },
  DELETE_SUBJECT: { icon: Trash2, color: 'text-danger', bg: 'bg-danger/10', label: 'Subject Deleted' },
  BULK_IMPORT: { icon: Database, color: 'text-primary', bg: 'bg-primary/10', label: 'Question Import' },
};

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

function renderDescription(log) {
  const actor = log.actor?.fullName || 'System';
  const meta = log.metadata || {};

  switch (log.action) {
    case 'BULK_IMPORT':
      return <>{actor} imported <span className="font-bold text-foreground">{meta.count}</span> questions.</>;
    case 'APPROVE_VERIFICATION':
      return <>{actor} approved payment for <span className="font-bold text-foreground">{meta.studentName || 'a student'}</span>.</>;
    case 'REJECT_VERIFICATION':
      return <>{actor} rejected receipt for <span className="font-bold text-foreground">{meta.studentName || 'a student'}</span>.</>;
    case 'SUBMIT_VERIFICATION':
      return <><span className="font-bold text-foreground">{meta.fullName || 'A student'}</span> uploaded a payment receipt.</>;
    case 'CREATE_SUBJECT':
      return <>{actor} created subject <span className="font-bold text-foreground">{meta.code}</span>.</>;
    case 'UPDATE_SUBJECT':
      return <>{actor} updated <span className="font-bold text-foreground">{meta.code}</span> subject details.</>;
    case 'DELETE_SUBJECT':
      return <>{actor} deleted <span className="font-bold text-foreground">{meta.code}</span> subject.</>;
    case 'BULK_DELETE_QUESTIONS':
      return <>{actor} deleted <span className="font-bold text-foreground">{meta.count}</span> questions in batch.</>;
    case 'BULK_TOGGLE_QUESTIONS':
      return <>{actor} updated visibility for <span className="font-bold text-foreground">{meta.count}</span> questions.</>;
    case 'CREATE_STUDENT':
      return <><span className="font-bold text-foreground">{actor}</span> registered a new account.</>;
    default:
      return <>{actor} performed <span className="font-bold text-foreground">{log.action.toLowerCase().replace(/_/g, ' ')}</span>.</>;
  }
}

function AdminActivityFeed() {
  const { data: result, isLoading, isError } = useQuery({
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

  const logs = result?.logs || [];

  if (logs.length === 0) {
    return (
      <div className="text-center py-12 px-4 rounded-3xl bg-surface-strong border border-dashed border-border">
        <Clock size={32} className="mx-auto text-muted/20 mb-3" />
        <p className="text-xs text-muted font-bold uppercase tracking-widest">No recent activity</p>
      </div>
    );
  }

  return (
    <div className="relative pl-3 space-y-1">
      <div className="absolute left-[23px] top-4 bottom-4 w-px bg-gradient-to-b from-border via-border to-transparent" />

      {logs.map((log) => {
        const config = ACTION_MAP[log.action] || {
          icon: FileText,
          color: 'text-muted',
          bg: 'bg-surface-strong',
          label: log.action.replace(/_/g, ' ')
        };
        const Icon = config.icon;

        return (
          <div key={log._id || log.id} className="group relative flex gap-4 pr-1">
            <div className={cn(
              "relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all group-hover:scale-110",
              config.bg,
              "shadow-sm border border-white/10"
            )}>
              <Icon className={cn("h-5 w-5", config.color)} />
            </div>

            <div className="flex-1 pt-1.5 pb-6">
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted flex items-center gap-1.5">
                    {config.label}
                  </span>
                  <span className="text-[9px] font-bold text-muted-foreground whitespace-nowrap">
                    {timeAgo(log.createdAt)}
                  </span>
                </div>
                <p className="text-[13px] text-muted-foreground leading-snug">
                  {renderDescription(log)}
                </p>
                {log.metadata?.verificationCode && (
                  <div className="mt-1 flex items-center gap-2">
                     <span className="text-[9px] font-black text-primary bg-primary/5 px-1.5 py-0.5 rounded border border-primary/10">
                        {log.metadata.verificationCode}
                     </span>
                  </div>
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
