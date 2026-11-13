import logging
from datetime import date
from typing import Literal
from urllib.parse import quote

import psycopg

from fastapi import APIRouter, Request
from fastapi.responses import Response
from routes.home import Jogo, list_pokemon, pokemon_image as get_pokemon_image
from services.connect import connect


router = APIRouter(
    prefix="/jogos",
    tags=["JOGOS"],
)


# ===== CATALOGO =====

PLATFORM_GROUPS = (
    {"Game Boy", "Game Boy Color"},
    {"Game Boy Advance"},
    {"Nintendo DS"},
    {"Nintendo 3DS"},
    {"Nintendo Switch"},
)


class JogoCatalogo(Jogo):
    href: str


def platform_order(platforms: list[str]) -> int:
    for order, group in enumerate(PLATFORM_GROUPS):
        if not group.isdisjoint(platforms):
            return order
    return len(PLATFORM_GROUPS)


@router.get("/pokemon", response_model=list[Jogo])
def list_games(request: Request):
    games = list_pokemon()
    if not games:
        return []

    slugs = [game["slug"] for game in games]
    release_dates: dict[str, date] = {}

    try:
        with connect() as connection:
            try:
                release_dates = dict(connection.execute(
                    "SELECT slug, release_date FROM public.pokemon "
                    "WHERE slug = ANY(%s) AND release_date IS NOT NULL",
                    (slugs,),
                ).fetchall())
            except psycopg.errors.UndefinedColumn:
                pass

            rows = connection.execute(
                "SELECT slug FROM public.pokemon "
                "WHERE slug = ANY(%s) AND image_data IS NOT NULL",
                (slugs,),
            ).fetchall()

        with_images = {row[0] for row in rows}
        for game in games:
            if game["slug"] in with_images:
                game["image"] = str(
                    request.app.url_path_for("jogos_pokemon_image", slug=game["slug"])
                )
    except psycopg.Error as error:
        logging.getLogger("uvicorn.error").warning(
            "Falha ao consultar datas ou imagens no PostgreSQL: %s", error
        )

    games.sort(key=lambda game: (
        platform_order(game["platforms"]),
        release_dates.get(game["slug"], date.max),
    ))
    return games


@router.get("/catalogo/{secao}", response_model=list[JogoCatalogo])
def list_catalog(secao: Literal["detonados", "builds", "pos-game"], request: Request):
    return [
        {**game, "href": f"/{secao}/{quote(game['slug'], safe='')}"}
        for game in list_games(request)
    ]


# ===== IMAGES =====


@router.get(
    "/pokemon/{slug}/image",
    name="jogos_pokemon_image",
    response_class=Response,
    responses={200: {"content": {"image/png": {}}}},
)
def pokemon_image(slug: str):
    return get_pokemon_image(slug)
