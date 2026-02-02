from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.bootstrap import bootstrap_admin, BootstrapError
from app.core.config import settings
from app.db.session import SessionLocal
from app.routers import auth_router, admin_users_router, assets_router, board_ws_router, chat_ws_router


def _parse_origins(raw: str) -> list[str]:
    return [origin.strip() for origin in raw.split(",") if origin.strip()]


def create_app() -> FastAPI:
    app = FastAPI(title="Higor API")

    # CORS: in prod we'll usually be same-origin behind nginx.
    if settings.ENV == "dev":
        allow_origins = [
            "http://localhost:5173",  # Vite dev
            "http://localhost:3000",  # nginx web (optional)
        ]
    else:
        allow_origins = _parse_origins(settings.CORS_ORIGINS) if settings.CORS_ORIGINS else []

    app.add_middleware(
        CORSMiddleware,
        allow_origins=allow_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # API under /api
    app.include_router(auth_router, prefix="/api")
    app.include_router(admin_users_router, prefix="/api")
    app.include_router(assets_router, prefix="/api")
    app.include_router(board_ws_router, prefix="/api")
    app.include_router(chat_ws_router, prefix="/api")

    # Serve local uploads
    app.mount("/storage", StaticFiles(directory="storage"), name="storage")

    @app.on_event("startup")
    def _startup():
        db = SessionLocal()
        try:
            bootstrap_admin(db)
        except BootstrapError as e:
            # In prod this should crash the app.
            raise RuntimeError(str(e))
        finally:
            db.close()

    return app


app = create_app()
