
import json
import re
import sys
import unicodedata
from pathlib import Path


if __package__ in (None, ""):
    sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.config import DATABASE_DIR
from services.rawg import rawg

JSON_FILE = DATABASE_DIR / "JSON" / "pokemon.json"
SQL_FILE = DATABASE_DIR / "SQL" / "pokemon.sql"

POKEMON = [
    ("Pokémon Red", 23762),
    ("Pokémon Green", 266184),
    ("Pokémon Blue", 23762),
    ("Pokémon Yellow", 23762),
    ("Pokémon Gold", 27936),
    ("Pokémon Silver", 27936),
    ("Pokémon Crystal", 50971),
    ("Pokémon Ruby", 52372),
    ("Pokémon Sapphire", 52372),
    ("Pokémon Emerald", 52372),
    ("Pokémon FireRed", 53473),
    ("Pokémon LeafGreen", 53473),
    ("Pokémon Diamond", 25131),
    ("Pokémon Pearl", 25131),
    ("Pokémon Platinum", 25856),
    ("Pokémon HeartGold", 26316),
    ("Pokémon SoulSilver", 26316),
    ("Pokémon Black", 330615),
    ("Pokémon White", 330615),
    ("Pokémon Black 2", 331454),
    ("Pokémon White 2", 331454),
    ("Pokémon X", 27312),
    ("Pokémon Y", 27312),
    ("Pokémon Omega Ruby", 23973),
    ("Pokémon Alpha Sapphire", 23973),
    ("Pokémon Sun", 23748),
    ("Pokémon Moon", 23748),
    ("Pokémon Ultra Sun", 27939),
    ("Pokémon Ultra Moon", 27939),
    ("Pokémon Let's Go, Pikachu!", 58606),
    ("Pokémon Let's Go, Eevee!", 58606),
    ("Pokémon Sword", 282825),
    ("Pokémon Shield", 282825),
    ("Pokémon Brilliant Diamond", 564763),
    ("Pokémon Shining Pearl", 564763),
    ("Pokémon Scarlet", 747505),
    ("Pokémon Violet", 747505),
]

def fetch_pokemon() -> list[dict]:
    games_by_id = {} 
    records = []

    for title, id_rawg in POKEMON:
        if id_rawg not in games_by_id:
            print(f"Buscando {title} (ID {id_rawg}) na RAWG...", flush=True)
            games_by_id[id_rawg] = rawg(f"games/{id_rawg}")

        records.append({
            "title": title,
            "id_rawg": id_rawg,
            "rawg": games_by_id[id_rawg],
        })

    return records


def save_pokemon(records: list[dict]) -> list[dict]:
    remakes = {
        "Pokémon FireRed", "Pokémon LeafGreen",
        "Pokémon HeartGold", "Pokémon SoulSilver",
        "Pokémon Platinum",
        "Pokémon Omega Ruby", "Pokémon Alpha Sapphire",
        "Pokémon Let's Go, Pikachu!", "Pokémon Let's Go, Eevee!",
        "Pokémon Brilliant Diamond", "Pokémon Shining Pearl",
    }
    games = []

    for record in records:
        game = record["rawg"]
        name = record["title"]
        slug = unicodedata.normalize("NFKD", name).encode("ascii", "ignore").decode()
        slug = re.sub(r"[^a-z0-9]+", "-", slug.lower()).strip("-")

        games.append({
            "nome": name,
            "slug": slug,
            "franchise": "Pokémon",
            "plataforms": [item["platform"]["name"] for item in game.get("platforms") or []],
            "parent_plataforms": [item["platform"]["name"] for item in game.get("parent_platforms") or []],
            "image": None,
            "remake": "YES" if name in remakes else "NO",
        })

    content_json = json.dumps(games, ensure_ascii=False, indent=2, allow_nan=False) + "\n"
    sql = [
        "BEGIN;",
        "CREATE TABLE IF NOT EXISTS pokemon (",
        "    nome TEXT NOT NULL, slug TEXT PRIMARY KEY, franchise TEXT NOT NULL,",
        "    plataforms TEXT NOT NULL, parent_plataforms TEXT NOT NULL,",
        "    image TEXT, remake TEXT NOT NULL",
        ");",
    ]

    for game in games:
        values = [json.dumps(value, ensure_ascii=False) if isinstance(value, list) else value for value in game.values()]
        values_sql = ", ".join("NULL" if value is None else "'" + value.replace("'", "''") + "'" for value in values)
        sql.append(
            "INSERT INTO pokemon (nome, slug, franchise, plataforms, parent_plataforms, image, remake) "
            f"VALUES ({values_sql}) ON CONFLICT (slug) DO UPDATE SET "
            "nome=excluded.nome, franchise=excluded.franchise, plataforms=excluded.plataforms, "
            "parent_plataforms=excluded.parent_plataforms, image=excluded.image, remake=excluded.remake;"
        )

    sql.append("COMMIT;")
    JSON_FILE.parent.mkdir(parents=True, exist_ok=True)
    SQL_FILE.parent.mkdir(parents=True, exist_ok=True)
    JSON_FILE.write_text(content_json, encoding="utf-8")
    SQL_FILE.write_text("\n".join(sql) + "\n", encoding="utf-8")
    return games


if __name__ == "__main__":
    save_pokemon(fetch_pokemon())
