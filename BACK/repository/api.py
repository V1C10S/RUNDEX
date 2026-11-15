from fastapi import APIRouter

from routes.game import router as game_router
from routes.builds import router as builds_router
from routes.detonados import router as detonados_router
from routes.home import router as home_router
from routes.jogos import router as jogos_router


router = APIRouter()
router.include_router(home_router)
router.include_router(jogos_router)
router.include_router(detonados_router)
router.include_router(builds_router)
router.include_router(game_router)
