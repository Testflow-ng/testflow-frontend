import Spinner from './ui/Spinner.jsx';

/** Centered loading state that fills the available page area. */
function PageLoader({ label = 'Loading' }) {
  return (
    <div className="flex flex-1 items-center justify-center py-24">
      <Spinner size="lg" label={label} className="text-primary" />
    </div>
  );
}

export default PageLoader;
