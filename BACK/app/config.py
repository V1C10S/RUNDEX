import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[1]
ENV_FILE = Path(__file__).with_name(".env")
DATABASE_DIR = BASE_DIR / "database"
RAWG_API_URL = "https://api.rawg.io/api/games"


def get_rawg_api_key() -> str:
    key = os.environ.get("RAWG_API_KEY", "").strip()
    if key:
        return key
    if ENV_FILE.is_file():
        for line in ENV_FILE.read_text(encoding="utf-8-sig").splitlines():
            line = line.strip()
            if line.startswith("export "):
                line = line[7:].lstrip()
            name, separator, value = line.partition("=")
            if separator and name.strip() == "RAWG_API_KEY":
                value = value.strip()
                if value.startswith(("'", '"')):
                    quote = value[0]
                    end = value.find(quote, 1)
                    if end == -1:
                        raise ValueError("RAWG_API_KEY tem aspas sem fechamento em app/.env.")
                    value = value[1:end]
                else:
                    value = value.split(" #", 1)[0].strip()
                if value:
                    return value
    raise ValueError("Defina RAWG_API_KEY no ambiente ou em app/.env.")
