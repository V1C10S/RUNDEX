import logging

import psycopg
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from routes.home import list_pokemon
from services.connect import connect


router = APIRouter(prefix="/builds", tags=["BUILDS"])


class DadosBuilds(BaseModel):
    slug: str
    caps: list[str]
    dicas: dict[str, object]
    images: dict[str, object]
    categorias: dict[str, str]


class Builds(BaseModel):
    nome: str
    plataformas: list[str]
    builds: DadosBuilds | None


@router.get("/{slug}", response_model=Builds)
def obter_builds(slug: str):
    jogo = next((item for item in list_pokemon() if item["slug"] == slug), None)
    if jogo is None:
        raise HTTPException(status_code=404, detail="Jogo não encontrado.")

    try:
        with connect() as connection:
            dados = connection.execute(
                "SELECT slug, caps, dicas, images, categorias FROM public.builds WHERE slug = %s",
                (slug,),
            ).fetchone()
    except psycopg.Error:
        logging.getLogger("uvicorn.error").exception("Falha ao buscar builds de %s.", slug)
        raise HTTPException(status_code=503, detail="Builds indisponíveis.") from None

    return Builds(
        nome=jogo["name"],
        plataformas=jogo["platforms"],
        builds=DadosBuilds(slug=dados[0], caps=dados[1], dicas=dados[2], images=dados[3], categorias=dados[4]) if dados is not None else None,
    )

