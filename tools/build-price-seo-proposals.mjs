import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { SpreadsheetFile, Workbook } from '@oai/artifact-tool';
import { servicePriceCatalog } from '../scripts/data/service-prices.js';
import { buildPrioritySemantics, publicPriceName } from './semantic-core-data.mjs';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputDir = path.join(projectRoot, 'outputs', 'seo-semantic-core-2026-10-06');
const outputPath = path.join(outputDir, 'price-list-seo-proposals.xlsx');
const previewDir = path.join(process.env.TEMP || outputDir, 'doctor38-price-proposals-preview');
const fontName = 'Arial';

const colors = {
  text: '#202124',
  muted: '#5F6368',
  header: '#4F5B66',
  headerText: '#FFFFFF',
  section: '#E9ECEF',
  line: '#C9CDD1',
  input: '#FFF2CC',
  warning: '#FCE8E6',
  success: '#E6F4EA',
  neutral: '#F5F5F5',
};

const categoryById = new Map(servicePriceCatalog.categories.map((category) => [category.id, category]));
const semantics = buildPrioritySemantics(servicePriceCatalog);
const entityByService = new Map(semantics.entityRows.map((row) => [row[9], row]));

function stableId(service) {
  return `P${createHash('sha256').update(`${service.category}|${service.name}|${service.price}`).digest('hex').slice(0, 9)}`;
}

function detectedIssues(service) {
  const name = service.name;
  const issues = [];
  if (/Сравка|териотроп|кадиолог/i.test(name)) issues.push('Опечатка');
  if (/\((?:Власова|Мясникова|Глазкова|Пиксаева)\s+[А-Я]\./i.test(name)) issues.push('Врач указан в названии');
  if (/^АКЦИЯ!+/i.test(name)) issues.push('Акция включена в название');
  if (name.length > 160) issues.push('Слишком длинное название');
  if (/,[А-Яа-яЁёA-Za-z]/.test(name) || /\.№/.test(name)) issues.push('Пунктуация и пробелы');
  if (service.category === 'droppers' && name.length > 160) issues.push('Медицинское описание внутри названия');
  return issues;
}

function providerFromName(name) {
  if (/Власова|Мясникова/i.test(name)) return 'Мясникова Александра Валерьевна';
  if (/Глазкова/i.test(name)) return 'Глазкова Яна Алексеевна';
  if (/Пиксаева/i.test(name)) return 'Пиксаева Ирина Викторовна';
  return '';
}

function normalizedProposal(service, issues) {
  let value = publicPriceName(service.name)
    .replace(/Сравка врача\s*-\s*дерматолога/g, 'Справка врача-дерматолога')
    .replace(/Сравка/g, 'Справка')
    .replace(/териотроп/gi, 'тиреотроп')
    .replace(/терапевта-кадиолога/gi, 'терапевта-кардиолога')
    .replace(/^АКЦИЯ!+\s*/i, '')
    .replace(/\.№\s*/g, ' № ')
    .replace(/№\s*(\d+)/g, '№ $1')
    .replace(/([А-Яа-яЁёA-Za-z]),(?=[А-Яа-яЁёA-Za-z])/g, '$1, ')
    .replace(/\s+/g, ' ')
    .trim();

  if (issues.includes('Врач указан в названии')) {
    value = value.replace(/\s*\((?:Мясникова|Глазкова|Пиксаева)\s+[А-Я]\.[А-Я]\.\)\s*$/i, '').trim();
  }
  if (service.category === 'droppers' && issues.includes('Медицинское описание внутри названия')) {
    const entity = entityByService.get(service.name);
    if (entity?.[4]) value = entity[4].replace(/\.№\s*/g, ' № ').replace(/№\s*(\d+)/g, '№ $1').replace(/,\s*/g, ', ').trim();
  }
  if (issues.includes('Акция включена в название')) {
    value = value.replace(/\s*\((?:скидка\s*\d+%|\d+\s*руб\.|\d{4,})\)\s*$/i, '').trim();
  }
  return value;
}

function separateField(service, issues) {
  const values = [];
  const provider = providerFromName(service.name);
  if (provider) values.push(`Исполнитель: ${provider}`);
  if (issues.includes('Акция включена в название')) values.push('Акция и размер скидки');
  if (issues.includes('Слишком длинное название')) values.push('Состав, подготовка или пояснение к услуге');
  if (issues.includes('Медицинское описание внутри названия')) values.push('Описание программы и ожидаемый эффект');
  return [...new Set(values)].join('; ');
}

function reasonFor(issues) {
  const reasons = [];
  if (issues.includes('Опечатка')) reasons.push('Исправить явную ошибку в названии');
  if (issues.includes('Врач указан в названии')) reasons.push('Хранить специалиста отдельно от названия услуги');
  if (issues.includes('Акция включена в название')) reasons.push('Хранить акцию отдельно, чтобы основное название не менялось');
  if (issues.includes('Слишком длинное название')) reasons.push('Сократить название, а состав и пояснение вынести в описание');
  if (issues.includes('Пунктуация и пробелы')) reasons.push('Привести пробелы и знаки препинания к единому виду');
  if (issues.includes('Медицинское описание внутри названия')) reasons.push('Медицинские обещания должен проверить врач');
  return reasons.join('. ');
}

function statusFor(service, issues) {
  if (issues.includes('Медицинское описание внутри названия')) return 'Согласовать с врачом';
  if (issues.includes('Слишком длинное название') || issues.includes('Акция включена в название') || issues.includes('Врач указан в названии')) return 'На согласование';
  if (issues.includes('Опечатка') || issues.includes('Пунктуация и пробелы')) return 'Можно применить после проверки';
  return 'Без изменений';
}

function auditNote(service, issues) {
  if (/Власова/i.test(service.name)) return 'На сайте фамилия уже временно заменена на Мясникову; финальную структуру названия нужно подтвердить.';
  if (issues.includes('Слишком длинное название') && service.category !== 'droppers') return 'Автоматическое сокращение не выполнялось, чтобы не изменить медицинский смысл.';
  if (issues.includes('Медицинское описание внутри названия')) return 'Предлагается короткое название; описание эффекта не публиковать без проверки врача.';
  return '';
}

const sourceRows = servicePriceCatalog.services.map((service) => {
  const category = categoryById.get(service.category);
  const entity = entityByService.get(service.name);
  const issues = detectedIssues(service);
  return {
    id: stableId(service),
    direction: category?.label || service.category,
    originalName: service.name,
    price: service.price,
    page: entity?.[13] || category?.href || '',
    cluster: entity?.[3] || category?.label || '',
    issues,
    status: issues.length ? 'Есть предложение' : 'Без изменений на этом этапе',
    service,
  };
});

const score = (issues) =>
  (issues.includes('Опечатка') ? 100 : 0) +
  (issues.includes('Медицинское описание внутри названия') ? 80 : 0) +
  (issues.includes('Врач указан в названии') ? 60 : 0) +
  (issues.includes('Акция включена в название') ? 50 : 0) +
  (issues.includes('Слишком длинное название') ? 30 : 0) +
  (issues.includes('Пунктуация и пробелы') ? 10 : 0);

const proposalRecords = sourceRows
  .filter((row) => row.issues.length)
  .map((row) => ({
    ...row,
    proposedName: normalizedProposal(row.service, row.issues),
    separateField: separateField(row.service, row.issues),
    reason: reasonFor(row.issues),
    approvalStatus: statusFor(row.service, row.issues),
    note: auditNote(row.service, row.issues),
  }))
  .toSorted((a, b) => score(b.issues) - score(a.issues) || a.direction.localeCompare(b.direction, 'ru') || a.originalName.localeCompare(b.originalName, 'ru'));

const workbook = Workbook.create();
const summary = workbook.worksheets.add('Сводка');
const proposals = workbook.worksheets.add('Предложения');
const source = workbook.worksheets.add('Исходный прайс');

for (const sheet of [summary, proposals, source]) {
  sheet.showGridLines = false;
}
summary.tabColor = '#4F5B66';

summary.getRange('A2').values = [['Предложения по изменению прайс-листа под семантическое ядро']];
summary.getRange('A2').format.font = { name: fontName, size: 14, bold: true, color: colors.text };
summary.getRange('A3').values = [['Исходные названия не изменены. Все правки вынесены отдельно для проверки клиникой и SEO-аудитором.']];
summary.getRange('A3').format.font = { name: fontName, size: 10, italic: true, color: colors.muted };
summary.getRange('A5:B12').values = [
  ['Показатель', 'Значение'],
  ['Услуг в актуальном прайсе', null],
  ['Позиций с предложениями', null],
  ['Явные опечатки', null],
  ['Врач указан внутри названия', null],
  ['Акция включена в название', null],
  ['Слишком длинные названия', null],
  ['Пунктуация и пробелы', null],
];
summary.getRange('B6').formulas = [[`=COUNTA('Исходный прайс'!A5:A${sourceRows.length + 4})`]];
summary.getRange('B7').formulas = [[`=COUNTA('Предложения'!A5:A${proposalRecords.length + 4})`]];
summary.getRange('B8:B12').values = [[
  proposalRecords.filter((row) => row.issues.includes('Опечатка')).length,
], [
  proposalRecords.filter((row) => row.issues.includes('Врач указан в названии')).length,
], [
  proposalRecords.filter((row) => row.issues.includes('Акция включена в название')).length,
], [
  proposalRecords.filter((row) => row.issues.includes('Слишком длинное название')).length,
], [
  proposalRecords.filter((row) => row.issues.includes('Пунктуация и пробелы')).length,
]];

summary.getRange('D5:E10').values = [
  ['Что проверить на аудите', 'Результат'],
  ['Единые названия услуг', 'Утвердить предлагаемые формулировки или оставить комментарий'],
  ['Врачи в названиях', 'Решить, хранить ли исполнителя отдельным полем'],
  ['Акционные позиции', 'Отделить постоянное название услуги от акции и скидки'],
  ['Капельницы', 'Проверить медицинские названия и описания ответственным врачом'],
  ['Длинные позиции', 'Согласовать короткое название без потери медицинского смысла'],
];

summary.getRange('A15:B19').values = [
  ['Порядок работы', 'Действие'],
  ['1', 'Клиника проверяет медицинские формулировки и фамилии специалистов'],
  ['2', 'SEO-аудитор проверяет соответствие названий кластерам и целевым страницам'],
  ['3', 'Согласованные названия применяются в прайсе и на сайте'],
  ['4', 'Несогласованные позиции остаются без изменения'],
];
summary.getRange('D15:E18').values = [
  ['Источник', 'Использование'],
  ['Услуги (1).xlsx', '937 услуг с подтверждённой ценой'],
  ['Семантическое ядро', 'Кластеры и целевые страницы для приоритетных направлений'],
  ['Дата подготовки', '2026-10-06'],
];

for (const range of ['A5:B5', 'D5:E5', 'A15:B15', 'D15:E15']) {
  summary.getRange(range).format = { fill: colors.header, font: { name: fontName, size: 10, bold: true, color: colors.headerText }, verticalAlignment: 'center' };
}
summary.getRange('A5:B12').format.borders = { preset: 'inside', style: 'thin', color: colors.line };
summary.getRange('D5:E10').format.borders = { preset: 'inside', style: 'thin', color: colors.line };
summary.getRange('A15:B19').format.borders = { preset: 'inside', style: 'thin', color: colors.line };
summary.getRange('D15:E18').format.borders = { preset: 'inside', style: 'thin', color: colors.line };
summary.getRange('A1:E20').format.font = { name: fontName, size: 10, color: colors.text };
summary.getRange('A2').format.font = { name: fontName, size: 14, bold: true, color: colors.text };
summary.getRange('A3').format.font = { name: fontName, size: 10, italic: true, color: colors.muted };
for (const range of ['A5:B5', 'D5:E5', 'A15:B15', 'D15:E15']) {
  summary.getRange(range).format.font = { name: fontName, size: 10, bold: true, color: colors.headerText };
}
summary.getRange('A:A').format.columnWidth = 34;
summary.getRange('B:B').format.columnWidth = 55;
summary.getRange('C:C').format.columnWidth = 3;
summary.getRange('D:D').format.columnWidth = 28;
summary.getRange('E:E').format.columnWidth = 68;
summary.getRange('A5:E19').format.verticalAlignment = 'center';
summary.getRange('A5:E19').format.wrapText = true;
summary.getRange('6:19').format.rowHeight = 34;

const proposalHeaders = ['ID', 'Направление', 'Исходное название', 'Предлагаемое название', 'Цена, ₽', 'Тип изменения', 'Причина', 'Целевая страница', 'Вынести в отдельное поле', 'Статус', 'Комментарий для аудита'];
const proposalRows = proposalRecords.map((row) => [
  row.id,
  row.direction,
  row.originalName,
  row.proposedName,
  row.price,
  row.issues.join('; '),
  row.reason,
  row.page,
  row.separateField,
  row.approvalStatus,
  row.note,
]);
proposals.getRange('A2').values = [['Предложения по изменению названий']];
proposals.getRange('A2').format.font = { name: fontName, size: 14, bold: true, color: colors.text };
proposals.getRange('A3').values = [['Жёлтая колонка «Статус» предназначена для решения клиники или аудитора. Предлагаемые названия не применены к исходному прайсу.']];
proposals.getRange('A3').format.font = { name: fontName, size: 10, italic: true, color: colors.muted };
proposals.getRange('A4:K4').values = [proposalHeaders];
proposals.getRange(`A5:K${proposalRows.length + 4}`).values = proposalRows;
proposals.getRange('A4:K4').format = { fill: colors.header, font: { name: fontName, size: 10, bold: true, color: colors.headerText }, verticalAlignment: 'center', wrapText: true };
proposals.getRange(`A5:K${proposalRows.length + 4}`).format.font = { name: fontName, size: 10, color: colors.text };
proposals.getRange(`A5:K${proposalRows.length + 4}`).format.verticalAlignment = 'top';
proposals.getRange(`B5:D${proposalRows.length + 4}`).format.wrapText = true;
proposals.getRange(`F5:K${proposalRows.length + 4}`).format.wrapText = true;
proposals.getRange(`E5:E${proposalRows.length + 4}`).format.numberFormat = '#,##0 "₽"';
proposals.getRange(`J5:J${proposalRows.length + 4}`).format.fill = colors.input;
proposals.getRange(`J5:J${proposalRows.length + 4}`).dataValidation = { rule: { type: 'list', values: ['На согласование', 'Согласовать с врачом', 'Можно применить после проверки', 'Частично подтверждено', 'Отложить'] } };
proposals.getRange(`J5:J${proposalRows.length + 4}`).conditionalFormats.add('containsText', { text: 'Согласовать с врачом', format: { fill: colors.warning, font: { bold: true, color: '#A50E0E' } } });
proposals.getRange(`J5:J${proposalRows.length + 4}`).conditionalFormats.add('containsText', { text: 'Можно применить', format: { fill: colors.success, font: { color: '#137333' } } });
proposals.tables.add(`A4:K${proposalRows.length + 4}`, true, 'PriceSeoProposals');
proposals.freezePanes.freezeRows(4);
proposals.freezePanes.freezeColumns(2);
proposals.getRange('A:A').format.columnWidth = 14;
proposals.getRange('B:B').format.columnWidth = 25;
proposals.getRange('C:D').format.columnWidth = 62;
proposals.getRange('E:E').format.columnWidth = 13;
proposals.getRange('F:F').format.columnWidth = 32;
proposals.getRange('G:G').format.columnWidth = 48;
proposals.getRange('H:H').format.columnWidth = 25;
proposals.getRange('I:I').format.columnWidth = 40;
proposals.getRange('J:J').format.columnWidth = 27;
proposals.getRange('K:K').format.columnWidth = 48;
proposals.getRange(`5:${proposalRows.length + 4}`).format.rowHeight = 64;

const sourceHeaders = ['ID', 'Направление', 'Исходное название', 'Цена, ₽', 'Текущая или целевая страница', 'Найденные замечания', 'Состояние'];
const fullRows = sourceRows.map((row) => [row.id, row.direction, row.originalName, row.price, row.page, row.issues.join('; '), row.status]);
source.getRange('A2').values = [['Исходный актуальный прайс']];
source.getRange('A2').format.font = { name: fontName, size: 14, bold: true, color: colors.text };
source.getRange('A3').values = [['Справочный лист. Названия и цены сохранены без изменений.']];
source.getRange('A3').format.font = { name: fontName, size: 10, italic: true, color: colors.muted };
source.getRange('A4:G4').values = [sourceHeaders];
source.getRange(`A5:G${fullRows.length + 4}`).values = fullRows;
source.getRange('A4:G4').format = { fill: colors.header, font: { name: fontName, size: 10, bold: true, color: colors.headerText }, verticalAlignment: 'center', wrapText: true };
source.getRange(`A5:G${fullRows.length + 4}`).format.font = { name: fontName, size: 10, color: colors.text };
source.getRange(`A5:G${fullRows.length + 4}`).format.verticalAlignment = 'top';
source.getRange(`B5:B${fullRows.length + 4}`).format.wrapText = true;
source.getRange(`C5:C${fullRows.length + 4}`).format.wrapText = true;
source.getRange(`F5:G${fullRows.length + 4}`).format.wrapText = true;
source.getRange(`D5:D${fullRows.length + 4}`).format.numberFormat = '#,##0 "₽"';
source.getRange(`G5:G${fullRows.length + 4}`).conditionalFormats.add('containsText', { text: 'Есть предложение', format: { fill: colors.input, font: { bold: true, color: '#7A4D00' } } });
source.tables.add(`A4:G${fullRows.length + 4}`, true, 'SourcePriceList');
source.freezePanes.freezeRows(4);
source.freezePanes.freezeColumns(2);
source.getRange('A:A').format.columnWidth = 14;
source.getRange('B:B').format.columnWidth = 30;
source.getRange('C:C').format.columnWidth = 76;
source.getRange('D:D').format.columnWidth = 13;
source.getRange('E:E').format.columnWidth = 28;
source.getRange('F:F').format.columnWidth = 40;
source.getRange('G:G').format.columnWidth = 30;
source.getRange(`5:${fullRows.length + 4}`).format.rowHeight = 36;

workbook.recalculate();
await fs.mkdir(outputDir, { recursive: true });
await fs.mkdir(previewDir, { recursive: true });

const summaryInspect = await workbook.inspect({ kind: 'table', range: 'Сводка!A2:E19', include: 'values,formulas', tableMaxRows: 25, tableMaxCols: 6, maxChars: 10000 });
const proposalInspect = await workbook.inspect({ kind: 'table', range: `Предложения!A2:K${Math.min(proposalRows.length + 4, 20)}`, include: 'values,formulas', tableMaxRows: 20, tableMaxCols: 11, maxChars: 16000 });
const errors = await workbook.inspect({ kind: 'match', searchTerm: '#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!|#SPILL!|#CALC!', options: { useRegex: true, maxResults: 300 }, summary: 'final formula error scan' });

for (const [sheetName, range, fileName] of [
  ['Сводка', 'A1:E20', 'summary.png'],
  ['Предложения', `A1:K${Math.min(proposalRows.length + 4, 20)}`, 'proposals.png'],
  ['Исходный прайс', 'A1:G18', 'source.png'],
]) {
  const image = await workbook.render({ sheetName, range, scale: 1.25, format: 'png' });
  await fs.writeFile(path.join(previewDir, fileName), new Uint8Array(await image.arrayBuffer()));
}

const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(outputPath);

console.log(JSON.stringify({
  outputPath,
  previewDir,
  sourceRows: sourceRows.length,
  proposalRows: proposalRows.length,
  issueCounts: {
    typos: proposalRecords.filter((row) => row.issues.includes('Опечатка')).length,
    doctors: proposalRecords.filter((row) => row.issues.includes('Врач указан в названии')).length,
    promotions: proposalRecords.filter((row) => row.issues.includes('Акция включена в название')).length,
    longNames: proposalRecords.filter((row) => row.issues.includes('Слишком длинное название')).length,
    punctuation: proposalRecords.filter((row) => row.issues.includes('Пунктуация и пробелы')).length,
  },
  summary: summaryInspect.ndjson,
  proposals: proposalInspect.ndjson,
  errors: errors.ndjson,
}, null, 2));
