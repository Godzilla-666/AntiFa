
import json
import re
from datetime import datetime, date
from io import StringIO

import pandas as pd
import requests

SOURCE = (
    "https://www.bundeswahlleiterin.de/"
    "service/wahltermine.html"
)

response = requests.get(
    SOURCE,
    timeout=30,
    headers={"User-Agent": "AntiFa-ElectionCalendar/1.0"}
)
response.raise_for_status()

tables = pd.read_html(StringIO(response.text))

elections = []
current_year = None

for table in tables:
    columns = {
        " ".join(map(str, col)).lower(): col
        for col in table.columns
    }

    def find_column(name):
        for label, original in columns.items():
            if name in label:
                return original
        return None

    year_col = find_column("jahr")
    date_col = find_column("datum")
    region_col = find_column("land")
    type_col = find_column("art")

    if not all([year_col, date_col, region_col, type_col]):
        continue

    table[year_col] = table[year_col].ffill()

    for _, row in table.iterrows():
        year_text = str(row[year_col]).strip()

        if not year_text.isdigit():
            continue

        year = int(year_text)

        if year < date.today().year:
            continue

        date_label = str(row[date_col]).strip()
        region = str(row[region_col]).strip()
        election_type = str(row[type_col]).strip()

        match = re.search(
            r"(\d{1,2})\.(\d{1,2})\.?",
            date_label
        )

        date_iso = None

        if match:
            day = int(match.group(1))
            month = int(match.group(2))

            try:
                date_iso = date(year, month, day).isoformat()
            except ValueError:
                date_iso = None

            if date_iso:
                date_label = (
                    f"{day:02d}.{month:02d}.{year}"
                )
        else:
            date_label = f"{date_label} {year}"

        elections.append({
            "title": f"{election_type} – {region}",
            "region": region,
            "type": election_type,
            "year": year,
            "dateLabel": date_label,
            "dateISO": date_iso,
            "source": SOURCE
        })

# Doppelte Einträge vermeiden
unique = {}

for election in elections:
    key = (
        election["title"],
        election["dateLabel"]
    )
    unique[key] = election

output = {
    "lastUpdated": datetime.utcnow().isoformat() + "Z",
    "source": SOURCE,
    "elections": list(unique.values())
}

with open("wahlen.json", "w", encoding="utf-8") as file:
    json.dump(output, file, ensure_ascii=False, indent=2)

print(f"{len(unique)} Wahltermine gespeichert.")
