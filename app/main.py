from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from asgi_correlation_id import CorrelationIdMiddleware

from app.chat import router as chat_router
from app.core.config import settings
from app.core.logger import log, setup_logging, set_custom_logfile
from app.utils.routes import ensure_unique_route_names, simplify_operation_ids

class FridayApp:
    def __init__(self):
        self.app = FastAPI(
            title=settings.FASTAPI_TITLE,
            version=settings.FASTAPI_VERSION,
            description=settings.FASTAPI_DESCRIPTION,
            root_path=settings.FASTAPI_API_V1_PATH
        )
        self.register_routes()
        self.register_logger()
        self.register_middleware()

    def register_logger(self):
        setup_logging()
        set_custom_logfile()
        log.info("Logging setup complete")

    def register_middleware(self):
        if settings.MIDDLEWARE_CORS:
            self.app.add_middleware(
                CORSMiddleware,
                allow_origins=settings.CORS_ALLOWED_ORIGINS,
                allow_credentials=True,
                allow_methods=['*'],
                allow_headers=['*'],
                expose_headers=settings.CORS_EXPOSE_HEADERS,
            )
        self.app.add_middleware(CorrelationIdMiddleware, validator=False)

    def register_routes(self):
        router = APIRouter()

        self.app.include_router(router)
        self.app.include_router(chat_router)
        ensure_unique_route_names(self.app)
        simplify_operation_ids(self.app)


app = FridayApp().app

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=settings.PORT, reload=True)
