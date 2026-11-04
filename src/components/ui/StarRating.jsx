import { useState } from 'react';
import { Star } from 'lucide-react';
import { cn } from '../../utils/cn.js';

/**
 * A 1 to 5 star rating.
 *
 * Five native radios behind five stars, which is what makes it behave like every other radio
 * group: the arrow keys move the selection, the value is announced as "3 stars", and a screen
 * reader says which one is checked. A row of clickable icons would have looked the same and
 * been unusable without a mouse.
 *
 * `readOnly` swaps the radios for plain glyphs, for showing a rating that was already given.
 * The component holds no value of its own .it reports the choice and the caller decides.
 */
function StarRating({
  value = 0,
  onValueChange,
  label = 'Rating',
  name = 'rating',
  size = 30,
  readOnly = false,
  className,
}) {
  const [hovered, setHovered] = useState(0);
  const shown = hovered || value;

  const star = (n) => (
    <Star
      size={size}
      strokeWidth={1.8}
      aria-hidden="true"
      className={cn(
        'transition-transform motion-reduce:transition-none',
        n <= shown ? 'fill-current text-warning' : 'text-border-strong',
        !readOnly && n <= hovered && 'scale-110',
      )}
    />
  );

  if (readOnly) {
    return (
      <span
        role="img"
        aria-label={`${value} out of 5`}
        className={cn('inline-flex items-center gap-0.5', className)}
      >
        {[1, 2, 3, 4, 5].map(star)}
      </span>
    );
  }

  return (
    <div
      role="radiogroup"
      aria-label={label}
      className={cn('inline-flex items-center gap-0.5', className)}
      onMouseLeave={() => setHovered(0)}
    >
      {[1, 2, 3, 4, 5].map((n) => (
        <label
          key={n}
          onMouseEnter={() => setHovered(n)}
          className="cursor-pointer rounded-full p-0.5 focus-within:ring-2 focus-within:ring-primary"
        >
          <input
            type="radio"
            name={name}
            value={n}
            checked={value === n}
            onChange={() => onValueChange?.(n)}
            className="sr-only"
          />
          {star(n)}
          <span className="sr-only">
            {n} star{n === 1 ? '' : 's'}
          </span>
        </label>
      ))}
    </div>
  );
}

export default StarRating;
