import {
  Ammo,
  Angular,
  Atmo,
  Calculator as JsBallisticsCalculator,
  DragModel,
  Energy,
  Shot,
  Table,
  TrajectoryData,
  Velocity,
  Weapon,
  Wind,
  Distance,
  UNew,
  calculateEnergy,
} from "js-ballistics";

export const LIMITS = {
  MAX_RANGE_YARDS: 3000,
  MIN_RANGE_YARDS: 25,
  MAX_STEP_SIZE: 100,
  MIN_STEP_SIZE: 1,
} as const;

const DRAG_TABLES = {
  G1: Table.G1,
  G7: Table.G7,
} as const;

export type DragModelName = keyof typeof DRAG_TABLES;

export interface WeaponInput {
  sight_height: number;
  twist?: number | null;
}

export interface AmmoInput {
  bc: number;
  drag_model: DragModelName;
  muzzle_velocity: number;
  bullet_weight?: number | null;
  bullet_diameter?: number | null;
}

export interface AtmosphereInput {
  temperature: number;
  pressure: number;
  humidity: number;
  altitude: number;
}

export interface WindInput {
  speed: number;
  direction: number;
}

export interface CalculationRequest {
  weapon: WeaponInput;
  ammo: AmmoInput;
  atmosphere: AtmosphereInput;
  wind: WindInput;
  zero_distance: number;
  max_range: number;
  step_size: number;
}

export interface TrajectoryPoint {
  distance: number;
  drop: number;
  windage: number;
  velocity: number;
  energy: number;
  time: number;
  drop_adjustment: number;
  windage_adjustment: number;
}

export interface CalculationResponse {
  trajectory: TrajectoryPoint[];
  zero_adjustment: number;
  success: boolean;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  message: string;
  estimated_points: number;
}

type CalculatorConfig = Record<string, never>;
type BulletWeight = number | null;

const STEP_TOLERANCE = 1e-4;

export class BallisticsError extends Error {
  constructor(message: string, public readonly code: string = "ballistics_error") {
    super(message);
    this.name = "BallisticsError";
  }
}

export class BallisticsCalculator {
  private readonly calculator: JsBallisticsCalculator<CalculatorConfig>;

  constructor(calculator?: JsBallisticsCalculator<CalculatorConfig>) {
    this.calculator = calculator ?? new JsBallisticsCalculator<CalculatorConfig>();
  }

  getAvailableDragModels(): DragModelName[] {
    return Object.keys(DRAG_TABLES) as DragModelName[];
  }

  validate(request: CalculationRequest): ValidationResult {
    if (request.max_range > LIMITS.MAX_RANGE_YARDS) {
      return {
        valid: false,
        message: `Maximum range cannot exceed ${LIMITS.MAX_RANGE_YARDS} yards`,
        estimated_points: 0,
      };
    }

    if (request.step_size > LIMITS.MAX_STEP_SIZE) {
      return {
        valid: false,
        message: `Step size cannot exceed ${LIMITS.MAX_STEP_SIZE} yards`,
        estimated_points: 0,
      };
    }

    if (request.step_size < LIMITS.MIN_STEP_SIZE) {
      return {
        valid: false,
        message: `Step size must be at least ${LIMITS.MIN_STEP_SIZE} yard`,
        estimated_points: 0,
      };
    }

    if (request.zero_distance < LIMITS.MIN_RANGE_YARDS) {
      return {
        valid: false,
        message: `Zero distance must be at least ${LIMITS.MIN_RANGE_YARDS} yards`,
        estimated_points: 0,
      };
    }

    if (request.max_range <= request.zero_distance) {
      return {
        valid: false,
        message: "Maximum range must be greater than zero distance",
        estimated_points: 0,
      };
    }

    const estimated_points = Math.floor((request.max_range - request.zero_distance) / request.step_size) + 1;

    return {
      valid: true,
      message: "Parameters are valid",
      estimated_points,
    };
  }

  calculate(request: CalculationRequest): CalculationResponse {
    const validation = this.validate(request);
    if (!validation.valid) {
      throw new BallisticsError(validation.message, "validation_error");
    }

    const { shot, bulletWeightGrains } = this.buildShot(request);

    const zeroDistance = UNew.Yard(request.zero_distance);
    const zeroAngle = this.calculator.setWeaponZero(shot, zeroDistance);

    const hitResult = this.calculator.fire({
      shot,
      trajectoryRange: UNew.Yard(request.max_range),
      trajectoryStep: UNew.Yard(request.step_size),
      extraData: true,
    });

    const filtered = this.filterTrajectory(hitResult.trajectory, request.step_size);
    const trajectory = filtered.map((point) =>
      this.toTrajectoryPoint(point, bulletWeightGrains)
    );

    return {
      trajectory,
      zero_adjustment: zeroAngle.In(Angular.MIL),
      success: true,
      message: "Calculation completed successfully",
    };
  }

  private buildShot(request: CalculationRequest) {
    const dragTable = DRAG_TABLES[request.ammo.drag_model] ?? DRAG_TABLES.G1;

    const bulletWeightGrains = request.ammo.bullet_weight ?? null;
    const dragModel = new DragModel({
      bc: request.ammo.bc,
      dragTable,
      weight: bulletWeightGrains ? UNew.Grain(bulletWeightGrains) : 0,
      diameter: request.ammo.bullet_diameter ? UNew.Inch(request.ammo.bullet_diameter) : 0,
    });

    const ammo = new Ammo({
      dm: dragModel,
      mv: UNew.FPS(request.ammo.muzzle_velocity),
      powderTemp: UNew.Fahrenheit(request.atmosphere.temperature),
    });

    const weapon = new Weapon({
      sightHeight: UNew.Inch(request.weapon.sight_height),
      twist: request.weapon.twist ? UNew.Inch(request.weapon.twist) : null,
    });

    const atmo = new Atmo({
      altitude: UNew.Foot(request.atmosphere.altitude),
      pressure: UNew.InHg(request.atmosphere.pressure),
      temperature: UNew.Fahrenheit(request.atmosphere.temperature),
      humidity: request.atmosphere.humidity,
      powderT: UNew.Fahrenheit(request.atmosphere.temperature),
    });

    const winds = request.wind.speed > 0
      ? [
          new Wind({
            velocity: UNew.MPH(request.wind.speed),
            directionFrom: UNew.OClock(request.wind.direction),
          }),
        ]
      : undefined;

    const shot = new Shot({ weapon, ammo, atmo, winds });

    return { shot, bulletWeightGrains };
  }

  private filterTrajectory(points: TrajectoryData[], stepSize: number): TrajectoryData[] {
    return points.filter((point) => {
      const distanceYards = point.distance.In(Distance.Yard);
      if (Math.abs(distanceYards) < STEP_TOLERANCE) {
        return true;
      }

      const ratio = distanceYards / stepSize;
      return Math.abs(ratio - Math.round(ratio)) < STEP_TOLERANCE;
    });
  }

  private toTrajectoryPoint(point: TrajectoryData, bulletWeightGrains: BulletWeight): TrajectoryPoint {
    const distance = point.distance.In(Distance.Yard);
    const velocity = point.velocity.In(Velocity.FPS);

    const dropCandidates = [
      point.height?.In(Distance.Inch),
      point.targetDrop?.In(Distance.Inch),
    ];
    const drop = dropCandidates.find((value) => Number.isFinite(value)) ?? 0;

    const windage = point.windage?.In(Distance.Inch) ?? 0;
    let energy = point.energy?.In(Energy.FootPound) ?? 0;

    if ((!Number.isFinite(energy) || energy === 0) && bulletWeightGrains) {
      energy = calculateEnergy(bulletWeightGrains, velocity);
    }

    return {
      distance,
      drop,
      windage,
      velocity,
      energy,
      time: point.time,
      drop_adjustment: point.dropAdjustment?.In(Angular.MIL) ?? 0,
      windage_adjustment: point.windageAdjustment?.In(Angular.MIL) ?? 0,
    };
  }
}

export const ballisticsCalculator = new BallisticsCalculator();
