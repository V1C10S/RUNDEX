import logging

import psycopg
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from routes.home import list_pokemon
from services.connect import connect


router = APIRouter(prefix="/detonados", tags=["DETONADOS"])


class Capitulo(BaseModel):
    slug: str
    titulo: str
    passos: list[str]


class Guia(BaseModel):
    capitulos: list[Capitulo]


class Detonado(BaseModel):
    nome: str
    plataformas: list[str]
    guia: Guia | None


@router.get("/{slug}", response_model=Detonado)
def obter_detonado(slug: str):
    jogo = next((item for item in list_pokemon() if item["slug"] == slug), None)
    if jogo is None:
        raise HTTPException(status_code=404, detail="Jogo não encontrado.")

    guia = None
    try:
        with connect() as connection:
            dados = connection.execute(
                "SELECT caps, walkthrough FROM public.detonados WHERE slug = %s",
                (slug,),
            ).fetchone()

            if dados is not None:
                nomes, walkthrough = dados
                capitulos_guia = [
                    Capitulo(slug=f"capitulo-{ordem}", titulo=titulo, passos=walkthrough.get(titulo, []))
                    for ordem, titulo in enumerate(nomes, 1)
                ]
                guia = Guia(
                    capitulos=capitulos_guia,
                )
    except psycopg.Error:
        logging.getLogger("uvicorn.error").exception("Falha ao buscar detonado de %s.", slug)
        raise HTTPException(status_code=503, detail="Detonado indisponível.") from None

    return Detonado(nome=jogo["name"], plataformas=jogo["platforms"], guia=guia)
