import { useState } from "react";
import { motion } from "framer-motion";
import { X, ChevronRight, Image as ImageIcon, FolderOpen, Monitor, Music, Film, FileText, HardDrive } from "lucide-react";

interface ImagePickerDialogProps {
  onSelect: (imageSrc: string) => void;
  onClose: () => void;
  isQuest?: boolean;
}

const SAMPLE_IMAGES = [
  { name: "풍경사진.jpg", color: "#86efac", emoji: "🏔️" },
  { name: "꽃다발.jpg", color: "#fca5a5", emoji: "🌸" },
  { name: "강아지.jpg", color: "#fde68a", emoji: "🐶" },
  { name: "고양이.jpg", color: "#c4b5fd", emoji: "🐱" },
  { name: "바다풍경.jpg", color: "#7dd3fc", emoji: "🌊" },
  { name: "해바라기.jpg", color: "#fbbf24", emoji: "🌻" },
  { name: "도시야경.jpg", color: "#6366f1", emoji: "🌃" },
  { name: "숲속길.jpg", color: "#4ade80", emoji: "🌲" },
  { name: "일몰.jpg", color: "#fb923c", emoji: "🌅" },
];

const SIDEBAR_ITEMS = [
  { icon: <ImageIcon className="w-3.5 h-3.5 text-blue-500" />, label: "갤러리" },
  { icon: <Monitor className="w-3.5 h-3.5 text-blue-500" />, label: "바탕 화면" },
  { icon: <FolderOpen className="w-3.5 h-3.5 text-yellow-500" />, label: "Downloads", active: true },
  { icon: <FolderOpen className="w-3.5 h-3.5 text-yellow-500" />, label: "문서" },
  { icon: <ImageIcon className="w-3.5 h-3.5 text-blue-400" />, label: "사진" },
  { icon: <Music className="w-3.5 h-3.5 text-pink-500" />, label: "음악" },
  { icon: <Film className="w-3.5 h-3.5 text-purple-500" />, label: "동영상" },
  { icon: <HardDrive className="w-3.5 h-3.5 text-gray-500" />, label: "내 드라이브" },
];

const ImagePickerDialog = ({ onSelect, onClose, isQuest }: ImagePickerDialogProps) => {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  const handleOpen = () => {
    if (selectedImage !== null) {
      const img = SAMPLE_IMAGES[selectedImage];
      // Generate an SVG as sample image
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="140" viewBox="0 0 200 140">
        <rect fill="${img.color}" width="200" height="140" rx="8"/>
        <text x="100" y="60" text-anchor="middle" font-size="32">${img.emoji}</text>
        <text x="100" y="90" text-anchor="middle" fill="#374151" font-size="11" font-family="sans-serif">${img.name}</text>
      </svg>`;
      onSelect("data:image/svg+xml," + encodeURIComponent(svg));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-lg shadow-2xl border border-gray-300 w-[90%] max-w-[560px] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Title bar */}
        <div className="flex items-center justify-between px-3 py-2 bg-gray-50 border-b border-gray-200 rounded-t-lg">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-blue-500" />
            <span className="text-xs font-medium text-gray-700">그림 넣기</span>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded">
            <X className="w-3.5 h-3.5 text-gray-600" />
          </button>
        </div>

        {/* Path breadcrumb */}
        <div className="flex items-center gap-1 px-3 py-1.5 bg-white border-b border-gray-200 text-[10px] text-gray-500">
          <FolderOpen className="w-3 h-3 text-yellow-500" />
          <span>내 PC</span>
          <ChevronRight className="w-2.5 h-2.5" />
          <span>Downloads</span>
        </div>

        <div className="flex flex-1 min-h-0">
          {/* Sidebar */}
          <div className="w-28 border-r border-gray-200 bg-gray-50 py-1 overflow-auto">
            {SIDEBAR_ITEMS.map((item, i) => (
              <div
                key={i}
                className={`flex items-center gap-1.5 px-2 py-1 text-[10px] cursor-pointer ${
                  item.active ? "bg-blue-100 text-blue-700 font-medium" : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {item.icon}
                <span className="truncate">{item.label}</span>
              </div>
            ))}
          </div>

          {/* Image grid */}
          <div className="flex-1 p-2 overflow-auto">
            <div className="grid grid-cols-3 gap-2">
              {SAMPLE_IMAGES.map((img, i) => (
                <div
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`flex flex-col items-center gap-1 p-1.5 rounded cursor-pointer border-2 transition-colors ${
                    selectedImage === i
                      ? "border-blue-500 bg-blue-50"
                      : isQuest && i === 1
                      ? "border-yellow-400 bg-yellow-50 animate-pulse"
                      : "border-transparent hover:bg-gray-100"
                  }`}
                >
                  <div
                    className="w-full aspect-square rounded flex items-center justify-center text-2xl"
                    style={{ backgroundColor: img.color + "40" }}
                  >
                    {img.emoji}
                  </div>
                  <span className="text-[8px] text-gray-600 text-center leading-tight truncate w-full">
                    {img.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-200 px-3 py-2 flex items-center gap-2">
          <span className="text-[10px] text-gray-500 whitespace-nowrap">파일 이름(N):</span>
          <input
            className="flex-1 text-[10px] border border-gray-300 rounded px-2 py-1 outline-none focus:border-blue-400"
            value={selectedImage !== null ? SAMPLE_IMAGES[selectedImage].name : ""}
            readOnly
          />
          <span className="text-[10px] text-gray-500 border border-gray-300 rounded px-2 py-1 bg-gray-50">
            모든 그림 파일
          </span>
        </div>
        <div className="border-t border-gray-100 px-3 py-2 flex justify-end gap-2">
          <button
            onClick={handleOpen}
            disabled={selectedImage === null}
            className={`px-4 py-1.5 text-[11px] rounded border transition-colors ${
              selectedImage !== null
                ? "bg-white border-gray-300 hover:bg-gray-100 text-gray-700 font-medium"
                : "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
            } ${isQuest && selectedImage !== null ? "ring-2 ring-yellow-400 animate-pulse bg-yellow-50" : ""}`}
          >
            열기(O)
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-[11px] rounded border border-gray-300 hover:bg-gray-100 text-gray-700"
          >
            취소
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ImagePickerDialog;
