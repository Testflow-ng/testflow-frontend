import { forwardRef } from 'react';
import { Search, X } from 'lucide-react';
import Input from './Input.jsx';

/** Search box: leading magnifier and a clear button once there is text. Controlled via value/onChange. */
const SearchField = forwardRef(function SearchField(
  { value = '', onChange, onClear, placeholder = 'Search', 'aria-label': ariaLabel = 'Search', ...props },
  ref,
) {
  return (
    <Input
      ref={ref}
      type="search"
      inputMode="search"
      enterKeyHint="search"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      aria-label={ariaLabel}
      leadingAdornment={<Search size={17} strokeWidth={1.75} aria-hidden="true" />}
      trailingAdornment={
        value ? (
          <button
            type="button"
            onClick={onClear}
            aria-label="Clear search"
            className="flex size-7 items-center justify-center rounded-full text-muted hover:bg-surface-strong hover:text-foreground-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <X size={15} aria-hidden="true" />
          </button>
        ) : null
      }
      {...props}
    />
  );
});

export default SearchField;
