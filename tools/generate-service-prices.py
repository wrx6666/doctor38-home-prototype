"""Generate the public service-price catalog from the clinic XLSX source.

The source workbook is never modified. Service names, specialties and numeric
prices are kept as provided; only surrounding/repeated whitespace is cleaned.
"""

from __future__ import annotations

import json
import re
import sys
from collections import Counter
from pathlib import Path

from openpyxl import load_workbook


CATEGORY_CONFIG = {
    "Акушерство и гинекология": ("gynecology", "Акушерство и гинекология", "Женское здоровье", "gynecology.html"),
    "Терапия": ("therapy", "Терапия", "Приём врачей", "therapy.html"),
    "Кардиология": ("cardiology", "Кардиология", "Приём врачей", "cardiology.html"),
    "Гастроэнтерология": ("gastroenterology", "Гастроэнтерология", "Приём врачей", "gastroenterology.html"),
    "Неврология": ("neurology", "Неврология", "Приём врачей", "neurology.html"),
    "Педиатрия": ("pediatrics", "Педиатрия", "Детям", "children.html"),
    "Оториноларингология": ("otorhinolaryngology", "Оториноларингология", "Приём врачей", "doctors.html"),
    "Дерматовенерология": ("dermatology", "Дерматовенерология", "Кожа и здоровье", "dermatology.html"),
    "Косметология": ("cosmetology", "Косметология", "Процедуры и уход", "cosmetology.html"),
    "Эндокринология": ("endocrinology", "Эндокринология", "Приём врачей", "endocrinology.html"),
    "Ультразвуковая диагностика": ("ultrasound", "Ультразвуковая диагностика", "УЗИ", "ultrasound.html"),
    "Хирургия": ("surgery", "Хирургия", "Приём врачей", "vascular-surgery.html"),
    "Лечебная физкультура и спорт": ("rehabilitation", "Лечебная физкультура и спорт", "Восстановление", "appointment.html"),
    "Капельницы": ("droppers", "Капельницы", "Инфузионные программы", "droppers.html"),
    "Процедурный кабинет": ("treatment-room", "Процедурный кабинет", "Манипуляции и забор анализов", "treatment-room.html"),
    "Клиническая лабораторная диагностика": ("laboratory", "Клиническая лабораторная диагностика", "Анализы", "analyses.html"),
    "": ("other", "Другие услуги", "Без указанной специальности", "appointment.html"),
}

CATEGORY_ORDER = [
    "Акушерство и гинекология",
    "Терапия",
    "Кардиология",
    "Гастроэнтерология",
    "Неврология",
    "Педиатрия",
    "Оториноларингология",
    "Дерматовенерология",
    "Косметология",
    "Эндокринология",
    "Ультразвуковая диагностика",
    "Хирургия",
    "Лечебная физкультура и спорт",
    "Капельницы",
    "Процедурный кабинет",
    "Клиническая лабораторная диагностика",
    "",
]


def clean_text(value: object) -> str:
    if value is None:
        return ""
    return re.sub(r"\s+", " ", str(value).replace("\u00a0", " ")).strip()


def infer_specialty(name: str) -> str:
    """Classify rows whose specialty cell is blank without changing their names."""
    normalized = name.casefold()
    if "коктейл" in normalized or "детоксикационн" in normalized:
        return "Капельницы"
    if "узи" in normalized or "узист" in normalized:
        return "Ультразвуковая диагностика"
    if "биоревитализация" in normalized:
        return "Косметология"
    if "второй прием таблетки" in normalized or "вакуум аспирация" in normalized:
        return "Акушерство и гинекология"
    laboratory_markers = (
        "гспг", "ттг", "т4", "кортизол", "17-он", "17 - oh", "кандида",
        "выявление возбудителей", "натрийуретический", "прогестерон", "ферритин",
        "пса ", "тестостерон", "тиреоглобулин", "посев на грибы", "иппп",
    )
    if any(marker in normalized for marker in laboratory_markers):
        return "Клиническая лабораторная диагностика"
    return ""


def generate(source_path: Path, output_path: Path) -> None:
    workbook = load_workbook(source_path, data_only=True, read_only=True)
    worksheet = workbook[workbook.sheetnames[0]]
    headers = [clean_text(worksheet.cell(1, column).value) for column in range(1, 4)]
    if headers != ["Название", "Специальность", "Стоимость"]:
        raise ValueError(f"Unexpected headers: {headers!r}")

    services = []
    category_counts: Counter[str] = Counter()
    for row_number, (name_raw, specialty_raw, price_raw) in enumerate(
        worksheet.iter_rows(min_row=2, max_col=3, values_only=True), start=2
    ):
        name = clean_text(name_raw)
        specialty = clean_text(specialty_raw)
        if not name:
            raise ValueError(f"Missing service name in source row {row_number}")
        if not specialty:
            specialty = infer_specialty(name)
        if specialty not in CATEGORY_CONFIG:
            raise ValueError(f"Unknown specialty in source row {row_number}: {specialty!r}")
        if not isinstance(price_raw, (int, float)) or isinstance(price_raw, bool):
            raise ValueError(f"Invalid price in source row {row_number}: {price_raw!r}")
        price = int(price_raw) if float(price_raw).is_integer() else float(price_raw)
        category_slug = CATEGORY_CONFIG[specialty][0]
        services.append({
            "name": name,
            "category": category_slug,
            "price": price,
        })
        category_counts[specialty] += 1

    categories = []
    for specialty in CATEGORY_ORDER:
        if specialty == "" and category_counts[specialty] == 0:
            continue
        slug, label, eyebrow, href = CATEGORY_CONFIG[specialty]
        categories.append({
            "id": slug,
            "label": label,
            "eyebrow": eyebrow,
            "href": href,
            "count": category_counts[specialty],
        })

    payload = {
        "updatedAt": "2026-09-17",
        "source": "Услуги (1).xlsx",
        "total": len(services),
        "categories": categories,
        "services": services,
    }
    json_text = json.dumps(payload, ensure_ascii=False, indent=2)
    output = (
        "// Generated from the clinic price workbook. Do not edit by hand.\n"
        f"export const servicePriceCatalog = {json_text};\n"
    )
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(output, encoding="utf-8", newline="\n")
    print(f"Generated {len(services)} services in {len(categories)} categories: {output_path}")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        raise SystemExit("Usage: generate-service-prices.py SOURCE.xlsx OUTPUT.js")
    generate(Path(sys.argv[1]), Path(sys.argv[2]))
