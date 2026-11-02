import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ExcelWindow from './ExcelWindow';
import { QuestEngineProvider } from '@/features/quests/useQuestEngine';
vi.mock('./WindowFrame',()=>({default:({children,toolbar}:{children:React.ReactNode;toolbar:React.ReactNode})=><div>{toolbar}{children}</div>}));
beforeEach(()=>localStorage.clear());afterEach(cleanup);
function setup(){const emit=vi.fn(()=> 'ignore' as const);const view=render(<QuestEngineProvider value={{currentQuest:'excel-input',emit}}><ExcelWindow onClose={vi.fn()} onQuestComplete={vi.fn()} currentQuestType="excel-input"/></QuestEngineProvider>);return {...view,emit};}
function cell(id:string){return document.querySelector(`[role=gridcell][aria-label^="${id} "]`)! as HTMLElement;}
function typeAndCommit(id:string,value:string){if(!screen.queryByLabelText(`셀 ${id}`))fireEvent.mouseDown(cell(id));fireEvent.change(screen.getByLabelText(`셀 ${id}`),{target:{value}});fireEvent.keyDown(screen.getByLabelText(`셀 ${id}`),{key:'Enter'});}
describe('Excel practice workflow',()=>{
 it('emits a confirmed input only after a student commits, preserving blanks and Enter navigation',()=>{
  const {emit}=setup();fireEvent.change(screen.getByLabelText('셀 A1'),{target:{value:'100'}});expect(emit).not.toHaveBeenCalledWith(expect.objectContaining({type:'CELL_VALUE_ENTERED'}));
  fireEvent.keyDown(screen.getByLabelText('셀 A1'),{key:'Enter'});expect(emit).toHaveBeenCalledWith({type:'CELL_VALUE_ENTERED',app:'excel',cell:'A1',value:'100',confirmed:true});expect(screen.getByLabelText('셀 A2')).toBeInTheDocument();
  fireEvent.mouseDown(cell('A1'));fireEvent.change(screen.getByLabelText('셀 A1'),{target:{value:''}});fireEvent.keyDown(screen.getByLabelText('셀 A1'),{key:'Enter'});expect(cell('A1')).toBeInTheDocument();
 });
 it('shows calculated results in cells and formulas in the formula bar, recalculates and restores after reopen',()=>{
  const view=setup();typeAndCommit('A1','100');typeAndCommit('B1','=A1*2');
  expect(cell('B1')).toHaveAttribute('aria-label','B1 200');fireEvent.mouseDown(cell('B1'));expect(screen.getByLabelText('셀 B1')).toHaveValue('200');expect(screen.getByLabelText('수식 입력줄')).toHaveValue('=A1*2');
  typeAndCommit('A1','125');expect(cell('B1')).toHaveAttribute('aria-label','B1 250');view.unmount();setup();expect(cell('B1')).toHaveAttribute('aria-label','B1 250');
 });
 it('keeps new worksheets independent and applies formatting to the selected cell',()=>{
  setup();typeAndCommit('A1','100');fireEvent.click(screen.getByRole('button',{name:'새 시트'}));expect(screen.getByLabelText('셀 A1')).toHaveValue('');typeAndCommit('A1','25');fireEvent.click(screen.getByRole('tab',{name:'Sheet1'}));expect(screen.getByLabelText('셀 A1')).toHaveValue('100');fireEvent.click(screen.getByRole('button',{name:'굵게'}));expect(screen.getByRole('button',{name:'굵게'})).toHaveAttribute('aria-pressed','true');
 });
 it('awards the budget checklist from actual calculations, formatting and an explicit save',()=>{
  setup();fireEvent.click(screen.getByRole('button',{name:'실습 자료 불러오기'}));expect(screen.getByText('0 / 6 완료')).toBeInTheDocument();
  typeAndCommit('C4','3');typeAndCommit('D4','=B4*C4');typeAndCommit('D5','=B5*C5');typeAndCommit('D6','=B6*C6');typeAndCommit('D7','=SUM(D4:D6)');typeAndCommit('D8','=AVERAGE(D4:D6)');
  fireEvent.mouseDown(cell('D7'));fireEvent.click(screen.getByRole('button',{name:'굵게'}));expect(screen.getByText('5 / 6 완료')).toBeInTheDocument();fireEvent.click(screen.getByRole('button',{name:'통합 문서 저장'}));expect(screen.getByText('6 / 6 완료')).toBeInTheDocument();
 });
});
