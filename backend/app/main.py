from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
import logging
from contextlib import asynccontextmanager

from .routers import ballistics, health
from .core.config import settings
from .core.logging import setup_logging

# Setup logging
setup_logging()
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logger.info("Starting up Ballistics Calculator API")
    yield
    # Shutdown
    logger.info("Shutting down Ballistics Calculator API")

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.VERSION,
    description="Advanced ballistics calculator using py-ballisticcalc",
    docs_url="/docs" if settings.ENVIRONMENT != "production" else None,
    redoc_url="/redoc" if settings.ENVIRONMENT != "production" else None,
    lifespan=lifespan
)

# Security middleware
if settings.ALLOWED_HOSTS:
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=settings.ALLOWED_HOSTS
    )

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# Include routers
app.include_router(ballistics.router, prefix="/api", tags=["ballistics"])
app.include_router(health.router, prefix="/api", tags=["health"])


@app.get("/", include_in_schema=False)
async def root():
    return {
        "message": "Ballistics Calculator API",
        "version": settings.VERSION
    }
