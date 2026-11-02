import { beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import ImagePickerDialog from './ImagePickerDialog';
import TableDialog from './TableDialog';

beforeEach(() => { cleanup(); });

describe('responsive image picker', () => {
  it('pins filename and open/cancel actions in the viewport footer and preserves sample SVG selection', () => {
    const onSelect = vi.fn();
    render(<ImagePickerDialog onSelect={onSelect} onClose={() => {}} isQuest />);
    const dialog = screen.getByRole('dialog', { name: '그림 넣기' });
    expect(dialog.parentElement).toHaveAttribute('data-viewport-dialog', 'true');
    const footer = dialog.querySelector('[data-dialog-footer]') as HTMLElement;
    expect(within(footer).getByLabelText('파일 이름(N):')).toHaveValue('');
    expect(within(footer).getByRole('button', { name: '열기(O)' })).toBeDisabled();
    expect(within(footer).getByRole('button', { name: '취소' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '꽃다발.jpg' }));
    expect(within(footer).getByLabelText('파일 이름(N):')).toHaveValue('꽃다발.jpg');
    fireEvent.click(within(footer).getByRole('button', { name: '열기(O)' }));
    expect(onSelect).toHaveBeenCalledOnce();
    const data = onSelect.mock.calls[0][0] as string;
    expect(data).toMatch(/^data:image\/svg\+xml,/);
    expect(decodeURIComponent(data)).toContain('꽃다발.jpg');
    expect(decodeURIComponent(data)).toContain('width="200" height="140"');
    expect(dialog.querySelector('[aria-label="연습 그림 목록"]')).toHaveClass('grid-cols-2', 'sm:grid-cols-3');
  });
  it('supports direct double-click selection and closes without selecting', () => {
    const onSelect = vi.fn(), onClose = vi.fn();
    render(<ImagePickerDialog onSelect={onSelect} onClose={onClose} />);
    fireEvent.doubleClick(screen.getByRole('button', { name: '강아지.jpg' }));
    expect(decodeURIComponent(onSelect.mock.calls[0][0])).toContain('강아지.jpg');
    fireEvent.click(screen.getByRole('button', { name: '취소' }));
    expect(onClose).toHaveBeenCalledOnce();
    expect(onSelect).toHaveBeenCalledOnce();
  });
});

describe('responsive table dialog', () => {
  it('clamps rows and columns to 1–20 and keeps create/cancel in the footer', () => {
    const onInsert = vi.fn();
    render(<TableDialog onInsert={onInsert} onClose={() => {}} isQuest />);
    fireEvent.change(screen.getByLabelText('줄 개수'), { target: { value: '999' } });
    fireEvent.change(screen.getByLabelText('칸 개수'), { target: { value: '-5' } });
    expect(screen.getByLabelText('줄 개수')).toHaveValue(20);
    expect(screen.getByLabelText('칸 개수')).toHaveValue(1);
    const footer = screen.getByRole('dialog', { name: '표 만들기' }).querySelector('[data-dialog-footer]') as HTMLElement;
    fireEvent.click(within(footer).getByRole('button', { name: '만들기(D)' }));
    expect(onInsert).toHaveBeenCalledWith(20, 1);
    expect(within(footer).getByRole('button', { name: '취소' })).toBeInTheDocument();
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '표마당(A)...' })).not.toBeInTheDocument();
  });
  it('submits the default 3 × 2 table and cancels without inserting', () => {
    const onInsert = vi.fn(), onClose = vi.fn();
    render(<TableDialog onInsert={onInsert} onClose={onClose} isQuest={false} />);
    fireEvent.click(screen.getByRole('button', { name: '만들기(D)' }));
    expect(onInsert).toHaveBeenCalledWith(3, 2);
    fireEvent.click(screen.getByRole('button', { name: '취소' }));
    expect(onClose).toHaveBeenCalledOnce();
    expect(onInsert).toHaveBeenCalledOnce();
  });
});
