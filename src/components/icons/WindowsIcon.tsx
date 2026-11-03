import icon0 from "@/assets/windows-icons/this-pc.svg";
import icon1 from "@/assets/windows-icons/recycle-bin.svg";
import icon2 from "@/assets/windows-icons/recycle-bin-full.svg";
import icon3 from "@/assets/windows-icons/file-explorer.svg";
import icon4 from "@/assets/windows-icons/edge.png";
import icon5 from "@/assets/windows-icons/excel.svg";
import icon6 from "@/assets/windows-icons/powerpoint.svg";
import icon7 from "@/assets/windows-icons/hangul.svg";
import icon8 from "@/assets/windows-icons/settings.svg";
import icon9 from "@/assets/windows-icons/notepad.png";
import icon10 from "@/assets/windows-icons/folder.svg";
import icon11 from "@/assets/windows-icons/documents.svg";
import icon12 from "@/assets/windows-icons/downloads.svg";
import icon13 from "@/assets/windows-icons/pictures.svg";
import icon14 from "@/assets/windows-icons/music.svg";
import icon15 from "@/assets/windows-icons/videos.svg";
import icon16 from "@/assets/windows-icons/desktop.svg";
import icon17 from "@/assets/windows-icons/text-file.svg";
import icon18 from "@/assets/windows-icons/drive.svg";
import icon19 from "@/assets/windows-icons/start.svg";
import icon20 from "@/assets/windows-icons/task-view.svg";
import icon21 from "@/assets/windows-icons/search.svg";
import "./WindowsIcon.css";

export type AppIconName = "this-pc" | "recycle-bin" | "recycle-bin-full" | "file-explorer" | "edge" | "excel" | "powerpoint" | "hangul" | "settings" | "notepad" | "folder" | "documents" | "downloads" | "pictures" | "music" | "videos" | "desktop" | "text-file" | "drive" | "start" | "task-view" | "search";

export const windowsIconSources: Record<AppIconName, string> = {
  "this-pc": icon0,
  "recycle-bin": icon1,
  "recycle-bin-full": icon2,
  "file-explorer": icon3,
  "edge": icon4,
  "excel": icon5,
  "powerpoint": icon6,
  "hangul": icon7,
  "settings": icon8,
  "notepad": icon9,
  "folder": icon10,
  "documents": icon11,
  "downloads": icon12,
  "pictures": icon13,
  "music": icon14,
  "videos": icon15,
  "desktop": icon16,
  "text-file": icon17,
  "drive": icon18,
  "start": icon19,
  "task-view": icon20,
  "search": icon21,
};

interface AppIconProps {
  name: AppIconName;
  size?: number;
  className?: string;
  alt?: string;
}

/** Local transparent assets, shared by the shell and all practice apps. */
export function AppIcon({ name, size = 24, className = "", alt = "" }: AppIconProps) {
  return (
    <img
      src={windowsIconSources[name]}
      width={size}
      height={size}
      className={`windows-app-icon ${className}`}
      alt={alt}
      aria-hidden={alt ? undefined : true}
      draggable={false}
    />
  );
}

export default AppIcon;
