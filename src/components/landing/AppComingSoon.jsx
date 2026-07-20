import Reveal from './Reveal.jsx';
import StoreBadges from './StoreBadges.jsx';

function AppComingSoon() {
  return (
    <section className="bg-background py-16 sm:py-24">
      <Reveal className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="flex flex-col items-center rounded-3xl border border-border bg-surface px-6 py-14 text-center sm:px-12">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs font-semibold text-foreground-strong">
            Coming soon
          </span>

          <img
            src="/brand/logo.webp"
            alt=""
            aria-hidden="true"
            width={72}
            height={72}
            className="mt-6 h-16 w-16 rounded-2xl border border-border"
          />

          <h2 className="mt-6 max-w-2xl font-heading text-3xl font-extrabold tracking-tight text-foreground-strong sm:text-4xl">
            TestFlow is coming to mobile
          </h2>
          <p className="mt-4 max-w-xl leading-relaxed text-muted">
            Take your practice anywhere. Native apps for iPhone and Android are on the way. Use
            TestFlow in your browser today, and be ready the day the apps land.
          </p>

          <StoreBadges className="mt-8 flex flex-col items-center gap-3 sm:flex-row" />
        </div>
      </Reveal>
    </section>
  );
}

export default AppComingSoon;
