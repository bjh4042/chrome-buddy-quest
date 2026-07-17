import { Menu, Star, HelpCircle, Volume2 } from "lucide-react";

interface TopLearnBarProps {
  index: number;
  total: number;
  title: string;
  stars: number;
  onOpenList: () => void;
  onHelp?: () => void;
  onReadAloud?: () => void;
}

const TopLearnBar = ({ index, total, title, stars, onOpenList, onHelp, onReadAloud }: TopLearnBarProps) => (
  <header className="shrink-0 h-12 sm:h-14 border-b border-border bg-card/95 backdrop-blur flex items-center gap-2 px-2 sm:px-3 z-30">
    <button
      onClick={onOpenList}
      aria-label="임무 목록 열기"
      title="임무 목록"
      className="flex items-center gap-1.5 min-h-[40px] px-2 sm:px-3 rounded-lg bg-primary/10 text-primary font-display text-xs sm:text-sm hover:bg-primary/20 active:scale-95 transition"
    >
      <Menu className="w-4 h-4" />
      <span className="hidden sm:inline">임무 목록</span>
    </button>

    <div className="flex items-center gap-2 min-w-0 flex-1">
      <span className="shrink-0 text-fluid-xs font-display px-2 py-0.5 rounded-full bg-muted text-foreground">
        {index + 1} / {total}
      </span>
      <span className="truncate font-display text-fluid-sm text-foreground" title={title}>
        {title}
      </span>
    </div>

    <div className="shrink-0 flex items-center gap-1 px-2 py-1 rounded-full bg-[hsl(var(--star-fill))]/15 text-foreground">
      <Star className="w-3.5 h-3.5 text-[hsl(var(--star-fill))] fill-[hsl(var(--star-fill))]" />
      <span className="font-display text-xs">{stars}</span>
    </div>

    {onReadAloud && (
      <button
        onClick={onReadAloud}
        aria-label="임무 읽어주기"
        title="임무 읽어주기"
        className="hidden sm:inline-flex items-center justify-center w-9 h-9 rounded-lg hover:bg-muted transition"
      >
        <Volume2 className="w-4 h-4 text-foreground" />
      </button>
    )}
    {onHelp && (
      <button
        onClick={onHelp}
        aria-label="도움말 보기"
        title="도움말"
        className="inline-flex items-center gap-1 min-h-[40px] px-2 rounded-lg hover:bg-muted transition"
      >
        <HelpCircle className="w-4 h-4 text-foreground" />
        <span className="hidden md:inline text-xs font-display">도움말</span>
      </button>
    )}
  </header>
);

export default TopLearnBar;