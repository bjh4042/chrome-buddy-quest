import { motion } from "framer-motion";
import { Minus, Square, X, Copy } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface WindowFrameProps {
  title: string;
  icon: React.ReactNode;
  onClose: () => void;
  onMinimize?: () => void;
  children: React.ReactNode;
  toolbar?: React.ReactNode;
  highlightClose?: boolean;
}

const WindowFrame = ({ title, icon, onClose, onMinimize, children, toolbar, highlightClose }: WindowFrameProps) => {
  const [maximized, setMaximized] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ sx: number; sy: number; ox: number; oy: number } | null>(null);
  const resizeRef = useRef<{ sx: number; sy: number; w: number; h: number } | null>(null);

  const fireInteract = (kind: "move" | "resize") => {
    window.dispatchEvent(new CustomEvent("window-interacted", { detail: kind }));
  };

  const onTitleMouseDown = (e: React.MouseEvent) => {
    if (maximized) return;
    const target = e.target as HTMLElement;
    if (target.closest("button")) return;
    dragRef.current = { sx: e.clientX, sy: e.clientY, ox: offset.x, oy: offset.y };
  };

  const onResizeMouseDown = (e: React.MouseEvent) => {
    if (maximized) return;
    e.stopPropagation();
    const rect = frameRef.current?.getBoundingClientRect();
    if (!rect) return;
    resizeRef.current = { sx: e.clientX, sy: e.clientY, w: rect.width, h: rect.height };
    setSize({ w: rect.width, h: rect.height });
  };

  useEffect(() => {
    const move = (e: MouseEvent) => {
      if (dragRef.current) {
        const nx = dragRef.current.ox + (e.clientX - dragRef.current.sx);
        const ny = dragRef.current.oy + (e.clientY - dragRef.current.sy);
        setOffset({ x: nx, y: ny });
        if (Math.abs(nx) + Math.abs(ny) > 40) fireInteract("move");
      }
      if (resizeRef.current) {
        const nw = Math.max(280, resizeRef.current.w + (e.clientX - resizeRef.current.sx));
        const nh = Math.max(200, resizeRef.current.h + (e.clientY - resizeRef.current.sy));
        setSize({ w: nw, h: nh });
        if (Math.abs(nw - resizeRef.current.w) + Math.abs(nh - resizeRef.current.h) > 40) fireInteract("resize");
      }
    };
    const up = () => { dragRef.current = null; resizeRef.current = null; };
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
  }, []);

  const manualStyle: React.CSSProperties = maximized
    ? {}
    : {
        transform: offset.x || offset.y ? `translate(${offset.x}px, ${offset.y}px)` : undefined,
        width: size?.w,
        height: size?.h,
      };

  return (
    <motion.div
      ref={frameRef}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      style={manualStyle}
      className={`absolute bg-white border border-gray-200 shadow-xl flex flex-col overflow-hidden z-30 ${
        maximized
          ? "inset-0 top-10 sm:top-12 rounded-none"
          : size
          ? "left-4 top-14 rounded-md sm:rounded-lg"
          : "inset-1 top-12 sm:inset-4 sm:top-14 md:inset-8 md:top-16 rounded-md sm:rounded-lg"
      }`}
    >
      {/* Title bar - Windows 11 style */}
      <div
        className={`flex items-center justify-between px-3 py-1.5 bg-gray-50 border-b border-gray-200 select-none ${
          maximized ? "" : "cursor-move"
        }`}
        onDoubleClick={() => setMaximized(m => !m)}
        onMouseDown={onTitleMouseDown}
      >
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-xs font-body text-gray-700">{title}</span>
        </div>
        <div className="flex items-center">
          <button
            onClick={onMinimize}
            title="최소화"
            className="p-1.5 hover:bg-gray-200 rounded-sm transition-colors"
          >
            <Minus className="w-3 h-3 text-gray-600" />
          </button>
          <button
            onClick={() => setMaximized(m => !m)}
            title={maximized ? "이전 크기로" : "최대화"}
            className="p-1.5 hover:bg-gray-200 rounded-sm transition-colors"
          >
            {maximized
              ? <Copy className="w-3 h-3 text-gray-600" />
              : <Square className="w-3 h-3 text-gray-600" />}
          </button>
          <button
            onClick={onClose}
            className={`p-1.5 hover:bg-red-500 hover:text-white rounded-sm transition-colors ${
              highlightClose ? "bg-red-500 text-white animate-pulse-highlight ring-2 ring-red-400" : ""
            }`}
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      </div>
      {toolbar && (
        <div className="border-b border-gray-200 bg-gray-50/50 overflow-x-auto">
          {toolbar}
        </div>
      )}
      <div className="flex-1 overflow-auto">{children}</div>
      {!maximized && (
        <div
          onMouseDown={onResizeMouseDown}
          className="absolute bottom-0 right-0 w-4 h-4 cursor-se-resize z-40 flex items-end justify-end p-0.5"
          title="크기 조절"
        >
          <div className="w-2 h-2 border-r-2 border-b-2 border-gray-400" />
        </div>
      )}
    </motion.div>
  );
};

export default WindowFrame;
