/**
 * Two stacked rounded bars, the "equals" hamburger mark used in the header.
 */
function EqualsMenuIcon({ size = 22, className }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <rect x="4" y="8.5" width="16" height="2.4" rx="1.2" fill="currentColor" />
      <rect x="4" y="13.1" width="16" height="2.4" rx="1.2" fill="currentColor" />
    </svg>
  );
}

export default EqualsMenuIcon;
