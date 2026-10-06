const checkedAt = '2026-10-06';

const queryEvidence = [
  ['Капельницы', 'капельницы иркутск', 10, ['prodoctorov.ru', 'irkutsk.biorise.ru', 'irk.docdoc.ru', '2gis.ru', 'irkutsk.kapelnica.clinic', 'napopravku.ru', 'irk.krasotaimedicina.ru', 'irkutsk.president-medical.ru', 'kapelnaya138.ru', 'clean-clinic38.ru']],
  ['Капельницы', 'инфузионная терапия иркутск', 10, ['irkutsk.biorise.ru', 'clean-clinic38.ru', 'irkutsk.health-kapelnica.ru', 'irkutsk.kapelnica.clinic', 'bioingeneria.ru', 'kapelnaya138.ru', 'zoon.ru', 'prodoctorov.ru', 'irkutsk.lvc-health.ru', 'clean-clinic.ru']],
  ['Капельницы', 'капельница золушка иркутск', 10, ['prodoctorov.ru', 'irk.docdoc.ru', 'kapelnaya138.ru', 'filleres.ru', 'irkutsk.chh.ru', 'irkutsk.kapelnica.clinic', 'irkutsk.president-medical.ru', 'wildberries.ru', 'irkutsk.lvc-health.ru', 'irkutsk.biorise.ru']],
  ['Капельницы', 'капельницы для печени иркутск', 10, ['prodoctorov.ru', 'irkutsk.kapelnica.clinic', 'irkutsk.chh.ru', 'irkutsk.biorise.ru', 'irkutsk.lvc-health.ru', 'irkutsk.med-ug.clinic', 'irkutsk.our-health.center', 'irkutsk.resource.clinic', 'irkutsk.uteka.ru', 'irkutsk.health-kapelnica.ru']],
  ['УЗИ', 'узи иркутск', 10, ['2gis.ru', 'prodoctorov.ru', 'napopravku.ru', 'irk.docdoc.ru', 'invitro.ru', 'irk.krasotaimedicina.ru', 'unilab.su', 'doctu.ru', 'zoon.ru', 'bcmm.ru']],
  ['УЗИ', 'узи брюшной полости иркутск', 9, ['prodoctorov.ru', '2gis.ru', 'irk.krasotaimedicina.ru', 'napopravku.ru', 'unilab.su', 'irk.docdoc.ru', 'irk.klinikaexpert.ru', 'irkutsk.rzd-medicine.ru', 'm-53.ru']],
  ['УЗИ', 'узи малого таза иркутск', 9, ['prodoctorov.ru', '2gis.ru', 'irk.docdoc.ru', 'invitro.ru', 'm-53.ru', 'napopravku.ru', 'irkutsk.mamadeti.ru', 'irk.krasotaimedicina.ru', 'zoon.ru']],
  ['УЗИ', 'узи почек иркутск', 9, ['prodoctorov.ru', '2gis.ru', 'napopravku.ru', 'irk.docdoc.ru', 'irk.krasotaimedicina.ru', 'irkutsk.rzd-medicine.ru', 'unilab.su', 'm-53.ru', 'invitro.ru']],
  ['УЗИ', 'узи сердца иркутск', 10, ['prodoctorov.ru', '2gis.ru', 'irk.krasotaimedicina.ru', 'm-53.ru', 'irk.docdoc.ru', 'unilab.su', 'irk.klinikaexpert.ru', 'invitro.ru', 'irkutsk.rzd-medicine.ru', 'irkutsk.nanomed.center']],
  ['Косметология', 'косметология иркутск', 9, ['2gis.ru', 'prodoctorov.ru', 'irk.docdoc.ru', 'satel-e.ru', 'ocvk.ru', 'doctu.ru', 'irk.krasotaimedicina.ru', 'zoon.ru', 'lamareclinic.ru']],
  ['Косметология', 'косметолог иркутск', 8, ['2gis.ru', 'prodoctorov.ru', 'irk.klinikaexpert.ru', 'ocvk.ru', 'satel-e.ru', 'xn---2-7kcajdbn2armkzcbf7ahjm2a5x.xn--p1ai', 'enigmaclinic.ru', 'lamareclinic.ru']],
  ['Косметология', 'ботулинотерапия иркутск', 10, ['irk.docdoc.ru', 'irkutsk.rzd-medicine.ru', 'm-53.ru', 'satel-e.ru', 'kkmstd.ru', 'belklinik.ru', 'ocvk.ru', 'denovaclinica.ru', 'inaya.clinic', 'irk.krasotaimedicina.ru']],
  ['Косметология', 'аппаратная косметология иркутск', 9, ['2gis.ru', 'prodoctorov.ru', 'artirk.ru', 'lamareclinic.ru', 'irk.docdoc.ru', 'satel-e.ru', 'cityclinic38.ru', 'ocvk.ru', 'denovaclinica.ru']],
  ['Косметология', 'косметология цены иркутск', 10, ['prodoctorov.ru', 'xn---2-7kcajdbn2armkzcbf7ahjm2a5x.xn--p1ai', 'ocvk.ru', 'cityclinic38.ru', 'zoon.ru', 'denovaclinica.ru', 'irk.krasotaimedicina.ru', 'satel-e.ru', 'irk.docdoc.ru', 'yara.su']],
];

export const serpSourceRows = queryEvidence.map(([direction, query, resultCount, domains]) => [
  direction,
  query,
  resultCount,
  domains.join('; '),
  `https://yandex.ru/search/?lr=63&text=${encodeURIComponent(query)}`,
  checkedAt,
]);

export const serpDecisionRows = [
  ['Капельницы', 'капельницы иркутск', 'Базовый запрос направления', 10, null, null, 'Родительская страница', 'droppers.html', 'Собрать обзор направления, программы, цены, противопоказания и запись.'],
  ['Капельницы', 'инфузионная терапия иркутск', 'капельницы иркутск', 10, 5, 5, 'Объединить с родительской', 'droppers.html', 'Пять общих доменов и пять одинаковых URL: поисковый интент совпадает.'],
  ['Капельницы', 'капельница золушка иркутск', 'капельницы иркутск', 10, 6, 2, 'Отдельная услуга', 'dropper-cinderella.html', 'Домены похожи, но восемь из десяти URL другие; в прайсе есть «Коктейль Золушка».'],
  ['Капельницы', 'капельницы для печени иркутск', 'капельницы иркутск', 10, 3, 1, 'Кандидат отдельной страницы', 'droppers.html#detox', 'Выдача отдельная, но точное медицинское название программы нужно подтвердить; пока оставить разделом.'],
  ['УЗИ', 'узи иркутск', 'Базовый запрос направления', 10, null, null, 'Родительская страница', 'ultrasound.html', 'Каталог всех исследований, врачи УЗИ, цены, филиалы и запись.'],
  ['УЗИ', 'узи брюшной полости иркутск', 'узи иркутск', 9, 6, 0, 'Отдельная страница услуги', 'ultrasound-abdomen.html', 'Шесть общих доменов, но ни одного одинакового URL: лидеры делают отдельные посадочные.'],
  ['УЗИ', 'узи малого таза иркутск', 'узи иркутск', 9, 7, 0, 'Отдельная страница услуги', 'ultrasound-pelvis.html', 'Семь общих доменов, но все URL специализированные; интент требует отдельной страницы.'],
  ['УЗИ', 'узи почек иркутск', 'узи иркутск', 9, 7, 0, 'Отдельная страница услуги', 'ultrasound-kidneys.html', 'Семь общих доменов, но ни одного общего URL с родительской выдачей.'],
  ['УЗИ', 'узи сердца иркутск', 'узи иркутск', 10, 6, 0, 'Отдельная страница услуги', 'echocardiography.html', 'Выдача использует отдельные страницы ЭхоКГ; запрос нельзя смешивать с общим УЗИ.'],
  ['Косметология', 'косметология иркутск', 'Базовый запрос направления', 9, null, null, 'Родительская страница', 'cosmetology.html', 'Категории процедур, врачи, цены, филиалы и запись.'],
  ['Косметология', 'косметолог иркутск', 'косметология иркутск', 8, 5, 4, 'Объединить с родительской', 'cosmetology.html', 'Пять общих доменов и четыре одинаковых URL; добавить сильный блок врачей на странице.'],
  ['Косметология', 'ботулинотерапия иркутск', 'косметология иркутск', 10, 4, 0, 'Отдельная страница услуги', 'botulinum-therapy.html', 'Ни одного одинакового URL; в прайсе есть отдельные позиции ботулинотерапии.'],
  ['Косметология', 'аппаратная косметология иркутск', 'косметология иркутск', 9, 6, 0, 'Отдельная страница категории', 'hardware-cosmetology.html', 'Шесть общих доменов, но все используют отдельные URL категории.'],
  ['Косметология', 'косметология цены иркутск', 'косметология иркутск', 10, 6, 2, 'Раздел родительской страницы', 'cosmetology.html#prices', 'Ценовой интент обслуживается прайс-блоком; отдельная страница пока не нужна.'],
].map((row) => [...row, checkedAt]);

export const serpMeta = {
  source: 'Яндекс Поиск',
  region: 'Иркутск в тексте запроса; параметр lr=63',
  checkedAt,
  queries: serpSourceRows.length,
  rule: 'Сравнивались домены и точные URL в первой органической выдаче. Нулевое пересечение URL при устойчивых специализированных страницах — аргумент для отдельной посадочной.',
};
