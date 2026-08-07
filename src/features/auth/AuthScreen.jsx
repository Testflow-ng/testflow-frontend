/**
 * Auth shell.
 *
 * Replaces the centred stack — logo, big heading, grey subheading, bordered
 * card — which is the single most-reproduced landing shape on the web and said
 * nothing about what is behind the login.
 *
 * Two decisions carry it:
 *
 * 1. **Left aligned.** Text that starts at the same x as the fields below it
 *    reads as a form, not a marketing hero, and gives the eye one edge to
 *    track down the screen instead of re-centring on every line.
 * 2. **Same furniture as the dashboard.** The fields sit on the ruled sheet
 *    the signed-in app is built from, so the first screen already teaches the
 *    shape of the product. The old version nested bordered inputs inside a
 *    bordered card, which is two frames around the same content.
 *
 * The wordmark is small and top-left rather than a 44px centred crest — a
 * student signing in knows what app they opened.
 */
function AuthScreen({ title, subtitle, children, footer }) {
  return (
    <section className="mx-auto flex w-full max-w-[26rem] flex-1 flex-col pb-[calc(2.5rem+var(--safe-bottom))] pt-8 tf-gutter sm:justify-center sm:pt-0">
      {/*
        No wordmark here. The sticky header already carries the logo and name
        on every auth route, and repeating it 60px lower was the same brand
        stated twice before the first field.
      */}
      <h1 className="font-heading text-[2rem] font-extrabold leading-[1.08] tracking-[-0.03em] text-foreground-strong">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-2 max-w-[34ch] text-[15px] leading-relaxed text-muted">{subtitle}</p>
      )}

      <div className="mt-7">{children}</div>

      {footer && <p className="mt-7 text-[15px] text-muted">{footer}</p>}
    </section>
  );
}

export default AuthScreen;
