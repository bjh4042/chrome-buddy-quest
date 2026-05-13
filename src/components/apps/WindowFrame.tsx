import { motion } from "framer-motion";
import { Minus, Square, X, Copy } from "lucide-react";
import { useState } from "react";

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
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      className={`absolute bg-white border border-gray-200 shadow-xl flex flex-col overflow-hidden z-30 ${
        maximized
          ? "inset-0 top-12 rounded-none"
          : "inset-4 top-14 md:inset-8 md:top-16 rounded-lg"
      }`}
    >
      {/* Title bar - Windows 11 style */}
      <div
        className="flex items-center justify-between px-3 py-1.5 bg-gray-50 border-b border-gray-200 select-none"
        onDoubleClick={() => setMaximized(m => !m)}
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
        <div className="border-b border-gray-200 bg-gray-50/50">
          {toolbar}
        </div>
      )}
      <div className="flex-1 overflow-auto">{children}</div>
    </motion.div>
  );
};

export default WindowFrame;
