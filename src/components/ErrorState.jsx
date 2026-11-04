import { useRouteError, useNavigate, isRouteErrorResponse } from 'react-router-dom';
import { useOnlineStatus } from '../hooks/useOnlineStatus.js';
import Mascot from './brand/Mascot.jsx';
import { buttonClasses } from './ui/buttonClasses.js';

/**
 * The screen when something actually breaks.
 *
 * Replaces React Router's default error element, which renders a raw stack
 * trace on a white page. Three rules from the app's error guidance apply here:
 *
 * 1. **Never say "Something went wrong".** It tells the user nothing and
 *    leaves them with no next move.
 * 2. **Distinguish no-connection from server-error from this-is-gone.** They
 *    need different words and different actions. A student in a lecture
 *    basement with no signal should not be told the app is broken.
 * 3. **Always offer a way out.** Retry first, then a route home.
 *
 * The technical detail is kept, collapsed, because a bug the user can quote
 * back is a bug that gets fixed.
 */
function ErrorState() {
  const error = useRouteError();
  const navigate = useNavigate();
  const online = useOnlineStatus();

  const notFound = isRouteErrorResponse(error) && error.status === 404;

  const copy = !online
    ? {
        mood: 'thinking',
        animation: 'lookAround',
        title: 'No connection',
        body: 'Your device is offline. This page needs the network. Anything you already answered is saved.',
        action: 'Try again',
      }
    : notFound
      ? {
          mood: 'surprised',
          animation: 'slideIn',
          title: 'That page is gone',
          body: 'The link may be old, or the paper may have been removed.',
          action: 'Back to dashboard',
        }
      : {
          mood: 'sad',
          animation: 'slump',
          title: 'This screen failed to load',
          body: 'Not your fault. Reloading usually clears it. If it keeps happening, tell us what you were doing.',
          action: 'Reload',
        };

  const detail = error?.message ?? (isRouteErrorResponse(error) ? error.statusText : null);

  return (
    <section className="flex min-h-svh flex-col items-center justify-center gap-3 pb-16 pt-12 text-center tf-gutter">
      <Mascot mood={copy.mood} animation={copy.animation} size={112} className="text-primary" />

      <h1 className="mt-2 font-heading text-[1.5rem] font-extrabold tracking-tight text-foreground-strong">
        {copy.title}
      </h1>
      <p className="max-w-[36ch] text-[15px] leading-relaxed text-muted">{copy.body}</p>

      <div className="mt-5 flex w-full max-w-xs flex-col gap-2">
        <button
          type="button"
          onClick={() => (notFound ? navigate('/dashboard') : window.location.reload())}
          className={buttonClasses({ size: 'lg', fullWidth: true })}
        >
          {copy.action}
        </button>
        {!notFound && (
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className={buttonClasses({ variant: 'ghost', size: 'lg', fullWidth: true })}
          >
            Back to dashboard
          </button>
        )}
      </div>

      {detail && (
        <details className="mt-8 max-w-full">
          <summary className="cursor-pointer text-[12px] text-muted">Technical detail</summary>
          <pre className="mt-2 max-w-[90vw] overflow-x-auto rounded-xl bg-surface-strong p-3 text-left font-mono text-[11px] text-muted">
            {String(detail)}
          </pre>
        </details>
      )}
    </section>
  );
}

export default ErrorState;
