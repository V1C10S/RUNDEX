import logging

import psycopg
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from routes.home import list_pokemon
from services.connect import connect


router = APIRouter(prefix="/pos-game", tags=["PÓS-GAME"])


class DadosGame(BaseModel):
    slug: str
    caps: list[str]
    dicas: dict[str, object]
    images: dict[str, object]


class PosGame(BaseModel):
    nome: str
    plataformas: list[str]
    game: DadosGame | None


@router.get("/{slug}", response_model=PosGame)
def obter_game(slug: str):
    jogo = next((item for item in list_pokemon() if item["slug"] == slug), None)
    if jogo is None:
        raise HTTPException(status_code=404, detail="Jogo não encontrado.")

    try:
        with connect() as connection:
            dados = connection.execute(
                "SELECT slug, caps, dicas, images FROM public.game WHERE slug = %s",
                (slug,),
            ).fetchone()
    except psycopg.Error:
        logging.getLogger("uvicorn.error").exception("Falha ao buscar pós-game de %s.", slug)
        raise HTTPException(status_code=503, detail="Pós-game indisponível.") from None

    return PosGame(
        nome=jogo["name"],
        plataformas=jogo["platforms"],
        game=DadosGame(slug=dados[0], caps=dados[1], dicas=dados[2], images=dados[3]) if dados is not None else None,
    )
