import { useId, useState } from "react";
import ViewportDialog from "./ViewportDialog";

interface TableDialogProps {
  onInsert: (rows: number, cols: number) => void;
  onClose: () => void;
  isQuest: boolean;
}

const clampCount = (value: string | number) => {
  const count = Number.parseInt(String(value), 10);
  return Number.isFinite(count) ? Math.max(1, Math.min(20, count)) : 1;
};

const TableDialog = ({ onInsert, onClose, isQuest }: TableDialogProps) => {
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(2);
  const formId = useId();
  const rowsId = useId();
  const colsId = useId();

  return (
    <ViewportDialog
      title="표 만들기"
      onClose={onClose}
      style={{ maxWidth: 400 }}
      footer={<>
        <button type="submit" form={formId} className={`rounded border px-4 py-1.5 text-xs font-medium ${isQuest ? "border-blue-500 bg-blue-50 text-blue-700 ring-2 ring-blue-200 hover:bg-blue-100" : "border-blue-400 bg-white text-blue-700 hover:bg-blue-50"}`}>만들기(D)</button>
        <button type="button" onClick={onClose} className="rounded border border-gray-300 bg-white px-4 py-1.5 text-xs text-gray-700 hover:bg-gray-100">취소</button>
      </>}
    >
      <form id={formId} onSubmit={event => { event.preventDefault(); onInsert(clampCount(rows), clampCount(cols)); }} className="min-w-0 space-y-4 text-xs text-gray-700">
        <fieldset className="min-w-0 rounded border border-gray-200 p-3">
          <legend className="px-1 font-semibold">줄/칸</legend>
          <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_80px] items-center gap-x-3 gap-y-3">
            <label htmlFor={rowsId}>줄 개수</label>
            <input id={rowsId} type="number" inputMode="numeric" value={rows} onChange={event => setRows(clampCount(event.target.value))} className="w-full rounded border border-gray-300 bg-white px-2 py-1.5 text-center outline-none focus:border-blue-500" min={1} max={20} step={1} />
            <label htmlFor={colsId}>칸 개수</label>
            <input id={colsId} type="number" inputMode="numeric" value={cols} onChange={event => setCols(clampCount(event.target.value))} className="w-full rounded border border-gray-300 bg-white px-2 py-1.5 text-center outline-none focus:border-blue-500" min={1} max={20} step={1} />
          </div>
          <p className="mt-3 text-[11px] text-gray-500">줄과 칸은 각각 1~20개까지 만들 수 있습니다.</p>
        </fieldset>
        <section aria-label="표 크기 안내" className="rounded border border-gray-200 bg-gray-50 p-3">
          <h3 className="mb-2 text-xs font-semibold">크기 지정</h3>
          <dl className="grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-x-3 gap-y-2 text-[11px]"><dt>너비</dt><dd>문서 너비에 맞춤</dd><dt>높이</dt><dd>내용에 따라 자동 조절</dd></dl>
        </section>
      </form>
    </ViewportDialog>
  );
};

export default TableDialog;
