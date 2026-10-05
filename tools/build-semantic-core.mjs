import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SpreadsheetFile, Workbook } from '@oai/artifact-tool';
import { servicePriceCatalog } from '../scripts/data/service-prices.js';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputDir = path.join(projectRoot, 'outputs', 'seo-semantic-core-2026-10-05');
const outputPath = path.join(outputDir, 'semantic-core-doctor38-standard.xlsx');
const previewDir = path.join(process.env.TEMP || outputDir, 'doctor38-semantic-core-preview');

const colors = {
  text: '#222222',
  header: '#D9E2F3',
  paleGreen: '#E2F0D9',
  paleAmber: '#FFF2CC',
  paleRed: '#FCE4D6',
  line: '#B7B7B7',
  muted: '#666666',
};

const clusters = [
  ['C01', 'Высокий', 'Клиника', 'медицинский центр Иркутск', 'частная клиника Иркутск; клиника для всей семьи Иркутск', 'Коммерческий', 'index.html', 'index.html', 'Текущая', 0, '', 'Медицинский центр в Иркутске — Добрый Доктор', 'Медицинский центр «Добрый Доктор» в Иркутске', 'Прием врачей, УЗИ, анализы, педиатрия, гинекология и косметология в медицинском центре «Добрый Доктор» в Иркутске.', 'Обновить главную и добавить локальные факторы доверия', 'Не собрано', 'Формулировку «семейная клиника» подтвердить у клиники'],
  ['C02', 'Высокий', 'Все услуги', 'медицинские услуги Иркутск', 'платные медицинские услуги Иркутск; услуги медицинского центра цены', 'Коммерческий', 'services.html', 'services.html', 'Текущая', 0, '', 'Медицинские услуги в Иркутске — Добрый Доктор', 'Медицинские услуги', 'Каталог медицинских услуг центра «Добрый Доктор» в Иркутске: прием врачей, диагностика, анализы и процедуры.', 'Расширить каталог по направлениям из актуального прайса', 'Не собрано', 'Медицинские тексты проверяет врач'],
  ['C03', 'Высокий', 'Врачи', 'врачи Иркутск', 'записаться к врачу Иркутск; врачи частной клиники Иркутск', 'Коммерческий', 'doctors.html', 'doctors.html', 'Текущая', 0, 'Все специалисты клиники', 'Врачи медицинского центра в Иркутске — Добрый Доктор', 'Врачи «Доброго Доктора»', 'Врачи медицинского центра «Добрый Доктор» в Иркутске: специальности, филиалы и запись на прием.', 'Добавить отдельные индексируемые страницы специальностей', 'Не собрано', 'Список врачей и специальности подтвердить перед запуском'],
  ['C04', 'Высокий', 'Цены', 'цены на медицинские услуги Иркутск', 'прайс медицинского центра Иркутск; стоимость приема врача Иркутск', 'Коммерческий', 'prices.html', 'prices.html', 'Текущая', 942, '', 'Цены на медицинские услуги в Иркутске — Добрый Доктор', 'Стоимость медицинских услуг', 'Актуальные цены на прием врачей, УЗИ, анализы, диагностику и косметологию в медицинском центре «Добрый Доктор».', 'Все услуги распределены по направлениям', 'Не собрано', 'Уточнить 5 нулевых цен'],
  ['C05', 'Высокий', 'Гинекология', 'гинекология Иркутск', 'гинекологическая клиника Иркутск; женское здоровье Иркутск; услуги гинеколога', 'Коммерческий', 'gynecology.html', 'gynecology.html', 'Текущая', 88, 'Сухарева Д. О.; Степанова Е. В.; Юрьева Т. Ю.', 'Гинекология в Иркутске — услуги и цены | Добрый Доктор', 'Гинекология в Иркутске', 'Услуги гинекологии в медицинском центре «Добрый Доктор» в Иркутске: консультации, обследования, процедуры, актуальные цены и запись.', 'Связать услуги прайса с врачами и ценами', 'Не собрано', 'Медицинские тексты проверяет врач'],
  ['C06', 'Высокий', 'Прием гинеколога', 'гинеколог Иркутск', 'прием гинеколога Иркутск; записаться к гинекологу Иркутск; гинеколог цена', 'Коммерческий', 'gynecologist.html', 'gynecologist.html', 'Текущая', 0, 'Сухарева Д. О.; Степанова Е. В.; Юрьева Т. Ю.', 'Прием гинеколога в Иркутске — запись и цены | Добрый Доктор', 'Прием гинеколога в Иркутске', 'Запись на прием гинеколога в медицинском центре «Добрый Доктор» в Иркутске. Врачи, филиалы, стоимость консультации и онлайн-запись.', 'Поставить актуальную цену приема из прайса', 'Не собрано', 'Медицинские тексты проверяет врач'],
  ['C07', 'Высокий', 'УЗИ', 'УЗИ Иркутск', 'сделать УЗИ Иркутск; УЗИ цена Иркутск; детское УЗИ Иркутск; УЗИ при беременности Иркутск', 'Коммерческий', 'ultrasound.html', 'ultrasound.html', 'Текущая', 67, 'Мясников В. Г.; Пиксаева И. В.', 'УЗИ в Иркутске — цены и запись | Добрый Доктор', 'УЗИ в Иркутске', 'Ультразвуковая диагностика для взрослых и детей в Иркутске. Виды исследований, врачи, цены и запись.', 'После сбора частотности определить приоритетные подстраницы исследований', 'Не собрано', 'Состав исследований проверить по прайсу'],
  ['C08', 'Высокий', 'Анализы', 'анализы Иркутск', 'сдать анализы Иркутск; лабораторные анализы Иркутск; анализы цена Иркутск', 'Коммерческий', 'analyses.html', 'analyses.html', 'Текущая', 513, '', 'Анализы в Иркутске — цены | Добрый Доктор', 'Лабораторные анализы в Иркутске', 'Лабораторные исследования в Иркутске: актуальный перечень анализов, стоимость и подготовка к сдаче.', 'Страница создана; подтвердить правила подготовки', 'Не собрано', 'Правила подготовки подтверждает клиника'],
  ['C09', 'Высокий', 'Педиатрия', 'педиатр Иркутск', 'детский врач Иркутск; прием педиатра Иркутск; педиатр цена Иркутск', 'Коммерческий', 'children.html', 'children.html', 'Текущая', 6, 'Федаш М. М.; Старшинова Е. О. — детский невролог', 'Педиатр в Иркутске — детские услуги | Добрый Доктор', 'Педиатрия и детские услуги', 'Прием педиатра и детские медицинские услуги в Иркутске. Врачи, справки, диагностика и запись.', 'Связать услуги, врачей и цены; убрать неподтвержденные услуги', 'Не собрано', 'Список детских услуг подтвердить'],
  ['C10', 'Высокий', 'Косметология', 'косметолог Иркутск', 'косметология Иркутск цены; дерматокосметолог Иркутск; косметологические процедуры Иркутск', 'Коммерческий', 'cosmetology.html', 'cosmetology.html', 'Текущая', 159, 'Мясникова А. В.; Глазкова Я. А.', 'Косметология в Иркутске — цены | Добрый Доктор', 'Косметология в Иркутске', 'Консультации косметолога и косметологические процедуры в Иркутске. Врачи, услуги, цены и запись.', 'Разбить 159 услуг на понятные подгруппы', 'Не собрано', 'Процедуры и показания проверяет врач'],
  ['C11', 'Высокий', 'Терапия', 'терапевт Иркутск', 'прием терапевта Иркутск; терапевт цена; записаться к терапевту', 'Коммерческий', 'therapy.html', 'therapy.html', 'Текущая', 8, 'Тигунцева О. И.', 'Терапевт в Иркутске — запись и цены', 'Прием терапевта в Иркутске', 'Прием терапевта в медицинском центре «Добрый Доктор» в Иркутске. Врач, стоимость и запись.', 'Страница создана; подтвердить компетенции врача', 'Не собрано', 'Компетенции врача подтвердить'],
  ['C12', 'Высокий', 'Кардиология', 'кардиолог Иркутск', 'прием кардиолога Иркутск; ЭКГ Иркутск цена; кардиолог цена', 'Коммерческий', 'cardiology.html', 'cardiology.html', 'Текущая', 4, 'Тигунцева О. И.', 'Кардиолог в Иркутске — запись и цены', 'Прием кардиолога в Иркутске', 'Прием кардиолога и ЭКГ в Иркутске. Врач, актуальные цены и онлайн-запись.', 'Страница создана; подтвердить связь с ЭКГ', 'Не собрано', 'Компетенции врача подтвердить'],
  ['C13', 'Высокий', 'Гастроэнтерология', 'гастроэнтеролог Иркутск', 'прием гастроэнтеролога Иркутск; гепатолог Иркутск; гастроэнтеролог цена', 'Коммерческий', 'gastroenterology.html', 'gastroenterology.html', 'Текущая', 2, 'Петрунько И. Л.', 'Гастроэнтеролог в Иркутске — запись и цены', 'Прием гастроэнтеролога в Иркутске', 'Прием гастроэнтеролога и гепатолога в Иркутске. Врач, стоимость консультации и запись.', 'Страница создана; подтвердить компетенции врача', 'Не собрано', 'Компетенции врача подтвердить'],
  ['C14', 'Высокий', 'Неврология', 'невролог Иркутск', 'детский невролог Иркутск; прием невролога Иркутск; невролог цена', 'Коммерческий', 'neurology.html', 'neurology.html', 'Текущая', 4, 'Старшинова Е. О.', 'Невролог в Иркутске — взрослым и детям', 'Прием невролога в Иркутске', 'Прием невролога для взрослых и детей в Иркутске. Врач, цены и запись на консультацию.', 'Страница создана; подтвердить возраст приема', 'Не собрано', 'Возраст приема и компетенции подтвердить'],
  ['C15', 'Высокий', 'Дерматология', 'дерматолог Иркутск', 'дерматовенеролог Иркутск; прием дерматолога Иркутск; дерматолог цена', 'Коммерческий', 'dermatology.html', 'dermatology.html', 'Текущая', 8, 'Мясникова А. В.; Рудых Н. М.; Асхаева Т. Л.', 'Дерматолог в Иркутске — запись и цены', 'Прием дерматолога в Иркутске', 'Консультация дерматолога и дерматовенеролога в Иркутске. Врачи, стоимость и запись.', 'Страница создана; подтвердить разделение дерматологии и косметологии', 'Не собрано', 'Компетенции врачей подтвердить'],
  ['C16', 'Высокий', 'Эндокринология', 'эндокринолог Иркутск', 'прием эндокринолога Иркутск; эндокринолог цена; гинеколог эндокринолог Иркутск', 'Коммерческий', 'endocrinology.html', 'endocrinology.html', 'Текущая', 2, 'Выгода С. Я.; Степанова Е. В. — гинеколог-эндокринолог', 'Эндокринолог в Иркутске — запись и цены', 'Прием эндокринолога в Иркутске', 'Прием эндокринолога в Иркутске. Врачи, стоимость консультации и запись в медицинский центр.', 'Страница создана; подтвердить профили врачей', 'Не собрано', 'Развести общий и гинекологический профиль'],
  ['C17', 'Высокий', 'Оториноларингология', 'ЛОР Иркутск', 'оториноларинголог Иркутск; прием ЛОРа Иркутск; ЛОР цена', 'Коммерческий', 'doctors.html', 'otorhinolaryngology.html', 'Новая', 12, '', 'ЛОР в Иркутске — прием и цены', 'Прием ЛОР-врача в Иркутске', 'Прием оториноларинголога в Иркутске. Услуги, актуальные цены и запись.', 'Сначала подтвердить наличие и данные врача, затем создать страницу', 'Не собрано', 'В текущем списке врач ЛОР не указан'],
  ['C18', 'Высокий', 'Сосудистая хирургия', 'сосудистый хирург Иркутск', 'флеболог Иркутск; прием сосудистого хирурга; флеболог цена', 'Коммерческий', 'vascular-surgery.html', 'vascular-surgery.html', 'Текущая', 2, 'Новохатько О. И.', 'Сосудистый хирург и флеболог в Иркутске', 'Прием сосудистого хирурга в Иркутске', 'Прием сосудистого хирурга и флеболога в Иркутске. Врач, стоимость и запись.', 'Страница создана; подтвердить компетенции врача', 'Не собрано', 'Компетенции врача подтвердить'],
  ['C19', 'Средний', 'Процедурный кабинет', 'процедурный кабинет Иркутск', 'уколы Иркутск; внутривенные инъекции Иркутск; забор анализов Иркутск', 'Коммерческий', 'treatment-room.html', 'treatment-room.html', 'Текущая', 42, 'Нилова И. А.; Чаюк В. С.; Ботова Я. С.', 'Процедурный кабинет в Иркутске — цены', 'Процедурный кабинет', 'Услуги процедурного кабинета в Иркутске: инъекции, манипуляции и забор анализов по назначению врача.', 'Страница создана; подтвердить условия процедур', 'Не собрано', 'Условия выполнения процедур подтвердить'],
  ['C20', 'Средний', 'ЛФК и спорт', 'лечебная физкультура Иркутск', 'спортивный врач Иркутск; справка для спорта Иркутск', 'Коммерческий', 'appointment.html', 'rehabilitation.html', 'Требуется подтверждение', 1, 'Мясников В. Г. — по данным прайса', 'Лечебная физкультура и спортивная медицина в Иркутске', 'ЛФК и спортивная медицина', 'Консультации по лечебной физкультуре и спортивной медицине в Иркутске.', 'Уточнить содержание направления и специалиста до создания страницы', 'Не собрано', 'Связь услуги и врача требует подтверждения'],
  ['C21', 'Средний', 'Капельницы', 'капельницы Иркутск', 'внутривенные капельницы Иркутск; инфузионная терапия Иркутск; капельницы цена', 'Коммерческий', 'droppers.html', 'droppers.html', 'Текущая', 24, '', 'Капельницы в Иркутске — программы и запись', 'Капельницы в Иркутске', 'Инфузионные программы в медицинском центре «Добрый Доктор» в Иркутске по назначению врача.', '24 позиции прайса сопоставлены со страницей', 'Не собрано', 'Составы и показания проверяет врач'],
  ['C22', 'Средний', 'Чекапы', 'чекап организма Иркутск', 'комплексное обследование Иркутск; обследование организма; женский чекап Иркутск', 'Коммерческий', 'checkups.html', 'checkups.html', 'Текущая', 0, '', 'Чекапы в Иркутске — программы обследования и цены | Добрый Доктор', 'Чекапы и программы диагностики в Иркутске', 'Комплексные программы обследования в медицинском центре «Добрый Доктор» в Иркутске: состав чекапов, актуальные цены и онлайн-запись.', 'Сверить состав программ с прайсом', 'Не собрано', 'Составы программ подтверждает клиника'],
  ['C23', 'Средний', 'Организациям', 'медосмотр сотрудников Иркутск', 'предрейсовый осмотр Иркутск; корпоративное медицинское обслуживание', 'Коммерческий B2B', 'organizations.html', 'organizations.html', 'Текущая', 0, '', 'Медосмотры сотрудников в Иркутске — организациям | Добрый Доктор', 'Медицинские услуги для организаций в Иркутске', 'Медицинские услуги для организаций в Иркутске: предрейсовые, послерейсовые и периодические осмотры сотрудников, корпоративное обслуживание.', 'Уточнить перечень услуг и условия договоров', 'Не собрано', 'Коммерческие условия подтверждает клиника'],
  ['C24', 'Средний', 'Контакты', 'Добрый Доктор Иркутск адрес', 'Добрый Доктор Иркутск телефон; режим работы Добрый Доктор', 'Навигационный', 'contacts.html', 'contacts.html', 'Текущая', 0, '', 'Адреса и контакты клиники — Добрый Доктор Иркутск', 'Адреса и контакты', 'Адреса филиалов медицинского центра «Добрый Доктор» в Иркутске, телефон и режим работы.', 'Добавить локальную разметку и маршруты', 'Не собрано', 'Режим работы подтвердить'],
  ['C25', 'Средний', 'Филиал Николая Гаврилова', 'медицинский центр Николая Гаврилова 4', 'клиника Николая Гаврилова 4; Добрый Доктор Гаврилова', 'Локальный', 'contacts.html#gavrilova', 'branches/gavrilova.html', 'Новая', 0, '', 'Медицинский центр на Николая Гаврилова, 4', 'Филиал на улице Николая Гаврилова, 4', 'Филиал медицинского центра «Добрый Доктор» по адресу: Иркутск, улица Николая Гаврилова, 4.', 'Создать страницу филиала после утверждения структуры', 'Не собрано', 'Услуги и врачи филиала подтвердить'],
  ['C26', 'Средний', 'Филиал Лермонтова', 'медицинский центр Лермонтова 69', 'клиника Лермонтова 69; Добрый Доктор Лермонтова', 'Локальный', 'contacts.html#lermontova', 'branches/lermontova.html', 'Новая', 0, '', 'Медицинский центр на Лермонтова, 69', 'Филиал на улице Лермонтова, 69', 'Филиал медицинского центра «Добрый Доктор» по адресу: Иркутск, улица Лермонтова, 69.', 'Создать страницу филиала после утверждения структуры', 'Не собрано', 'Услуги и врачи филиала подтвердить'],
  ['C27', 'Высокий', 'Онлайн-запись', 'записаться к врачу Иркутск', 'онлайн запись к врачу Иркутск; запись в клинику Иркутск', 'Транзакционный', 'appointment.html', 'appointment.html', 'Текущая', 0, '', 'Онлайн-запись к врачу в Иркутске | Добрый Доктор', 'Запись на прием в Иркутске', 'Запись на прием в медицинский центр «Добрый Доктор» в Иркутске. Выберите услугу, специалиста и филиал — администратор подтвердит удобное время.', 'Метатеги настроены под транзакционный запрос', 'Не собрано', 'Форма отправляет заявку администратору'],
];

const clusterByCategory = {
  gynecology: 'C05',
  therapy: 'C11',
  cardiology: 'C12',
  gastroenterology: 'C13',
  neurology: 'C14',
  pediatrics: 'C09',
  otorhinolaryngology: 'C17',
  dermatology: 'C15',
  cosmetology: 'C10',
  endocrinology: 'C16',
  ultrasound: 'C07',
  surgery: 'C18',
  rehabilitation: 'C20',
  droppers: 'C21',
  'treatment-room': 'C19',
  laboratory: 'C08',
};

const clusterLookup = new Map(clusters.map((row) => [row[0], row]));
const categoryLookup = new Map(servicePriceCatalog.categories.map((category) => [category.id, category]));

const serviceRows = servicePriceCatalog.services.map((service, index) => {
  const clusterId = clusterByCategory[service.category] || '';
  const cluster = clusterLookup.get(clusterId);
  const notes = [];
  if (!clusterId) notes.push('В исходном прайсе не указана специальность');
  if (service.price === 0) notes.push('Цена 0 ₽ — требуется подтверждение');
  return [
    index + 1,
    service.name,
    categoryLookup.get(service.category)?.label || 'Без категории',
    service.price,
    clusterId,
    cluster?.[7] || '',
    clusterId ? cluster[8] : 'Требуется классификация',
    notes.join('; '),
    index + 2,
  ];
});

const htmlFiles = (await fs.readdir(projectRoot)).filter((name) => name.endsWith('.html')).sort();
const pageSeed = {
  'index.html': 'медицинский центр Иркутск',
  'services.html': 'медицинские услуги Иркутск',
  'doctors.html': 'врачи Иркутск',
  'prices.html': 'цены на медицинские услуги Иркутск',
  'about.html': 'медицинский центр Добрый Доктор Иркутск',
  'gynecology.html': 'гинекология Иркутск',
  'gynecologist.html': 'гинеколог Иркутск',
  'diagnostics.html': 'медицинская диагностика Иркутск',
  'ultrasound.html': 'УЗИ Иркутск',
  'analyses.html': 'анализы Иркутск',
  'children.html': 'педиатр Иркутск',
  'cosmetology.html': 'косметолог Иркутск',
  'therapy.html': 'терапевт Иркутск',
  'cardiology.html': 'кардиолог Иркутск',
  'gastroenterology.html': 'гастроэнтеролог Иркутск',
  'neurology.html': 'невролог Иркутск',
  'dermatology.html': 'дерматолог Иркутск',
  'endocrinology.html': 'эндокринолог Иркутск',
  'vascular-surgery.html': 'сосудистый хирург Иркутск',
  'treatment-room.html': 'процедурный кабинет Иркутск',
  'checkups.html': 'чекап организма Иркутск',
  'droppers.html': 'капельницы Иркутск',
  'organizations.html': 'медосмотр сотрудников Иркутск',
  'contacts.html': 'Добрый Доктор Иркутск адрес',
  'documents.html': 'лицензии медицинского центра Добрый Доктор',
  'diseases.html': 'справочник заболеваний',
  'personal-data-consent.html': 'согласие на обработку персональных данных',
  'appointment.html': 'записаться к врачу Иркутск',
};

const pageRows = [];
for (const fileName of htmlFiles) {
  const html = await fs.readFile(path.join(projectRoot, fileName), 'utf8');
  const title = html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]?.trim() || '';
  const description = html.match(/<meta\s+name="description"\s+content="([^"]*)"/i)?.[1]?.trim() || '';
  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i)?.[1]?.replace(/<[^>]+>/g, ' ')?.replace(/\s+/g, ' ')?.trim() || '';
  const isNoindex = /<meta\b(?=[^>]*\bname=["']robots["'])(?=[^>]*\bcontent=["'][^"']*noindex)[^>]*>/i.test(html);
  let status = 'База готова';
  let action = 'Проверить после утверждения семантического ядра';
  if (isNoindex) {
    status = 'Не индексируется';
    action = fileName === 'diseases.html'
      ? 'Наполнить материалами перед включением в индекс'
      : 'Создать отдельные индексируемые страницы врачей';
  } else if (/прототип|редизайн/i.test(`${title} ${description}`)) {
    status = 'Требуется правка';
    action = 'Убрать служебную формулировку из метаданных';
  } else if (title.length < 25 || description.length < 80) {
    status = 'Улучшить';
    action = 'Расширить title или description под целевой запрос';
  }
  pageRows.push([fileName, pageSeed[fileName] || '', title, description, h1, status, action]);
}

const approvalRows = [
  ['Данные клиники', 'Формулировка «Семейная клиника»', 'Подтвердить или отклонить формулировку', 'Ожидает клинику'],
  ['Врачи', 'Список врачей, специальностей и филиалов', 'Подтвердить актуальность данных', 'Ожидает клинику'],
  ['Медицинские тексты', 'Названия и описания направлений', 'Проверить ответственным врачом', 'Ожидает клинику'],
  ['Направление', 'ЛОР: в прайсе 12 услуг, врач не указан', 'Указать врача или исключить направление из продвижения', 'Ожидает клинику'],
  ['Направление', 'ЛФК и спортивная медицина: в прайсе 1 услуга', 'Подтвердить услугу и специалиста', 'Ожидает клинику'],
  ['Филиалы', 'Состав услуг и врачей по двум филиалам', 'Подтвердить для создания локальных страниц', 'Ожидает клинику'],
  ...servicePriceCatalog.services
    .filter((service) => service.price === 0)
    .map((service) => ['Цена', service.name, 'Указать цену или подтвердить бесплатную услугу', 'Ожидает клинику']),
  ['Название услуги', 'Консультация терапевта-кадиолога первичная', 'Исправить на «Консультация терапевта-кардиолога первичная»', 'Ожидает клинику'],
  ['Название услуги', 'Сравка врача - дерматолога', 'Исправить на «Справка врача-дерматолога»', 'Ожидает клинику'],
  ['Фамилия в прайсе', 'Две услуги содержат «Власова А.В.»', 'Подтвердить замену на «Мясникова А.В.»', 'Ожидает клинику'],
  ['Название услуги', 'ТТГ, териотропный гормон', 'Исправить «териотропный» на «тиреотропный»', 'Ожидает клинику'],
];

const workbook = Workbook.create();
const summary = workbook.worksheets.add('Сводка');
const clusterSheet = workbook.worksheets.add('Кластеры');
const servicesSheet = workbook.worksheets.add('Услуги');
const pagesSheet = workbook.worksheets.add('Текущие страницы');
const approvalSheet = workbook.worksheets.add('На согласование');

for (const sheet of [summary, clusterSheet, servicesSheet, pagesSheet, approvalSheet]) {
  sheet.showGridLines = true;
}

summary.getRange('A2').values = [['Семантическое ядро сайта «Добрый Доктор»']];
summary.mergeCells('A2:F2');
summary.getRange('A2').format.font = { name: 'Calibri', size: 14, bold: true, color: colors.text };
summary.getRange('A3').values = [['Рабочая структура запросов и страниц. Частотность нужно загрузить из Wordstat, Вебмастера или Search Console.']];
summary.mergeCells('A3:F3');
summary.getRange('A3').format.font = { name: 'Calibri', size: 11, italic: true, color: colors.muted };
summary.getRange('A5:B11').values = [
  ['Показатель', 'Значение'],
  ['Кластеры', null],
  ['Текущие или расширяемые страницы', null],
  ['Новые страницы', null],
  ['Услуги из прайса', null],
  ['Услуги без направления', null],
  ['Услуги с ценой 0 ₽', null],
];
summary.getRange('B6').formulas = [["=COUNTA('Кластеры'!A5:A31)"]];
summary.getRange('B7').formulas = [["=COUNTIF('Кластеры'!I5:I31,\"Текущая\")+COUNTIF('Кластеры'!I5:I31,\"Расширить\")"]];
summary.getRange('B8').formulas = [["=COUNTIF('Кластеры'!I5:I31,\"Новая\")"]];
summary.getRange('B9').formulas = [["=COUNTA('Услуги'!A2:A943)"]];
summary.getRange('B10').formulas = [["=COUNTIF('Услуги'!G2:G943,\"Требуется классификация\")"]];
summary.getRange('B11').formulas = [["=COUNTIF('Услуги'!D2:D943,0)"]];
summary.getRange('D5:E10').values = [
  ['Что сделать сначала', 'Почему'],
  ['Согласование клиники', 'Нужно подтвердить нулевые цены, врачей, филиалы и медицинские формулировки'],
  ['Частотность', 'До выгрузки Wordstat или Вебмастера приоритет основан на структуре услуг'],
  ['ЛОР и ЛФК', 'В прайсе есть услуги, но состав врачей и направление требуют подтверждения'],
  ['Страницы филиалов', 'Создаются после подтверждения состава услуг и врачей по адресам'],
  ['Публикация', 'Текущие изменения нужно проверить, зафиксировать и отправить на GitHub'],
];
summary.getRange('A13:B17').values = [
  ['Источник', 'Использование'],
  ['Услуги (1).xlsx', 'Названия, направления и цены 942 услуг'],
  ['HTML-файлы проекта', 'Текущие title, description, H1 и URL'],
  ['doctors.html', 'Врачи, специальности и филиалы'],
  ['Дата подготовки', '2026-10-05'],
];

const summaryHeader = [summary.getRange('A5:B5'), summary.getRange('D5:E5'), summary.getRange('A13:B13')];
for (const range of summaryHeader) {
  range.format = { fill: colors.header, font: { name: 'Calibri', size: 11, bold: true, color: colors.text }, verticalAlignment: 'center' };
}
summary.getRange('A6:B11').format.font = { name: 'Calibri', size: 11, color: colors.text };
summary.getRange('D6:E10').format.font = { name: 'Calibri', size: 11, color: colors.text };
summary.getRange('A14:B17').format.font = { name: 'Calibri', size: 11, color: colors.text };
summary.getRange('A5:B11').format.borders = { preset: 'inside', style: 'thin', color: colors.line };
summary.getRange('D5:E10').format.borders = { preset: 'inside', style: 'thin', color: colors.line };
summary.getRange('A13:B17').format.borders = { preset: 'inside', style: 'thin', color: colors.line };
summary.getRange('A1:F18').format.verticalAlignment = 'center';
summary.getRange('A3:F3').format.wrapText = true;
summary.getRange('D6:E10').format.wrapText = true;
summary.getRange('A:A').format.columnWidth = 29;
summary.getRange('B:B').format.columnWidth = 21;
summary.getRange('C:C').format.columnWidth = 3;
summary.getRange('D:D').format.columnWidth = 28;
summary.getRange('E:E').format.columnWidth = 64;
summary.getRange('2:2').format.rowHeight = 26;
summary.getRange('3:3').format.rowHeight = 24;
summary.getRange('6:11').format.rowHeight = 35;

const clusterHeaders = ['ID', 'Приоритет', 'Направление', 'Основной запрос', 'Дополнительные запросы', 'Интент', 'Текущий URL', 'Целевой URL', 'Состояние страницы', 'Услуг в прайсе', 'Связанные врачи', 'Рекомендуемый title', 'Рекомендуемый H1', 'Рекомендуемый description', 'Следующее действие', 'Частотность', 'Что подтвердить'];
clusterSheet.getRange('A2').values = [['Кластеры запросов и целевые страницы']];
clusterSheet.getRange('A2').format.font = { name: 'Calibri', size: 14, bold: true, color: colors.text };
clusterSheet.getRange('A3').values = [['Частотность не моделировалась. Запросы составлены как рабочие группы на основе актуального прайса, текущих страниц и списка врачей.']];
clusterSheet.getRange('A3').format.font = { name: 'Calibri', size: 11, italic: true, color: colors.muted };
clusterSheet.getRange('A4:Q4').values = [clusterHeaders];
clusterSheet.getRange(`A5:Q${clusters.length + 4}`).values = clusters;
clusterSheet.getRange(`A4:Q${clusters.length + 4}`).format.font = { name: 'Calibri', size: 11, color: colors.text };
clusterSheet.getRange('A4:Q4').format = { fill: colors.header, font: { name: 'Calibri', size: 11, bold: true, color: colors.text }, horizontalAlignment: 'center', verticalAlignment: 'center', wrapText: true };
clusterSheet.getRange(`A5:Q${clusters.length + 4}`).format.verticalAlignment = 'top';
clusterSheet.getRange(`C5:Q${clusters.length + 4}`).format.wrapText = true;
clusterSheet.getRange(`J5:J${clusters.length + 4}`).format.numberFormat = '#,##0';
clusterSheet.getRange(`B5:B${clusters.length + 4}`).dataValidation = { rule: { type: 'list', values: ['Высокий', 'Средний', 'Низкий'] } };
clusterSheet.getRange(`I5:I${clusters.length + 4}`).dataValidation = { rule: { type: 'list', values: ['Текущая', 'Расширить', 'Новая', 'Требуется подтверждение'] } };
clusterSheet.getRange(`B5:B${clusters.length + 4}`).conditionalFormats.add('containsText', { text: 'Высокий', format: { fill: colors.paleRed, font: { bold: true, color: '#9F1D20' } } });
clusterSheet.getRange(`I5:I${clusters.length + 4}`).conditionalFormats.add('containsText', { text: 'Новая', format: { fill: colors.paleAmber, font: { bold: true, color: '#8A5A00' } } });
clusterSheet.getRange(`I5:I${clusters.length + 4}`).conditionalFormats.add('containsText', { text: 'Текущая', format: { fill: colors.paleGreen, font: { bold: true, color: '#086A3B' } } });
clusterSheet.getRange(`I5:I${clusters.length + 4}`).conditionalFormats.add('containsText', { text: 'Требуется подтверждение', format: { fill: colors.paleRed, font: { bold: true, color: '#9F1D20' } } });
const clustersTable = clusterSheet.tables.add(`A4:Q${clusters.length + 4}`, true, 'SemanticClusters');
clustersTable.style = 'TableStyleLight1';
clusterSheet.freezePanes.freezeRows(4);
const clusterWidths = [8, 12, 24, 30, 50, 18, 30, 30, 23, 14, 36, 48, 38, 62, 48, 15, 48];
clusterWidths.forEach((width, index) => { clusterSheet.getRangeByIndexes(0, index, 1, 1).format.columnWidth = width; });
clusterSheet.getRange('2:2').format.rowHeight = 26;
clusterSheet.getRange('3:3').format.rowHeight = 32;
clusterSheet.getRange(`5:${clusters.length + 4}`).format.rowHeight = 76;

const serviceHeaders = ['№', 'Услуга', 'Направление прайса', 'Цена, ₽', 'Кластер', 'Целевой URL', 'Состояние', 'Примечание', 'Строка источника'];
servicesSheet.getRange('A1:I1').values = [serviceHeaders];
servicesSheet.getRange(`A2:I${serviceRows.length + 1}`).values = serviceRows;
servicesSheet.getRange(`A1:I${serviceRows.length + 1}`).format.font = { name: 'Calibri', size: 11, color: colors.text };
servicesSheet.getRange('A1:I1').format = { fill: colors.header, font: { name: 'Calibri', size: 11, bold: true, color: colors.text }, horizontalAlignment: 'center', verticalAlignment: 'center', wrapText: true };
servicesSheet.getRange(`B2:C${serviceRows.length + 1}`).format.wrapText = true;
servicesSheet.getRange(`H2:H${serviceRows.length + 1}`).format.wrapText = true;
servicesSheet.getRange(`D2:D${serviceRows.length + 1}`).format.numberFormat = '#,##0" ₽"';
servicesSheet.getRange(`G2:G${serviceRows.length + 1}`).conditionalFormats.add('containsText', { text: 'Требуется классификация', format: { fill: colors.paleAmber, font: { bold: true, color: '#8A5A00' } } });
servicesSheet.getRange(`H2:H${serviceRows.length + 1}`).conditionalFormats.add('containsText', { text: 'Цена 0 ₽', format: { fill: colors.paleRed, font: { bold: true, color: '#9F1D20' } } });
const servicesTable = servicesSheet.tables.add(`A1:I${serviceRows.length + 1}`, true, 'ServiceKeywordMap');
servicesTable.style = 'TableStyleLight1';
servicesSheet.freezePanes.freezeRows(1);
servicesSheet.freezePanes.freezeColumns(2);
[8, 62, 34, 13, 11, 28, 24, 48, 16].forEach((width, index) => { servicesSheet.getRangeByIndexes(0, index, 1, 1).format.columnWidth = width; });
servicesSheet.getRange('1:1').format.rowHeight = 34;

const pageHeaders = ['Файл', 'Целевой запрос', 'Текущий title', 'Текущий description', 'Текущий H1', 'Статус', 'Действие'];
pagesSheet.getRange('A2').values = [['Текущие страницы сайта']];
pagesSheet.getRange('A2').format.font = { name: 'Calibri', size: 14, bold: true, color: colors.text };
pagesSheet.getRange('A3:G3').values = [pageHeaders];
pagesSheet.getRange(`A4:G${pageRows.length + 3}`).values = pageRows;
pagesSheet.getRange(`A3:G${pageRows.length + 3}`).format.font = { name: 'Calibri', size: 11, color: colors.text };
pagesSheet.getRange('A3:G3').format = { fill: colors.header, font: { name: 'Calibri', size: 11, bold: true, color: colors.text }, horizontalAlignment: 'center', verticalAlignment: 'center', wrapText: true };
pagesSheet.getRange(`B4:G${pageRows.length + 3}`).format.wrapText = true;
pagesSheet.getRange(`F4:F${pageRows.length + 3}`).conditionalFormats.add('containsText', { text: 'Требуется', format: { fill: colors.paleRed, font: { bold: true, color: '#9F1D20' } } });
pagesSheet.getRange(`F4:F${pageRows.length + 3}`).conditionalFormats.add('containsText', { text: 'Улучшить', format: { fill: colors.paleAmber, font: { bold: true, color: '#8A5A00' } } });
pagesSheet.getRange(`F4:F${pageRows.length + 3}`).conditionalFormats.add('containsText', { text: 'Не индексируется', format: { fill: colors.paleAmber, font: { bold: true, color: '#8A5A00' } } });
pagesSheet.getRange(`F4:F${pageRows.length + 3}`).conditionalFormats.add('containsText', { text: 'База готова', format: { fill: colors.paleGreen, font: { bold: true, color: '#086A3B' } } });
const pagesTable = pagesSheet.tables.add(`A3:G${pageRows.length + 3}`, true, 'CurrentPages');
pagesTable.style = 'TableStyleLight1';
pagesSheet.freezePanes.freezeRows(3);
[28, 34, 50, 72, 48, 28, 52].forEach((width, index) => { pagesSheet.getRangeByIndexes(0, index, 1, 1).format.columnWidth = width; });
pagesSheet.getRange(`4:${pageRows.length + 3}`).format.rowHeight = 54;

approvalSheet.getRange('A2').values = [['Вопросы и правки для согласования с клиникой']];
approvalSheet.getRange('A2').format.font = { name: 'Calibri', size: 14, bold: true, color: colors.text };
approvalSheet.getRange('A3').values = [['Исходные формулировки и цены не изменяются без подтверждения клиники.']];
approvalSheet.getRange('A3').format.font = { name: 'Calibri', size: 11, italic: true, color: colors.muted };
approvalSheet.getRange('A5:D5').values = [['Тип', 'Что проверить', 'Предлагаемое действие', 'Статус']];
approvalSheet.getRange(`A6:D${approvalRows.length + 5}`).values = approvalRows;
approvalSheet.getRange(`A5:D${approvalRows.length + 5}`).format.font = { name: 'Calibri', size: 11, color: colors.text };
approvalSheet.getRange('A5:D5').format = { fill: colors.header, font: { name: 'Calibri', size: 11, bold: true, color: colors.text }, horizontalAlignment: 'center', verticalAlignment: 'center', wrapText: true };
approvalSheet.getRange(`A6:D${approvalRows.length + 5}`).format.verticalAlignment = 'center';
approvalSheet.getRange(`B6:C${approvalRows.length + 5}`).format.wrapText = true;
approvalSheet.getRange(`D6:D${approvalRows.length + 5}`).dataValidation = { rule: { type: 'list', values: ['Ожидает клинику', 'Подтверждено', 'Отклонено'] } };
approvalSheet.getRange(`D6:D${approvalRows.length + 5}`).conditionalFormats.add('containsText', { text: 'Ожидает клинику', format: { fill: colors.paleAmber, font: { bold: true, color: '#8A5A00' } } });
const approvalTable = approvalSheet.tables.add(`A5:D${approvalRows.length + 5}`, true, 'ClinicApproval');
approvalTable.style = 'TableStyleLight1';
approvalSheet.freezePanes.freezeRows(5);
[24, 72, 72, 22].forEach((width, index) => { approvalSheet.getRangeByIndexes(0, index, 1, 1).format.columnWidth = width; });
approvalSheet.getRange(`5:${approvalRows.length + 5}`).format.autofitRows();

workbook.recalculate();
await fs.mkdir(outputDir, { recursive: true });
await fs.mkdir(previewDir, { recursive: true });

for (const [sheetName, range, fileName] of [
  ['Сводка', 'A1:F18', 'summary.png'],
  ['Кластеры', 'A1:Q14', 'clusters.png'],
  ['Услуги', 'A1:I22', 'services.png'],
  ['Текущие страницы', 'A1:G16', 'pages.png'],
  ['На согласование', `A1:D${approvalRows.length + 5}`, 'approval.png'],
]) {
  const preview = await workbook.render({ sheetName, range, scale: 1, format: 'png' });
  await fs.writeFile(path.join(previewDir, fileName), new Uint8Array(await preview.arrayBuffer()));
}

const clusterInspection = await workbook.inspect({
  kind: 'table',
  range: 'Кластеры!A2:Q10',
  include: 'values,formulas',
  tableMaxRows: 12,
  tableMaxCols: 17,
});
const summaryInspection = await workbook.inspect({
  kind: 'table',
  range: 'Сводка!A2:E17',
  include: 'values,formulas',
  tableMaxRows: 20,
  tableMaxCols: 8,
});
const errorInspection = await workbook.inspect({
  kind: 'match',
  searchTerm: '#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!|#SPILL!|#CALC!',
  options: { useRegex: true, maxResults: 100 },
  summary: 'final formula error scan',
});
const approvalInspection = await workbook.inspect({
  kind: 'table',
  range: `На согласование!A2:D${approvalRows.length + 5}`,
  include: 'values,formulas',
  tableMaxRows: 30,
  tableMaxCols: 4,
});

const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(outputPath);

console.log(JSON.stringify({
  outputPath,
  previewDir,
  clusters: clusters.length,
  services: serviceRows.length,
  pages: pageRows.length,
  inspections: {
    summary: summaryInspection.ndjson,
    clusters: clusterInspection.ndjson,
    approval: approvalInspection.ndjson,
    errors: errorInspection.ndjson,
  },
}, null, 2));
