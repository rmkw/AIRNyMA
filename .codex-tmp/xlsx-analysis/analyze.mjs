import { FileBlob, SpreadsheetFile } from '@oai/artifact-tool';

const file = await FileBlob.load('C:/Users/LUIS.CASTANEDAL/Downloads/DSIRNMA_import.xlsx');
const workbook = await SpreadsheetFile.importXlsx(file);
const overview = await workbook.inspect({
  kind: 'workbook,sheet,table',
  maxChars: 8000,
  tableMaxRows: 8,
  tableMaxCols: 35,
  tableMaxCellChars: 120,
});
console.log('OVERVIEW');
console.log(overview.ndjson);

const sheets = await workbook.inspect({ kind: 'sheet', include: 'id,name', maxChars: 3000 });
console.log('SHEETS');
console.log(sheets.ndjson);

const firstSheet = workbook.worksheets.getItemAt(0);
const used = firstSheet.getUsedRange(true);
console.log('USED_RANGE');
console.log(JSON.stringify({ sheet: firstSheet.name, address: used?.address, values: used?.values }));

const [headers, ...rows] = used.values;
const stats = headers.map((header, index) => ({
  header,
  empty: rows.filter(row => row[index] === null || String(row[index] ?? '').trim() === '').length,
  dash: rows.filter(row => String(row[index] ?? '').trim() === '-').length,
  types: [...new Set(rows.map(row => typeof row[index]))],
  unique: new Set(rows.map(row => String(row[index] ?? '').trim())).size,
}));
const index = Object.fromEntries(headers.map((h, i) => [h, i]));
const invalidUrls = rows.flatMap((row, ri) => ['url', 'urlVariable'].filter(h => {
  try { const value = String(row[index[h]] ?? ''); const parsed = new URL(value); return !['http:', 'https:'].includes(parsed.protocol); }
  catch { return true; }
}).map(h => ({ row: ri + 2, column: h, value: row[index[h]] })));
const ids = rows.map(row => `${row[index.id_s]}-${row[index.edicion]}`);
console.log('STATS');
console.log(JSON.stringify({ rows: rows.length, stats, invalidUrls,
  duplicateIds: ids.filter((id, i) => ids.indexOf(id) !== i),
  carriageArtifacts: rows.reduce((n, row) => n + row.filter(v => typeof v === 'string' && v.includes('_x000D_')).length, 0)
}, null, 2));
