import Logo from './Logo.jsx';

/**
 * Full-page loading state: the TestFlow mark and three quiet dots.
 * `label` is announced to screen readers; the mark is decoration.
 */
function PageLoader({ label = 'Loading' }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-5 py-20">
      <Logo size={52} withWordmark={false} />
      <div role="status" aria-label={label} className="flex items-center gap-2">
        <span className="size-2 animate-bounce rounded-full bg-primary/70 [animation-delay:-0.3s]" />
        <span className="size-2 animate-bounce rounded-full bg-primary/70 [animation-delay:-0.15s]" />
        <span className="size-2 animate-bounce rounded-full bg-primary/70" />
      </div>
    </div>
  );
}

export default PageLoader;
