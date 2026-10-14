import { AlertCircle, CheckCircle2, Clock, CircleDashed, CreditCard, Hourglass, PauseCircle, XCircle } from 'lucide-react';

/** One map for every status in the product, so a status always looks the same everywhere. */
export const STATUS = {
  // ads: campaigns
  draft: { label: 'Draft', tone: 'neutral', icon: CircleDashed },
  pending_payment: { label: 'Awaiting payment', tone: 'warning', icon: CreditCard },
  pending_review: { label: 'In review', tone: 'info', icon: Hourglass },
  scheduled: { label: 'Scheduled', tone: 'info', icon: Clock },
  active: { label: 'Active', tone: 'success', icon: CheckCircle2 },
  rejected: { label: 'Rejected', tone: 'danger', icon: XCircle },
  suspended: { label: 'Suspended', tone: 'danger', icon: PauseCircle },
  expired: { label: 'Expired', tone: 'neutral', icon: Clock },
  archived: { label: 'Archived', tone: 'neutral', icon: CircleDashed },
  // payments and subscriptions
  paid: { label: 'Paid', tone: 'success', icon: CheckCircle2 },
  failed: { label: 'Failed', tone: 'danger', icon: XCircle },
  refunded: { label: 'Refunded', tone: 'neutral', icon: AlertCircle },
  past_due: { label: 'Past due', tone: 'warning', icon: AlertCircle },
  cancelled: { label: 'Cancelled', tone: 'neutral', icon: XCircle },
  // live sessions and attempts
  waiting: { label: 'Waiting', tone: 'warning', icon: Hourglass },
  ready: { label: 'Ready', tone: 'info', icon: CheckCircle2 },
  in_progress: { label: 'In progress', tone: 'info', icon: Clock },
  completed: { label: 'Finished', tone: 'neutral', icon: CheckCircle2 },
  results_published: { label: 'Results out', tone: 'success', icon: CheckCircle2 },
  approved: { label: 'Approved', tone: 'success', icon: CheckCircle2 },
  submitted: { label: 'Submitted', tone: 'success', icon: CheckCircle2 },
  timed_out: { label: 'Timed out', tone: 'warning', icon: Clock },
  // domains and sites
  pending: { label: 'Pending', tone: 'warning', icon: Hourglass },
  verified: { label: 'Verified', tone: 'info', icon: CheckCircle2 },
  published: { label: 'Published', tone: 'success', icon: CheckCircle2 },
};

