import json
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from app.config import get_rawg_api_key

BASE_URL = "https://api.rawg.io/api"

def rawg(path: str, **params) -> dict:
    params["key"] = get_rawg_api_key()
    url = f"{BASE_URL}/{path}?" + urlencode(params)
    request = Request(url, headers={"User-Agent": "Rundex/1.0"})
    with urlopen(request, timeout=30) as response:
        return json.load(response)