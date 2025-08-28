from fastapi import APIRouter
from datetime import datetime
import platform
import sys

from ..models import HealthResponse
from ..core.config import settings

router = APIRouter()


@router.get(
    "/health",
    response_model=HealthResponse,
    summary="Health check",
    description="Get API health status and system information"
)
async def health_check() -> HealthResponse:
    """Health check endpoint."""
    return HealthResponse(
        status="healthy",
        version=settings.VERSION,
        environment=settings.ENVIRONMENT,
        timestamp=datetime.utcnow().isoformat()
    )


@router.get(
    "/info",
    summary="System information",
    description="Get detailed system and runtime information"
)
async def system_info():
    """Get system information."""
    return {
        "app_name": settings.APP_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "python_version": sys.version,
        "platform": platform.platform(),
        "timestamp": datetime.utcnow().isoformat(),
        "api_limits": {
            "max_range_yards": settings.MAX_RANGE_YARDS,
            "min_range_yards": settings.MIN_RANGE_YARDS,
            "max_step_size": settings.MAX_STEP_SIZE,
            "min_step_size": settings.MIN_STEP_SIZE,
        }
    }
