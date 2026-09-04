import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import type { ReactNode } from "react";

interface QuestSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}

const QuestSheet = ({ open, onOpenChange, children }: QuestSheetProps) => (
  <Sheet open={open} onOpenChange={onOpenChange}>
    <SheetContent
      side="left"
      className="p-0 w-[320px] sm:w-[360px] max-w-[85vw] flex flex-col"
    >
      <SheetHeader className="px-4 pt-4 pb-2 shrink-0">
        <SheetTitle className="font-display text-base">🗺️ 임무 목록</SheetTitle>
      </SheetHeader>
      <div className="flex-1 min-h-0 overflow-hidden">{children}</div>
    </SheetContent>
  </Sheet>
);

export default QuestSheet;