import { cn } from '../utils/cn.js';

/**
 * TestFlow brand lockup. The mark is a transparent PNG-derived WebP that reads
 * well on light and dark. When the wordmark is shown, the mark is decorative
 * (the text carries the accessible name); mark-only gets an alt of "TestFlow".
 */
function Logo({ size = 32, withWordmark = true, className }) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <img
        src="/brand/logo.webp"
        alt={withWordmark ? '' : 'TestFlow'}
        aria-hidden={withWordmark ? 'true' : undefined}
        width={size}
        height={size}
        className="shrink-0"
      />
      {withWordmark ? (
        <span className="font-heading text-lg font-semibold tracking-tight text-foreground-strong">
          TestFlow
        </span>
      ) : null}
    </span>
  );
}

export default Logo;
