import logging
import psycopg

from fastapi import APIRouter, Request
from fastapi.responses import Response
from routes.home import Jogo, list_pokemon, pokemon_image as get_pokemon_image
from services.connect import connect


router = APIRouter(
    prefix="/jogos",
    tags=["JOGOS"],
)


# ===== CATÁLOGO =====


@router.get("/pokemon", response_model=list[Jogo])
def list_games(request: Request):
    games = list_pokemon()
    if not games:
        return []

    try:
        with connect() as connection:
            rows = connection.execute(
                "SELECT slug FROM public.pokemon "
                "WHERE slug = ANY(%s) AND image_data IS NOT NULL",
                ([game["slug"] for game in games],),
            ).fetchall()

        with_images = {row[0] for row in rows}
        for game in games:
            if game["slug"] in with_images:
                game["image"] = str(
                    request.url_for("jogos_pokemon_image", slug=game["slug"])
                )
    except psycopg.Error as error:
        logging.getLogger("uvicorn.error").warning(
            "Falha ao verificar imagens no PostgreSQL: %s", error
        )

    return games


# ===== IMAGENS =====


@router.get(
    "/pokemon/{slug}/image",
    name="jogos_pokemon_image",
    response_class=Response,
    responses={200: {"content": {"image/png": {}}}},
)
def pokemon_image(slug: str):
    return get_pokemon_image(slug)
