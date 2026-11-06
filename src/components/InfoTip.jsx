import { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Icon from './Icon';

const POPOVER_WIDTH = 300;
const GAP = 10;
const EDGE = 12;

/**
 * Accessible info popover. Rendered in a portal and positioned against the
 * viewport, so it is never clipped by cards, tables or scroll containers.
 */
const InfoTip = ({ title, children, label = 'Info' }) => {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState(null);
  const btnRef = useRef(null);
  const popRef = useRef(null);
  const hoverTimer = useRef(null);
  const mode = useRef(null);

  const close = useCallback(() => {
    mode.current = null;
    setOpen(false);
  }, []);

  const place = useCallback(() => {
    const btn = btnRef.current;
    if (!btn) return;
    const r = btn.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const width = Math.min(POPOVER_WIDTH, vw - EDGE * 2);
    const popH = popRef.current?.offsetHeight || 160;

    let left = r.left + r.width / 2 - width / 2;
    left = Math.max(EDGE, Math.min(left, vw - width - EDGE));

    const below = r.bottom + GAP + popH <= vh - EDGE || r.top - GAP - popH < EDGE;
    const top = below ? r.bottom + GAP : r.top - GAP - popH;
    const arrowX = Math.max(14, Math.min(width - 14, r.left + r.width / 2 - left));

    setPos({ left, top, width, below, arrowX });
  }, []);

  useLayoutEffect(() => {
    if (open) place();
  }, [open, place]);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (btnRef.current?.contains(e.target) || popRef.current?.contains(e.target)) return;
      close();
    };
    const onKey = (e) => e.key === 'Escape' && close();
    const onMove = () => place();
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', onMove);
    window.addEventListener('scroll', onMove, true);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onMove);
      window.removeEventListener('scroll', onMove, true);
    };
  }, [open, place, close]);

  useEffect(() => () => clearTimeout(hoverTimer.current), []);

  // Hover only on devices with a real pointer; touch uses tap to toggle.
  const canHover = () => typeof window !== 'undefined' && window.matchMedia?.('(hover: hover)').matches;
  // mode: null (closed) | 'hover' (transient preview) | 'pinned' (opened by click/tap)
  const enter = () => {
    if (!canHover()) return;
    clearTimeout(hoverTimer.current);
    if (mode.current !== 'pinned') mode.current = 'hover';
    setOpen(true);
  };
  const leave = () => {
    if (mode.current !== 'hover') return;
    clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(close, 120);
  };
  const toggle = (e) => {
    e.stopPropagation();
    clearTimeout(hoverTimer.current);
    if (mode.current === 'pinned') {
      close();
    } else {
      mode.current = 'pinned';
      setOpen(true);
    }
  };

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        aria-label={label}
        aria-expanded={open}
        onClick={toggle}
        onMouseEnter={enter}
        onMouseLeave={leave}
        className="inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-ink-faint transition-colors hover:text-ink aria-expanded:bg-ink aria-expanded:text-paper"
      >
        <Icon name="info" className="h-3.5 w-3.5" />
      </button>

      {open && createPortal(
        <div
          ref={popRef}
          role="tooltip"
          onMouseEnter={enter}
          onMouseLeave={leave}
          style={{
            position: 'fixed',
            left: pos?.left ?? -9999,
            top: pos?.top ?? -9999,
            width: pos?.width ?? POPOVER_WIDTH,
            visibility: pos ? 'visible' : 'hidden'
          }}
          className="z-[1000] animate-fade-in border border-ink bg-paper p-4 text-left shadow-[0_12px_30px_-12px_rgba(22,21,15,0.35)]"
        >
          {pos && (
            <span
              className={`absolute h-3 w-3 rotate-45 border-ink bg-paper ${pos.below ? '-top-1.5 border-l border-t' : '-bottom-1.5 border-b border-r'}`}
              style={{ left: pos.arrowX - 6 }}
            />
          )}
          <div className="mb-2 border-b border-rule pb-2 font-cond text-[14px] font-bold uppercase tracking-[0.04em] text-ink">
            
            <span>{title}</span>
          </div>
          <div className="text-[13px] leading-relaxed text-ink-soft">{children}</div>
        </div>,
        document.body
      )}
    </>
  );
};

export default InfoTip;
