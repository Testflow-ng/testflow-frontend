export const timeAgo = (value) => {
  if (!value) return '';
  const s = Math.max(0, (Date.now() - new Date(value).getTime()) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  return new Date(value).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
};

export const fmtDate = (value) => (value ? new Date(value).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : '-');
