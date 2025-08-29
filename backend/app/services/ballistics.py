import logging
from typing import List
from ..models import (
    CalculationRequest,
    CalculationResponse,
    TrajectoryPoint,
    DragModelEnum
)

# Import py-ballisticcalc components
from py_ballisticcalc import (
    Calculator, DragModel, Ammo, Weapon, Atmo, Shot, Wind,
    TableG1, TableG7
)
from py_ballisticcalc.unit import (
    Distance, Velocity, Temperature, Weight, Pressure, Angular, Energy
)

logger = logging.getLogger(__name__)


class BallisticsService:
    """Service for performing ballistics calculations."""

    def __init__(self):
        self.calculator = Calculator()

    async def calculate_trajectory(
        self,
        request: CalculationRequest
    ) -> CalculationResponse:
        """Calculate trajectory based on input parameters."""
        try:
            logger.info(
                f"Starting trajectory calculation for range "
                f"{request.max_range} yards"
            )

            # Create drag model
            drag_table = self._get_drag_table(request.ammo.drag_model)
            drag_model = DragModel(request.ammo.bc, drag_table)

            # Create ammo object
            ammo = Ammo(
                drag_model,
                Velocity.FPS(request.ammo.muzzle_velocity),
                Temperature.Fahrenheit(request.atmosphere.temperature)
            )

            # Add bullet weight if provided
            if request.ammo.bullet_weight:
                ammo.bullet_weight = Weight.Grain(request.ammo.bullet_weight)

            # Create weapon object
            weapon = Weapon(
                sight_height=Distance.Inch(request.weapon.sight_height)
            )
            if request.weapon.twist:
                weapon.twist = Distance.Inch(request.weapon.twist)

            # Create atmospheric conditions
            atmo = Atmo(
                altitude=Distance.Foot(request.atmosphere.altitude),
                temperature=Temperature.Fahrenheit(
                    request.atmosphere.temperature
                ),
                pressure=Pressure.InHg(request.atmosphere.pressure),
                humidity=request.atmosphere.humidity
            )

            # Create shot with wind
            shot = Shot(weapon=weapon, ammo=ammo, atmo=atmo)
            if request.wind.speed > 0:
                shot.winds = [Wind(
                    Velocity.MPH(request.wind.speed),
                    Angular.OClock(request.wind.direction)
                )]

            # Set zero and calculate trajectory
            zero_distance = Distance.Yard(request.zero_distance)
            zero_adjustment = self.calculator.set_weapon_zero(
                shot, zero_distance
            )

            # Calculate trajectory with step size
            trajectory_range = Distance.Yard(request.max_range)
            trajectory_step = Distance.Yard(request.step_size)

            result = self.calculator.fire(
                shot,
                trajectory_range=trajectory_range,
                trajectory_step=trajectory_step,
                extra_data=True
            )

            # Convert to response format
            trajectory_points = self._convert_trajectory_points(result)

            logger.info(
                f"Trajectory calculation completed with "
                f"{len(trajectory_points)} points"
            )

            return CalculationResponse(
                trajectory=trajectory_points,
                zero_adjustment=float(zero_adjustment >> Angular.MIL),
                success=True,
                message="Calculation completed successfully"
            )

        except Exception as e:
            logger.error(f"Trajectory calculation failed: {str(e)}")
            raise ValueError(f"Calculation error: {str(e)}")

    def _get_drag_table(self, drag_model: DragModelEnum):
        """Get the appropriate drag table."""
        if drag_model == DragModelEnum.G1:
            return TableG1
        elif drag_model == DragModelEnum.G7:
            return TableG7
        else:
            return TableG1

    def _convert_trajectory_points(self, result) -> List[TrajectoryPoint]:
        """Convert calculation result to trajectory points."""
        trajectory_points = []

        for i, point in enumerate(result):
            # Debug: log available attributes for first point
            if i == 0:
                available_attrs = [
                    attr for attr in dir(point)
                    if not attr.startswith('_')
                ]
                logger.info(
                    f"Available trajectory point attributes: {available_attrs}"
                )

            # Extract energy value
            energy = 0.0
            if hasattr(point, 'energy'):
                energy = float(point.energy >> Energy.FootPound)

            # Extract drop adjustment in MIL
            drop_adj = 0.0
            if hasattr(point, 'drop_adj'):
                drop_adj = float(point.drop_adj >> Angular.MIL)
            elif hasattr(point, 'drop_adjustment'):
                drop_adj = float(point.drop_adjustment >> Angular.MIL)

            # Extract windage adjustment in MIL
            windage_adj = 0.0
            if hasattr(point, 'windage_adj'):
                windage_adj = float(point.windage_adj >> Angular.MIL)
            elif hasattr(point, 'windage_adjustment'):
                windage_adj = float(point.windage_adjustment >> Angular.MIL)

            # Try different attribute names for drop/height
            drop_value = 0.0
            if hasattr(point, 'height'):
                drop_value = float(point.height >> Distance.Inch)
            elif hasattr(point, 'slant_height'):
                drop_value = float(point.slant_height >> Distance.Inch)
            elif hasattr(point, 'y'):
                drop_value = float(point.y >> Distance.Inch)
            elif hasattr(point, 'drop'):
                drop_value = float(point.drop >> Distance.Inch)

            # Try different attribute names for windage
            windage_value = 0.0
            if hasattr(point, 'windage'):
                windage_value = float(point.windage >> Distance.Inch)
            elif hasattr(point, 'z'):
                windage_value = float(point.z >> Distance.Inch)

            trajectory_points.append(TrajectoryPoint(
                distance=float(point.distance >> Distance.Yard),
                drop=drop_value,
                windage=windage_value,
                velocity=float(point.velocity >> Velocity.FPS),
                energy=energy,
                time=float(point.time),
                drop_adjustment=drop_adj,
                windage_adjustment=windage_adj
            ))

        return trajectory_points

    def get_available_drag_models(self) -> List[str]:
        """Get list of available drag models."""
        return [model.value for model in DragModelEnum]
