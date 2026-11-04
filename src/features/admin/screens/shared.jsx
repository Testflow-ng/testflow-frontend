import { Banner, Skeleton } from '../../../components/ui/index.js';

/** The standard error strip for an admin query. */
export const LoadError = ({ error, what = 'this page' }) => (
  <Banner variant="danger">{error?.message ?? `Could not load ${what}.`} Check your connection and try again.</Banner>
);

export const TableSkeleton = ({ rows = 6 }) => (
  <div className="space-y-2" role="status" aria-label="Loading">
    {Array.from({ length: rows }, (_, i) => <Skeleton key={i} className="h-12 w-full rounded-xl" />)}
  </div>
);
