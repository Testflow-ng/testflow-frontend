import { cn } from '../../utils/cn.js';

/**
 * Flo, the TestFlow mascot: an exam script that got up and walked.
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
    // Two downward arcs: lids, not lashes.
    return (
      <g strokeWidth={2.4}>
        {cxs.map((cx) => (
          <path key={cx} d={`M${cx - 3.6} 33 Q${cx} 36.4 ${cx + 3.6} 33`} />
        ))}
      </g>
    );
  }

  if (variant === 'squint') {
    // Upward arcs: the classic happy eye.
    return (
      <g strokeWidth={2.6}>
        {cxs.map((cx) => (
          <path key={cx} d={`M${cx - 3.6} 34.4 Q${cx} 30 ${cx + 3.6} 34.4`} />
        ))}
      </g>
    );
  }

  const geometry = {
    open: { rx: 3.4, ry: 4, cy: 33, hi: 1.1 },
    wide: { rx: 4.2, ry: 4.8, cy: 32.6, hi: 1.4 },
    up: { rx: 3.4, ry: 4, cy: 31.8, hi: 1.1 },
    down: { rx: 3.2, ry: 3.4, cy: 34.2, hi: 0.9 },
  }[variant] ?? { rx: 3.4, ry: 4, cy: 33, hi: 1.1 };

  return (
    <g className="tf-mascot-eyes">
      {cxs.map((cx) => (
        <ellipse
          key={cx}
          cx={cx}
          cy={geometry.cy}
          rx={geometry.rx}
          ry={geometry.ry}
          className="fill-current"
          strokeWidth={0}
        />
      ))}
      {/* Catchlights in the page colour, so they read as highlights. */}
      {cxs.map((cx) => (
        <circle
          key={cx}
          cx={cx + 1.3}
          cy={geometry.cy - 1.6}
          r={geometry.hi}
          className="fill-background"
          strokeWidth={0}
        />
      ))}
    </g>
  );
}

function Mouth({ shape }) {
  if (shape === 'open') {
    // A wide open grin, filled so it reads at small sizes.
    return (
      <path
        d="M30 40 Q36 40 42 40 Q42 47.5 36 47.5 Q30 47.5 30 40Z"
        className="fill-current"
        strokeWidth={2.2}
      />
    );
  }
  if (shape === 'o') {
    return <ellipse cx="36" cy="43" rx="3.2" ry="4" className="fill-current" strokeWidth={2} />;
  }
  return <path d={shape} strokeWidth={2.6} />;
}


/** A limb plus its hand, and optionally a thumb. */
function Arm({ pose, thumb }) {
  const [hx, hy] = pose.hand;
  return (
    <>
      <path d={pose.d} strokeWidth={2.8} />
      <circle cx={hx} cy={hy} r={3.4} className="fill-current" strokeWidth={0} />
      {thumb && <path d={THUMB} strokeWidth={3.6} />}
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
      stroke="currentColor"
      strokeWidth={2.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Feet and arms sit behind the body so the sheet stays a clean shape. */}
      <g className="tf-mascot-feet">
        <ellipse cx="27" cy="62.5" rx="7" ry="3.4" className="fill-current/20" />
        <ellipse cx="45" cy="62.5" rx="7" ry="3.4" className="fill-current/20" />
      </g>

      {/* Arms behind the body: every pose except the ones held in front. */}
      {!spec.front && (
        <g className="tf-mascot-arms">
          <Arm pose={ARMS[armL]} />
          <Arm pose={ARMS[armR]} thumb={spec.thumb} />
        </g>
      )}

      {/* Sheet body. The implicit close from (14,18) back to (26,6) is the fold. */}
      <path
        d="M26 6H52C55.3 6 58 8.7 58 12V54C58 57.3 55.3 60 52 60H20C16.7 60 14 57.3 14 54V18Z"
        className="fill-current/10"
      />

      {/* The folded-over corner: the detail that makes it paper and not a box. */}
      <path d="M26 6V12C26 15.3 23.3 18 20 18H14" />

      {/* Ruled header line, clear of the fold */}
      <path d="M22.5 24H49.5" strokeWidth={3.2} className="opacity-60" />

      <Eyes variant={spec.eyes} />
      <Mouth shape={spec.mouth} />

      {/* Arms held in front, drawn over the sheet so they read as hands. */}
      {spec.front && (
        <g className={cn('tf-mascot-arms', spec.clap && 'tf-mascot-clap')}>
          <Arm pose={ARMS[armL]} />
          <Arm pose={ARMS[armR]} />
        </g>
      )}

      {/* A single tear, for the one mood that needs it. */}
      {spec.tear && (
        <path
          d="M31 38.5C31 38.5 29.4 41.4 29.4 42.6C29.4 43.6 30.1 44.3 31 44.3C31.9 44.3 32.6 43.6 32.6 42.6C32.6 41.4 31 38.5 31 38.5Z"
          className="tf-mascot-tear fill-current"
          strokeWidth={0}
        />
      )}

      {/* Thought dots, rising beside the head. */}
      {spec.dots && (
        <g className="fill-current" strokeWidth={0}>
          <circle cx="64" cy="19" r="2.2" className="tf-mascot-dot" style={{ animationDelay: '0ms' }} />
          <circle cx="68.5" cy="12.5" r="3" className="tf-mascot-dot" style={{ animationDelay: '260ms' }} />
          <circle cx="63" cy="5.5" r="3.8" className="tf-mascot-dot" style={{ animationDelay: '520ms' }} />
        </g>
      )}

      {/* Zzz, drifting up. Text rather than paths: it is literal lettering. */}
      {spec.zzz && (
        <g className="fill-current font-heading" strokeWidth={0}>
          {[
            { x: 60, y: 22, s: 8, d: '0ms' },
            { x: 64, y: 15, s: 10, d: '400ms' },
            { x: 59, y: 7, s: 13, d: '800ms' },
          ].map((z) => (
            <text
              key={z.d}
              x={z.x}
              y={z.y}
              fontSize={z.s}
              fontWeight="800"
              className="tf-mascot-zzz"
              style={{ animationDelay: z.d }}
            >
              z
            </text>
          ))}
        </g>
      )}

      {/*
        Answered boxes down the margin. Two, not the three in the source render:
        below the mouth there are only ~13 units of body left, and three at that
        pitch merged into a vertical smudge at the size this is actually drawn.
      */}
      {showTicks && !spec.front && (
        <g strokeWidth={2}>
          {[45.5, 52.5].map((y, i) => (
            <g key={y} className="tf-mascot-tick" style={{ animationDelay: `${540 + i * 170}ms` }}>
              <rect x="19.5" y={y} width="5" height="5" rx="1.4" />
              <path d={`M20.6 ${y + 2.5}L22 ${y + 3.9}L25 ${y + 0.6}`} className="tf-mascot-check" />
            </g>
          ))}
        </g>
      )}
    </svg>
  );
}

export default Mascot;
