import json
import logging
import random
import unicodedata
import psycopg

from typing import Literal
from datetime import date, datetime
from zoneinfo import ZoneInfo
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import RedirectResponse, Response
from pydantic import BaseModel
from psycopg.rows import dict_row
from app.config import DATABASE_DIR
from services.connect import connect


router = APIRouter(
    prefix="/home",
    tags=["HOME"]
)


# ===== GET DATABASE =====


def get_pokemon():
    try:
        with connect() as connection:
            with connection.cursor(row_factory=dict_row) as cursor:
                cursor.execute("""
                    SELECT nome, slug, franchise,
                           plataforms::json AS plataforms,
                           parent_plataforms::json AS parent_plataforms,
                           image, remake
                    FROM pokemon
                    ORDER BY nome
                """)
                games = cursor.fetchall()
    except psycopg.Error as error:
        logging.getLogger("uvicorn.error").warning(
            "Falha na consulta PostgreSQL (%s): %s. Usando o JSON de Pokemon.",
            type(error).__name__,
            error,
        )
        try:
            snapshot = DATABASE_DIR / "JSON" / "pokemon.json"
            games = json.loads(snapshot.read_text(encoding="utf-8-sig"))
        except (OSError, ValueError) as error:
            raise HTTPException(
                status_code=503,
                detail="PostgreSQL e JSON de Pokemon indisponiveis.",
            ) from error

    return games


# ===== INTEGRAÇÃO FRONT =====


class Jogo(BaseModel):
    name: str
    slug: str
    franchise: str
    platforms: list[str]
    parent_platforms: list[str]
    image: str | None
    remake: Literal["YES", "NO"]


@router.get("/pokemon", response_model=list[Jogo])
def list_pokemon():
    games = get_pokemon()

    return [
        {
            "name": game["nome"],
            "slug": game["slug"],
            "franchise": game["franchise"],
            "platforms": game["plataforms"],
            "parent_platforms": game["parent_plataforms"],
            "image": game["image"],
            "remake": game["remake"],
        }
        for game in sorted(games, key=lambda game: game["nome"])
    ]


# ===== SEARCHBAR =====


def normalize_title(title: str) -> str:
    return "".join(
        character
        for character in unicodedata.normalize("NFD", title)
        if not unicodedata.combining(character)
    ).casefold()


@router.get("/search", response_model=list[Jogo])
def search_pokemon(q: str = ""):
    keywords = normalize_title(q).split()
    if not keywords:
        return []

    matches = []
    for game in list_pokemon():
        title = normalize_title(game["name"])
        if all(keyword in title for keyword in keywords):
            matches.append(game)
            if len(matches) == 3:
                break
    return matches


# ===== DESTAQUES =====


FEATURED_ROTATION_START = date(2026, 10, 31)

@router.get("/destaques", response_model=list[Jogo])
def list_featured(request: Request):
    today = datetime.now(ZoneInfo("America/Sao_Paulo")).date()
    remake = "NO" if (today - FEATURED_ROTATION_START).days % 2 == 0 else "YES"
    games = sorted(
        (game for game in list_pokemon() if game["remake"] == remake),
        key=lambda game: game["slug"],
    )
    featured = random.Random(today.isoformat()).sample(games, k=min(3, len(games)))
    if not featured:
        return []

    try:
        with connect() as connection:
            rows = connection.execute(
                "SELECT slug FROM public.pokemon "
                "WHERE slug = ANY(%s) AND image_data IS NOT NULL",
                ([game["slug"] for game in featured],),
            ).fetchall()
        with_images = {row[0] for row in rows}
        for game in featured:
            if game["slug"] in with_images:
                game["image"] = str(request.url_for("pokemon_image", slug=game["slug"]))
    except psycopg.Error as error:
        logging.getLogger("uvicorn.error").warning(
            "Falha ao verificar imagens no PostgreSQL: %s", error
        )

    return featured


@router.get(
    "/pokemon/{slug}/image",
    name="pokemon_image",
    response_class=Response,
    responses={200: {"content": {"image/png": {}}}},
)
def pokemon_image(slug: str):
    unavailable = False
    try:
        with connect() as connection:
            row = connection.execute(
                "SELECT image_data FROM public.pokemon WHERE slug = %s",
                (slug,),
            ).fetchone()
        if row is not None and row[0] is not None:
            return Response(content=bytes(row[0]), media_type="image/png")
    except psycopg.Error as error:
        unavailable = True
        logging.getLogger("uvicorn.error").warning(
            "Falha ao buscar imagem no PostgreSQL: %s", error
        )

    try:
        snapshot = DATABASE_DIR / "JSON" / "pokemon.json"
        games = json.loads(snapshot.read_text(encoding="utf-8-sig"))
    except (OSError, ValueError) as error:
        raise HTTPException(status_code=503, detail="Imagem indisponivel.") from error

    game = next((game for game in games if game["slug"] == slug), None)
    if game is None:
        raise HTTPException(status_code=404, detail="Jogo nao encontrado.")
    if game["image"]:
        return RedirectResponse(url=game["image"], status_code=302)
    raise HTTPException(
        status_code=503 if unavailable else 404,
        detail="Imagem indisponivel." if unavailable else "Imagem nao cadastrada.",
    )

