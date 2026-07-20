/**
 * Two stacked rounded bars, the "equals" hamburger mark used in the header.
 * The bars slide in opposite directions on hover/press of the parent `group`.
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
      <rect
        x="4"
        y="8.5"
        width="16"
        height="2.4"
        rx="1.2"
        fill="currentColor"
        className="origin-center transition-transform duration-300 ease-out group-hover:translate-x-[2px] group-active:translate-x-[3px]"
      />
      <rect
        x="4"
        y="13.1"
        width="16"
        height="2.4"
        rx="1.2"
        fill="currentColor"
        className="origin-center transition-transform duration-300 ease-out group-hover:-translate-x-[2px] group-active:-translate-x-[3px]"
      />
    </svg>
  );
}

export default EqualsMenuIcon;
