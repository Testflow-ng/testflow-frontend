import Mascot from './brand/Mascot.jsx';

/**
 * Boot splash.
 *
 * Flo walks on from the left, then the wordmark and the loader fade up behind
 * him. This is the one screen in the app where a full entrance is unambiguously
 * right: it is seen once per cold start, it is already dead time waiting on the
 * session check, and it is the app's first impression.
 *
 * The staggered fade is CSS rather than framer-motion on purpose. This renders
 * before the app has hydrated, and a JS-driven animation would compete with the
 * very work the user is waiting on.
 */
function SplashScreen() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-7 bg-background">
      <Mascot mood="happy" size={132} animation="walkIn" className="text-primary" />

      <div className="flex flex-col items-center gap-4">
        <span
          className="tf-rise-in font-heading text-xl font-bold tracking-tight text-foreground-strong"
          style={{ animationDelay: '480ms' }}
        >
          TestFlow
        </span>

        <div
          className="tf-rise-in flex items-center gap-2"
          style={{ animationDelay: '620ms' }}
          role="status"
          aria-label="Loading TestFlow"
        >
          <span className="size-2 animate-bounce rounded-full bg-primary/70 [animation-delay:-0.3s]" />
          <span className="size-2 animate-bounce rounded-full bg-primary/70 [animation-delay:-0.15s]" />
          <span className="size-2 animate-bounce rounded-full bg-primary/70" />
        </div>
      </div>
    </div>
  );
}

export default SplashScreen;
