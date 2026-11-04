/** Small layout helpers for previews. */
export const Row = ({ children, className = '' }) => <div className={`flex flex-wrap items-center gap-3 ${className}`}>{children}</div>;
export const W = ({ children, w = 320 }) => <div style={{ width: '100%', maxWidth: w }}>{children}</div>;
