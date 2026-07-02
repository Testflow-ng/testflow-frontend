import Logo from './Logo.jsx';

/**
 * Full-screen branded boot splash: the logo, wordmark, and a three-dot loader.
 * The dots use negative animation delays so they stagger immediately; under
 * `prefers-reduced-motion` the global reset stills them.
 */
function SplashScreen() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-8 bg-background">
      <div className="flex flex-col items-center gap-3">
        <Logo size={64} withWordmark={false} />
        <span className="font-heading text-xl font-semibold tracking-tight text-foreground-strong">
          TestFlow
        </span>
      </div>
      <div className="flex items-center gap-2" role="status" aria-label="Loading TestFlow">
        <span className="size-2.5 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]" />
        <span className="size-2.5 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]" />
        <span className="size-2.5 animate-bounce rounded-full bg-primary" />
      </div>
    </div>
  );
}

export default SplashScreen;
