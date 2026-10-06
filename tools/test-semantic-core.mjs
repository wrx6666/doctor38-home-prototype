import assert from 'node:assert/strict';
import { FileBlob, SpreadsheetFile } from '@oai/artifact-tool';
import { servicePriceCatalog as catalog } from '../scripts/data/service-prices.js';
import { buildPrioritySemantics, publicPriceName } from './semantic-core-data.mjs';
import { serpDecisionRows, serpSourceRows } from './serp-clustering-2026-10-06.mjs';

const data = buildPrioritySemantics(catalog);
const { entityRows: entities, queryRows: queries, coverageRows: coverage, wordstatRows, ultrasoundWordstatRows, cosmetologyWordstatRows, exactWordstatRows } = data;
assert.equal(entities.length, 246);
assert.equal(coverage.length, 246);
assert.equal(new Set(entities.map(r=>r[0])).size, 246);
assert.equal(new Set(queries.map(r=>r[4])).size, queries.length);
assert.equal(new Set(queries.map(r=>r[0])).size, queries.length);
for(const term of ['капельницы иркутск','узи иркутск','косметология иркутск','капельницы цена иркутск']) assert(queries.some(r=>r[4]===term), term);
for(const [term,frequency] of [['капельницы',3913],['капельницы иркутск',442],['поставить капельницу иркутск',67],['инфузионная терапия',186],['антиоксидантная капельница',0]]) {
  const row=queries.find(r=>r[4]===term);
  assert(row, term);
  assert.equal(row[10],frequency,term);
  assert.equal(row[12],'Wordstat',term);
  assert.equal(row[17],'2026-10-06',term);
}
for(const [term,frequency] of [['узи',29719],['узи иркутск',9501],['узи брюшной полости',2609],['уздг',708],['узи сердца иркутск',398]]) {
  const row=queries.find(r=>r[4]===term);
  assert(row, term);
  assert.equal(row[10],frequency,term);
  assert.equal(row[12],'Wordstat',term);
  assert.equal(row[17],'2026-10-06',term);
}
for(const [term,frequency] of [['косметология',5250],['косметология иркутск',2482],['клиника косметологии иркутск',137],['косметология цены',115],['врач косметолог',221]]) {
  const row=queries.find(r=>r[4]===term);
  assert(row, term);
  assert.equal(row[10],frequency,term);
  assert.equal(row[12],'Wordstat',term);
  assert.equal(row[17],'2026-10-06',term);
}
assert.equal(queries.length,851);
assert.equal(queries.filter(r=>r[2]==='Капельницы').length,50);
assert.equal(queries.filter(r=>r[2]==='УЗИ').length,288);
assert.equal(queries.filter(r=>r[2]==='Косметология').length,513);
assert.equal(queries.filter(r=>Number.isFinite(r[10])).length,205);
assert.equal(queries.filter(r=>Number.isFinite(r[11])).length,30);
assert.equal(wordstatRows.length,37);
assert.equal(ultrasoundWordstatRows.length,103);
assert.equal(cosmetologyWordstatRows.length,220);
assert.equal(cosmetologyWordstatRows.filter(r=>String(r[3]).startsWith('В ядро')).length,87);
assert.equal(cosmetologyWordstatRows.filter(r=>r[3]==='Исключить').length,133);
assert.equal(exactWordstatRows.length,30);
assert.equal(serpDecisionRows.length,14);
assert.equal(serpSourceRows.length,14);
assert.equal(serpDecisionRows.filter(r=>String(r[6]).includes('Отдельная')).length,7);
assert.equal(serpDecisionRows.find(r=>r[1]==='инфузионная терапия иркутск')[7],'droppers.html');
assert.equal(serpDecisionRows.find(r=>r[1]==='узи сердца иркутск')[7],'echocardiography.html');
const find = text => entities.find(r=>r[9].includes(text));
assert.equal(find('Биоревитализация Belotero Hydra')[3], 'Биоревитализация');
assert.equal(find('Эластография печени')[3], 'Эластография');
assert.equal(find('УЗИ от макушки')[3], 'Детское УЗИ');
assert.equal(find('УЗИ органов брюшной полости + почек')[3], 'Комплексные УЗИ и чекапы');
assert.equal(find('УЗИ органов брюшной полости(')[13], 'ultrasound-abdomen.html');
assert.equal(find('УЗИ матки и придатков / органов малого таза')[13], 'ultrasound-pelvis.html');
assert.equal(find('УЗИ почек')[13], 'ultrasound-kidneys.html');
assert.equal(find('УЗИ сердца ЭХОКГ')[13], 'echocardiography.html');
assert.equal(find('УЗИ коленного сустава')[11], 'Пиксаева Ирина Викторовна');
assert.equal(find('УЗИ коленного сустава')[12], 'Лермонтова, 69');
assert.equal(find('УЗИ печени')[11], 'Исполнитель услуги не указан');
for(const row of coverage) {
  const source = catalog.services.find(s=>s.name===row[1]);
  assert.equal(row[4], source.price);
  if(!row[8]) assert(/Сопутствующая|Уточнить/.test(row[7]), row[1]);
  for(const id of row[8].split('; ').filter(Boolean)) assert(queries.find(q=>q[0]===id)?.[15].split('; ').includes(row[0]));
}
assert.equal(coverage.filter(r=>!r[8]).length, 9);
assert.equal(coverage.filter(r=>!r[8]&&r[7].startsWith('Сопутствующая')).length, 5);
for(const query of queries) {
  const exact = exactWordstatRows.find(r=>r[1]===query[4]);
  assert.equal(query[11], exact ? exact[4] : null);
  if(exact) assert.equal(query[19],exact[3]);
  if(Number.isFinite(query[10])) {
    assert.equal(query[12], 'Wordstat');
    assert.equal(query[18], query[2]==='Капельницы'?'05.09.2026–05.10.2026':'05.09.2026–04.10.2026');
  } else {
    assert.equal(query[10], null);
    assert.equal(query[12], 'Не загружено');
    if(query[2]==='Капельницы') assert.equal(query[13], 'Проверить медицинскую формулировку');
  }
  assert(!/до за|как подготовиться к|АКЦИЯ|Власова|Пиксаева/.test(query[4]));
  for(const id of query[15].split('; ').filter(Boolean)) assert(entities.some(r=>r[0]===id));
}
const clean = coverage.filter(r=>r[1].startsWith('Комплексная чистка лица (с пилингом) комедональная'));
assert.equal(clean.length, 2);
assert(queries.some(q=>clean.every(r=>q[15].includes(r[0]))));
const reverse = buildPrioritySemantics({...catalog,services:[...catalog.services].reverse()});
assert.deepEqual(reverse.queryRows, queries);
assert.deepEqual(reverse.entityRows, entities);
const renamedPrices = catalog.services.map(s=>publicPriceName(s.name));
assert(renamedPrices.some(s=>s.includes('(Глазкова Я.А.)')));
assert(renamedPrices.some(s=>s.includes('(Мясникова А.В.)')));
assert.equal(renamedPrices.filter(s=>s.startsWith('АКЦИЯ!')).length,catalog.services.filter(s=>s.name.startsWith('АКЦИЯ!')).length);
assert(!data.negativeKeywordRows.some(r=>['скачать','курсы','курс','форум'].includes(r[0])));

const root = new URL('../outputs/seo-semantic-core-2026-10-06/', import.meta.url);
const {fileURLToPath}=await import('node:url');
const book = await SpreadsheetFile.importXlsx(await FileBlob.load(fileURLToPath(new URL('semantic-core-doctor38-wordstat.xlsx',root))));
const qsheet=book.worksheets.getItem('Поисковые запросы');
const excelBlanks = rows => rows.map(row=>row.map(value=>value===''?null:value));
assert.deepEqual(qsheet.getRange(`A5:T${queries.length+4}`).values,excelBlanks(queries));
assert.deepEqual(book.worksheets.getItem('Wordstat капельницы').getRange(`A6:I${wordstatRows.length+5}`).values,excelBlanks(wordstatRows));
assert.deepEqual(book.worksheets.getItem('Wordstat УЗИ').getRange(`A6:I${ultrasoundWordstatRows.length+5}`).values,excelBlanks(ultrasoundWordstatRows));
assert.deepEqual(book.worksheets.getItem('Wordstat косметология').getRange(`A6:I${cosmetologyWordstatRows.length+5}`).values,excelBlanks(cosmetologyWordstatRows));
assert.deepEqual(book.worksheets.getItem('Wordstat точная').getRange(`A6:H${exactWordstatRows.length+5}`).values,excelBlanks(exactWordstatRows));
assert.deepEqual(book.worksheets.getItem('Кластеризация SERP').getRange(`A6:J${serpDecisionRows.length+5}`).values,excelBlanks(serpDecisionRows));
const serpSourceStart=serpDecisionRows.length+10;
assert.deepEqual(book.worksheets.getItem('Кластеризация SERP').getRange(`A${serpSourceStart}:F${serpSourceStart+serpSourceRows.length-1}`).values,excelBlanks(serpSourceRows));
assert.deepEqual(book.worksheets.getItem('Покрытие услуг').getRange('A2:I247').values,excelBlanks(coverage));
const summary=book.worksheets.getItem('Сводка');
const audit=book.worksheets.getItem('Аудит ядра');
book.recalculate();
assert.equal(summary.getRange('E24').values[0][0],205);
assert.equal(summary.getRange('E25').values[0][0],30);
assert.deepEqual(audit.getRange('B6:B14').values.map((row)=>row[0]), [851,205,646,30,138,0,0,0,14]);
assert.deepEqual(audit.getRange('D6:I8').values, [
  ['Капельницы',50,25,10,33,0],
  ['УЗИ',288,93,10,13,195],
  ['Косметология',513,87,10,92,369],
]);
const unmeasuredIndex=queries.findIndex(row=>row[10]===null);
assert(unmeasuredIndex>=0);
const unmeasuredRow=unmeasuredIndex+5;
qsheet.getRange(`M${unmeasuredRow}`).values=[['Wordstat']];
book.recalculate();
assert.equal(summary.getRange('E24').values[0][0],205,'Selecting source without frequency must not count');
qsheet.getRange(`K${unmeasuredRow}`).values=[[0]];
book.recalculate();
assert.equal(summary.getRange('E24').values[0][0],206,'Measured zero must count as numeric frequency');
const secondUnmeasuredRow=queries.findIndex((row,index)=>index>unmeasuredIndex&&row[10]===null)+5;
qsheet.getRange(`K${secondUnmeasuredRow}`).values=[[42]];
book.recalculate();
assert.equal(summary.getRange('E24').values[0][0],207);
// Test mutations above are in-memory only; delivered file remains blank.
const price=await SpreadsheetFile.importXlsx(await FileBlob.load(fileURLToPath(new URL('../assets/documents/services-price-current.xlsx',import.meta.url))));
const rows=price.worksheets.getItem('Прайс').getRange('A2:C938').values;
assert.equal(rows.length,937);
for(let i=0;i<rows.length;i++) {
  assert.equal(rows[i][0],renamedPrices[i]);
  assert.equal(rows[i][2],catalog.services[i].price);
}
console.log(JSON.stringify({passed:true,entities:entities.length,queries:queries.length,serpQueries:serpSourceRows.length,serpDecisions:serpDecisionRows.length,linkedServices:coverage.filter(r=>r[8]).length,documentedExceptions:9,publicPriceRows:rows.length,formulaChecks:4}));
