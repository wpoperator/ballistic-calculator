from fastapi import APIRouter, HTTPException, Depends
import logging
from typing import List

from ..models import (
    CalculationRequest,
    CalculationResponse,
    ErrorResponse
)
from ..services.ballistics import BallisticsService
from ..core.config import settings

logger = logging.getLogger(__name__)
router = APIRouter()


# Dependency to get ballistics service
def get_ballistics_service() -> BallisticsService:
    return BallisticsService()


@router.post(
    "/calculate",
    response_model=CalculationResponse,
    responses={
        400: {"model": ErrorResponse},
        422: {"model": ErrorResponse},
    },
    summary="Calculate trajectory",
    description="Calculate ballistic trajectory based on weapon, "
                "ammo, and environmental parameters"
)
async def calculate_trajectory(
    request: CalculationRequest,
    ballistics_service: BallisticsService = Depends(get_ballistics_service)
) -> CalculationResponse:
    """Calculate ballistic trajectory."""
    try:
        # Validate ranges
        if request.max_range > settings.MAX_RANGE_YARDS:
            raise HTTPException(
                status_code=400,
                detail=f"Maximum range cannot exceed "
                       f"{settings.MAX_RANGE_YARDS} yards"
            )

        if request.step_size > settings.MAX_STEP_SIZE:
            raise HTTPException(
                status_code=400,
                detail=f"Step size cannot exceed "
                       f"{settings.MAX_STEP_SIZE} yards"
            )

        result = await ballistics_service.calculate_trajectory(request)

        logger.info(
            f"Trajectory calculated: {len(result.trajectory)} points, "
            f"zero adjustment: {result.zero_adjustment:.2f} MOA"
        )

        return result

    except ValueError as e:
        logger.error(f"Calculation error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Unexpected error in trajectory calculation: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred during calculation"
        )


@router.get(
    "/drag-models",
    response_model=List[str],
    summary="Get available drag models",
    description="Get list of available ballistic drag models"
)
async def get_drag_models(
    ballistics_service: BallisticsService = Depends(get_ballistics_service)
) -> List[str]:
    """Get available drag models."""
    return ballistics_service.get_available_drag_models()


@router.get(
    "/validate",
    summary="Validate calculation parameters",
    description="Validate calculation parameters without "
                "performing calculation"
)
async def validate_parameters(request: CalculationRequest):
    """Validate calculation parameters."""
    try:
        # Basic validation is handled by Pydantic
        # Additional business logic validation can be added here

        if request.max_range <= request.zero_distance:
            raise HTTPException(
                status_code=400,
                detail="Maximum range must be greater than zero distance"
            )

        points = int(
            (request.max_range - request.zero_distance) / request.step_size
        ) + 1

        return {
            "valid": True,
            "message": "Parameters are valid",
            "estimated_points": points
        }

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
