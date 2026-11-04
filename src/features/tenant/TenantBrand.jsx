import { cn } from '../../utils/cn.js';
import { useTenant } from './TenantContext.js';

/** The organisation's logo and name where "Testflow" would normally be. */
function TenantBrand({ size = 36, className, light = false }) {
  const { brand } = useTenant();
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      {brand.logoUrl ? (
        <img src={brand.logoUrl} alt="" width={size} height={size} className="shrink-0 rounded-lg object-contain" style={{ width: size, height: size }} />
      ) : (
        <span aria-hidden="true" className="flex shrink-0 items-center justify-center rounded-xl bg-primary font-heading font-extrabold text-primary-foreground" style={{ width: size, height: size, fontSize: size * 0.45 }}>{(brand.name ?? '?').slice(0, 1).toUpperCase()}</span>
      )}
      <span className={cn('font-heading text-lg font-extrabold tracking-tight', light ? 'text-white' : 'text-foreground-strong')}>{brand.name}</span>
    </span>
  );
}

export default TenantBrand;
