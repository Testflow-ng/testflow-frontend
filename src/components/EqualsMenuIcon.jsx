import { cn } from '../utils/cn.js';

/**
 * Two stacked rounded bars. On hover/press of the parent `group` the bars slide
 * apart; when `open` they morph into an X.
 */
function EqualsMenuIcon({ size = 22, open = false, className }) {
  const barStyle = { transformBox: 'fill-box', transformOrigin: 'center' };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <rect
        x="4"
        y="8.5"
        width="16"
        height="2.4"
        rx="1.2"
        fill="currentColor"
        style={barStyle}
        className={cn(
          'transition-transform duration-300 ease-out',
          open
            ? 'translate-y-[2.3px] rotate-45'
            : 'group-hover:translate-x-[2px] group-active:translate-x-[3px]',
        )}
      />
      <rect
        x="4"
        y="13.1"
        width="16"
        height="2.4"
        rx="1.2"
        fill="currentColor"
        style={barStyle}
        className={cn(
          'transition-transform duration-300 ease-out',
          open
            ? '-translate-y-[2.3px] -rotate-45'
            : 'group-hover:-translate-x-[2px] group-active:-translate-x-[3px]',
        )}
      />
    </svg>
  );
}

export default EqualsMenuIcon;
