import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface ToolbarDropdownProps {
  open: boolean;
  anchorRef: React.RefObject<HTMLElement>;
  onClose: () => void;
  minWidth?: number;
  children: React.ReactNode;
}

/**
 * Renders a toolbar dropdown menu in a portal on document.body so it is not
 * clipped by WindowFrame's overflow-hidden / toolbar's overflow-x-auto.
 * Position is computed from the anchor button's viewport rect.
 */
const ToolbarDropdown = ({ open, anchorRef, onClose, minWidth = 80, children }: ToolbarDropdownProps) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number; maxHeight: number } | null>(null);

  useLayoutEffect(() => {
    if (!open) { setPos(null); return; }
    const update = () => {
      const anchor = anchorRef.current;
      if (!anchor) return;
      const r = anchor.getBoundingClientRect();
      const menuW = Math.max(minWidth, menuRef.current?.offsetWidth ?? minWidth);
      const menuH = menuRef.current?.offsetHeight ?? 200;
      const margin = 8;
      let left = r.left;
      if (left + menuW > window.innerWidth - margin) left = window.innerWidth - menuW - margin;
      if (left < margin) left = margin;

      const spaceBelow = window.innerHeight - r.bottom - margin;
      const spaceAbove = r.top - margin;
      let top = r.bottom + 4;
      let maxHeight = spaceBelow;
      if (spaceBelow < Math.min(menuH, 160) && spaceAbove > spaceBelow) {
        maxHeight = spaceAbove;
        top = Math.max(margin, r.top - 4 - Math.min(menuH, maxHeight));
      }
      setPos({ top, left, maxHeight: Math.max(120, maxHeight) });
    };
    update();
    const raf = requestAnimationFrame(update);
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    window.addEventListener("mousemove", update);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("mousemove", update);
    };
  }, [open, anchorRef, minWidth]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (menuRef.current?.contains(t)) return;
      if (anchorRef.current?.contains(t)) return;
      onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    };
    document.addEventListener("mousedown", onDown, true);
    document.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("mousedown", onDown, true);
      document.removeEventListener("keydown", onKey, true);
    };
  }, [open, onClose, anchorRef]);

  if (!open) return null;

  return createPortal(
    <div
      ref={menuRef}
      role="menu"
      style={{
        position: "fixed",
        top: pos?.top ?? -9999,
        left: pos?.left ?? -9999,
        minWidth,
        width: "max-content",
        maxWidth: "min(90vw, 320px)",
        maxHeight: pos?.maxHeight,
        visibility: pos ? "visible" : "hidden",
      }}
      className="z-[9999] overflow-y-auto bg-white border border-gray-200 rounded shadow-lg"
    >
      {children}
    </div>,
    document.body
  );
};

export default ToolbarDropdown;
