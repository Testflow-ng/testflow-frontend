import SponsoredCard from './SponsoredCard.jsx';
import { cn } from '../../utils/cn.js';

/**
 * Live preview next to the ad form: shows exactly how the card looks to a student, filling in
 * placeholders until the advertiser has typed something. Pass the form values straight in.
 */
function AdPreview({ title, description, imageUrl, ctaType = 'whatsapp', className }) {
  return (
    <section aria-label="Ad preview" className={cn('rounded-[28px] bg-[var(--brand-lavender)]/60 p-5', className)}>
      <p className="mb-3 text-xs font-bold uppercase tracking-[0.1em] text-primary">What students see</p>
      <div className="mx-auto max-w-[24rem] rounded-[24px] bg-background p-3">
        <p className="mb-3 px-2 text-sm font-semibold text-foreground-strong">Practice complete</p>
        <SponsoredCard
          ad={{ title: title || 'Your ad title', description: description || 'A short line that makes students want to tap.', imageUrl }}
          cta={{ type: ctaType }}
        />
      </div>
      <p className="mt-3 text-center text-xs text-muted">Ads are reviewed before they go live.</p>
    </section>
  );
}

export default AdPreview;
