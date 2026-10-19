import Logo from './Logo.jsx';
import Spinner from './ui/Spinner.jsx';

/**
 * Boot splash: the TestFlow mark, the wordmark and a quiet loader.
 * Plain CSS on purpose: it renders before the app has hydrated.
 */
function SplashScreen() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-background">
      <Logo size={72} withWordmark={false} />

      <div className="flex flex-col items-center gap-4">
        <span className="tf-rise-in font-heading text-xl font-bold tracking-tight text-foreground-strong">
          TestFlow
        </span>

        <div className="tf-rise-in" style={{ animationDelay: '160ms' }}>
          <Spinner size="lg" label="Loading TestFlow" className="text-primary" />
        </div>
      </div>
    </div>
  );
}

export default SplashScreen;
