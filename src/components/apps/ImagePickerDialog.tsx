import { useId, useState } from "react";
import { ChevronRight, Image as ImageIcon, FolderOpen, Monitor, Music, Film, FileText, HardDrive } from "lucide-react";
import ViewportDialog from "./ViewportDialog";

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
  { icon: ImageIcon, label: "갤러리" },
  { icon: Monitor, label: "바탕 화면" },
  { icon: FolderOpen, label: "Downloads", active: true },
  { icon: FileText, label: "문서" },
  { icon: ImageIcon, label: "사진" },
  { icon: Music, label: "음악" },
  { icon: Film, label: "동영상" },
  { icon: HardDrive, label: "내 드라이브" },
];

const ImagePickerDialog = ({ onSelect, onClose, isQuest }: ImagePickerDialogProps) => {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const fileNameId = useId();

  const handleOpen = (imageIndex = selectedImage) => {
    if (imageIndex === null) return;
    const img = SAMPLE_IMAGES[imageIndex];
    if (!img) return;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="140" viewBox="0 0 200 140">
      <rect fill="${img.color}" width="200" height="140" rx="8"/>
      <text x="100" y="60" text-anchor="middle" font-size="32">${img.emoji}</text>
      <text x="100" y="90" text-anchor="middle" fill="#374151" font-size="11" font-family="sans-serif">${img.name}</text>
    </svg>`;
    onSelect("data:image/svg+xml," + encodeURIComponent(svg));
  };

  const footer = (
    <div className="w-full min-w-0 space-y-1.5">
      <div className="flex min-w-0 items-center gap-2">
        <label htmlFor={fileNameId} className="shrink-0 text-[11px] text-gray-600">파일 이름(N):</label>
        <input
          id={fileNameId}
          className="min-w-0 flex-1 rounded border border-gray-300 bg-white px-2 py-1 text-xs outline-none focus:border-blue-500"
          value={selectedImage !== null ? SAMPLE_IMAGES[selectedImage].name : ""}
          readOnly
          placeholder="그림을 선택하세요"
        />
      </div>
      <div className="flex min-w-0 items-center justify-end gap-2">
        <span className="mr-auto text-[10px] text-gray-500">모든 그림 파일</span>
        <button
          type="button"
          onClick={() => handleOpen()}
          disabled={selectedImage === null}
          className={`shrink-0 rounded border px-4 py-1 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-40 ${
            isQuest && selectedImage !== null
              ? "border-blue-500 bg-blue-50 text-blue-700 ring-2 ring-blue-200 hover:bg-blue-100"
              : "border-gray-300 bg-white text-gray-700 hover:bg-gray-100"
          }`}
        >열기(O)</button>
        <button type="button" onClick={onClose} className="shrink-0 rounded border border-gray-300 bg-white px-4 py-1 text-xs text-gray-700 hover:bg-gray-100">취소</button>
      </div>
    </div>
  );

  return (
    <ViewportDialog title="그림 넣기" onClose={onClose} bodyClassName="!p-0" footer={footer}>
      <div className="flex min-w-0 items-center gap-1 border-b border-gray-200 bg-white px-3 py-1.5 text-[11px] text-gray-600" aria-label="현재 그림 폴더">
        <FolderOpen className="h-3.5 w-3.5 shrink-0 text-yellow-500" />
        <span>내 PC</span><ChevronRight className="h-3 w-3 shrink-0" /><span>Downloads</span>
      </div>
      <div className="flex min-w-0">
        <aside className="hidden w-28 shrink-0 border-r border-gray-200 bg-gray-50 py-1 sm:block" aria-label="연습 그림 위치">
          {SIDEBAR_ITEMS.map(({ icon: Icon, label, active }) => (
            <div key={label} className={`flex items-center gap-1.5 px-2 py-1.5 text-[11px] ${active ? "bg-blue-100 font-medium text-blue-700" : "text-gray-400"}`} aria-current={active ? "location" : undefined}>
              <Icon className="h-3.5 w-3.5 shrink-0" /><span className="truncate">{label}</span>
            </div>
          ))}
          <p className="px-2 pt-2 text-[10px] leading-relaxed text-gray-500">이 연습의 그림은 Downloads 폴더에 있습니다.</p>
        </aside>
        <div className="min-w-0 flex-1 p-2">
          <div className="grid min-w-0 grid-cols-2 gap-1.5 sm:grid-cols-3" aria-label="연습 그림 목록">
            {SAMPLE_IMAGES.map((img, i) => (
              <button
                key={img.name}
                type="button"
                aria-label={img.name}
                aria-pressed={selectedImage === i}
                onClick={() => setSelectedImage(i)}
                onDoubleClick={() => handleOpen(i)}
                className={`flex min-w-0 flex-col items-center gap-1 rounded border-2 p-1.5 transition-colors ${
                  selectedImage === i
                    ? "border-blue-500 bg-blue-50"
                    : isQuest && i === 1
                    ? "border-yellow-400 bg-yellow-50"
                    : "border-transparent hover:bg-gray-100"
                }`}
              >
                <span className="flex h-14 max-h-[72px] w-full items-center justify-center rounded text-2xl sm:h-16" style={{ backgroundColor: img.color + "40" }} aria-hidden="true">{img.emoji}</span>
                <span className="w-full truncate text-center text-[11px] leading-tight text-gray-700">{img.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </ViewportDialog>
  );
};

export default ImagePickerDialog;
