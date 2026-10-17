import { cn } from '../../utils/cn.js';
import { BOOK_COLORS, BOOK_COVER_TEXT, BOOK_PAGE_EDGE } from './bookColors.js';

/*
  Cover sizes. A shelf cell drives its own width with the grid, so `full` opts
  out of the cap; the named sizes are for single books (a hero, a detail row).
*/
const sizes = {
  sm: 'max-w-[7rem]',
  md: 'max-w-[10rem]',
  lg: 'max-w-[13rem]',
  full: '',
};

/**
 * A course as a book on a shelf: the code is printed at the top of the cover,
 * the TestFlow mark is stamped in the middle, and the title sits underneath.
 *
 * Built from gradients rather than an image, so it stays crisp at any size and
 * takes `color` at runtime. The whole cover is decorative .the accessible name
 * comes from a visually-hidden `code: title` .and passing `onSelect` turns the
 * book into a button with the shared focus ring and press feedback.
 *
 * `color`: ink | red | blue | green | amber | violet | teal   `size`: sm | md | lg | full
 * `showTitle={false}` when the title is already printed next to the book.
 */
function Book({ code, title, color = 'ink', size = 'md', showTitle = true, onSelect, className, ...props }) {
  const theme = BOOK_COLORS[color] ?? BOOK_COLORS.ink;
  const Card = onSelect ? 'button' : 'div';

  return (
    <Card
      {...(onSelect ? { type: 'button', onClick: onSelect } : {})}
      className={cn(
        'group relative block w-full text-left',
        onSelect &&
          'tf-pressable cursor-pointer rounded-[10px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
        sizes[size] ?? sizes.md,
        className,
      )}
      {...props}
    >
      <span className="sr-only">{code ? `${code}: ${title}` : title}</span>

      <span
        aria-hidden="true"
        className={cn(
          'relative block aspect-[2/3] w-full',
          onSelect &&
            'transition-transform duration-300 group-hover:-translate-y-1 motion-reduce:transition-none motion-reduce:group-hover:translate-y-0',
        )}
      >
        {/* Paper block, peeking out past the cover on the fore-edge and the tail. */}
        <span
          className="absolute inset-y-[2.5%] -right-[6px] w-[6px] rounded-r-[3px]"
          style={{
            backgroundImage: `repeating-linear-gradient(180deg, #f7f3e8 0 1.5px, rgba(27,67,50,0.18) 1.5px 3px)`,
          }}
        />
        <span
          className="absolute inset-x-[3%] -bottom-[3px] h-[6px] rounded-b-[3px]"
          style={{ background: BOOK_PAGE_EDGE }}
        />

        {/* Cover board. The weave sits over the gradient so the colour still reads flat. */}
        <span
          className="absolute inset-0 overflow-hidden rounded-[4px] rounded-r-[7px]"
          style={{
            backgroundImage: [
              `repeating-linear-gradient(45deg, rgba(255,255,255,0.045) 0 1px, rgba(0,0,0,0) 1px 3px)`,
              `linear-gradient(145deg, ${theme.light} 0%, ${theme.cover} 44%, ${theme.dark} 100%)`,
            ].join(', '),
            boxShadow:
              '0 16px 26px -14px rgba(27,67,50,0.5), 0 3px 8px -4px rgba(27,67,50,0.35), inset 0 -1px 0 rgba(0,0,0,0.28)',
          }}
        >
          {/* Spine, with the crease where it meets the cover. */}
          <span
            className="absolute inset-y-0 left-0 w-[12%]"
            style={{
              backgroundImage: `linear-gradient(90deg, ${theme.dark} 0%, ${theme.dark} 46%, rgba(0,0,0,0.36) 100%)`,
            }}
          />
          <span className="absolute inset-y-0 left-[12%] w-px bg-[rgba(255,255,255,0.26)]" />

          {/* The printed frame every cover has. */}
          <span className="absolute inset-y-[7%] left-[17%] right-[7%] rounded-[2px] border border-[rgba(255,255,255,0.24)]" />

          {/* Course code, printed at the head of the cover. */}
          <span className="absolute left-[17%] right-[7%] top-[11%] block text-center">
            <span
              className="block text-[0.62rem] font-bold uppercase tracking-[0.18em] leading-none"
              style={{ color: BOOK_COVER_TEXT }}
            >
              {code}
            </span>
            <span className="mx-auto mt-1.5 block h-px w-6 bg-[rgba(255,255,255,0.45)]" />
          </span>

          {/* The TestFlow mark, stamped in the middle. */}
          <span className="absolute inset-0 grid place-items-center">
            <span
              className="grid aspect-square w-[34%] place-items-center rounded-full"
              style={{ background: 'rgba(248,244,234,0.94)' }}
            >
              <img src="/brand/logo.webp" alt="" width="64" height="64" className="w-[62%]" />
            </span>
          </span>

          {/* Fore-edge shadow, so the cover reads as curving away. */}
          <span className="absolute inset-y-0 right-0 w-[3px] bg-gradient-to-l from-[rgba(0,0,0,0.24)] to-transparent" />
        </span>
      </span>

      {showTitle ? (
        <span
          aria-hidden="true"
          className="mt-3 block font-heading text-[0.85rem] font-bold leading-snug text-foreground-strong line-clamp-2"
        >
          {title}
        </span>
      ) : null}
    </Card>
  );
}

export default Book;
