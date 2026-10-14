import { cn } from '../../utils/cn.js';

/**
 * Flo, the TestFlow mascot: an exam script that got up and walked.
 *
 * Redesigned in the landing-page language: a soft lavender sheet, ink-green face and limbs,
 * an indigo folded corner (the dog-ear is the brand mark), lime highlighter gloves and a lime
 * header stripe. Colours come from the --brand-* tokens in global.css, not from currentColor,
 * so Flo looks the same wherever he is placed.
 *
 * Vector rather than the generated PNG. The render was 1.4MB with a neon glow
 * and a dark backdrop baked into the pixels, so it could not sit on a light
 * surface and could not change expression. As SVG the whole cast of moods is a
 * few KB, stays crisp at any size, inherits the theme through `currentColor`,
 * and every part of it can move.
 *
 * ## Anatomy
 *
 * Drawn on a 72x76 grid. The body path's closing segment IS the fold diagonal,
 * so the dog-ear is part of the silhouette rather than a shape laid on top.
 * Arms and feet sit behind the body so the sheet stays a clean rectangle.
 *
 * ## Moods
 *
 * A mood is a combination of eyes, mouth, arm poses and optional props. They
 * are data, not separate drawings, so adding one is a table entry rather than
 * a new asset. `Mascot` renders a mood statically; `animation` layers movement
 * on top (see mascotMotion.css).
 *
 * ## Accessibility
 *
 * The mascot is decoration in every current placement: the state it reflects is
 * always also stated in text nearby ("needs work", "You are offline"). So it
 * defaults to `aria-hidden`. Pass `title` only where it carries meaning that
 * exists nowhere else on the screen.
 */

/*
 * Arm poses: a stroked limb plus a filled hand at the end.
 *
 * The first version drew arms as small filled blobs tucked behind the body.
 * At the ~90px the mascot actually renders, a raised blob read as a nub on the
 * shoulder, which made `thumbsUp` and `confident` indistinguishable from
 * `happy` — the exact moods whose whole job is to look different.
 *
 * A limb that clearly leaves the silhouette, ending in a round hand, is
 * legible at every size. `hand` is the circle centre; `thumb` adds the stub
 * that turns a fist into a thumbs-up.
 */
const ARMS = {
  // Hanging at the side, the default.
  restL: { d: 'M14 38C10 39 8 43 8.5 46.5', hand: [8, 49] },
  restR: { d: 'M58 38C62 39 64 43 63.5 46.5', hand: [64, 49] },

  // Raised overhead. Clears the top of the body (y=6) so it reads as "up".
  upL: { d: 'M14 34C10 30 7 22 6.5 16', hand: [6, 12.5] },
  upR: { d: 'M58 34C62 30 65 22 65.5 16', hand: [66, 12.5] },

  // Out and up, palm forward: waving, encouraging.
  waveR: { d: 'M58 35C62.5 32 66 26 67 21', hand: [67.5, 17.5] },

  // Bent up toward the face: thinking.
  thinkR: { d: 'M58 40C61 38 62 34 61 30', hand: [60.5, 27] },

  // Meeting in front of the body, below the mouth: applauding.
  clapL: { d: 'M14 40C18 44 23 48 27.5 50', hand: [30, 51] },
  clapR: { d: 'M58 40C54 44 49 48 44.5 50', hand: [42, 51] },
};

/*
  The stub that makes a raised fist a thumbs-up. Drawn as a short, thick,
  round-capped stroke rising straight out of the hand circle at (66, 12.5),
  rather than as an outlined shape floating beside it: at render size an
  outline read as a detached hook, while a capsule growing out of the fist
  reads instantly as a thumb.
*/
const THUMB = 'M66 10.5V5.5';


/* Eyebrows per mood (left, right). Raised/slanted brows carry most of the emotion at small sizes. */
const BROWS = {
  sad: ['M23.5 26.5 L31 28.6', 'M48.5 26.5 L41 28.6'],
  surprised: ['M23.5 25.4 Q28 22.4 32.5 25.4', 'M39.5 25.4 Q44 22.4 48.5 25.4'],
  excited: ['M23.8 26 Q28 23.4 32 26', 'M40 26 Q44 23.4 48.2 26'],
  thinking: [null, 'M39.5 25.6 Q44 23 48.5 25.2'],
  confident: ['M23.5 27.4 Q28 26.4 32.5 27.2', 'M39.5 25.4 Q44 23.6 48.5 25.4'],
  encouraging: ['M23.8 27 Q28 25.6 32 27', 'M40 27 Q44 25.6 48.2 27'],
};

const MOODS = {
  happy: {
    mouth: 'M30 40 Q36 46.4 42 40',
    eyes: 'squint',
    arms: ['restL', 'restR'],
  },
  thumbsUp: {
    mouth: 'M30.5 40.5 Q36 46 41.5 40.5',
    eyes: 'squint',
    arms: ['restL', 'upR'],
    thumb: true,
  },
  excited: {
    mouth: 'open',
    eyes: 'wide',
    arms: ['upL', 'upR'],
  },
  sad: {
    // Inverted curve. The only mood that turns the mouth down.
    mouth: 'M30.5 44 Q36 38.6 41.5 44',
    eyes: 'down',
    arms: ['restL', 'restR'],
    tear: true,
  },
  thinking: {
    mouth: 'M32.5 42.5 H39.5',
    eyes: 'up',
    arms: ['restL', 'thinkR'],
    dots: true,
  },
  sleeping: {
    mouth: 'M33 42.5 Q36 44.6 39 42.5',
    eyes: 'closed',
    arms: ['restL', 'restR'],
    zzz: true,
  },
  confident: {
    // An asymmetric smirk. `confident` previously reused the thumbs-up pose
    // and was indistinguishable from it; a lopsided mouth and an easy stance
    // reads as self-assured without borrowing another mood's gesture.
    mouth: 'M30 41.4 Q34.5 45.6 41.5 39.8',
    eyes: 'open',
    arms: ['restL', 'restR'],
  },
  surprised: {
    mouth: 'o',
    eyes: 'wide',
    arms: ['restL', 'restR'],
  },
  encouraging: {
    mouth: 'M30.5 40.5 Q36 45.8 41.5 40.5',
    eyes: 'open',
    arms: ['restL', 'waveR'],
  },
  applauding: {
    mouth: 'open',
    eyes: 'squint',
    arms: ['clapL', 'clapR'],
    clap: true,
    front: true,
  },
  neutral: {
    mouth: 'M31 41 Q36 45.4 41 41',
    eyes: 'open',
    arms: ['restL', 'restR'],
  },
};

/** Eye sets. Each returns the eye group for one side, mirrored by `cx`. */
function Eyes({ variant }) {
  const cxs = [28, 44];

  if (variant === 'closed') {
    return (
      <g stroke="var(--flo-ink)" strokeWidth={2.4}>
        {cxs.map((cx) => (
          <path key={cx} d={`M${cx - 3.6} 33 Q${cx} 36.4 ${cx + 3.6} 33`} />
        ))}
      </g>
    );
  }

  if (variant === 'squint') {
    return (
      <g stroke="var(--flo-ink)" strokeWidth={2.6}>
        {cxs.map((cx) => (
          <path key={cx} d={`M${cx - 3.6} 34.4 Q${cx} 30 ${cx + 3.6} 34.4`} />
        ))}
      </g>
    );
  }

  const geometry = {
    open: { rx: 3.8, ry: 4.4, cy: 33, hi: 1.3 },
    wide: { rx: 4.5, ry: 5.2, cy: 32.6, hi: 1.6 },
    up: { rx: 3.8, ry: 4.4, cy: 31.8, hi: 1.3 },
    down: { rx: 3.5, ry: 3.8, cy: 34.2, hi: 1.1 },
  }[variant] ?? { rx: 3.8, ry: 4.4, cy: 33, hi: 1.3 };

  return (
    <g className="tf-mascot-eyes" strokeWidth={0}>
      {cxs.map((cx) => (
        <ellipse key={cx} cx={cx} cy={geometry.cy} rx={geometry.rx} ry={geometry.ry} fill="var(--flo-ink)" />
      ))}
      {/* Two catchlights per eye: the big one gives life, the small one gives depth. */}
      {cxs.map((cx) => (
        <g key={cx} fill="#fff">
          <circle cx={cx + 1.4} cy={geometry.cy - 1.8} r={geometry.hi} />
          <circle cx={cx - 1.4} cy={geometry.cy + 1.7} r={geometry.hi * 0.5} />
        </g>
      ))}
    </g>
  );
}

function Mouth({ shape }) {
  if (shape === 'open') {
    return (
      <g>
        <path
          d="M30 40 Q36 40 42 40 Q42 47.5 36 47.5 Q30 47.5 30 40Z"
          fill="var(--flo-ink)"
          stroke="var(--flo-ink)"
          strokeWidth={2.2}
        />
        {/* Tongue in brand indigo. */}
        <path d="M32.6 45.6 Q36 43.2 39.4 45.6 Q38 47.4 36 47.4 Q34 47.4 32.6 45.6Z" fill="var(--flo-accent)" stroke="none" />
      </g>
    );
  }
  if (shape === 'o') {
    return <ellipse cx="36" cy="43" rx="3.2" ry="4" fill="var(--flo-ink)" stroke="var(--flo-ink)" strokeWidth={2} />;
  }
  return <path d={shape} stroke="var(--flo-ink)" strokeWidth={2.6} />;
}

function Brows({ mood }) {
  const set = BROWS[mood];
  if (!set) return null;
  return (
    <g stroke="var(--flo-ink)" strokeWidth={2.2} opacity={0.9}>
      {set.map((d, i) => (d ? <path key={i} d={d} /> : null))}
    </g>
  );
}

/** A limb plus its glove (lime, outlined in ink), and optionally a thumb. */
function Arm({ pose, thumb }) {
  const [hx, hy] = pose.hand;
  return (
    <>
      <path d={pose.d} stroke="var(--flo-ink)" strokeWidth={3} />
      {thumb && <path d={THUMB} stroke="var(--flo-ink)" strokeWidth={5.2} />}
      {thumb && <path d={THUMB} stroke="var(--flo-hi)" strokeWidth={2.2} />}
      <circle cx={hx} cy={hy} r={3.9} fill="var(--flo-hi)" stroke="var(--flo-ink)" strokeWidth={1.8} />
    </>
  );
}

function Mascot({
  mood = 'neutral',
  size = 96,
  animation,
  className,
  title,
  showTicks = true,
}) {
  const spec = MOODS[mood] ?? MOODS.neutral;
  const [armL, armR] = spec.arms;

  return (
    <svg
      viewBox="0 0 72 76"
      width={size}
      height={(size * 76) / 72}
      role={title ? 'img' : 'presentation'}
      aria-label={title || undefined}
      aria-hidden={title ? undefined : 'true'}
      className={cn('tf-mascot shrink-0 overflow-visible', animation && `tf-m-${animation}`, className)}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Ground shadow and feet sit behind the body. */}
      <ellipse cx="36" cy="66" rx="19" ry="2.8" fill="var(--flo-ink)" opacity="0.12" stroke="none" />
      <g className="tf-mascot-feet" stroke="none">
        <rect x="19.5" y="58.6" width="14" height="7.4" rx="3.7" fill="var(--flo-ink)" />
        <rect x="38.5" y="58.6" width="14" height="7.4" rx="3.7" fill="var(--flo-ink)" />
      </g>

      {/* Arms behind the body: every pose except the ones held in front. */}
      {!spec.front && (
        <g className="tf-mascot-arms">
          <Arm pose={ARMS[armL]} />
          <Arm pose={ARMS[armR]} thumb={spec.thumb} />
        </g>
      )}

      {/* The sheet: soft lavender with an ink edge. */}
      <path
        d="M27 6H49C54.5 6 58 9.5 58 15V51C58 56.5 54.5 60 49 60H23C17.5 60 14 56.5 14 51V19Z"
        fill="var(--flo-body)"
        stroke="var(--flo-ink)"
        strokeWidth={2.6}
      />

      {/* The dog-ear, filled indigo: the brand mark in miniature. */}
      <path d="M27 6V13C27 16.5 24.5 19 21 19H14Z" fill="var(--flo-accent)" stroke="var(--flo-ink)" strokeWidth={2.2} />

      {/* Lime highlighter stripe, above the eyebrows and clear of the fold. */}
      <path d="M31 19.6H51" stroke="var(--flo-hi)" strokeWidth={3.6} />

      {/* Rosy cheeks in the brand accent. */}
      <g fill="var(--flo-accent)" opacity="0.16" stroke="none">
        <ellipse cx="22" cy="40" rx="3.6" ry="2.4" />
        <ellipse cx="50" cy="40" rx="3.6" ry="2.4" />
      </g>

      <Brows mood={mood} />
      <Eyes variant={spec.eyes} />
      <Mouth shape={spec.mouth} />

      {/* Arms held in front, drawn over the sheet so they read as hands. */}
      {spec.front && (
        <g className={cn('tf-mascot-arms', spec.clap && 'tf-mascot-clap')}>
          <Arm pose={ARMS[armL]} />
          <Arm pose={ARMS[armR]} />
        </g>
      )}

      {spec.tear && (
        <path
          d="M31 38.5C31 38.5 29.4 41.4 29.4 42.6C29.4 43.6 30.1 44.3 31 44.3C31.9 44.3 32.6 43.6 32.6 42.6C32.6 41.4 31 38.5 31 38.5Z"
          className="tf-mascot-tear"
          fill="#7aa7ff"
          stroke="none"
        />
      )}

      {spec.dots && (
        <g fill="var(--flo-accent)" stroke="none">
          <circle cx="64" cy="19" r="2.2" className="tf-mascot-dot" style={{ animationDelay: '0ms' }} />
          <circle cx="68.5" cy="12.5" r="3" className="tf-mascot-dot" style={{ animationDelay: '260ms' }} />
          <circle cx="63" cy="5.5" r="3.8" className="tf-mascot-dot" style={{ animationDelay: '520ms' }} />
        </g>
      )}

      {spec.zzz && (
        <g fill="var(--flo-accent)" className="font-heading" stroke="none">
          {[
            { x: 60, y: 22, s: 8, d: '0ms' },
            { x: 64, y: 15, s: 10, d: '400ms' },
            { x: 59, y: 7, s: 13, d: '800ms' },
          ].map((z) => (
            <text key={z.d} x={z.x} y={z.y} fontSize={z.s} fontWeight="800" className="tf-mascot-zzz" style={{ animationDelay: z.d }}>
              z
            </text>
          ))}
        </g>
      )}

      {/* Answered boxes down the margin: ink boxes with indigo ticks. */}
      {showTicks && !spec.front && (
        <g strokeWidth={1.8}>
          {[45.5, 52.5].map((y, i) => (
            <g key={y} className="tf-mascot-tick" style={{ animationDelay: `${540 + i * 170}ms` }}>
              <rect x="19.5" y={y} width="5" height="5" rx="1.4" stroke="var(--flo-ink)" fill="#fff" />
              <path d={`M20.6 ${y + 2.5}L22 ${y + 3.9}L25 ${y + 0.6}`} className="tf-mascot-check" stroke="var(--flo-accent)" strokeWidth={1.9} />
            </g>
          ))}
        </g>
      )}
    </svg>
  );
}

export default Mascot;
