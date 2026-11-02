import os
import uvicorn

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from services.connect import lifespan


# ===== API =====


app = FastAPI(title="RUNDEX", lifespan=lifespan)


# ===== CORS =====


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["GET"],
)


# ===== IMPORTS =====


from routes.home import router as home_router


# ===== ROUTERS =====


app.include_router(home_router)


# ===== CHECKING =====


@app.get("/health")
def health():

    return {"status": "OK"}

@app.get("/")
def back_status():

    return {
        "app": "RUNDEX",
        "status": "A TODO VAPOR"
    }


# ===== PORTA BACK =====
    

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5500))
    uvicorn.run(app, host="0.0.0.0", port=port)
