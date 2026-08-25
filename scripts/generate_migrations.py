#!/usr/bin/env python3
"""Bygger seed-migrations och CSV-export ur avtalets källdokument.

Körs om när SKR släpper en ny version av priskatalogen eller zonbilagan:

    pip install openpyxl pymupdf
    python3 scripts/generate_migrations.py

Skriver:
    supabase/migrations/20260823000002_seed_kommuner_zoner.sql
    supabase/migrations/20260823000003_seed_roller_priser.sql
    data/kommun_zon.csv
    data/roll_zonpris.csv
    data/roll_kommun_pris.csv        (hela korsprodukten, för granskning)

Skriptet vägrar skriva om någon av invarianterna nedan brister. Tyst
partiell data är värre än inget alls när priset ska faktureras.
"""

from __future__ import annotations

import csv
import json
import re
import sys
from collections import Counter, defaultdict
from pathlib import Path

import openpyxl
import pymupdf

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "data" / "source"
MIGRATIONS = ROOT / "supabase" / "migrations"

VALID_FROM = "2026-01-01"
VALID_TO = "2026-12-31"

CATALOGS = [
    {
        "category": "lakare",
        "procurement_area": "Läkare",
        "version": "1.6",
        "file": SOURCE / "priskatalog_lakare_v1.6_2026.xlsx",
        "expected_roles": 66,
    },
    {
        "category": "sjukskoterska",
        "procurement_area": "Sjuksköterska",
        "version": "1.7",
        "file": SOURCE / "priskatalog_sjukskoterska_v1.7_20260224.xlsx",
        "expected_roles": 22,
    },
]

ZON_PDF = SOURCE / "bilaga3_zonindelning.pdf"
SCB_CODES = ROOT / "data" / "scb_kommunkoder.json"

EXPECTED_MUNICIPALITIES = 290

# Bilaga 3 använder avtalsetiketter, SCB använder formella länsnamn.
# Kopplingen är 1:1 och verifieras mot kommunkodernas länsprefix.
CONTRACT_REGION_TO_COUNTY = {
    "Blekinge": "10", "Dalarna": "20", "Gotland": "09", "Gävleborg": "21",
    "Halland": "13", "Jämtland/Hj": "23", "Jönköping": "06", "Kalmar": "08",
    "Kronoberg": "07", "Norrbotten": "25", "Skåne": "12", "Stockholm": "01",
    "Sörmland": "04", "Uppsala": "03", "VGR": "14", "Värmland": "17",
    "Västerbotten": "24", "Västernorrland": "22", "Västmanland": "19",
    "Örebro": "18", "Östergötland": "05",
}


class SourceError(RuntimeError):
    """Källdokumentet ser inte ut som vi förväntar oss."""


def sql_str(value: str) -> str:
    return "'" + value.replace("'", "''") + "'"


def pack(tuples: list[str], per_line: int) -> str:
    """Radbryter en VALUES-lista var N:e tupel.

    Seedarna är hundratals rader breda data, inte logik. Packade rader gör
    filen läsbar i en diff utan att varje prisändring blir 300 radbyten.
    """
    lines = [",".join(tuples[i:i + per_line]) for i in range(0, len(tuples), per_line)]
    return ",\n  ".join(lines)


# --------------------------------------------------------------- kommuner ---

def parse_zones() -> list[tuple[str, int, str]]:
    """Läser Bilaga 3. Sidorna är tre kolumner som extraheras som rad-tripplar."""
    doc = pymupdf.open(ZON_PDF)
    noise_prefixes = ("RS 2022-03983", "Samordnad upphandling", "Bilaga Zonindelning")
    header_cells = {"Kommun", "namn", "Kategori zon", "Region", "Kommun namn"}

    rows: list[tuple[str, int, str]] = []
    for page_no in range(doc.page_count):
        lines = [line.strip() for line in doc[page_no].get_text().split("\n")]
        cells = [
            line for line in lines
            if line
            and not any(line.startswith(p) for p in noise_prefixes)
            and not re.fullmatch(r"\d+ \(\d+\)", line)
            and line not in header_cells
        ]
        i = 0
        while i < len(cells):
            if i + 2 < len(cells) and re.fullmatch(r"Zon\s*\d", cells[i + 1]):
                zone = int(re.search(r"\d", cells[i + 1]).group())
                rows.append((cells[i], zone, cells[i + 2].strip()))
                i += 3
            else:
                raise SourceError(
                    f"Oparsbar sekvens på sida {page_no + 1}: {cells[i:i + 4]!r}"
                )
    return rows


def build_municipalities() -> tuple[list[dict], dict[str, str]]:
    zones = parse_zones()
    if len(zones) != EXPECTED_MUNICIPALITIES:
        raise SourceError(f"Förväntade {EXPECTED_MUNICIPALITIES} kommuner, fick {len(zones)}")

    scb = json.loads(SCB_CODES.read_text(encoding="utf-8"))
    by_name = {row["municipality"]: row for row in scb}

    pdf_names = {name for name, _, _ in zones}
    if pdf_names != set(by_name):
        missing = sorted(pdf_names - set(by_name))
        extra = sorted(set(by_name) - pdf_names)
        raise SourceError(f"Kommunnamn matchar inte SCB. Saknas: {missing}. Extra: {extra}")

    counties: dict[str, str] = {}
    municipalities: list[dict] = []
    for name, zone, contract_region in sorted(zones):
        scb_row = by_name[name]
        code = scb_row["code"]
        county_code = code[:2]
        counties[county_code] = scb_row["county"]

        expected = CONTRACT_REGION_TO_COUNTY.get(contract_region)
        if expected is None:
            raise SourceError(f"Okänd regionetikett i Bilaga 3: {contract_region!r}")
        if expected != county_code:
            raise SourceError(
                f"{name}: Bilaga 3 säger region {contract_region!r} (län {expected}) "
                f"men kommunkod {code} ligger i län {county_code}"
            )

        municipalities.append({
            "municipality_code": code,
            "name": name,
            "county_code": county_code,
            "county_name": scb_row["county"],
            "contract_region": contract_region,
            "zone": zone,
        })
    return municipalities, counties


# ------------------------------------------------------------------ roller ---

def normalise_role_name(raw: str) -> str:
    without_zone = re.sub(r"\s*zon\s*\d\s*$", "", raw, flags=re.IGNORECASE)
    return re.sub(r"\s+", " ", without_zone).strip()


def build_roles() -> tuple[list[dict], list[dict], list[str]]:
    roles: list[dict] = []
    prices: list[dict] = []
    notes: list[str] = []
    seen_codes: set[str] = set()

    for catalog in CATALOGS:
        sheet = openpyxl.load_workbook(catalog["file"], data_only=True)["Grundpris"]
        by_code: dict[str, dict[int, dict]] = defaultdict(dict)

        for row in sheet.iter_rows(min_row=7, values_only=True):
            article = row[0]
            if article is None:
                continue
            article = str(article).strip()
            if not re.fullmatch(r"\d{6}", article):
                continue  # upprepad rubrikrad mitt i bladet
            zone = int(article[0])
            if row[4] != zone:
                raise SourceError(
                    f"{catalog['file'].name}: artikel {article} har zonkolumn {row[4]!r}"
                )
            by_code[article[1:]][zone] = {
                "article_number": article,
                "raw_name": str(row[1]).strip(),
                "description": str(row[2]).strip() if row[2] else None,
                "price": row[3],
            }

        if len(by_code) != catalog["expected_roles"]:
            raise SourceError(
                f"{catalog['file'].name}: förväntade {catalog['expected_roles']} roller, "
                f"fick {len(by_code)}"
            )

        for role_code, per_zone in by_code.items():
            if set(per_zone) != {1, 2, 3}:
                raise SourceError(f"Roll {role_code} saknar zon: har {sorted(per_zone)}")
            if role_code in seen_codes:
                raise SourceError(f"Yrkeskod {role_code} finns i två anbudsområden")
            seen_codes.add(role_code)

            variants = {normalise_role_name(per_zone[z]["raw_name"]) for z in (1, 2, 3)}
            canonical = normalise_role_name(per_zone[1]["raw_name"])
            if len(variants) > 1:
                notes.append(
                    f"{role_code}: källan stavar rollen olika mellan zoner "
                    f"({sorted(variants)}) — zon 1 används som kanonisk"
                )

            roles.append({
                "role_code": role_code,
                "name": canonical,
                "category": catalog["category"],
                "description": per_zone[1]["description"],
                "procurement_area": catalog["procurement_area"],
            })
            for zone in (1, 2, 3):
                cell = per_zone[zone]
                price = cell["price"]
                if not isinstance(price, (int, float)) or price <= 0:
                    raise SourceError(f"Artikel {cell['article_number']} har pris {price!r}")
                if cell["article_number"] != f"{zone}{role_code}":
                    raise SourceError(
                        f"Artikel {cell['article_number']} är inte zon+yrkeskod "
                        f"({zone}{role_code}) — seeden härleder artikelnumret och "
                        f"kan inte köras med denna katalog"
                    )
                prices.append({
                    "role_code": role_code,
                    "zone": zone,
                    "article_number": cell["article_number"],
                    "hourly_price": round(float(price), 2),
                    "catalog_version": catalog["version"],
                    "source_document": catalog["file"].name,
                })

    roles.sort(key=lambda r: (r["category"], r["role_code"]))
    prices.sort(key=lambda p: (p["role_code"], p["zone"]))
    return roles, prices, notes


# ------------------------------------------------------------------ output ---

def write_municipality_migration(municipalities: list[dict], counties: dict[str, str]) -> None:
    lines = [
        "-- Kommuner och zonindelning enligt Bilaga 3 Zonindelning, RS 2022-03983.",
        "-- Genererad av scripts/generate_migrations.py — redigera inte för hand.",
        f"-- {len(municipalities)} kommuner, {len(counties)} län.",
        "",
        "insert into public.counties (county_code, name) values",
    ]
    lines.append(
        "  " + pack(
            [f"({sql_str(code)},{sql_str(name)})" for code, name in sorted(counties.items())],
            3,
        )
        + "\non conflict (county_code) do update set name = excluded.name;"
    )
    lines += ["", "insert into public.municipalities", "  (municipality_code, name, county_code, contract_region, zone)", "values"]
    lines.append(
        "  " + pack(
            [
                "({},{},{},{},{})".format(
                    sql_str(m["municipality_code"]),
                    sql_str(m["name"]),
                    sql_str(m["county_code"]),
                    sql_str(m["contract_region"]),
                    m["zone"],
                )
                for m in municipalities
            ],
            6,
        )
        + "\non conflict (municipality_code) do update set"
        "\n  name            = excluded.name,"
        "\n  county_code     = excluded.county_code,"
        "\n  contract_region = excluded.contract_region,"
        "\n  zone            = excluded.zone;"
    )
    lines += [
        "",
        "do $$",
        "begin",
        f"  if (select count(*) from public.municipalities) <> {EXPECTED_MUNICIPALITIES} then",
        f"    raise exception 'Förväntade {EXPECTED_MUNICIPALITIES} kommuner, fick %',",
        "      (select count(*) from public.municipalities);",
        "  end if;",
        "end $$;",
        "",
    ]
    (MIGRATIONS / "20260823000002_seed_kommuner_zoner.sql").write_text(
        "\n".join(lines), encoding="utf-8"
    )


def write_role_migration(roles: list[dict], prices: list[dict], notes: list[str]) -> None:
    lines = [
        "-- Yrkesroller och zonpriser ur avtalets artikel- och priskatalog.",
        "-- Genererad av scripts/generate_migrations.py — redigera inte för hand.",
        f"-- {len(roles)} roller, {len(prices)} zonpriser, giltiga {VALID_FROM}–{VALID_TO}.",
    ]
    if notes:
        lines.append("--")
        lines += [f"-- OBS  {note}" for note in notes]
    lines += ["", "insert into public.roles (role_code, name, category, description, procurement_area)", "values"]
    lines.append(
        "  " + pack(
            [
                "({},{},{},{},{})".format(
                    sql_str(r["role_code"]),
                    sql_str(r["name"]),
                    sql_str(r["category"]),
                    sql_str(r["description"]) if r["description"] else "null",
                    sql_str(r["procurement_area"]),
                )
                for r in roles
            ],
            2,
        )
        + "\non conflict (role_code) do update set"
        "\n  name             = excluded.name,"
        "\n  category         = excluded.category,"
        "\n  description      = excluded.description,"
        "\n  procurement_area = excluded.procurement_area;"
    )
    by_role_zone = {(pr["role_code"], pr["zone"]): pr for pr in prices}
    versions = {pr["catalog_version"] for pr in prices}
    sources = {pr["source_document"] for pr in prices}
    role_meta = {r["role_code"]: r for r in roles}

    lines += [
        "",
        "-- En rad per roll: yrkeskod, katalog, och timpriset i zon 1, 2 och 3.",
        "-- Artikelnumret är per definition zonsiffran följd av yrkeskoden",
        "-- (113430 = zon 1, yrkeskod 13430) och härleds därför i select-satsen",
        "-- nedan i stället för att upprepas 264 gånger.",
        "insert into public.role_zone_prices",
        "  (role_code, zone, valid_from, valid_to, article_number, hourly_price,",
        "   catalog_version, source_document)",
        "select",
        f"  v.role_code, z.zone, {sql_str(VALID_FROM)}, {sql_str(VALID_TO)},",
        "  (z.zone::text || v.role_code)::char(6),",
        "  (array[v.zon1, v.zon2, v.zon3])[z.zone],",
        "  v.catalog_version, v.source_document",
        "from (values",
    ]
    lines.append(
        "  " + pack(
            [
                "({},{},{},{},{},{})".format(
                    sql_str(code),
                    f"{by_role_zone[(code, 1)]['hourly_price']:.2f}",
                    f"{by_role_zone[(code, 2)]['hourly_price']:.2f}",
                    f"{by_role_zone[(code, 3)]['hourly_price']:.2f}",
                    sql_str(by_role_zone[(code, 1)]["catalog_version"]),
                    sql_str(by_role_zone[(code, 1)]["source_document"]),
                )
                for code in (r["role_code"] for r in roles)
            ],
            2,
        )
    )
    lines += [
        ") as v (role_code, zon1, zon2, zon3, catalog_version, source_document)",
        "cross join generate_series(1, 3) as z (zone)",
        "on conflict (role_code, zone, valid_from) do update set",
        "  valid_to        = excluded.valid_to,",
        "  article_number  = excluded.article_number,",
        "  hourly_price    = excluded.hourly_price,",
        "  catalog_version = excluded.catalog_version,",
        "  source_document = excluded.source_document;",
    ]

    expected_pairs = len(roles) * EXPECTED_MUNICIPALITIES
    lines += [
        "",
        "do $$",
        "declare",
        "  n_roles  int;",
        "  n_prices int;",
        "  n_pairs  int;",
        "begin",
        "  select count(*) into n_roles  from public.roles;",
        "  select count(*) into n_prices from public.role_zone_prices;",
        "  select count(*) into n_pairs  from public.role_municipality_prices;",
        f"  if n_roles <> {len(roles)} then",
        f"    raise exception 'Förväntade {len(roles)} roller, fick %', n_roles;",
        "  end if;",
        f"  if n_prices <> {len(prices)} then",
        f"    raise exception 'Förväntade {len(prices)} zonpriser, fick %', n_prices;",
        "  end if;",
        f"  if n_pairs <> {expected_pairs} then",
        f"    raise exception 'Förväntade {expected_pairs} roll/kommun-par, fick %', n_pairs;",
        "  end if;",
        "end $$;",
        "",
    ]
    (MIGRATIONS / "20260823000003_seed_roller_priser.sql").write_text(
        "\n".join(lines), encoding="utf-8"
    )


def write_csvs(municipalities: list[dict], roles: list[dict], prices: list[dict]) -> int:
    data = ROOT / "data"

    with (data / "kommun_zon.csv").open("w", newline="", encoding="utf-8") as fh:
        writer = csv.writer(fh)
        writer.writerow(["kommunkod", "kommun", "lanskod", "lan", "avtalsregion", "zon"])
        for m in municipalities:
            writer.writerow([m["municipality_code"], m["name"], m["county_code"],
                             m["county_name"], m["contract_region"], m["zone"]])

    by_role = {r["role_code"]: r for r in roles}
    with (data / "roll_zonpris.csv").open("w", newline="", encoding="utf-8") as fh:
        writer = csv.writer(fh)
        writer.writerow(["yrkeskod", "roll", "kategori", "zon", "artikelnummer", "timpris"])
        for p in prices:
            role = by_role[p["role_code"]]
            writer.writerow([p["role_code"], role["name"], role["category"],
                             p["zone"], p["article_number"], f"{p['hourly_price']:.2f}"])

    prices_by_zone: dict[str, dict[int, dict]] = defaultdict(dict)
    for p in prices:
        prices_by_zone[p["role_code"]][p["zone"]] = p

    rows = 0
    with (data / "roll_kommun_pris.csv").open("w", newline="", encoding="utf-8") as fh:
        writer = csv.writer(fh)
        writer.writerow(["yrkeskod", "roll", "kategori", "kommunkod", "kommun",
                         "lan", "avtalsregion", "zon", "artikelnummer", "timpris",
                         "giltig_fran", "giltig_till"])
        for role in roles:
            for m in municipalities:
                p = prices_by_zone[role["role_code"]][m["zone"]]
                writer.writerow([
                    role["role_code"], role["name"], role["category"],
                    m["municipality_code"], m["name"], m["county_name"],
                    m["contract_region"], m["zone"], p["article_number"],
                    f"{p['hourly_price']:.2f}", VALID_FROM, VALID_TO,
                ])
                rows += 1
    return rows


def main() -> int:
    try:
        municipalities, counties = build_municipalities()
        roles, prices, notes = build_roles()
    except SourceError as exc:
        print(f"AVBRUTET: {exc}", file=sys.stderr)
        return 1

    write_municipality_migration(municipalities, counties)
    write_role_migration(roles, prices, notes)
    cross_rows = write_csvs(municipalities, roles, prices)

    zone_spread = Counter(m["zone"] for m in municipalities)
    print(f"{len(municipalities)} kommuner i {len(counties)} län "
          f"(zon 1: {zone_spread[1]}, zon 2: {zone_spread[2]}, zon 3: {zone_spread[3]})")
    print(f"{len(roles)} roller, {len(prices)} zonpriser")
    print(f"{cross_rows} roll/kommun-kombinationer skrivna till data/roll_kommun_pris.csv")
    for note in notes:
        print(f"OBS  {note}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
