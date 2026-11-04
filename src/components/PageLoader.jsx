import Logo from './Logo.jsx';
import Spinner from './ui/Spinner.jsx';

/**
 * Full-page loading state: the TestFlow mark over the brand spinner.
 * `label` is announced to screen readers; the mark is decoration.
 */
function PageLoader({ label = 'Loading' }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 py-20">
      <Logo size={52} withWordmark={false} />
      <Spinner size="lg" label={label} className="text-primary" />
    </div>
  );
}

export default PageLoader;
