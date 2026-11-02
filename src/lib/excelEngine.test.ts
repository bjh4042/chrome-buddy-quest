import { describe, it, expect } from 'vitest';
import { evaluateCell, exportCsv, rangeCells, colName } from './excelEngine';
describe('spreadsheet calculations',()=>{
 it('recalculates references, mixed aggregate functions and arithmetic',()=>{
  const cells={A1:'100',A2:'200',A3:'연필',B1:'=SUM(A1:A3)',B2:'=AVERAGE(A1:A2)',C1:'=(B1-B2)*2+MAX(A1:A2)',C2:'=COUNT(A1:A3)',C3:'=MIN(A1;A2)'};
  expect(evaluateCell(cells,'B1')).toBe(300);expect(evaluateCell(cells,'B2')).toBe(150);expect(evaluateCell(cells,'C1')).toBe(500);expect(evaluateCell(cells,'C2')).toBe(2);expect(evaluateCell(cells,'C3')).toBe(100);
  expect(evaluateCell({...cells,A1:'300'},'B1')).toBe(500);
 });
 it('handles direct and indirect circular references and error propagation',()=>{
  expect(evaluateCell({A1:'=A1'},'A1')).toBe('#CIRC!');expect(evaluateCell({A1:'=B1',B1:'=SUM(A1:A2)'},'A1')).toBe('#CIRC!');
  expect(evaluateCell({A1:'=1/0',A2:'=SUM(A1)'},'A2')).toBe('#DIV/0!');expect(evaluateCell({A1:'=AVERAGE(B1:B3)'},'A1')).toBe('#DIV/0!');
 });
 it('rejects code, unknown functions and malformed formulas without executing',()=>{
  for(const raw of ['=alert(1)','=globalThis.x=1','=SUM(A1:A999999)','=1+','=SUM(1,2']) expect(String(evaluateCell({B1:raw},'B1'))).toMatch(/^#/);
  expect(evaluateCell({A1:'=SECRET(1)'},'A1')).toBe('#NAME?');
 });
 it('supports precedence, percentages and absolute references',()=>{
  expect(evaluateCell({A1:'=2+3*4'},'A1')).toBe(14);expect(evaluateCell({A1:'=2^3^2'},'A1')).toBe(64);expect(evaluateCell({A1:'=-2^2'},'A1')).toBe(4);expect(evaluateCell({A1:'=2^-2'},'A1')).toBe(0.25);expect(evaluateCell({A1:'100',B1:'=$A$1*25%'},'B1')).toBe(25);
 });
 it('formats CSV quotes, commas, multiline content and prevents formula injection',()=>{
  expect(exportCsv({A1:'친구, 이름',B1:'"인사"',A2:'첫째\n둘째',B2:'=100+200'})).toBe('\uFEFF"친구, 이름","""인사"""\r\n"첫째\n둘째",300');
  expect(exportCsv({A1:"'=DANGEROUS()"})).toBe("\uFEFF'=DANGEROUS()");
 });
 it('supports reverse selection and multi letter columns',()=>{expect(rangeCells('B2','A1')).toEqual(['A1','B1','A2','B2']);expect(colName(26)).toBe('AA');});
});
