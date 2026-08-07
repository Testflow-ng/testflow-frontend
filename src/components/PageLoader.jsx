import Mascot from './brand/Mascot.jsx';

/**
 * Full-page loading state.
 *
 * Flo runs in and bobs while the page resolves. Deliberately restrained
 * compared to the splash: this appears on ordinary route loads, several times a
 * session, and an elaborate performance here would make the app feel slower
 * rather than friendlier. The entrance is 620ms and the idle is a 4px float.
 *
 * `label` is still announced to screen readers. The mascot is decoration; the
 * status text is the actual loading indicator.
 */
function PageLoader({ label = 'Loading' }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 py-20">
      <Mascot mood="neutral" size={84} animation="runIn" className="text-primary" />
      <p role="status" className="text-[13px] font-medium text-muted">
        {label}
      </p>
    </div>
  );
}

export default PageLoader;
