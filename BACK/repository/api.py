from fastapi import APIRouter

from routes.home import router as home_router
from routes.jogos import router as jogos_router


router = APIRouter()
router.include_router(home_router)
router.include_router(jogos_router)
