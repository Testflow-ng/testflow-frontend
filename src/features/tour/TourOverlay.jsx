import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { useReducedMotion } from 'framer-motion';
import { Button } from '../../components/ui/index.js';

const PAD = 8;
const GAP = 14;
const WIDTH = 320;
const MARGIN = 12;

const find = (target) => {
  const list = Array.isArray(target) ? target : [target];
  for (const id of list) {
    const el = document.querySelector(`[data-tour="${id}"]`);
    if (el && el.getClientRects().length) return el;
  }
  return null;
};

/** Tooltip placement: try the preferred side, flip if it does not fit, then clamp inside the viewport. */
function place(rect, h, prefer) {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const w = Math.min(WIDTH, vw - MARGIN * 2);
  const fits = {
    right: rect.right + GAP + w <= vw - MARGIN,
    left: rect.left - GAP - w >= MARGIN,
    bottom: rect.bottom + GAP + h <= vh - MARGIN,
    top: rect.top - GAP - h >= MARGIN,
  };
  const order = [prefer, 'bottom', 'top', 'right', 'left'];
  const side = order.find((s) => fits[s]) ?? 'bottom';
  let left;
  let top;
  if (side === 'right') { left = rect.right + GAP; top = rect.top + rect.height / 2 - h / 2; }
  else if (side === 'left') { left = rect.left - GAP - w; top = rect.top + rect.height / 2 - h / 2; }
  else if (side === 'bottom') { left = rect.left + rect.width / 2 - w / 2; top = rect.bottom + GAP; }
  else { left = rect.left + rect.width / 2 - w / 2; top = rect.top - GAP - h; }
  left = Math.max(MARGIN, Math.min(left, vw - w - MARGIN));
  top = Math.max(MARGIN, Math.min(top, vh - h - MARGIN));
  return { left, top, width: w, side };
}

/**
 * Spotlight + tooltip over the real interface. The dim is a box-shadow ring (pointer-events: none), so the
 * highlighted control and everything else stays clickable and nothing is blocked.
 */
function TourOverlay({ steps, onEnd }) {
  const navigate = useNavigate();
  const location = useLocation();
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState(null);
  const [pos, setPos] = useState(null);
  const tipRef = useRef(null);
  const nextRef = useRef(null);

  const step = steps[index];
  const total = steps.length;
  const last = index === total - 1;

  const go = useCallback((to) => {
    if (to < 0) return;
    if (to >= total) { onEnd('done'); return; }
    setRect(null);
    setIndex(to);
  }, [total, onEnd]);

  // Locate the target; keep it tracked as the page moves, resizes or re-renders.
  useEffect(() => {
    if (!step) return undefined;
    let raf;
    let ticks = 0;
    const tick = () => {
      // Interactive step: the user clicked the highlighted control and landed where we asked.
      if (step.advanceTo && location.pathname === step.advanceTo) {
        go(index + 1);
        return;
      }
      const onPath = !step.path || location.pathname === step.path;
      const el = onPath ? find(step.target) : null;
      if (el) {
        const r = el.getBoundingClientRect();
        const outside = r.top < 0 || r.bottom > window.innerHeight;
        if (outside) el.scrollIntoView({ block: 'center', behavior: reduce ? 'auto' : 'smooth' });
        setRect((prev) => (prev && prev.top === r.top && prev.left === r.left && prev.width === r.width && prev.height === r.height ? prev : { top: r.top, left: r.left, width: r.width, height: r.height, right: r.right, bottom: r.bottom }));
          } else {
        ticks += 1;
        // Never appears (another role or screen size): skip it quietly after a short wait.
        if (ticks > 40) {
          go(index + 1);
          return;
        }
        setRect(null);
      }
      raf = window.setTimeout(tick, 120);
    };
    tick();
    return () => window.clearTimeout(raf);
  }, [step, location.pathname, reduce, go, index]);

  useLayoutEffect(() => {
    if (rect && tipRef.current) setPos(place(rect, tipRef.current.offsetHeight, step.place ?? 'bottom'));
  }, [rect, step]);

  const next = () => {
    if (step.advanceTo && location.pathname !== step.advanceTo) navigate(step.advanceTo);
    else go(index + 1);
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onEnd('skipped');
      else if (e.key === 'ArrowRight' && !e.target.closest?.('input,textarea')) next();
      else if (e.key === 'ArrowLeft' && !e.target.closest?.('input,textarea')) go(index - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  const visible = rect !== null;
  useEffect(() => {
    if (visible) nextRef.current?.focus({ preventScroll: true });
  }, [index, visible]);

  const progress = useMemo(() => `Step ${index + 1} of ${total}`, [index, total]);
  if (!step || !rect) return null;

  const transition = reduce ? 'none' : 'all 200ms ease';

  return createPortal(
    <>
      <div
        aria-hidden="true"
        style={{ position: 'fixed', zIndex: 90, pointerEvents: 'none', top: rect.top - PAD, left: rect.left - PAD, width: rect.width + PAD * 2, height: rect.height + PAD * 2, borderRadius: 16, boxShadow: '0 0 0 9999px rgba(27,67,50,0.42), 0 0 0 2px rgba(214,232,124,0.9)', transition }}
      />
      <div
        ref={tipRef}
        role="dialog"
        aria-label={step.title}
        aria-live="polite"
        style={{ position: 'fixed', zIndex: 91, top: pos?.top ?? -9999, left: pos?.left ?? -9999, width: pos?.width ?? WIDTH, transition: reduce ? 'none' : 'top 200ms ease, left 200ms ease' }}
        className="rounded-[20px] border border-border bg-surface p-4 shadow-[0_18px_40px_-12px_rgba(27,67,50,0.35)]"
      >
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary">{progress}</p>
        <h2 className="mt-1 font-heading text-base font-bold text-foreground-strong">{step.title}</h2>
        <p className="mt-1 text-sm leading-relaxed text-muted">{step.text}</p>
        <div className="mt-4 flex items-center justify-between gap-2">
          <Button variant="ghost" size="sm" onClick={() => onEnd('skipped')}>Skip tour</Button>
          <div className="flex gap-2">
            {index > 0 && <Button variant="outline" size="sm" onClick={() => go(index - 1)}>Back</Button>}
            <Button ref={nextRef} size="sm" onClick={next}>{last ? 'Finish' : 'Next'}</Button>
          </div>
        </div>
      </div>
    </>,
    document.body,
  );
}

export default TourOverlay;
