import { motion } from "framer-motion";
import { Minus, Square, X } from "lucide-react";

interface WindowFrameProps {
  title: string;
  icon: React.ReactNode;
  onClose: () => void;
  children: React.ReactNode;
  toolbar?: React.ReactNode;
}

const WindowFrame = ({ title, icon, onClose, children, toolbar }: WindowFrameProps) => {
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      className="absolute inset-4 top-14 md:inset-8 md:top-16 bg-white rounded-lg border border-gray-200 shadow-xl flex flex-col overflow-hidden z-30"
    >
      {/* Title bar - Windows 11 style */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-gray-50 border-b border-gray-200 select-none">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-xs font-body text-gray-700">{title}</span>
        </div>
        <div className="flex items-center">
          <button className="p-1.5 hover:bg-gray-200 rounded-sm transition-colors">
            <Minus className="w-3 h-3 text-gray-600" />
          </button>
          <button className="p-1.5 hover:bg-gray-200 rounded-sm transition-colors">
            <Square className="w-3 h-3 text-gray-600" />
          </button>
          <button onClick={onClose} className="p-1.5 hover:bg-red-500 hover:text-white rounded-sm transition-colors">
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
