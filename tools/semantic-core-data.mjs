import { createHash } from 'node:crypto';
import { droppersWordstatMeta, droppersWordstatRows } from './wordstat-droppers-2026-10-06.mjs';
import { ultrasoundWordstatMeta, ultrasoundWordstatRows } from './wordstat-ultrasound-2026-10-06.mjs';
import { cosmetologyWordstatMeta, cosmetologyWordstatRows } from './wordstat-cosmetology-2026-10-06.mjs';
import { exactWordstatMeta, exactWordstatRows } from './wordstat-exact-2026-10-06.mjs';
const priorityEntityConfig = {
  droppers: {
    direction: 'Капельницы',
    url: 'droppers.html',
    staff: 'Медицинские сестры двух филиалов; по назначению врача',
    branch: 'Николая Гаврилова, 4; Лермонтова, 69',
    modifiers: 'Иркутск; цена; стоимость; записаться; курс; консультация',
  },
  ultrasound: {
    direction: 'УЗИ',
    url: 'ultrasound.html',
    staff: 'Мясников В. Г.; Пиксаева И. В.',
    branch: 'Николая Гаврилова, 4; Лермонтова, 69',
    modifiers: 'Иркутск; цена; стоимость; записаться; сделать; подготовка',
  },
  cosmetology: {
    direction: 'Косметология',
    url: 'cosmetology.html',
    staff: 'Мясникова А. В.; Глазкова Я. А.',
    branch: 'Николая Гаврилова, 4',
    modifiers: 'Иркутск; цена; стоимость; записаться; процедура; консультация',
  },
};

const priorityLandingPages = {
  ultrasound: {
    gynecology: 'ultrasound-pelvis.html',
    urinary: 'ultrasound-kidneys.html',
    abdomen: 'ultrasound-abdomen.html',
    elastography: 'ultrasound-abdomen.html',
    heart: 'echocardiography.html',
  },
};

function landingPageFor(category, groupKey) {
  return priorityLandingPages[category]?.[groupKey] || priorityEntityConfig[category].url;
}

const entityGroups = {
  droppers: {
    liver: ['Программы для печени', 'капельница для печени; гепатопротекторная капельница', 'капельница для восстановления печени; капельница детокс для печени', 'Найти программу по назначению врача и узнать стоимость'],
    detox: ['Детокс-программы', 'детокс-капельница; инфузионная детокс-программа', 'капельница детокс; очищающая капельница', 'Найти детокс-программу и узнать условия проведения'],
    neuro: ['Нейропротективные программы', 'нейропротективная капельница; инфузионная программа', 'капельница для памяти; капельница для концентрации', 'Найти программу по назначению врача и уточнить состав курса'],
    antiage: ['Anti-age программы', 'anti-age капельница; антивозрастная инфузионная программа', 'капельница anti-age; капельница Золушка', 'Найти anti-age программу и узнать стоимость'],
    antioxidant: ['Антиоксидантные программы', 'антиоксидантная капельница; инфузионная программа', 'капельница с антиоксидантами', 'Найти антиоксидантную программу и уточнить показания'],
    energy: ['Программы активности и восстановления', 'восстановительная капельница; инфузионная программа', 'капельница для энергии; спортивная капельница', 'Найти программу восстановления и узнать условия записи'],
    recovery: ['Восстановительные программы', 'восстановительная капельница; инфузионная терапия', 'капельница для восстановления', 'Найти восстановительную программу и уточнить назначение'],
  },
  ultrasound: {
    checkup: ['Комплексные УЗИ и чекапы', 'комплексное УЗИ; УЗИ-чекап', 'УЗИ всего организма; мужской или женский УЗИ-чекап', 'Подобрать комплекс исследований и узнать его состав'],
    pregnancy: ['УЗИ при беременности', 'ультразвуковое исследование при беременности; пренатальное УЗИ', 'УЗИ плода; УЗИ по триместрам', 'Найти исследование по сроку беременности и записаться'],
    gynecology: ['Гинекологическое УЗИ', 'УЗИ малого таза; УЗИ матки и придатков', 'женское УЗИ; трансвагинальное УЗИ', 'Выбрать способ исследования и узнать подготовку'],
    male: ['УЗИ мужской мочеполовой системы', 'ТРУЗИ; УЗИ предстательной железы; УЗИ мошонки', 'УЗИ простаты; мужское УЗИ', 'Найти нужное исследование мужской мочеполовой системы'],
    urinary: ['УЗИ мочевыделительной системы', 'УЗИ почек; УЗИ мочевого пузыря; УЗИ надпочечников', 'УЗИ почек и мочевого пузыря', 'Найти исследование органов мочевыделительной системы'],
    abdomen: ['УЗИ органов брюшной полости', 'УЗИ брюшной полости; УЗИ печени; УЗИ желчного пузыря', 'УЗИ ОБП; УЗИ живота', 'Найти исследование органов брюшной полости и подготовку'],
    vessels: ['УЗИ сосудов', 'дуплексное сканирование; допплерография сосудов', 'УЗДГ; допплер; дуплекс сосудов', 'Выбрать исследование сосудов нужной области'],
    heart: ['УЗИ сердца', 'эхокардиография; ЭХОКГ', 'ЭХО сердца; УЗИ сердца', 'Узнать стоимость ЭХОКГ и записаться'],
    thyroid: ['УЗИ щитовидной железы', 'ультразвуковое исследование щитовидной железы', 'УЗИ щитовидки', 'Узнать цену и подготовку к УЗИ щитовидной железы'],
    breast: ['УЗИ молочных желез', 'ультразвуковое исследование молочных желез', 'УЗИ груди', 'Узнать цену и записаться на УЗИ молочных желез'],
    pediatric: ['Детское УЗИ', 'УЗИ детям; нейросонография; скрининг новорожденного', 'УЗИ ребенку; УЗИ грудничку', 'Подобрать исследование ребенку по возрасту'],
    joints: ['УЗИ суставов', 'ультразвуковое исследование сустава', 'УЗИ колена; УЗИ сустава', 'Найти УЗИ нужного сустава и записаться'],
    soft: ['УЗИ мягких тканей и поверхностных структур', 'УЗИ мягких тканей; УЗИ лимфоузлов; УЗИ кожи', 'УЗИ образования; УЗИ лимфоузлов', 'Выбрать исследование мягких тканей нужной зоны'],
    pleura: ['УЗИ плевральной полости', 'ультразвуковое исследование плевральной полости', 'УЗИ плевры', 'Узнать стоимость исследования и записаться'],
    intervention: ['УЗИ-контролируемые манипуляции', 'пункция под УЗИ-контролем; дренирование', 'лечебная пункция', 'Уточнить показания и условия проведения манипуляции'],
    elastography: ['Эластография', 'эластография печени; эластография сдвиговой волны', 'эластография; фибросканирование', 'Узнать подготовку и стоимость эластографии'],
    consultation: ['Консультация врача УЗИ', 'прием врача ультразвуковой диагностики; консультация узиста', 'прием узиста', 'Записаться на консультацию врача УЗИ'],
    control: ['Контрольные УЗИ', 'контрольное ультразвуковое исследование; УЗИ после манипуляции', 'контрольное УЗИ', 'Записаться на контрольное исследование'],
    addon: ['Дополнительные материалы УЗИ', 'фотография УЗИ; снимок исследования', 'фото с УЗИ', 'Уточнить возможность получить материалы исследования'],
  },
  cosmetology: {
    consultation: ['Консультации косметолога и дерматолога', 'прием косметолога; консультация дерматолога', 'консультация косметолога; прием дерматолога', 'Записаться на консультацию специалиста'],
    contour: ['Контурная пластика и филлеры', 'контурная пластика; коррекция филлерами; объемное моделирование', 'филлеры; увеличение губ; моделирование лица', 'Выбрать зону коррекции и препарат на консультации'],
    biorevitalization: ['Биоревитализация', 'инъекционная биоревитализация; препараты для биоревитализации', 'биоревитализация лица; уколы гиалуроновой кислоты', 'Узнать стоимость препарата и записаться на консультацию'],
    botulinum: ['Ботулинотерапия', 'инъекции ботулотоксина; коррекция мимических морщин', 'ботокс; диспорт; релатокс; ксеомин', 'Уточнить препарат, количество единиц и стоимость'],
    peeling: ['Химические пилинги', 'химический пилинг лица; профессиональный пилинг', 'пилинг лица; желтый пилинг', 'Выбрать вид пилинга на консультации'],
    cleaning: ['Чистка лица', 'комплексная чистка лица; чистка лица с пилингом', 'чистка лица у косметолога', 'Узнать состав процедуры и записаться'],
    collagen: ['Коллагенотерапия', 'инъекционная коллагенотерапия; коллагеностимулирующая терапия', 'инъекции коллагена', 'Уточнить препарат и стоимость процедуры'],
    mesotherapy: ['Мезотерапия', 'инъекционная мезотерапия; мезококтейли', 'мезотерапия лица', 'Выбрать препарат и узнать стоимость'],
    plasma: ['Плазмотерапия', 'плазмолифтинг; PRP-терапия; плазматерапия', 'плазма для лица; плазмолифтинг лица', 'Узнать вариант процедуры и записаться'],
    rf: ['Микроигольчатый RF-лифтинг', 'игольчатый RF-лифтинг; радиочастотный микроигольчатый лифтинг', 'РФ-лифтинг; микроигольчатый лифтинг', 'Выбрать зону и тип игл на консультации'],
    smas: ['SMAS-лифтинг', 'ультразвуковой SMAS-лифтинг; аппаратный лифтинг', 'СМАС-лифтинг; смас лица', 'Выбрать объем процедуры и узнать стоимость'],
    threads: ['Нитевой лифтинг', 'мезонити; тредлифтинг', 'нити для лица; подтяжка нитями', 'Уточнить количество нитей и показания на консультации'],
    removal: ['Удаление новообразований кожи', 'лазерное удаление папиллом; удаление невусов; удаление кератом', 'удалить родинку; удалить папиллому; удалить бородавку', 'Уточнить метод удаления, зону и необходимость диагностики'],
    laser: ['Лазерная косметология', 'лазерная процедура; лазерная коррекция', 'лазерная блефаропластика', 'Уточнить показания и стоимость лазерной процедуры'],
    placental: ['Плацентарная терапия', 'терапия плацентарными препаратами; инъекционная терапия', 'Лаеннек; Мэлсмон', 'Уточнить препарат, показания и схему на консультации'],
    lipolysis: ['Интралипотерапия', 'инъекционная липолитическая терапия; коррекция локальных жировых отложений', 'липолитики; коррекция малярных мешков', 'Выбрать зону и объем процедуры на консультации'],
    care: ['Уходовые и аппаратные процедуры', 'уход за лицом; массаж лица; косметологическая маска; микротоки', 'массаж лица; маска для лица; микротоки', 'Подобрать уходовую или аппаратную процедуру'],
    scar: ['Коррекция рубцов', 'лечение и коррекция рубцов; инъекционная коррекция рубца', 'убрать рубец; коррекция шрама', 'Уточнить тип рубца и возможный метод коррекции'],
    correction: ['Коррекция после инъекционных процедур', 'коррекция филлера; выведение гиалуроновой кислоты', 'растворить филлер; убрать гиалуронку', 'Записаться на осмотр и коррекцию после инъекционной процедуры'],
    support: ['Сопутствующие услуги', 'анестезия; обезболивание; гистология; расходные материалы', 'обезболивание процедуры; анализ материала', 'Уточнить необходимость сопутствующей услуги'],
    other: ['Другие косметологические процедуры', 'косметологическая процедура; дерматокосметология', 'процедура у косметолога', 'Записаться на консультацию для выбора процедуры'],
  },
};

function compactText(value) {
  return String(value).replace(/\s+/g, ' ').trim();
}

function normalizedServiceName(name) {
  return compactText(name)
    .replaceAll('Власова А.В.', 'Мясникова А.В.')
    .replaceAll('Власова А. В.', 'Мясникова А.В.')
    .replace(/^АКЦИЯ!\s*/i, '')
    .replace(/\s*\((?:Глазкова|Мясникова)\s+[А-Я]\.[А-Я]\.\)\s*$/i, '');
}

function classifyPriorityEntity(category, name) {
  const value = name.toLocaleLowerCase('ru-RU').replaceAll('ё', 'е');
  if (category === 'droppers') {
    if (/^детокс|детоксикационный коктейль/.test(value)) return 'detox';
    if (/гепатопротектор|печен/.test(value)) return 'liver';
    if (/нейропротектив|памят/.test(value)) return 'neuro';
    if (/anti\s*-?\s*age|золушк/.test(value)) return 'antiage';
    if (/антиоксидант/.test(value)) return 'antioxidant';
    if (/энерг|спорт/.test(value)) return 'energy';
    return 'recovery';
  }
  if (category === 'ultrasound') {
    if (/новорожден|макушки|нейросон/.test(value)) return 'pediatric';
    if (/эластограф/.test(value)) return 'elastography';
    if (/брюш.*почек/.test(value)) return 'checkup';
    if (/чекап/.test(value)) return 'checkup';
    if (/плод|беремен|плацент|пупов|цервик|фетометр|амниот|триместр|сердцебиен|обвит/.test(value)) return 'pregnancy';
    if (/матк|придат|гинеколог|фолликул/.test(value)) return 'gynecology';
    if (/мошон|предстател|семенн|трузи/.test(value)) return 'male';
    if (/мочев|почек|надпочеч/.test(value)) return 'urinary';
    if (/брюш|гепатобилиар|печен|желч|поджел|селез/.test(value)) return 'abdomen';
    if (/сосуд|дуплекс|артери|вен |доплер/.test(value)) return 'vessels';
    if (/сердц|эхокг/.test(value)) return 'heart';
    if (/щитов/.test(value)) return 'thyroid';
    if (/молоч/.test(value)) return 'breast';
    if (/нейросон|макушки|новорожден/.test(value)) return 'pediatric';
    if (/сустав/.test(value)) return 'joints';
    if (/кож|мягк|лимфат|поверхност/.test(value)) return 'soft';
    if (/плевраль/.test(value)) return 'pleura';
    if (/пункц|дренир/.test(value)) return 'intervention';
    if (/эластограф/.test(value)) return 'elastography';
    if (/узист/.test(value)) return 'consultation';
    if (/после манипуляц/.test(value)) return 'control';
    if (/фотограф/.test(value)) return 'addon';
    throw new Error(`Не классифицировано УЗИ: ${name}`);
  }
  if (/первичн.*прием|консультац/.test(value)) return 'consultation';
  if (/микроиголь|rf лифт|рф лифт/.test(value)) return 'rf';
  if (/биоревитал/.test(value)) return 'biorevitalization';
  if (/контур|объ[её]мное модел/.test(value)) return 'contour';
  if (/ботулин|диспорт|ксеомин|миотокс|релатокс|гипергидроз/.test(value)) return 'botulinum';
  if (/чистк/.test(value)) return 'cleaning';
  if (/пилинг/.test(value)) return 'peeling';
  if (/коллаген|collost|linerase|nithya|сферогель/.test(value)) return 'collagen';
  if (/мезотерап/.test(value)) return 'mesotherapy';
  if (/плазм/.test(value)) return 'plasma';
  if (/микроиголь|\brf\b|\bрф\b/.test(value)) return 'rf';
  if (/смас|smas/.test(value)) return 'smas';
  if (/нитевой|мезонити/.test(value)) return 'threads';
  if (/удален|папиллом|невус|родин|кератом|ксантелаз|кондилом|бородав|милиум|гемангиом|новообразован/.test(value)) return 'removal';
  if (/лазерн/.test(value)) return 'laser';
  if (/плацентар|лаеннек|мэлсмон/.test(value)) return 'placental';
  if (/интралипо/.test(value)) return 'lipolysis';
  if (/массаж|маска|микроток|дарсанваль|карбокс|озонотерап/.test(value)) return 'care';
  if (/рубц/.test(value)) return 'scar';
  if (/выведение гиалурон/.test(value)) return 'correction';
  if (/анестез|обезбол|гистолог|расходн/.test(value)) return 'support';
  return 'other';
}


export function publicPriceName(name) {
  return compactText(name).replace(/Власова\s+А\.\s*В\./g, 'Мясникова А.В.');
}
const stableId = (prefix, text) => prefix + createHash('sha256').update(text).digest('hex').slice(0, 10);
function provider(name) {
  if (/Пиксаева/i.test(name)) return ['Пиксаева Ирина Викторовна', 'Лермонтова, 69'];
  if (/Глазкова/i.test(name)) return ['Глазкова Яна Алексеевна', 'Николая Гаврилова, 4'];
  if (/Власова|Мясникова/i.test(name)) return ['Мясникова Александра Валерьевна', 'Николая Гаврилова, 4'];
  return ['Исполнитель услуги не указан', 'Филиал услуги не указан'];
}
// These are hypotheses grounded in price names, not harvested search demand.
const rootTerms = {
  droppers: ['капельницы', 'инфузионная терапия'],
  ultrasound: ['узи', 'ультразвуковая диагностика'],
  cosmetology: ['косметология', 'косметолог'],
};
const groupTerms = {
  droppers: {
    liver: ['гепатопротекторная капельница'], detox: ['капельница детокс'],
    neuro: ['нейропротективная капельница'], antiage: ['капельница anti-age'],
    antioxidant: ['антиоксидантная капельница'], energy: [], recovery: ['регенерирующая капельница'],
  },
  ultrasound: {
    checkup: ['комплексное узи'], pregnancy: ['узи при беременности'],
    gynecology: ['гинекологическое узи'], male: [], urinary: [], abdomen: [],
    vessels: ['узи сосудов'], heart: ['эхокардиография'], thyroid: ['узи щитовидки'],
    breast: [], pediatric: ['узи для детей'], joints: ['узи суставов'], soft: [],
    pleura: [], intervention: [], elastography: [], consultation: ['врач узи'],
    control: [], addon: [],
  },
  cosmetology: {
    consultation: [], contour: ['контурная пластика', 'филлеры'],
    biorevitalization: ['биоревитализация'], botulinum: ['ботулинотерапия'],
    peeling: ['пилинг лица'], cleaning: ['чистка лица'], collagen: ['коллагенотерапия'],
    mesotherapy: ['мезотерапия'], plasma: ['плазмотерапия', 'плазмолифтинг'],
    rf: ['микроигольчатый rf лифтинг'], smas: ['смас лифтинг', 'smas лифтинг'],
    threads: ['нитевой лифтинг', 'мезонити'], removal: ['удаление новообразований кожи'],
    laser: [], placental: ['плацентарная терапия'], lipolysis: ['интралипотерапия'],
    care: [], scar: ['коррекция рубцов'], correction: ['выведение гиалуроновой кислоты'],
    support: [], other: [],
  },
};
function termFor(service) {
  const raw = service.name;
  if (service.category === 'cosmetology') {
    if (/нитевой|мезонити/i.test(raw)) return 'нитевой лифтинг мезонити dg-lift';
    if (/^смас|^smas/i.test(raw)) return 'смас лифтинг';
    if (/^маска$/i.test(raw)) return 'косметологическая маска для лица';
    if (/^маска альгинантная/i.test(raw)) return 'альгинатная маска для лица';
    if (/^дарсанваль/i.test(raw)) return 'дарсонваль для волос';
    if (/^микротоки$/i.test(raw)) return 'микротоки в косметологии';
  }
  if (service.category === 'droppers') {
    if (/золушка/i.test(raw)) return 'капельница золушка';
    if (/anti\s*-?\s*age/i.test(raw)) return 'капельница anti-age';
    if (/спорт/i.test(raw)) return 'капельница спорт';
    if (/энерг/i.test(raw)) return 'энергетическая капельница';
    return (groupTerms.droppers[classifyPriorityEntity(service.category, raw)] || [])[0];
  }
  if (service.category === 'ultrasound') {
    const overrides = [
      [/новорожден|макушки/i, 'узи скрининг новорожденного'],
      [/детский чекап/i, 'детский узи чекап'],
      [/женский.*чекап/i, 'женский узи чекап'],
      [/мужской.*чекап/i, 'мужской узи чекап'],
      [/эластография печени/i, 'эластография печени'],
      [/экстракраниаль/i, 'дуплексное сканирование брахиоцефальных артерий'],
      [/трузи/i, 'трузи предстательной железы'],
      [/цервикаль/i, 'цервикометрия'],
      [/индекс амниот/i, 'узи индекс амниотической жидкости'],
      [/консультативный/i, 'консультация врача узи'],
      [/темп.*роста плода/i, 'узи роста плода'],
      [/контрольное узи сердцебиения/i, 'узи сердцебиения плода'],
      [/сердца эхокг/i, 'узи сердца'],
      [/доплерография/i, 'допплерография сосудов матки и плода'],
      [/определение положения/i, 'узи положения плода'],
    ];
    for (const [pattern, term] of overrides) if (pattern.test(raw)) return term;
  }
  // Preserve clinically meaningful zones, drop only administration/quantity tails.
  return publicPriceName(raw).replace(/^АКЦИЯ!\s*/i, '')
    .replace(/\([^()]*(?:Глазкова|Мясникова|Пиксаева|натощак|анализы|стоимость|скидка|за штуку|за 1|диагностик)[^()]*\)/gi, '')
    .replace(/\(([^)]*)\)/g, (_, inner) => /^(колени|кисти рук|ягодицы|б[её]дра|лицо|лицо и шея|лицо,шея|спина|под грудью|интимная область|транс\s*вагинально|транс\s*ректально|транс\s*абдоминально)/i.test(inner.trim()) ? ' '+inner.replace(/неизолированные иглы|изолированные иглы/gi,'')+' ' : ' ')
    .replace(/\/.*$/, '')
    .replace(/СТРОГО НАТОЩАК.*$/i, '')
    .replace(/от\s+\d+\s*р\.?/gi, '')
    .replace(/\d+(?:[.,]\d+)?\s*(?:ml|мл|ед|шт|линий|линия|%)(?=\s|[.;,]|$)\.?/gi, '')
    .replace(/\d+\s*;\s*.*$/, '')
    .replace(/\s+\d{4,}(?=\s|$).*$/, '')
    .replace(/до\s+\d+.*$/i, '')
    .replace(/от\s+\d+\s*мм.*$/i, '')
    .replace(/более\s+\d+.*$/i, '')
    .replace(/[«»"]/g, '').replace(/\\/g, ' ').replace(/[.;,:-]+\s*$/g, '').replace(/\s+/g, ' ').trim().toLowerCase();
}
export function buildPrioritySemantics(catalog) {
  const order = ['droppers', 'ultrasound', 'cosmetology'];
  const services = catalog.services.filter(s => order.includes(s.category))
    .toSorted((a,b) => order.indexOf(a.category)-order.indexOf(b.category) || a.name.localeCompare(b.name,'ru'));
  const records = services.map(service => {
    const key = classifyPriorityEntity(service.category, service.name);
    const ancillary = ['support','addon'].includes(key);
    const ambiguous = key === 'other' || (key === 'removal' && !/удален/i.test(service.name));
    const term = ancillary || key === 'other' ? '' : termFor(service);
    return {service, key, id: stableId('E', service.category+'|'+service.name), term,
      disposition: ancillary ? 'Сопутствующая услуга — без отдельного продвижения'
        : ambiguous ? 'Уточнить процедуру; запрос — гипотеза' : 'Кандидаты для проверки спроса'};
  });
  const entityRows = records.map(({service:s,key,id,term,disposition}) => {
    const c=priorityEntityConfig[s.category]; const [group,,,need]=entityGroups[s.category][key];
    const [staff,branch]=provider(s.name);
    const canonical = s.category === 'droppers' ? normalizedServiceName(s.name).replace(/\([^)]*\)/g, '').trim() : normalizedServiceName(s.name);
    return [id,'1 — приоритет клиники',c.direction,group,canonical,
      term,'',need,c.modifiers,s.name,s.price,staff,branch,landingPageFor(s.category, key),
      s.category==='droppers' ? 'Проверить медицинскую формулировку' : disposition,
      'Варианты запросов — гипотезы, не подтвержденный спрос. URL предварительный. '+(staff.startsWith('Исполнитель')?'Специалисты направления не означают доступность каждой процедуры.':'Исполнитель из названия прайса; филиал из списка пользователя.')
    ];
  });
  const map = new Map();
  function add(term, category, group, ids=[], level='Услуга') {
    if (!term) return;
    for (const phrase of [term, term+' иркутск', term+' цена иркутск']) {
      const query=compactText(phrase).toLowerCase().replaceAll('ё','е');
      if(query.length>140)throw Error('Слишком длинный кандидат: '+query);
      const existing=map.get(query);
      if(existing){ids.forEach(id=>existing.ids.add(id));continue;}
      map.set(query,{id:stableId('Q',query),query,category,group,ids:new Set(ids),level});
    }
  }
  for (const category of order) for(const term of rootTerms[category])
    add(term,category,'Общие запросы направления',[],'Направление');
  for(const r of records) {
    const group=entityGroups[r.service.category][r.key][0];
    add(r.term,r.service.category,group,[r.id]);
  }
  for (const category of order) for(const [key,terms] of Object.entries(groupTerms[category])) {
    const ids=records.filter(r=>r.service.category===category&&r.key===key&&r.term).map(r=>r.id);
    if(!ids.length)continue;
    for(const term of terms) add(term,category,entityGroups[category][key][0],ids,'Группа');
  }
  const wordstatSources = [
    { category: 'droppers', rows: droppersWordstatRows, meta: droppersWordstatMeta },
    { category: 'ultrasound', rows: ultrasoundWordstatRows, meta: ultrasoundWordstatMeta },
    { category: 'cosmetology', rows: cosmetologyWordstatRows, meta: cosmetologyWordstatMeta },
  ];
  for (const source of wordstatSources) for (const row of source.rows.filter((item) => item.decision === 'В ядро' || item.decision === 'В ядро с проверкой' || item.decision === 'Отклонить')) {
    const query = compactText(row.query).toLowerCase().replaceAll('ё', 'е');
    const entityIds = row.entityKey
      ? records.filter((record) => record.service.category === source.category && record.key === row.entityKey && record.term).map((record) => record.id)
      : [];
    const existing = map.get(query);
    if (existing) {
      entityIds.forEach((id) => existing.ids.add(id));
      Object.assign(existing, { wordstat: row, wordstatMeta: source.meta, group: row.group || existing.group, level: row.level || existing.level });
      continue;
    }
    map.set(query, {
      id: stableId('Q', query), query, category: source.category, group: row.group,
      ids: new Set(entityIds), level: row.level, wordstat: row, wordstatMeta: source.meta,
    });
  }
  const exactByQuery = new Map(exactWordstatRows.map((row) => [row[1], { operator: row[3], frequency: row[4] }]));
  const queryRows=[...map.values()].sort((a,b)=>order.indexOf(a.category)-order.indexOf(b.category)||a.query.localeCompare(b.query,'ru')).map(q=> {
    const exact = exactByQuery.get(q.query);
    return [
    q.id,(q.query.includes('цена')||q.wordstat?.intent==='Цена')?'2 — коммерческий':'1 — основной',
    priorityEntityConfig[q.category].direction,q.group,q.query,q.level,
    q.wordstat?.intent || (q.query.includes('цена')?'Цена':'Услуга'),q.query.includes('иркутск')?'Иркутск':'Без гео',
    q.level==='Направление'?'Общий запрос направления':q.query.replace(/ цена иркутск$| иркутск$/,''),
    landingPageFor(q.category, Object.entries(entityGroups[q.category]).find(([, value]) => value[0] === q.group)?.[0]),q.wordstat?.frequency ?? null,exact?.frequency ?? null,q.wordstat?'Wordstat':'Не загружено',
    q.wordstat?.decision === 'Отклонить' ? 'Отклонено'
      : q.wordstat?.decision === 'В ядро с проверкой' ? 'Проверить медицинскую формулировку'
      : q.wordstat ? 'Подтверждено'
      : q.category==='droppers'||records.some(r=>q.ids.has(r.id)&&r.disposition.startsWith('Уточнить'))?'Проверить медицинскую формулировку':'Готов к проверке частотности',
    q.wordstat
      ? `${q.wordstat.note} Частотность без операторов; точную частотность собрать отдельно.`
      : 'Кандидат из прайса и словаря; спрос и группировка выдачей не проверены.',
    [...q.ids].sort().join('; '),'Иркутск',q.wordstat?q.wordstatMeta.checkedAt:null,q.wordstat?q.wordstatMeta.period:null,exact?.operator ?? (q.wordstat?'без операторов':null),
  ];
  });
  const coverageRows=records.map(r=>[
    r.id,r.service.name,priorityEntityConfig[r.service.category].direction,
    entityGroups[r.service.category][r.key][0],r.service.price,...provider(r.service.name),
    r.disposition,queryRows.filter(q=>q[15].split('; ').includes(r.id)).map(q=>q[0]).join('; '),
  ]);
  const entityGroupCounts=entityRows.reduce((a,r)=>(a[r[2]+' / '+r[3]]=(a[r[2]+' / '+r[3]]||0)+1,a),{});
  const negativeKeywordRows=[
    ['обучение косметологов','Косметология','Обучение специалиста, не процедура пациента'],
    ['курсы врачей узи','УЗИ','Не исключать слово «курс»: курс лечения — целевой запрос'],
    ['вакансия косметолога','Косметология','Поиск работы, не запись на прием'],
    ['купить аппарат узи','УЗИ','Покупка оборудования'],
    ['реферат по косметологии','Косметология','Учебная работа'],
    ['узи для животных','УЗИ','Ветеринарная услуга'],
  ].map(r=>[...r,'Проверить после частотности']);
  const wordstatRows = droppersWordstatRows.map((row) => [
    row.query, row.frequency, row.type, row.decision, row.group, row.intent,
    row.note, droppersWordstatMeta.region, droppersWordstatMeta.period,
  ]);
  const ultrasoundSourceRows = ultrasoundWordstatRows.map((row) => [
    row.query, row.frequency, row.type, row.decision, row.group, row.intent,
    row.note, ultrasoundWordstatMeta.region, ultrasoundWordstatMeta.period,
  ]);
  const cosmetologySourceRows = cosmetologyWordstatRows.map((row) => [
    row.query, row.frequency, row.type, row.decision, row.group, row.intent,
    row.note, cosmetologyWordstatMeta.region, cosmetologyWordstatMeta.period,
  ]);
  const exactSourceRows = exactWordstatRows.map((row) => [
    ...row, exactWordstatMeta.region, exactWordstatMeta.period, exactWordstatMeta.checkedAt,
  ]);
  return {
    entityRows,queryRows,coverageRows,entityGroupCounts,negativeKeywordRows,
    wordstatRows,wordstatMeta:droppersWordstatMeta,
    ultrasoundWordstatRows:ultrasoundSourceRows,ultrasoundWordstatMeta,
    cosmetologyWordstatRows:cosmetologySourceRows,cosmetologyWordstatMeta,
    exactWordstatRows:exactSourceRows,exactWordstatMeta,
  };
}
