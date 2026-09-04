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
        <SheetDescription className="sr-only">
          원하는 임무를 골라서 연습하거나, 이미 끝낸 임무를 다시 연습할 수 있어요.
        </SheetDescription>
      </SheetHeader>
      <div className="flex-1 min-h-0 overflow-hidden">{children}</div>
    </SheetContent>
  </Sheet>
);

export default QuestSheet;