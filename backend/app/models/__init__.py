from pydantic import BaseModel, Field, validator
from typing import List, Optional
from enum import Enum


class DragModelEnum(str, Enum):
    G1 = "G1"
    G7 = "G7"


class WeaponData(BaseModel):
    sight_height: float = Field(
        default=2.0,
        ge=0.1,
        le=10.0,
        description="Sight height in inches"
    )
    twist: Optional[float] = Field(
        default=None,
        ge=1.0,
        le=50.0,
        description="Barrel twist rate in inches"
    )


class AmmoData(BaseModel):
    bc: float = Field(
        ge=0.1,
        le=2.0,
        description="Ballistic coefficient"
    )
    drag_model: DragModelEnum = Field(
        default=DragModelEnum.G1,
        description="Drag model type"
    )
    muzzle_velocity: float = Field(
        ge=500,
        le=5000,
        description="Muzzle velocity in fps"
    )
    bullet_weight: Optional[float] = Field(
        default=None,
        ge=20,
        le=1000,
        description="Bullet weight in grains"
    )
    bullet_diameter: Optional[float] = Field(
        default=None,
        ge=0.1,
        le=1.0,
        description="Bullet diameter in inches"
    )


class AtmosphericData(BaseModel):
    temperature: float = Field(
        default=59.0,
        ge=-50,
        le=150,
        description="Temperature in Fahrenheit"
    )
    pressure: float = Field(
        default=29.92,
        ge=20.0,
        le=35.0,
        description="Barometric pressure in inHg"
    )
    humidity: float = Field(
        default=0.5,
        ge=0.0,
        le=1.0,
        description="Relative humidity (0-1)"
    )
    altitude: float = Field(
        default=0.0,
        ge=0.0,
        le=20000,
        description="Altitude in feet"
    )


class WindData(BaseModel):
    speed: float = Field(
        default=0.0,
        ge=0.0,
        le=100.0,
        description="Wind speed in mph"
    )
    direction: float = Field(
        default=3.0,
        ge=1.0,
        le=12.0,
        description="Wind direction in o'clock position"
    )


class CalculationRequest(BaseModel):
    weapon: WeaponData
    ammo: AmmoData
    atmosphere: AtmosphericData
    wind: WindData
    zero_distance: float = Field(
        default=100.0,
        ge=25.0,
        le=500.0,
        description="Zero distance in yards"
    )
    max_range: float = Field(
        default=1000.0,
        ge=100.0,
        le=3000.0,
        description="Maximum range in yards"
    )
    step_size: float = Field(
        default=25.0,
        ge=1.0,
        le=100.0,
        description="Step size in yards"
    )

    @validator('max_range')
    def validate_max_range(cls, v, values):
        if 'zero_distance' in values and v <= values['zero_distance']:
            raise ValueError('max_range must be greater than zero_distance')
        return v


class TrajectoryPoint(BaseModel):
    distance: float = Field(description="Distance in yards")
    drop: float = Field(description="Drop in inches")
    windage: float = Field(description="Windage in inches")
    velocity: float = Field(description="Velocity in fps")
    energy: float = Field(description="Energy in foot-pounds")
    time: float = Field(description="Time of flight in seconds")
    drop_adjustment: float = Field(description="Drop adjustment in Mil")
    windage_adjustment: float = Field(description="Windage adjustment in Mil")


class CalculationResponse(BaseModel):
    trajectory: List[TrajectoryPoint]
    zero_adjustment: float = Field(description="Zero adjustment in Mil")
    success: bool = True
    message: str = "Calculation completed successfully"


class ErrorResponse(BaseModel):
    detail: str
    error_code: Optional[str] = None


class HealthResponse(BaseModel):
    status: str
    version: str
    environment: str
    timestamp: str
