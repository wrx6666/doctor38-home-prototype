import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { SpreadsheetFile, Workbook } from '@oai/artifact-tool';
import { servicePriceCatalog } from '../scripts/data/service-prices.js';
import { buildPrioritySemantics, publicPriceName } from './semantic-core-data.mjs';
import { serpDecisionRows, serpMeta, serpSourceRows } from './serp-clustering-2026-10-06.mjs';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputDir = path.join(projectRoot, 'outputs', 'seo-semantic-core-2026-10-06');
const outputPath = path.join(outputDir, 'semantic-core-doctor38-wordstat.xlsx');
const publicPriceOutputPath = path.join(outputDir, 'services-price-current.xlsx');
const publicPriceAssetPath = path.join(projectRoot, 'assets', 'documents', 'services-price-current.xlsx');
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
  ['C01', 'Высокий', 'Клиника', 'медицинский центр Иркутск', 'частная клиника Иркутск; медицинская клиника Иркутск', 'Коммерческий', 'index.html', 'index.html', 'Текущая', 0, '', 'Медицинский центр в Иркутске — Добрый Доктор', 'Медицинский центр «Добрый Доктор» в Иркутске', 'Прием врачей, УЗИ, анализы, педиатрия, гинекология и косметология в медицинском центре «Добрый Доктор» в Иркутске.', 'Обновить главную и добавить локальные факторы доверия', 'Не собрано', 'Формулировка «семейная клиника» пока не используется'],
  ['C02', 'Высокий', 'Все услуги', 'медицинские услуги Иркутск', 'платные медицинские услуги Иркутск; услуги медицинского центра цены', 'Коммерческий', 'services.html', 'services.html', 'Текущая', 0, '', 'Медицинские услуги в Иркутске — Добрый Доктор', 'Медицинские услуги', 'Каталог медицинских услуг центра «Добрый Доктор» в Иркутске: прием врачей, диагностика, анализы и процедуры.', 'Расширить каталог по направлениям из актуального прайса', 'Не собрано', 'Медицинские тексты проверяет врач'],
  ['C03', 'Высокий', 'Врачи', 'врачи Иркутск', 'записаться к врачу Иркутск; врачи частной клиники Иркутск', 'Коммерческий', 'doctors.html', 'doctors.html', 'Текущая', 0, '18 специалистов из актуального списка', 'Врачи медицинского центра в Иркутске — Добрый Доктор', 'Врачи «Доброго Доктора»', 'Врачи медицинского центра «Добрый Доктор» в Иркутске: специальности, филиалы и запись на прием.', 'Использовать текущий список как рабочий источник', 'Не собрано', 'Список зафиксирован 05.10.2026'],
  ['C04', 'Высокий', 'Цены', 'цены на медицинские услуги Иркутск', 'прайс медицинского центра Иркутск; стоимость приема врача Иркутск', 'Коммерческий', 'prices.html', 'prices.html', 'Текущая', 937, '', 'Цены на медицинские услуги в Иркутске — Добрый Доктор', 'Стоимость медицинских услуг', 'Актуальные цены на прием врачей, УЗИ, анализы, диагностику и косметологию в медицинском центре «Добрый Доктор».', 'Все услуги с подтвержденной ценой распределены по направлениям', 'Не собрано', '5 услуг без цены временно исключены'],
  ['C05', 'Высокий', 'Гинекология', 'гинекология Иркутск', 'гинекологическая клиника Иркутск; женское здоровье Иркутск; услуги гинеколога', 'Коммерческий', 'gynecology.html', 'gynecology.html', 'Текущая', 88, 'Сухарева Д. О.; Степанова Е. В.; Юрьева Т. Ю.', 'Гинекология в Иркутске — услуги и цены | Добрый Доктор', 'Гинекология в Иркутске', 'Услуги гинекологии в медицинском центре «Добрый Доктор» в Иркутске: консультации, обследования, процедуры, актуальные цены и запись.', 'Связать услуги прайса с врачами и ценами', 'Не собрано', 'Медицинские тексты проверяет врач'],
  ['C06', 'Высокий', 'Прием гинеколога', 'гинеколог Иркутск', 'прием гинеколога Иркутск; записаться к гинекологу Иркутск; гинеколог цена', 'Коммерческий', 'gynecologist.html', 'gynecologist.html', 'Текущая', 0, 'Сухарева Д. О.; Степанова Е. В.; Юрьева Т. Ю.', 'Прием гинеколога в Иркутске — запись и цены | Добрый Доктор', 'Прием гинеколога в Иркутске', 'Запись на прием гинеколога в медицинском центре «Добрый Доктор» в Иркутске. Врачи, филиалы, стоимость консультации и онлайн-запись.', 'Поставить актуальную цену приема из прайса', 'Не собрано', 'Медицинские тексты проверяет врач'],
  ['C07', 'Высокий', 'УЗИ', 'УЗИ Иркутск', 'сделать УЗИ Иркутск; УЗИ цена Иркутск; детское УЗИ Иркутск; УЗИ при беременности Иркутск', 'Коммерческий', 'ultrasound.html', 'ultrasound.html', 'Текущая', 66, 'Мясников В. Г.; Пиксаева И. В.', 'УЗИ в Иркутске — цены и запись | Добрый Доктор', 'УЗИ в Иркутске', 'Ультразвуковая диагностика для взрослых и детей в Иркутске. Виды исследований, врачи, цены и запись.', 'Первым расширить запросы и собрать частотность по видам УЗИ', 'Не собрано', 'Рабочий приоритет клиники'],
  ['C08', 'Высокий', 'Анализы', 'анализы Иркутск', 'сдать анализы Иркутск; лабораторные анализы Иркутск; анализы цена Иркутск', 'Коммерческий', 'analyses.html', 'analyses.html', 'Текущая', 513, '', 'Анализы в Иркутске — цены | Добрый Доктор', 'Лабораторные анализы в Иркутске', 'Лабораторные исследования в Иркутске: актуальный перечень анализов, стоимость и подготовка к сдаче.', 'Страница создана; подтвердить правила подготовки', 'Не собрано', 'Правила подготовки подтверждает клиника'],
  ['C09', 'Высокий', 'Педиатрия', 'педиатр Иркутск', 'детский врач Иркутск; прием педиатра Иркутск; педиатр цена Иркутск', 'Коммерческий', 'children.html', 'children.html', 'Текущая', 6, 'Федаш М. М.; Старшинова Е. О. — детский невролог', 'Педиатр в Иркутске — детские услуги | Добрый Доктор', 'Педиатрия и детские услуги', 'Прием педиатра и детские медицинские услуги в Иркутске. Врачи, справки, диагностика и запись.', 'Связать услуги, врачей и цены; убрать неподтвержденные услуги', 'Не собрано', 'Список детских услуг подтвердить'],
  ['C10', 'Высокий', 'Косметология', 'косметолог Иркутск', 'косметология Иркутск цены; дерматокосметолог Иркутск; косметологические процедуры Иркутск', 'Коммерческий', 'cosmetology.html', 'cosmetology.html', 'Текущая', 156, 'Мясникова А. В.; Глазкова Я. А.', 'Косметология в Иркутске — цены | Добрый Доктор', 'Косметология в Иркутске', 'Консультации косметолога и косметологические процедуры в Иркутске. Врачи, услуги, цены и запись.', 'Первым разбить услуги на подгруппы и расширить запросы', 'Не собрано', 'Рабочий приоритет клиники'],
  ['C11', 'Высокий', 'Терапия', 'терапевт Иркутск', 'прием терапевта Иркутск; терапевт цена; записаться к терапевту', 'Коммерческий', 'therapy.html', 'therapy.html', 'Текущая', 8, 'Тигунцева О. И.', 'Терапевт в Иркутске — запись и цены', 'Прием терапевта в Иркутске', 'Прием терапевта в медицинском центре «Добрый Доктор» в Иркутске. Врач, стоимость и запись.', 'Страница создана; подтвердить компетенции врача', 'Не собрано', 'Компетенции врача подтвердить'],
  ['C12', 'Высокий', 'Кардиология', 'кардиолог Иркутск', 'прием кардиолога Иркутск; ЭКГ Иркутск цена; кардиолог цена', 'Коммерческий', 'cardiology.html', 'cardiology.html', 'Текущая', 4, 'Тигунцева О. И.', 'Кардиолог в Иркутске — запись и цены', 'Прием кардиолога в Иркутске', 'Прием кардиолога и ЭКГ в Иркутске. Врач, актуальные цены и онлайн-запись.', 'Страница создана; подтвердить связь с ЭКГ', 'Не собрано', 'Компетенции врача подтвердить'],
  ['C13', 'Высокий', 'Гастроэнтерология', 'гастроэнтеролог Иркутск', 'прием гастроэнтеролога Иркутск; гепатолог Иркутск; гастроэнтеролог цена', 'Коммерческий', 'gastroenterology.html', 'gastroenterology.html', 'Текущая', 2, 'Петрунько И. Л.', 'Гастроэнтеролог в Иркутске — запись и цены', 'Прием гастроэнтеролога в Иркутске', 'Прием гастроэнтеролога и гепатолога в Иркутске. Врач, стоимость консультации и запись.', 'Страница создана; подтвердить компетенции врача', 'Не собрано', 'Компетенции врача подтвердить'],
  ['C14', 'Высокий', 'Неврология', 'невролог Иркутск', 'детский невролог Иркутск; прием невролога Иркутск; невролог цена', 'Коммерческий', 'neurology.html', 'neurology.html', 'Текущая', 4, 'Старшинова Е. О.', 'Невролог в Иркутске — взрослым и детям', 'Прием невролога в Иркутске', 'Прием невролога для взрослых и детей в Иркутске. Врач, цены и запись на консультацию.', 'Страница создана; подтвердить возраст приема', 'Не собрано', 'Возраст приема и компетенции подтвердить'],
  ['C15', 'Высокий', 'Дерматология', 'дерматолог Иркутск', 'дерматовенеролог Иркутск; прием дерматолога Иркутск; дерматолог цена', 'Коммерческий', 'dermatology.html', 'dermatology.html', 'Текущая', 8, 'Мясникова А. В.; Рудых Н. М.; Асхаева Т. Л.', 'Дерматолог в Иркутске — запись и цены', 'Прием дерматолога в Иркутске', 'Консультация дерматолога и дерматовенеролога в Иркутске. Врачи, стоимость и запись.', 'Страница создана; подтвердить разделение дерматологии и косметологии', 'Не собрано', 'Компетенции врачей подтвердить'],
  ['C16', 'Высокий', 'Эндокринология', 'эндокринолог Иркутск', 'прием эндокринолога Иркутск; эндокринолог цена; гинеколог эндокринолог Иркутск', 'Коммерческий', 'endocrinology.html', 'endocrinology.html', 'Текущая', 2, 'Выгода С. Я.; Степанова Е. В. — гинеколог-эндокринолог', 'Эндокринолог в Иркутске — запись и цены', 'Прием эндокринолога в Иркутске', 'Прием эндокринолога в Иркутске. Врачи, стоимость консультации и запись в медицинский центр.', 'Страница создана; подтвердить профили врачей', 'Не собрано', 'Развести общий и гинекологический профиль'],
  ['C17', 'Высокий', 'Оториноларингология', 'ЛОР Иркутск', 'оториноларинголог Иркутск; прием ЛОРа Иркутск; ЛОР цена', 'Коммерческий', 'doctors.html', 'otorhinolaryngology.html', 'Отложена', 12, '', 'ЛОР в Иркутске — прием и цены', 'Прием ЛОР-врача в Иркутске', 'Прием оториноларинголога в Иркутске. Услуги, актуальные цены и запись.', 'Не прорабатывать до появления подтвержденного врача', 'Не собрано', 'Направление временно пропущено'],
  ['C18', 'Высокий', 'Сосудистая хирургия', 'сосудистый хирург Иркутск', 'флеболог Иркутск; прием сосудистого хирурга; флеболог цена', 'Коммерческий', 'vascular-surgery.html', 'vascular-surgery.html', 'Текущая', 2, 'Новохатько О. И.', 'Сосудистый хирург и флеболог в Иркутске', 'Прием сосудистого хирурга в Иркутске', 'Прием сосудистого хирурга и флеболога в Иркутске. Врач, стоимость и запись.', 'Страница создана; подтвердить компетенции врача', 'Не собрано', 'Компетенции врача подтвердить'],
  ['C19', 'Средний', 'Процедурный кабинет', 'процедурный кабинет Иркутск', 'уколы Иркутск; внутривенные инъекции Иркутск; забор анализов Иркутск', 'Коммерческий', 'treatment-room.html', 'treatment-room.html', 'Текущая', 42, 'Нилова И. А.; Чаюк В. С.; Ботова Я. С.', 'Процедурный кабинет в Иркутске — цены', 'Процедурный кабинет', 'Услуги процедурного кабинета в Иркутске: инъекции, манипуляции и забор анализов по назначению врача.', 'Страница создана; подтвердить условия процедур', 'Не собрано', 'Условия выполнения процедур подтвердить'],
  ['C20', 'Средний', 'ЛФК и спорт', 'лечебная физкультура Иркутск', 'спортивный врач Иркутск; справка для спорта Иркутск', 'Коммерческий', 'appointment.html', 'rehabilitation.html', 'Отложена', 1, '', 'Лечебная физкультура и спортивная медицина в Иркутске', 'ЛФК и спортивная медицина', 'Консультации по лечебной физкультуре и спортивной медицине в Иркутске.', 'Не прорабатывать до подтверждения услуги и специалиста', 'Не собрано', 'Направление временно пропущено'],
  ['C21', 'Средний', 'Капельницы', 'капельницы Иркутск', 'внутривенные капельницы Иркутск; инфузионная терапия Иркутск; капельницы цена', 'Коммерческий', 'droppers.html', 'droppers.html', 'Текущая', 24, 'Медицинские сестры двух филиалов', 'Капельницы в Иркутске — программы и запись', 'Капельницы в Иркутске', 'Инфузионные программы в медицинском центре «Добрый Доктор» в Иркутске по назначению врача.', 'Первым расширить запросы по программам и задачам пациентов', 'Не собрано', 'Рабочий приоритет клиники'],
  ['C22', 'Средний', 'Чекапы', 'чекап организма Иркутск', 'комплексное обследование Иркутск; обследование организма; женский чекап Иркутск', 'Коммерческий', 'checkups.html', 'checkups.html', 'Текущая', 0, '', 'Чекапы в Иркутске — программы обследования и цены | Добрый Доктор', 'Чекапы и программы диагностики в Иркутске', 'Комплексные программы обследования в медицинском центре «Добрый Доктор» в Иркутске: состав чекапов, актуальные цены и онлайн-запись.', 'Сверить состав программ с прайсом', 'Не собрано', 'Составы программ подтверждает клиника'],
  ['C23', 'Средний', 'Организациям', 'медосмотр сотрудников Иркутск', 'предрейсовый осмотр Иркутск; корпоративное медицинское обслуживание', 'Коммерческий B2B', 'organizations.html', 'organizations.html', 'Текущая', 0, '', 'Медосмотры сотрудников в Иркутске — организациям | Добрый Доктор', 'Медицинские услуги для организаций в Иркутске', 'Медицинские услуги для организаций в Иркутске: предрейсовые, послерейсовые и периодические осмотры сотрудников, корпоративное обслуживание.', 'Уточнить перечень услуг и условия договоров', 'Не собрано', 'Коммерческие условия подтверждает клиника'],
  ['C24', 'Средний', 'Контакты', 'Добрый Доктор Иркутск адрес', 'Добрый Доктор Иркутск телефон; режим работы Добрый Доктор', 'Навигационный', 'contacts.html', 'contacts.html', 'Текущая', 0, '', 'Адреса и контакты клиники — Добрый Доктор Иркутск', 'Адреса и контакты', 'Адреса филиалов медицинского центра «Добрый Доктор» в Иркутске, телефон и режим работы.', 'Добавить локальную разметку и маршруты', 'Не собрано', 'Режим работы подтвердить'],
  ['C25', 'Средний', 'Филиал Николая Гаврилова', 'медицинский центр Николая Гаврилова 4', 'клиника Николая Гаврилова 4; Добрый Доктор Гаврилова', 'Локальный', 'contacts.html#gavrilova', 'branches/gavrilova.html', 'Новая', 0, '', 'Медицинский центр на Николая Гаврилова, 4', 'Филиал на улице Николая Гаврилова, 4', 'Филиал медицинского центра «Добрый Доктор» по адресу: Иркутск, улица Николая Гаврилова, 4.', 'Создать страницу филиала после утверждения структуры', 'Не собрано', 'Услуги и врачи филиала подтвердить'],
  ['C26', 'Средний', 'Филиал Лермонтова', 'медицинский центр Лермонтова 69', 'клиника Лермонтова 69; Добрый Доктор Лермонтова', 'Локальный', 'contacts.html#lermontova', 'branches/lermontova.html', 'Новая', 0, '', 'Медицинский центр на Лермонтова, 69', 'Филиал на улице Лермонтова, 69', 'Филиал медицинского центра «Добрый Доктор» по адресу: Иркутск, улица Лермонтова, 69.', 'Создать страницу филиала после утверждения структуры', 'Не собрано', 'Услуги и врачи филиала подтвердить'],
  ['C27', 'Высокий', 'Онлайн-запись', 'записаться к врачу Иркутск', 'онлайн запись к врачу Иркутск; запись в клинику Иркутск', 'Транзакционный', 'appointment.html', 'appointment.html', 'Текущая', 0, '', 'Онлайн-запись к врачу в Иркутске | Добрый Доктор', 'Запись на прием в Иркутске', 'Запись на прием в медицинский центр «Добрый Доктор» в Иркутске. Выберите услугу, специалиста и филиал — администратор подтвердит удобное время.', 'Метатеги настроены под транзакционный запрос', 'Не собрано', 'Форма отправляет заявку администратору'],
  ['C28', 'Высокий', 'УЗИ брюшной полости', 'УЗИ брюшной полости Иркутск', 'УЗИ органов брюшной полости Иркутск; УЗИ живота цена; подготовка к УЗИ брюшной полости', 'Коммерческий', 'ultrasound-abdomen.html', 'ultrasound-abdomen.html', 'Текущая', 9, 'Мясников В. Г.; Пиксаева И. В.', 'УЗИ брюшной полости в Иркутске — цены и запись | Добрый Доктор', 'УЗИ брюшной полости в Иркутске', 'УЗИ органов брюшной полости в медицинском центре «Добрый Доктор» в Иркутске: актуальные цены, подготовка и онлайн-запись.', 'Страница создана и связана с общим каталогом УЗИ', 'Проверена выдачей', 'Медицинскую подготовку подтвердить врачом'],
  ['C29', 'Высокий', 'УЗИ малого таза', 'УЗИ малого таза Иркутск', 'УЗИ органов малого таза Иркутск; гинекологическое УЗИ; УЗИ матки и придатков', 'Коммерческий', 'ultrasound-pelvis.html', 'ultrasound-pelvis.html', 'Текущая', 6, 'Мясников В. Г.; Пиксаева И. В.', 'УЗИ малого таза в Иркутске — цены и запись | Добрый Доктор', 'УЗИ малого таза в Иркутске', 'УЗИ органов малого таза в медицинском центре «Добрый Доктор» в Иркутске: виды исследований, актуальные цены, подготовка и запись.', 'Страница создана и связана с общим каталогом УЗИ', 'Проверена выдачей', 'Медицинскую подготовку подтвердить врачом'],
  ['C30', 'Высокий', 'УЗИ почек', 'УЗИ почек Иркутск', 'УЗИ почек цена Иркутск; УЗИ мочевого пузыря; УЗИ надпочечников', 'Коммерческий', 'ultrasound-kidneys.html', 'ultrasound-kidneys.html', 'Текущая', 6, 'Мясников В. Г.; Пиксаева И. В.', 'УЗИ почек в Иркутске — цены и запись | Добрый Доктор', 'УЗИ почек в Иркутске', 'УЗИ почек и мочевыделительной системы в медицинском центре «Добрый Доктор» в Иркутске: актуальные цены и онлайн-запись.', 'Страница создана и связана с общим каталогом УЗИ', 'Проверена выдачей', 'Медицинскую подготовку подтвердить врачом'],
  ['C31', 'Высокий', 'УЗИ сердца', 'УЗИ сердца Иркутск', 'ЭхоКГ Иркутск; эхокардиография Иркутск; УЗИ сердца цена', 'Коммерческий', 'echocardiography.html', 'echocardiography.html', 'Текущая', 1, 'Мясников В. Г.; Пиксаева И. В.', 'УЗИ сердца в Иркутске — ЭхоКГ, цена и запись | Добрый Доктор', 'УЗИ сердца в Иркутске', 'Эхокардиография и УЗИ сердца в медицинском центре «Добрый Доктор» в Иркутске: актуальная цена и онлайн-запись.', 'Страница создана и связана с общим каталогом УЗИ', 'Проверена выдачей', 'Доступность услуги по филиалам подтвердить'],
];

const firstPriorityClusters = new Set(['C07', 'C10', 'C21', 'C28', 'C29', 'C30', 'C31']);
const postponedClusters = new Set(['C17', 'C20']);
clusters.forEach((row) => {
  if (firstPriorityClusters.has(row[0])) row[1] = '1 — приоритет клиники';
  else if (postponedClusters.has(row[0])) row[1] = '4 — отложено';
  else if (row[1] === 'Высокий') row[1] = '2 — основной';
  else row[1] = '3 — дополнительный';
});

const doctors = [
  ['Глазкова Яна Алексеевна', 'Медицинская сестра, косметология', 'Николая Гаврилова, 4', ''],
  ['Мясникова Александра Валерьевна', 'Косметолог, дерматовенеролог, дерматолог', 'Николая Гаврилова, 4', ''],
  ['Мясников Владимир Геннадьевич', 'Врач ультразвуковой диагностики', 'Николая Гаврилова, 4', 'Специальность указана по текущей странице сайта'],
  ['Нилова Инна Аркадьевна', 'Медицинская сестра', 'Николая Гаврилова, 4', ''],
  ['Петрунько Ирина Леонидовна', 'Гастроэнтеролог, гепатолог', 'Николая Гаврилова, 4', ''],
  ['Рудых Наталья Михайловна', 'Дерматолог', 'Николая Гаврилова, 4', ''],
  ['Старшинова Елена Олеговна', 'Невролог, детский невролог', 'Николая Гаврилова, 4', ''],
  ['Степанова Елена Владимировна', 'Гинеколог-эндокринолог', 'Николая Гаврилова, 4', ''],
  ['Сухарева Дарья Олеговна', 'Гинеколог', 'Лермонтова, 69; Николая Гаврилова, 4', 'На Николая Гаврилова, 4 принимает по четвергам'],
  ['Федаш Мария Михайловна', 'Педиатр', 'Николая Гаврилова, 4', ''],
  ['Чаюк Виктория Сергеевна', 'Медицинская сестра', 'Николая Гаврилова, 4', ''],
  ['Юрьева Татьяна Юрьевна', 'Гинеколог', 'Николая Гаврилова, 4', ''],
  ['Асхаева Татьяна Леонидовна', 'Дерматолог', 'Лермонтова, 69', ''],
  ['Ботова Яна Сергеевна', 'Медицинская сестра', 'Лермонтова, 69', ''],
  ['Выгода Сима Яковлевна', 'Эндокринолог', 'Лермонтова, 69', ''],
  ['Новохатько Ольга Ивановна', 'Сосудистый хирург', 'Лермонтова, 69', ''],
  ['Пиксаева Ирина Викторовна', 'Врач ультразвуковой диагностики', 'Лермонтова, 69', ''],
  ['Тигунцева Ольга Игоревна', 'Кардиолог, терапевт', 'Лермонтова, 69', ''],
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
for (const category of servicePriceCatalog.categories) {
  const clusterId = clusterByCategory[category.id];
  if (clusterId && clusterLookup.has(clusterId)) clusterLookup.get(clusterId)[9] = category.count;
}
clusterLookup.get('C04')[9] = servicePriceCatalog.total;

const serviceRows = servicePriceCatalog.services.map((service, index) => {
  const clusterId = clusterByCategory[service.category] || '';
  const cluster = clusterLookup.get(clusterId);
  const notes = [];
  if (!clusterId) notes.push('В исходном прайсе не указана специальность');
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

const {
  entityRows, entityGroupCounts, queryRows, coverageRows, negativeKeywordRows,
  wordstatRows, wordstatMeta, ultrasoundWordstatRows, ultrasoundWordstatMeta,
  cosmetologyWordstatRows, cosmetologyWordstatMeta,
  exactWordstatRows, exactWordstatMeta,
} = buildPrioritySemantics(servicePriceCatalog);

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
  'ultrasound-abdomen.html': 'УЗИ брюшной полости Иркутск',
  'ultrasound-pelvis.html': 'УЗИ малого таза Иркутск',
  'ultrasound-kidneys.html': 'УЗИ почек Иркутск',
  'echocardiography.html': 'УЗИ сердца Иркутск',
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
  ['Область семантики', 'Подробно проработаны капельницы, УЗИ и косметология', 'Передать на аудит как первый приоритет; остальные направления расширять следующим этапом', 'Готово к аудиту'],
  ['Частотность', 'Общая частотность заполнена для 205 запросов, точная — для 30', 'На аудите проверить выбранные приоритеты; полную частотность остальных запросов собрать после замечаний', 'Готово к аудиту'],
  ['Кластеризация', 'По выдаче проверено 14 основных запросов', 'Проверить решения по отдельным страницам; затем расширить SERP-проверку', 'Готово к аудиту'],
  ['Данные клиники', 'Формулировка «Семейная клиника»', 'Не использовать до отдельного решения', 'Отложено'],
  ['Врачи', '18 специалистов, специальности и филиалы', 'Использовать переданный список как актуальный', 'Подтверждено'],
  ['Медицинские тексты', 'Названия и описания направлений', 'Проверить ответственным врачом', 'Ожидает клинику'],
  ['Направление', 'ЛОР: в прайсе 12 услуг, врач не указан', 'Не продвигать до появления подтвержденного врача', 'Отложено'],
  ['Направление', 'ЛФК и спортивная медицина: в прайсе 1 услуга', 'Не продвигать до подтверждения услуги и специалиста', 'Отложено'],
  ['Филиалы', 'Состав врачей по двум филиалам', 'Использовать переданный список как рабочий', 'Подтверждено'],
  ['Цена', '5 услуг с ценой 0 ₽', 'Временно исключены из ядра и публичного прайса', 'Подтверждено'],
  ['Название услуги', 'Консультация терапевта-кадиолога первичная', 'Исправить на «Консультация терапевта-кардиолога первичная»', 'Ожидает клинику'],
  ['Название услуги', 'Сравка врача - дерматолога', 'Исправить на «Справка врача-дерматолога»', 'Ожидает клинику'],
  ['Фамилия в прайсе', 'Две услуги содержат «Власова А.В.»', 'На сайте и в рабочем ядре показывать «Мясникова А.В.»', 'Подтверждено'],
  ['Название услуги', 'ТТГ, териотропный гормон', 'Исправить «териотропный» на «тиреотропный»', 'Ожидает клинику'],
];

const workbook = Workbook.create();
const summary = workbook.worksheets.add('Сводка');
const clusterSheet = workbook.worksheets.add('Кластеры');
const entitySheet = workbook.worksheets.add('Словарь сущностей');
const queriesSheet = workbook.worksheets.add('Поисковые запросы');
const wordstatSheet = workbook.worksheets.add('Wordstat капельницы');
const ultrasoundWordstatSheet = workbook.worksheets.add('Wordstat УЗИ');
const cosmetologyWordstatSheet = workbook.worksheets.add('Wordstat косметология');
const exactWordstatSheet = workbook.worksheets.add('Wordstat точная');
const serpSheet = workbook.worksheets.add('Кластеризация SERP');
const negativeSheet = workbook.worksheets.add('Минус-слова');
const servicesSheet = workbook.worksheets.add('Услуги');
const doctorsSheet = workbook.worksheets.add('Врачи');
const pagesSheet = workbook.worksheets.add('Текущие страницы');
const approvalSheet = workbook.worksheets.add('На согласование');

for (const sheet of [summary, clusterSheet, entitySheet, queriesSheet, wordstatSheet, ultrasoundWordstatSheet, cosmetologyWordstatSheet, exactWordstatSheet, serpSheet, negativeSheet, servicesSheet, doctorsSheet, pagesSheet, approvalSheet]) {
  sheet.showGridLines = true;
}

summary.getRange('A2').values = [['Семантическое ядро сайта «Добрый Доктор»']];
summary.mergeCells('A2:E2');
summary.getRange('A2').format.font = { name: 'Calibri', size: 14, bold: true, color: colors.text };
summary.getRange('A3').values = [['Рабочая структура запросов и страниц. Wordstat и проверка группировки по выдаче собраны для капельниц, УЗИ и косметологии в Иркутске.']];
summary.mergeCells('A3:E3');
summary.getRange('A3').format.font = { name: 'Calibri', size: 11, italic: true, color: colors.muted };
summary.getRange('A4').values = [['Версия для аудита приоритетных направлений. Это не финальное семантическое ядро всех услуг клиники.']];
summary.mergeCells('A4:E4');
summary.getRange('A4').format = { fill: colors.paleAmber, font: { name: 'Calibri', size: 11, bold: true, color: colors.text }, verticalAlignment: 'center' };
summary.getRange('A5:B11').values = [
  ['Показатель', 'Значение'],
  ['Кластеры', null],
  ['Текущие или расширяемые страницы', null],
  ['Новые страницы', null],
  ['Услуги из прайса', null],
  ['Услуги без направления', null],
  ['Специалисты в рабочем списке', null],
];
summary.getRange('B6').formulas = [[`=COUNTA('Кластеры'!A5:A${clusters.length + 4})`]];
summary.getRange('B7').formulas = [[`=COUNTIF('Кластеры'!I5:I${clusters.length + 4},"Текущая")+COUNTIF('Кластеры'!I5:I${clusters.length + 4},"Расширить")`]];
summary.getRange('B8').formulas = [[`=COUNTIF('Кластеры'!I5:I${clusters.length + 4},"Новая")`]];
summary.getRange('B9').formulas = [[`=COUNTA('Услуги'!A2:A${serviceRows.length + 1})`]];
summary.getRange('B10').formulas = [[`=COUNTIF('Услуги'!G2:G${serviceRows.length + 1},\"Требуется классификация\")`]];
summary.getRange('B11').formulas = [[`=COUNTA('Врачи'!A2:A${doctors.length + 1})`]];
summary.getRange('D13:E17').values = [
  ['Этап 2', 'Словарь сущностей приоритетных направлений'],
  ['Услуг распределено', entityRows.length],
  ['Капельницы', entityRows.filter((row) => row[2] === 'Капельницы').length],
  ['УЗИ', entityRows.filter((row) => row[2] === 'УЗИ').length],
  ['Косметология', entityRows.filter((row) => row[2] === 'Косметология').length],
];
summary.getRange('D13:E13').format = { fill: colors.header, font: { name: 'Calibri', size: 11, bold: true, color: colors.text }, verticalAlignment: 'center' };
summary.getRange('D14:E17').format.font = { name: 'Calibri', size: 11, color: colors.text };
summary.getRange('D13:E17').format.borders = { preset: 'inside', style: 'thin', color: colors.line };
summary.getRange('D19:E26').values = [
  ['Этап 3–4', 'Запросы, частотность и группировка по поисковой выдаче'],
  ['Уникальных запросов', queryRows.length],
  ['Капельницы', queryRows.filter((row) => row[2] === 'Капельницы').length],
  ['УЗИ', queryRows.filter((row) => row[2] === 'УЗИ').length],
  ['Косметология', queryRows.filter((row) => row[2] === 'Косметология').length],
  ['Wordstat: строк с общей частотностью', 0],
  ['Wordstat: строк с точной частотностью', 0],
  ['Следующее действие', 'Передать на аудит кластеры, целевые страницы и связь с прайсом; после замечаний расширить остальные направления'],
];
summary.getRange('E20').formulas = [[`=COUNTA('Поисковые запросы'!A5:A${queryRows.length + 4})`]];
summary.getRange('E21').formulas = [[`=COUNTIF('Поисковые запросы'!C5:C${queryRows.length + 4},"Капельницы")`]];
summary.getRange('E22').formulas = [[`=COUNTIF('Поисковые запросы'!C5:C${queryRows.length + 4},"УЗИ")`]];
summary.getRange('E23').formulas = [[`=COUNTIF('Поисковые запросы'!C5:C${queryRows.length + 4},"Косметология")`]];
summary.getRange('E24').formulas = [[`=COUNT('Поисковые запросы'!K5:K${queryRows.length + 4})`]];
summary.getRange('E25').formulas = [[`=COUNT('Поисковые запросы'!L5:L${queryRows.length + 4})`]];
summary.getRange('D19:E19').format = { fill: colors.header, font: { name: 'Calibri', size: 11, bold: true, color: colors.text }, verticalAlignment: 'center' };
summary.getRange('D20:E26').format.font = { name: 'Calibri', size: 11, color: colors.text };
summary.getRange('D19:E26').format.borders = { preset: 'inside', style: 'thin', color: colors.line };
summary.getRange('D26:E26').format.wrapText = true;
summary.getRange('D5:E10').values = [
  ['Что сделать сначала', 'Почему'],
  ['Капельницы', 'Первый приоритет клиники: расширить запросы по программам и задачам пациентов'],
  ['УЗИ', 'Первый приоритет клиники: собрать запросы по каждому виду исследования'],
  ['Косметология', 'Первый приоритет клиники: разделить большой перечень услуг на понятные группы'],
  ['Частотность', 'После расширения запросов собрать спрос по Иркутску'],
  ['Остальные направления', 'Прорабатывать после трех главных направлений'],
];
summary.getRange('A13:B21').values = [
  ['Источник', 'Использование'],
  ['Услуги (1).xlsx', 'Названия, направления и 937 услуг с подтвержденной ценой'],
  ['HTML-файлы проекта', 'Текущие title, description, H1 и URL'],
  ['Список от пользователя', '18 специалистов, специальности и филиалы'],
  ['Яндекс Wordstat', `Капельницы, регион ${wordstatMeta.region}, период ${wordstatMeta.period}`],
  ['Яндекс Wordstat', `УЗИ, регион ${ultrasoundWordstatMeta.region}, период ${ultrasoundWordstatMeta.period}`],
  ['Яндекс Wordstat', `Косметология, регион ${cosmetologyWordstatMeta.region}, период ${cosmetologyWordstatMeta.period}`],
  ['Яндекс Поиск', `${serpMeta.queries} запросов: проверка пересечения доменов и URL, ${serpMeta.checkedAt}`],
  ['Дата подготовки', '2026-10-06'],
];
summary.getRange('A23:B25').values = [
  ['Статус передачи', 'Готово к аудиту приоритетных направлений'],
  ['Граница версии', 'Капельницы, УЗИ и косметология проработаны подробно; по остальным направлениям собрана базовая структура'],
  ['Что проверить на аудите', 'Группировку запросов, разделение страниц, целевые URL и соответствие услугам прайса'],
];
summary.getRange('A23:B23').format = { fill: colors.header, font: { name: 'Calibri', size: 11, bold: true, color: colors.text }, verticalAlignment: 'center' };
summary.getRange('A24:B25').format.font = { name: 'Calibri', size: 11, color: colors.text };
summary.getRange('A23:B25').format.borders = { preset: 'inside', style: 'thin', color: colors.line };
summary.getRange('A23:B25').format.wrapText = true;

const summaryHeader = [summary.getRange('A5:B5'), summary.getRange('D5:E5'), summary.getRange('A13:B13')];
for (const range of summaryHeader) {
  range.format = { fill: colors.header, font: { name: 'Calibri', size: 11, bold: true, color: colors.text }, verticalAlignment: 'center' };
}
summary.getRange('A6:B11').format.font = { name: 'Calibri', size: 11, color: colors.text };
summary.getRange('D6:E10').format.font = { name: 'Calibri', size: 11, color: colors.text };
summary.getRange('A14:B21').format.font = { name: 'Calibri', size: 11, color: colors.text };
summary.getRange('A5:B11').format.borders = { preset: 'inside', style: 'thin', color: colors.line };
summary.getRange('D5:E10').format.borders = { preset: 'inside', style: 'thin', color: colors.line };
summary.getRange('A13:B21').format.borders = { preset: 'inside', style: 'thin', color: colors.line };
summary.getRange('A1:F27').format.verticalAlignment = 'center';
summary.getRange('A3:F3').format.wrapText = true;
summary.getRange('A4:F4').format.wrapText = true;
summary.getRange('D6:E10').format.wrapText = true;
summary.getRange('A5:B21').format.wrapText = true;
summary.getRange('D13:E26').format.wrapText = true;
summary.getRange('14:21').format.rowHeight = 48;
summary.getRange('19:25').format.rowHeight = 34;
summary.getRange('A:A').format.columnWidth = 35;
summary.getRange('B:B').format.columnWidth = 37;
summary.getRange('C:C').format.columnWidth = 3;
summary.getRange('D:D').format.columnWidth = 28;
summary.getRange('E:E').format.columnWidth = 64;
summary.getRange('2:2').format.rowHeight = 26;
summary.getRange('3:3').format.rowHeight = 46;
summary.getRange('4:4').format.rowHeight = 34;
summary.getRange('6:11').format.rowHeight = 35;
summary.getRange('26:26').format.rowHeight = 56;
summary.getRange('23:25').format.rowHeight = 42;

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
clusterSheet.getRange(`B5:B${clusters.length + 4}`).dataValidation = { rule: { type: 'list', values: ['1 — приоритет клиники', '2 — основной', '3 — дополнительный', '4 — отложено'] } };
clusterSheet.getRange(`I5:I${clusters.length + 4}`).dataValidation = { rule: { type: 'list', values: ['Текущая', 'Расширить', 'Новая', 'Требуется подтверждение', 'Отложена'] } };
clusterSheet.getRange(`B5:B${clusters.length + 4}`).conditionalFormats.add('containsText', { text: '1 — приоритет клиники', format: { fill: colors.paleRed, font: { bold: true, color: '#9F1D20' } } });
clusterSheet.getRange(`B5:B${clusters.length + 4}`).conditionalFormats.add('containsText', { text: '4 — отложено', format: { fill: '#E7E6E6', font: { color: '#666666' } } });
clusterSheet.getRange(`I5:I${clusters.length + 4}`).conditionalFormats.add('containsText', { text: 'Новая', format: { fill: colors.paleAmber, font: { bold: true, color: '#8A5A00' } } });
clusterSheet.getRange(`I5:I${clusters.length + 4}`).conditionalFormats.add('containsText', { text: 'Текущая', format: { fill: colors.paleGreen, font: { bold: true, color: '#086A3B' } } });
clusterSheet.getRange(`I5:I${clusters.length + 4}`).conditionalFormats.add('containsText', { text: 'Требуется подтверждение', format: { fill: colors.paleRed, font: { bold: true, color: '#9F1D20' } } });
clusterSheet.getRange(`I5:I${clusters.length + 4}`).conditionalFormats.add('containsText', { text: 'Отложена', format: { fill: '#E7E6E6', font: { color: '#666666' } } });
const clustersTable = clusterSheet.tables.add(`A4:Q${clusters.length + 4}`, true, 'SemanticClusters');
clustersTable.style = 'TableStyleLight1';
clusterSheet.freezePanes.freezeRows(4);
const clusterWidths = [8, 12, 24, 30, 50, 18, 30, 30, 23, 14, 36, 48, 38, 62, 48, 15, 48];
clusterWidths.forEach((width, index) => { clusterSheet.getRangeByIndexes(0, index, 1, 1).format.columnWidth = width; });
clusterSheet.getRange('2:2').format.rowHeight = 26;
clusterSheet.getRange('3:3').format.rowHeight = 32;
clusterSheet.getRange(`5:${clusters.length + 4}`).format.rowHeight = 76;

const entityHeaders = ['ID', 'Приоритет', 'Направление', 'Группа сущностей', 'Рабочее название', 'Базовый кандидат запроса', 'Дополнительные варианты — резерв', 'Потребность пациента', 'Коммерческие модификаторы', 'Услуга из прайса', 'Цена, ₽', 'Исполнитель из источника', 'Филиал из источника', 'Предварительная страница', 'Статус проверки', 'Примечание'];
entitySheet.getRange('A2').values = [['Словарь сущностей: капельницы, УЗИ и косметология']];
entitySheet.mergeCells('A2:P2');
entitySheet.getRange('A2').format.font = { name: 'Calibri', size: 14, bold: true, color: colors.text };
entitySheet.getRange('A3').values = [['246 услуг сохранены. Исполнитель и филиал указаны только при наличии связи в источниках. Запросы — гипотезы; URL предварительные. Полная связь по ID — на листе «Покрытие услуг».']];
entitySheet.mergeCells('A3:P3');
entitySheet.getRange('A3').format.font = { name: 'Calibri', size: 11, italic: true, color: colors.muted };
entitySheet.getRange('A4:P4').values = [entityHeaders];
entitySheet.getRange(`A5:P${entityRows.length + 4}`).values = entityRows;
entitySheet.getRange(`A4:P${entityRows.length + 4}`).format.font = { name: 'Calibri', size: 11, color: colors.text };
entitySheet.getRange('A4:P4').format = { fill: colors.header, font: { name: 'Calibri', size: 11, bold: true, color: colors.text }, horizontalAlignment: 'center', verticalAlignment: 'center', wrapText: true };
entitySheet.getRange(`C5:J${entityRows.length + 4}`).format.wrapText = true;
entitySheet.getRange(`L5:P${entityRows.length + 4}`).format.wrapText = true;
entitySheet.getRange(`K5:K${entityRows.length + 4}`).format.numberFormat = '#,##0" ₽"';
entitySheet.getRange(`B5:B${entityRows.length + 4}`).conditionalFormats.add('containsText', { text: '1 — приоритет клиники', format: { fill: colors.paleRed, font: { bold: true, color: '#9F1D20' } } });
entitySheet.getRange(`O5:O${entityRows.length + 4}`).conditionalFormats.add('containsText', { text: 'Проверить', format: { fill: colors.paleAmber, font: { bold: true, color: '#8A5A00' } } });
entitySheet.getRange(`O5:O${entityRows.length + 4}`).conditionalFormats.add('containsText', { text: 'Рабочая', format: { fill: colors.paleGreen, font: { bold: true, color: '#086A3B' } } });
const entityTable = entitySheet.tables.add(`A4:P${entityRows.length + 4}`, true, 'PriorityEntityDictionary');
entityTable.style = 'TableStyleLight1';
entitySheet.freezePanes.freezeRows(4);
entitySheet.freezePanes.freezeColumns(4);
[9, 19, 16, 34, 58, 54, 48, 48, 44, 72, 14, 48, 38, 24, 34, 58].forEach((width, index) => { entitySheet.getRangeByIndexes(0, index, 1, 1).format.columnWidth = width; });
entitySheet.getRange('2:2').format.rowHeight = 26;
entitySheet.getRange('3:3').format.rowHeight = 34;
entitySheet.getRange('4:4').format.rowHeight = 44;
entitySheet.getRange(`5:${entityRows.length + 4}`).format.rowHeight = 82;
entitySheet.getRange(`A5:P${entityRows.length + 4}`).format.verticalAlignment = 'top';
entitySheet.getRange(`5:${entityRows.length + 4}`).format.autofitRows();

const queryHeaders = ['ID', 'Приоритет', 'Направление', 'Группа сущностей', 'Поисковый запрос', 'Уровень', 'Интент', 'География', 'Исходная сущность или услуга', 'Целевая страница', 'Частотность общая', 'Частотность с операторами', 'Источник частотности', 'Статус', 'Примечание', 'ID услуг', 'Регион Wordstat', 'Дата выгрузки', 'Период статистики', 'Операторы запроса'];
queriesSheet.getRange('A2').values = [['Поисковые запросы по приоритетным направлениям']];
queriesSheet.mergeCells('A2:T2');
queriesSheet.getRange('A2').format.font = { name: 'Calibri', size: 14, bold: true, color: colors.text };
queriesSheet.getRange('A3').values = [['Общая частотность Wordstat заполнена по капельницам, УЗИ и косметологии. Для 30 главных запросов добавлена точная частотность с кавычками и оператором !. Нулевой спрос сохранен как измеренный ноль.']];
queriesSheet.mergeCells('A3:T3');
queriesSheet.getRange('A3').format.font = { name: 'Calibri', size: 11, italic: true, color: colors.muted };
queriesSheet.getRange('A4:T4').values = [queryHeaders];
queriesSheet.getRange(`A5:T${queryRows.length + 4}`).values = queryRows;
queriesSheet.getRange(`A4:T${queryRows.length + 4}`).format.font = { name: 'Calibri', size: 11, color: colors.text };
queriesSheet.getRange('A4:T4').format = { fill: colors.header, font: { name: 'Calibri', size: 11, bold: true, color: colors.text }, horizontalAlignment: 'center', verticalAlignment: 'center', wrapText: true };
queriesSheet.getRange(`C5:J${queryRows.length + 4}`).format.wrapText = true;
queriesSheet.getRange(`M5:T${queryRows.length + 4}`).format.wrapText = true;
queriesSheet.getRange(`K5:L${queryRows.length + 4}`).format.numberFormat = '#,##0';
queriesSheet.getRange(`K5:L${queryRows.length + 4}`).format.fill = colors.paleAmber;
queriesSheet.getRange(`M5:M${queryRows.length + 4}`).dataValidation = { rule: { type: 'list', values: ['Не загружено', 'Wordstat'] } };
queriesSheet.getRange(`N5:N${queryRows.length + 4}`).dataValidation = { rule: { type: 'list', values: ['Готов к проверке частотности', 'Проверить медицинскую формулировку', 'Отклонено', 'Подтверждено'] } };
queriesSheet.getRange(`B5:B${queryRows.length + 4}`).conditionalFormats.add('containsText', { text: '1 — основной', format: { fill: colors.paleRed, font: { bold: true, color: '#9F1D20' } } });
queriesSheet.getRange(`M5:M${queryRows.length + 4}`).conditionalFormats.add('containsText', { text: 'Не загружено', format: { fill: colors.paleAmber, font: { bold: true, color: '#8A5A00' } } });
queriesSheet.getRange(`N5:N${queryRows.length + 4}`).conditionalFormats.add('containsText', { text: 'Проверить', format: { fill: colors.paleAmber, font: { bold: true, color: '#8A5A00' } } });
queriesSheet.getRange(`N5:N${queryRows.length + 4}`).conditionalFormats.add('containsText', { text: 'Готов', format: { fill: colors.paleGreen, font: { bold: true, color: '#086A3B' } } });
const queriesTable = queriesSheet.tables.add(`A4:T${queryRows.length + 4}`, true, 'SearchQueryMap');
queriesTable.style = 'TableStyleLight1';
queriesSheet.freezePanes.freezeRows(4);
queriesSheet.freezePanes.freezeColumns(4);
[16, 19, 16, 35, 58, 20, 21, 14, 62, 26, 18, 18, 24, 36, 58, 45, 20, 20, 22, 24].forEach((width, index) => { queriesSheet.getRangeByIndexes(0, index, 1, 1).format.columnWidth = width; });
queriesSheet.getRange('2:2').format.rowHeight = 26;
queriesSheet.getRange('3:3').format.rowHeight = 32;
queriesSheet.getRange('4:4').format.rowHeight = 44;
queriesSheet.getRange(`5:${queryRows.length + 4}`).format.rowHeight = 54;
queriesSheet.getRange(`A5:T${queryRows.length + 4}`).format.verticalAlignment = 'top';
queriesSheet.getRange('A:A').format.columnWidth = 17;

const wordstatHeaders = ['Запрос', 'Частотность', 'Раздел Wordstat', 'Решение', 'Группа', 'Интент', 'Обоснование', 'Регион', 'Период'];
wordstatSheet.getRange('A2').values = [['Исходные данные Wordstat: капельницы']];
wordstatSheet.mergeCells('A2:I2');
wordstatSheet.getRange('A2').format.font = { name: 'Calibri', size: 14, bold: true, color: colors.text };
wordstatSheet.getRange('A3').values = [[`Источник: ${wordstatMeta.source}. Запрос «${wordstatMeta.baseQuery}», регион ${wordstatMeta.region}. ${wordstatMeta.sourceUrl}`]];
wordstatSheet.mergeCells('A3:I3');
wordstatSheet.getRange('A3').format = { font: { name: 'Calibri', size: 11, italic: true, color: colors.muted }, wrapText: true };
wordstatSheet.getRange('A5:I5').values = [wordstatHeaders];
wordstatSheet.getRange(`A6:I${wordstatRows.length + 5}`).values = wordstatRows;
wordstatSheet.getRange(`A5:I${wordstatRows.length + 5}`).format.font = { name: 'Calibri', size: 11, color: colors.text };
wordstatSheet.getRange('A5:I5').format = { fill: colors.header, font: { name: 'Calibri', size: 11, bold: true, color: colors.text }, horizontalAlignment: 'center', verticalAlignment: 'center', wrapText: true };
wordstatSheet.getRange(`A6:I${wordstatRows.length + 5}`).format.verticalAlignment = 'top';
wordstatSheet.getRange(`A6:A${wordstatRows.length + 5}`).format.wrapText = true;
wordstatSheet.getRange(`C6:G${wordstatRows.length + 5}`).format.wrapText = true;
wordstatSheet.getRange(`B6:B${wordstatRows.length + 5}`).format.numberFormat = '#,##0';
wordstatSheet.getRange(`D6:D${wordstatRows.length + 5}`).conditionalFormats.add('containsText', { text: 'Исключить', format: { fill: colors.paleRed, font: { bold: true, color: '#9F1D20' } } });
wordstatSheet.getRange(`D6:D${wordstatRows.length + 5}`).conditionalFormats.add('containsText', { text: 'Отклонить', format: { fill: colors.paleRed, font: { bold: true, color: '#9F1D20' } } });
wordstatSheet.getRange(`D6:D${wordstatRows.length + 5}`).conditionalFormats.add('containsText', { text: 'На проверку', format: { fill: colors.paleAmber, font: { bold: true, color: '#8A5A00' } } });
wordstatSheet.getRange(`D6:D${wordstatRows.length + 5}`).conditionalFormats.add('containsText', { text: 'с проверкой', format: { fill: colors.paleAmber, font: { bold: true, color: '#8A5A00' } } });
wordstatSheet.getRange(`D6:D${wordstatRows.length + 5}`).conditionalFormats.add('containsText', { text: 'В ядро', format: { fill: colors.paleGreen, font: { bold: true, color: '#086A3B' } } });
const wordstatTable = wordstatSheet.tables.add(`A5:I${wordstatRows.length + 5}`, true, 'WordstatDroppersSource');
wordstatTable.style = 'TableStyleLight1';
wordstatSheet.freezePanes.freezeRows(5);
[42, 16, 21, 24, 34, 21, 72, 18, 24].forEach((width, index) => { wordstatSheet.getRangeByIndexes(0, index, 1, 1).format.columnWidth = width; });
wordstatSheet.getRange('2:2').format.rowHeight = 26;
wordstatSheet.getRange('3:3').format.rowHeight = 44;
wordstatSheet.getRange('5:5').format.rowHeight = 36;
wordstatSheet.getRange(`6:${wordstatRows.length + 5}`).format.rowHeight = 54;

ultrasoundWordstatSheet.getRange('A2').values = [['Исходные данные Wordstat: УЗИ']];
ultrasoundWordstatSheet.mergeCells('A2:I2');
ultrasoundWordstatSheet.getRange('A2').format.font = { name: 'Calibri', size: 14, bold: true, color: colors.text };
ultrasoundWordstatSheet.getRange('A3').values = [[`Источник: ${ultrasoundWordstatMeta.source}. Запрос «${ultrasoundWordstatMeta.baseQuery}», регион ${ultrasoundWordstatMeta.region}. ${ultrasoundWordstatMeta.sourceUrl}`]];
ultrasoundWordstatSheet.mergeCells('A3:I3');
ultrasoundWordstatSheet.getRange('A3').format = { font: { name: 'Calibri', size: 11, italic: true, color: colors.muted }, wrapText: true };
ultrasoundWordstatSheet.getRange('A5:I5').values = [wordstatHeaders];
ultrasoundWordstatSheet.getRange(`A6:I${ultrasoundWordstatRows.length + 5}`).values = ultrasoundWordstatRows;
ultrasoundWordstatSheet.getRange(`A5:I${ultrasoundWordstatRows.length + 5}`).format.font = { name: 'Calibri', size: 11, color: colors.text };
ultrasoundWordstatSheet.getRange('A5:I5').format = { fill: colors.header, font: { name: 'Calibri', size: 11, bold: true, color: colors.text }, horizontalAlignment: 'center', verticalAlignment: 'center', wrapText: true };
ultrasoundWordstatSheet.getRange(`A6:I${ultrasoundWordstatRows.length + 5}`).format.verticalAlignment = 'top';
ultrasoundWordstatSheet.getRange(`A6:A${ultrasoundWordstatRows.length + 5}`).format.wrapText = true;
ultrasoundWordstatSheet.getRange(`C6:G${ultrasoundWordstatRows.length + 5}`).format.wrapText = true;
ultrasoundWordstatSheet.getRange(`B6:B${ultrasoundWordstatRows.length + 5}`).format.numberFormat = '#,##0';
ultrasoundWordstatSheet.getRange(`D6:D${ultrasoundWordstatRows.length + 5}`).conditionalFormats.add('containsText', { text: 'Исключить', format: { fill: colors.paleRed, font: { bold: true, color: '#9F1D20' } } });
ultrasoundWordstatSheet.getRange(`D6:D${ultrasoundWordstatRows.length + 5}`).conditionalFormats.add('containsText', { text: 'На проверку', format: { fill: colors.paleAmber, font: { bold: true, color: '#8A5A00' } } });
ultrasoundWordstatSheet.getRange(`D6:D${ultrasoundWordstatRows.length + 5}`).conditionalFormats.add('containsText', { text: 'с проверкой', format: { fill: colors.paleAmber, font: { bold: true, color: '#8A5A00' } } });
ultrasoundWordstatSheet.getRange(`D6:D${ultrasoundWordstatRows.length + 5}`).conditionalFormats.add('containsText', { text: 'В ядро', format: { fill: colors.paleGreen, font: { bold: true, color: '#086A3B' } } });
const ultrasoundWordstatTable = ultrasoundWordstatSheet.tables.add(`A5:I${ultrasoundWordstatRows.length + 5}`, true, 'WordstatUltrasoundSource');
ultrasoundWordstatTable.style = 'TableStyleLight1';
ultrasoundWordstatSheet.freezePanes.freezeRows(5);
[42, 16, 21, 24, 42, 21, 72, 18, 24].forEach((width, index) => { ultrasoundWordstatSheet.getRangeByIndexes(0, index, 1, 1).format.columnWidth = width; });
ultrasoundWordstatSheet.getRange('2:2').format.rowHeight = 26;
ultrasoundWordstatSheet.getRange('3:3').format.rowHeight = 44;
ultrasoundWordstatSheet.getRange('5:5').format.rowHeight = 36;
ultrasoundWordstatSheet.getRange(`6:${ultrasoundWordstatRows.length + 5}`).format.rowHeight = 54;

cosmetologyWordstatSheet.getRange('A2').values = [['Исходные данные Wordstat: косметология']];
cosmetologyWordstatSheet.mergeCells('A2:I2');
cosmetologyWordstatSheet.getRange('A2').format.font = { name: 'Calibri', size: 14, bold: true, color: colors.text };
cosmetologyWordstatSheet.getRange('A3').values = [[`Источник: ${cosmetologyWordstatMeta.source}. Запрос «${cosmetologyWordstatMeta.baseQuery}», регион ${cosmetologyWordstatMeta.region}. ${cosmetologyWordstatMeta.sourceUrl}`]];
cosmetologyWordstatSheet.mergeCells('A3:I3');
cosmetologyWordstatSheet.getRange('A3').format = { font: { name: 'Calibri', size: 11, italic: true, color: colors.muted }, wrapText: true };
cosmetologyWordstatSheet.getRange('A5:I5').values = [wordstatHeaders];
cosmetologyWordstatSheet.getRange(`A6:I${cosmetologyWordstatRows.length + 5}`).values = cosmetologyWordstatRows;
cosmetologyWordstatSheet.getRange(`A5:I${cosmetologyWordstatRows.length + 5}`).format.font = { name: 'Calibri', size: 11, color: colors.text };
cosmetologyWordstatSheet.getRange('A5:I5').format = { fill: colors.header, font: { name: 'Calibri', size: 11, bold: true, color: colors.text }, horizontalAlignment: 'center', verticalAlignment: 'center', wrapText: true };
cosmetologyWordstatSheet.getRange(`A6:I${cosmetologyWordstatRows.length + 5}`).format.verticalAlignment = 'top';
cosmetologyWordstatSheet.getRange(`A6:A${cosmetologyWordstatRows.length + 5}`).format.wrapText = true;
cosmetologyWordstatSheet.getRange(`C6:G${cosmetologyWordstatRows.length + 5}`).format.wrapText = true;
cosmetologyWordstatSheet.getRange(`B6:B${cosmetologyWordstatRows.length + 5}`).format.numberFormat = '#,##0';
cosmetologyWordstatSheet.getRange(`D6:D${cosmetologyWordstatRows.length + 5}`).conditionalFormats.add('containsText', { text: 'Исключить', format: { fill: colors.paleRed, font: { bold: true, color: '#9F1D20' } } });
cosmetologyWordstatSheet.getRange(`D6:D${cosmetologyWordstatRows.length + 5}`).conditionalFormats.add('containsText', { text: 'с проверкой', format: { fill: colors.paleAmber, font: { bold: true, color: '#8A5A00' } } });
cosmetologyWordstatSheet.getRange(`D6:D${cosmetologyWordstatRows.length + 5}`).conditionalFormats.add('containsText', { text: 'В ядро', format: { fill: colors.paleGreen, font: { bold: true, color: '#086A3B' } } });
const cosmetologyWordstatTable = cosmetologyWordstatSheet.tables.add(`A5:I${cosmetologyWordstatRows.length + 5}`, true, 'WordstatCosmetologySource');
cosmetologyWordstatTable.style = 'TableStyleLight1';
cosmetologyWordstatSheet.freezePanes.freezeRows(5);
[48, 16, 21, 24, 42, 21, 72, 18, 24].forEach((width, index) => { cosmetologyWordstatSheet.getRangeByIndexes(0, index, 1, 1).format.columnWidth = width; });
cosmetologyWordstatSheet.getRange('2:2').format.rowHeight = 26;
cosmetologyWordstatSheet.getRange('3:3').format.rowHeight = 44;
cosmetologyWordstatSheet.getRange('5:5').format.rowHeight = 36;
cosmetologyWordstatSheet.getRange(`6:${cosmetologyWordstatRows.length + 5}`).format.rowHeight = 54;

exactWordstatSheet.getRange('A2').values = [['Точная частотность приоритетных запросов']];
exactWordstatSheet.mergeCells('A2:H2');
exactWordstatSheet.getRange('A2').format.font = { name: 'Calibri', size: 14, bold: true, color: colors.text };
exactWordstatSheet.getRange('A3').values = [[`${exactWordstatMeta.source}. Регион ${exactWordstatMeta.region}. ${exactWordstatMeta.method}`]];
exactWordstatSheet.mergeCells('A3:H3');
exactWordstatSheet.getRange('A3').format = { font: { name: 'Calibri', size: 11, italic: true, color: colors.muted }, wrapText: true };
exactWordstatSheet.getRange('A5:H5').values = [['Направление', 'Запрос', 'Частотность общая', 'Операторный запрос', 'Частотность точная', 'Регион', 'Период', 'Дата проверки']];
exactWordstatSheet.getRange(`A6:H${exactWordstatRows.length + 5}`).values = exactWordstatRows;
exactWordstatSheet.getRange(`A5:H${exactWordstatRows.length + 5}`).format.font = { name: 'Calibri', size: 11, color: colors.text };
exactWordstatSheet.getRange('A5:H5').format = { fill: colors.header, font: { name: 'Calibri', size: 11, bold: true, color: colors.text }, horizontalAlignment: 'center', verticalAlignment: 'center', wrapText: true };
exactWordstatSheet.getRange(`A6:H${exactWordstatRows.length + 5}`).format.verticalAlignment = 'center';
exactWordstatSheet.getRange(`B6:D${exactWordstatRows.length + 5}`).format.wrapText = true;
exactWordstatSheet.getRange(`C6:C${exactWordstatRows.length + 5}`).format.numberFormat = '#,##0';
exactWordstatSheet.getRange(`E6:E${exactWordstatRows.length + 5}`).format.numberFormat = '#,##0';
exactWordstatSheet.getRange(`E6:E${exactWordstatRows.length + 5}`).conditionalFormats.add('cellIs', { operator: 'equal', formula: 0, format: { fill: colors.paleAmber, font: { bold: true, color: '#8A5A00' } } });
const exactWordstatTable = exactWordstatSheet.tables.add(`A5:H${exactWordstatRows.length + 5}`, true, 'WordstatExactSource');
exactWordstatTable.style = 'TableStyleLight1';
exactWordstatSheet.freezePanes.freezeRows(5);
[22, 46, 21, 52, 21, 18, 24, 20].forEach((width, index) => { exactWordstatSheet.getRangeByIndexes(0, index, 1, 1).format.columnWidth = width; });
exactWordstatSheet.getRange('2:2').format.rowHeight = 26;
exactWordstatSheet.getRange('3:3').format.rowHeight = 44;
exactWordstatSheet.getRange('5:5').format.rowHeight = 36;
exactWordstatSheet.getRange(`6:${exactWordstatRows.length + 5}`).format.rowHeight = 34;

serpSheet.getRange('A2').values = [['Группировка запросов по поисковой выдаче']];
serpSheet.mergeCells('A2:J2');
serpSheet.getRange('A2').format.font = { name: 'Calibri', size: 14, bold: true, color: colors.text };
serpSheet.getRange('A3').values = [[`${serpMeta.source}. ${serpMeta.region}. Проверено ${serpMeta.checkedAt}. ${serpMeta.rule}`]];
serpSheet.mergeCells('A3:J3');
serpSheet.getRange('A3').format = { font: { name: 'Calibri', size: 11, italic: true, color: colors.muted }, wrapText: true };
serpSheet.getRange('A5:J5').values = [['Направление', 'Запрос', 'Сравнение с', 'Результатов', 'Общих доменов', 'Одинаковых URL', 'Решение', 'Целевой URL', 'Обоснование', 'Дата проверки']];
serpSheet.getRange(`A6:J${serpDecisionRows.length + 5}`).values = serpDecisionRows;
serpSheet.getRange(`A5:J${serpDecisionRows.length + 5}`).format.font = { name: 'Calibri', size: 11, color: colors.text };
serpSheet.getRange('A5:J5').format = { fill: colors.header, font: { name: 'Calibri', size: 11, bold: true, color: colors.text }, horizontalAlignment: 'center', verticalAlignment: 'center', wrapText: true };
serpSheet.getRange(`A6:J${serpDecisionRows.length + 5}`).format.verticalAlignment = 'top';
serpSheet.getRange(`A6:C${serpDecisionRows.length + 5}`).format.wrapText = true;
serpSheet.getRange(`G6:J${serpDecisionRows.length + 5}`).format.wrapText = true;
serpSheet.getRange(`G6:G${serpDecisionRows.length + 5}`).conditionalFormats.add('containsText', { text: 'Отдельная', format: { fill: colors.paleGreen, font: { bold: true, color: '#086A3B' } } });
serpSheet.getRange(`G6:G${serpDecisionRows.length + 5}`).conditionalFormats.add('containsText', { text: 'Кандидат', format: { fill: colors.paleAmber, font: { bold: true, color: '#8A5A00' } } });
serpSheet.getRange(`G6:G${serpDecisionRows.length + 5}`).conditionalFormats.add('containsText', { text: 'Родительская', format: { fill: colors.header, font: { bold: true, color: colors.text } } });
const serpDecisionTable = serpSheet.tables.add(`A5:J${serpDecisionRows.length + 5}`, true, 'SerpClusteringDecisions');
serpDecisionTable.style = 'TableStyleLight1';
const serpSourceHeaderRow = serpDecisionRows.length + 8;
serpSheet.getRange(`A${serpSourceHeaderRow}`).values = [['Источники проверки выдачи']];
serpSheet.mergeCells(`A${serpSourceHeaderRow}:F${serpSourceHeaderRow}`);
serpSheet.getRange(`A${serpSourceHeaderRow}`).format.font = { name: 'Calibri', size: 13, bold: true, color: colors.text };
serpSheet.getRange(`A${serpSourceHeaderRow + 1}:F${serpSourceHeaderRow + 1}`).values = [['Направление', 'Запрос', 'Органических результатов', 'Домены в порядке выдачи', 'Ссылка на выдачу', 'Дата проверки']];
serpSheet.getRange(`A${serpSourceHeaderRow + 2}:F${serpSourceHeaderRow + serpSourceRows.length + 1}`).values = serpSourceRows;
serpSheet.getRange(`A${serpSourceHeaderRow + 1}:F${serpSourceHeaderRow + serpSourceRows.length + 1}`).format = { font: { name: 'Calibri', size: 11, color: colors.text }, verticalAlignment: 'top' };
serpSheet.getRange(`A${serpSourceHeaderRow + 1}:F${serpSourceHeaderRow + 1}`).format = { fill: colors.header, font: { name: 'Calibri', size: 11, bold: true, color: colors.text }, horizontalAlignment: 'center', verticalAlignment: 'center', wrapText: true };
serpSheet.getRange(`A${serpSourceHeaderRow + 2}:F${serpSourceHeaderRow + serpSourceRows.length + 1}`).format.wrapText = true;
const serpSourceTable = serpSheet.tables.add(`A${serpSourceHeaderRow + 1}:F${serpSourceHeaderRow + serpSourceRows.length + 1}`, true, 'SerpQueryEvidence');
serpSourceTable.style = 'TableStyleLight1';
serpSheet.freezePanes.freezeRows(5);
[20, 42, 38, 15, 16, 16, 30, 30, 72, 18].forEach((width, index) => { serpSheet.getRangeByIndexes(0, index, 1, 1).format.columnWidth = width; });
serpSheet.getRange('2:2').format.rowHeight = 26;
serpSheet.getRange('3:3').format.rowHeight = 48;
serpSheet.getRange('5:5').format.rowHeight = 44;
serpSheet.getRange(`6:${serpDecisionRows.length + 5}`).format.rowHeight = 64;
serpSheet.getRange(`D${serpSourceHeaderRow + 1}:D${serpSourceHeaderRow + serpSourceRows.length + 1}`).format.columnWidth = 86;
serpSheet.getRange(`E${serpSourceHeaderRow + 1}:E${serpSourceHeaderRow + serpSourceRows.length + 1}`).format.columnWidth = 70;
serpSheet.getRange(`${serpSourceHeaderRow + 2}:${serpSourceHeaderRow + serpSourceRows.length + 1}`).format.rowHeight = 72;

negativeSheet.getRange('A2').values = [['Минус-слова для первичной очистки запросов']];
negativeSheet.mergeCells('A2:D2');
negativeSheet.getRange('A2').format.font = { name: 'Calibri', size: 14, bold: true, color: colors.text };
negativeSheet.getRange('A3').values = [['Только кандидаты для ручной проверки, не автоматические исключения. «Курс лечения», «скачать прайс» и информационные вопросы не исключать целиком.']];
negativeSheet.mergeCells('A3:D3');
negativeSheet.getRange('A3').format.font = { name: 'Calibri', size: 11, italic: true, color: colors.muted };
negativeSheet.getRange('A5:D5').values = [['Минус-слово или фраза', 'Направление', 'Причина', 'Статус']];
negativeSheet.getRange(`A6:D${negativeKeywordRows.length + 5}`).values = negativeKeywordRows;
negativeSheet.getRange(`A5:D${negativeKeywordRows.length + 5}`).format.font = { name: 'Calibri', size: 11, color: colors.text };
negativeSheet.getRange('A5:D5').format = { fill: colors.header, font: { name: 'Calibri', size: 11, bold: true, color: colors.text }, horizontalAlignment: 'center', verticalAlignment: 'center', wrapText: true };
negativeSheet.getRange(`A6:D${negativeKeywordRows.length + 5}`).format.wrapText = true;
negativeSheet.getRange(`D6:D${negativeKeywordRows.length + 5}`).dataValidation = { rule: { type: 'list', values: ['Рабочее', 'Проверить после частотности', 'Не использовать'] } };
negativeSheet.getRange(`D6:D${negativeKeywordRows.length + 5}`).conditionalFormats.add('containsText', { text: 'Проверить', format: { fill: colors.paleAmber, font: { bold: true, color: '#8A5A00' } } });
const negativeTable = negativeSheet.tables.add(`A5:D${negativeKeywordRows.length + 5}`, true, 'NegativeKeywords');
negativeTable.style = 'TableStyleLight1';
negativeSheet.freezePanes.freezeRows(5);
[32, 30, 62, 28].forEach((width, index) => { negativeSheet.getRangeByIndexes(0, index, 1, 1).format.columnWidth = width; });
negativeSheet.getRange('2:2').format.rowHeight = 26;
negativeSheet.getRange('3:3').format.rowHeight = 32;
negativeSheet.getRange(`6:${negativeKeywordRows.length + 5}`).format.rowHeight = 38;

const serviceHeaders = ['№', 'Услуга', 'Направление прайса', 'Цена, ₽', 'Кластер', 'Целевой URL', 'Состояние', 'Примечание', 'Строка каталога'];
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

const doctorHeaders = ['№', 'ФИО', 'Специальность или роль', 'Филиал', 'График и примечание', 'Статус'];
const doctorRows = doctors.map(([name, role, branch, note], index) => [
  index + 1,
  name,
  role,
  branch,
  note,
  'Рабочий актуальный список',
]);
doctorsSheet.getRange('A1:F1').values = [doctorHeaders];
doctorsSheet.getRange(`A2:F${doctorRows.length + 1}`).values = doctorRows;
doctorsSheet.getRange(`A1:F${doctorRows.length + 1}`).format.font = { name: 'Calibri', size: 11, color: colors.text };
doctorsSheet.getRange('A1:F1').format = { fill: colors.header, font: { name: 'Calibri', size: 11, bold: true, color: colors.text }, horizontalAlignment: 'center', verticalAlignment: 'center', wrapText: true };
doctorsSheet.getRange(`B2:F${doctorRows.length + 1}`).format.wrapText = true;
doctorsSheet.getRange(`A2:F${doctorRows.length + 1}`).format.verticalAlignment = 'center';
doctorsSheet.getRange(`F2:F${doctorRows.length + 1}`).conditionalFormats.add('containsText', { text: 'Рабочий актуальный список', format: { fill: colors.paleGreen, font: { bold: true, color: '#086A3B' } } });
const doctorsTable = doctorsSheet.tables.add(`A1:F${doctorRows.length + 1}`, true, 'CurrentDoctors');
doctorsTable.style = 'TableStyleLight1';
doctorsSheet.freezePanes.freezeRows(1);
[8, 38, 42, 42, 56, 30].forEach((width, index) => { doctorsSheet.getRangeByIndexes(0, index, 1, 1).format.columnWidth = width; });
doctorsSheet.getRange('1:1').format.rowHeight = 34;
doctorsSheet.getRange(`2:${doctorRows.length + 1}`).format.rowHeight = 42;

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
approvalSheet.getRange('A3').values = [['Отложенные пункты не блокируют сбор запросов по капельницам, УЗИ и косметологии.']];
approvalSheet.getRange('A3').format.font = { name: 'Calibri', size: 11, italic: true, color: colors.muted };
approvalSheet.getRange('A5:D5').values = [['Тип', 'Что проверить', 'Предлагаемое действие', 'Статус']];
approvalSheet.getRange(`A6:D${approvalRows.length + 5}`).values = approvalRows;
approvalSheet.getRange(`A5:D${approvalRows.length + 5}`).format.font = { name: 'Calibri', size: 11, color: colors.text };
approvalSheet.getRange('A5:D5').format = { fill: colors.header, font: { name: 'Calibri', size: 11, bold: true, color: colors.text }, horizontalAlignment: 'center', verticalAlignment: 'center', wrapText: true };
approvalSheet.getRange(`A6:D${approvalRows.length + 5}`).format.verticalAlignment = 'center';
approvalSheet.getRange(`B6:C${approvalRows.length + 5}`).format.wrapText = true;
approvalSheet.getRange(`D6:D${approvalRows.length + 5}`).dataValidation = { rule: { type: 'list', values: ['Ожидает клинику', 'Подтверждено', 'Отклонено', 'Отложено'] } };
approvalSheet.getRange(`D6:D${approvalRows.length + 5}`).conditionalFormats.add('containsText', { text: 'Ожидает клинику', format: { fill: colors.paleAmber, font: { bold: true, color: '#8A5A00' } } });
approvalSheet.getRange(`D6:D${approvalRows.length + 5}`).conditionalFormats.add('containsText', { text: 'Подтверждено', format: { fill: colors.paleGreen, font: { bold: true, color: '#086A3B' } } });
approvalSheet.getRange(`D6:D${approvalRows.length + 5}`).conditionalFormats.add('containsText', { text: 'Отложено', format: { fill: '#E7E6E6', font: { color: '#666666' } } });
const approvalTable = approvalSheet.tables.add(`A5:D${approvalRows.length + 5}`, true, 'ClinicApproval');
approvalTable.style = 'TableStyleLight1';
approvalSheet.freezePanes.freezeRows(5);
[24, 72, 72, 22].forEach((width, index) => { approvalSheet.getRangeByIndexes(0, index, 1, 1).format.columnWidth = width; });
approvalSheet.getRange(`5:${approvalRows.length + 5}`).format.autofitRows();

const coverageSheet = workbook.worksheets.add('Покрытие услуг');
coverageSheet.showGridLines = true;
coverageSheet.getRange('A1:I1').values = [['ID услуги', 'Исходное название', 'Направление', 'Группа', 'Цена, ₽', 'Исполнитель', 'Филиал', 'Решение по SEO', 'ID связанных запросов']];
coverageSheet.getRange(`A2:I${coverageRows.length + 1}`).values = coverageRows;
coverageSheet.getRange(`A1:I${coverageRows.length + 1}`).format = { font: {name:'Calibri',size:11,color:colors.text}, wrapText:true, verticalAlignment:'top' };
coverageSheet.getRange('A1:I1').format = { fill:colors.header, font:{name:'Calibri',size:11,bold:true}, wrapText:true };
coverageSheet.getRange(`E2:E${coverageRows.length+1}`).format.numberFormat = '#,##0" ₽"';
[16,70,18,38,14,40,35,48,70].forEach((width,i)=>{coverageSheet.getRangeByIndexes(0,i,1,1).format.columnWidth=width;});
coverageSheet.getRange(`2:${coverageRows.length+1}`).format.rowHeight=86;
coverageSheet.getRange(`2:${coverageRows.length+1}`).format.autofitRows();
coverageSheet.freezePanes.freezeRows(1);
coverageSheet.tables.add(`A1:I${coverageRows.length+1}`,true,'ServiceQueryCoverage').style='TableStyleLight1';

const publicPriceWorkbook = Workbook.create();
const publicPriceSheet = publicPriceWorkbook.worksheets.add('Прайс');
publicPriceSheet.showGridLines = true;
publicPriceSheet.getRange('A1:C1').values = [['Название', 'Специальность', 'Стоимость']];
publicPriceSheet.getRange(`A2:C${servicePriceCatalog.services.length + 1}`).values = servicePriceCatalog.services.map((service) => [
  publicPriceName(service.name),
  categoryLookup.get(service.category)?.label || '',
  service.price,
]);
publicPriceSheet.getRange(`A1:C${servicePriceCatalog.services.length + 1}`).format.font = { name: 'Calibri', size: 11, color: colors.text };
publicPriceSheet.getRange('A1:C1').format = { fill: colors.header, font: { name: 'Calibri', size: 11, bold: true, color: colors.text }, horizontalAlignment: 'center', verticalAlignment: 'center' };
publicPriceSheet.getRange(`A2:B${servicePriceCatalog.services.length + 1}`).format.wrapText = true;
publicPriceSheet.getRange(`C2:C${servicePriceCatalog.services.length + 1}`).format.numberFormat = '#,##0" ₽"';
publicPriceSheet.getRange('A:A').format.columnWidth = 76;
publicPriceSheet.getRange('B:B').format.columnWidth = 40;
publicPriceSheet.getRange('C:C').format.columnWidth = 16;
publicPriceSheet.freezePanes.freezeRows(1);
const publicPriceTable = publicPriceSheet.tables.add(`A1:C${servicePriceCatalog.services.length + 1}`, true, 'PublicPrice');
publicPriceTable.style = 'TableStyleLight1';
publicPriceSheet.getRange(`2:${servicePriceCatalog.services.length+1}`).format.autofitRows();

workbook.recalculate();
publicPriceWorkbook.recalculate();
await fs.mkdir(outputDir, { recursive: true });
await fs.mkdir(previewDir, { recursive: true });

for (const [sheetName, range, fileName] of [
  ['Сводка', 'A1:E27', 'summary.png'],
  ['Покрытие услуг', 'A1:E10', 'coverage.png'],
  ['Кластеры', 'A1:E10', 'clusters.png'],
  ['Словарь сущностей', 'C2:F10', 'entities.png'],
  ['Поисковые запросы', 'C2:G15', 'queries.png'],
  ['Поисковые запросы', 'C52:O82', 'queries-ultrasound.png'],
  ['Wordstat капельницы', `A1:I${wordstatRows.length + 5}`, 'wordstat-droppers.png'],
  ['Wordstat УЗИ', 'A1:I40', 'wordstat-ultrasound-top.png'],
  ['Wordstat УЗИ', 'A40:I78', 'wordstat-ultrasound-middle.png'],
  ['Wordstat УЗИ', `A78:I${ultrasoundWordstatRows.length + 5}`, 'wordstat-ultrasound-bottom.png'],
  ['Wordstat косметология', 'A1:I42', 'wordstat-cosmetology-top.png'],
  ['Wordstat косметология', 'A42:I102', 'wordstat-cosmetology-middle.png'],
  ['Wordstat косметология', `A102:I${cosmetologyWordstatRows.length + 5}`, 'wordstat-cosmetology-bottom.png'],
  ['Wordstat точная', `A1:H${exactWordstatRows.length + 5}`, 'wordstat-exact.png'],
  ['Кластеризация SERP', `A1:J${serpDecisionRows.length + 5}`, 'serp-clustering.png'],
  ['Минус-слова', `A1:D${negativeKeywordRows.length + 5}`, 'negative-keywords.png'],
  ['Услуги', 'A1:D14', 'services.png'],
  ['Врачи', `A1:F${doctors.length + 1}`, 'doctors.png'],
  ['Текущие страницы', 'A1:C10', 'pages.png'],
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
  range: 'Сводка!A2:E25',
  include: 'values,formulas',
  tableMaxRows: 30,
  tableMaxCols: 8,
});
const entityInspection = await workbook.inspect({
  kind: 'table',
  range: `Словарь сущностей!A2:P${entityRows.length + 4}`,
  include: 'values,formulas',
  tableMaxRows: 18,
  tableMaxCols: 16,
});
const entityCoverageInspection = await workbook.inspect({
  kind: 'match',
  searchTerm: 'Без группы|undefined|#N/A',
  options: { useRegex: true, maxResults: 100 },
  summary: 'entity dictionary coverage scan',
});
const queryInspection = await workbook.inspect({
  kind: 'table',
  range: `Поисковые запросы!A2:O${queryRows.length + 4}`,
  include: 'values,formulas',
  tableMaxRows: 20,
  tableMaxCols: 15,
});
const queryCoverageInspection = await workbook.inspect({
  kind: 'match',
  searchTerm: 'undefined|#N/A|Без группы',
  options: { useRegex: true, maxResults: 100 },
  summary: 'search query coverage scan',
});
const wordstatInspection = await workbook.inspect({
  kind: 'table',
  range: `Wordstat капельницы!A2:I${wordstatRows.length + 5}`,
  include: 'values,formulas',
  tableMaxRows: 45,
  tableMaxCols: 9,
});
const ultrasoundWordstatInspection = await workbook.inspect({
  kind: 'table',
  range: `Wordstat УЗИ!A2:I${ultrasoundWordstatRows.length + 5}`,
  include: 'values,formulas',
  tableMaxRows: 110,
  tableMaxCols: 9,
});
const cosmetologyWordstatInspection = await workbook.inspect({
  kind: 'table',
  range: `Wordstat косметология!A2:I${cosmetologyWordstatRows.length + 5}`,
  include: 'values,formulas',
  tableMaxRows: 230,
  tableMaxCols: 9,
});
const exactWordstatInspection = await workbook.inspect({
  kind: 'table',
  range: `Wordstat точная!A2:H${exactWordstatRows.length + 5}`,
  include: 'values,formulas',
  tableMaxRows: 40,
  tableMaxCols: 8,
});
const serpInspection = await workbook.inspect({
  kind: 'table',
  range: `Кластеризация SERP!A2:J${serpDecisionRows.length + 5}`,
  include: 'values,formulas',
  tableMaxRows: 24,
  tableMaxCols: 10,
});
const negativeInspection = await workbook.inspect({
  kind: 'table',
  range: `Минус-слова!A2:D${negativeKeywordRows.length + 5}`,
  include: 'values,formulas',
  tableMaxRows: 30,
  tableMaxCols: 4,
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
const doctorsInspection = await workbook.inspect({
  kind: 'table',
  range: `Врачи!A1:F${doctors.length + 1}`,
  include: 'values,formulas',
  tableMaxRows: 25,
  tableMaxCols: 6,
});
const publicPriceInspection = await publicPriceWorkbook.inspect({
  kind: 'table',
  range: 'Прайс!A1:C15',
  include: 'values,formulas',
  tableMaxRows: 15,
  tableMaxCols: 3,
});
const publicPriceErrors = await publicPriceWorkbook.inspect({
  kind: 'match',
  searchTerm: '#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!|#SPILL!|#CALC!',
  options: { useRegex: true, maxResults: 100 },
  summary: 'public price formula error scan',
});

const publicPricePreview = await publicPriceWorkbook.render({ sheetName: 'Прайс', range: 'A1:C18', scale: 1, format: 'png' });
await fs.writeFile(path.join(previewDir, 'public-price.png'), new Uint8Array(await publicPricePreview.arrayBuffer()));

const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(outputPath);
const publicPriceOutput = await SpreadsheetFile.exportXlsx(publicPriceWorkbook);
await publicPriceOutput.save(publicPriceOutputPath);
await fs.copyFile(publicPriceOutputPath, publicPriceAssetPath);

const report = {
  outputPath,
  previewDir,
  clusters: clusters.length,
  services: serviceRows.length,
  entities: entityRows.length,
  entityCounts: Object.fromEntries(['Капельницы', 'УЗИ', 'Косметология'].map((direction) => [direction, entityRows.filter((row) => row[2] === direction).length])),
  entityGroupCounts,
  queries: queryRows.length,
  queryCounts: Object.fromEntries(['Капельницы', 'УЗИ', 'Косметология'].map((direction) => [direction, queryRows.filter((row) => row[2] === direction).length])),
  negativeKeywords: negativeKeywordRows.length,
  pages: pageRows.length,
  inspections: {
    summary: summaryInspection.ndjson,
    clusters: clusterInspection.ndjson,
    entities: entityInspection.ndjson,
    entityCoverage: entityCoverageInspection.ndjson,
    queries: queryInspection.ndjson,
    queryCoverage: queryCoverageInspection.ndjson,
    wordstatDroppers: wordstatInspection.ndjson,
    wordstatUltrasound: ultrasoundWordstatInspection.ndjson,
    wordstatCosmetology: cosmetologyWordstatInspection.ndjson,
    wordstatExact: exactWordstatInspection.ndjson,
    serpClustering: serpInspection.ndjson,
    negativeKeywords: negativeInspection.ndjson,
    doctors: doctorsInspection.ndjson,
    approval: approvalInspection.ndjson,
    errors: errorInspection.ndjson,
    publicPrice: publicPriceInspection.ndjson,
    publicPriceErrors: publicPriceErrors.ndjson,
  },
};
await fs.writeFile(path.join(outputDir, 'validation-report.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify({outputPath, previewDir, services:serviceRows.length, entities:entityRows.length, queries:queryRows.length, uncovered:coverageRows.filter(r=>!r[8]).length, errors:errorInspection.ndjson, publicPriceErrors:publicPriceErrors.ndjson, summary:summaryInspection.ndjson}, null, 2));
