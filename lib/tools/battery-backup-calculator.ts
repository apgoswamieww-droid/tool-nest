/**
 * Battery Backup Calculator.
 * Estimates UPS/inverter backup time and battery requirements.
 */

export interface BatteryConfig {
  batteryVoltage: number; // e.g., 12V
  batteryAh: number; // Amp-hours, e.g., 100Ah
  batteryCount: number; // number of batteries
  batteryType: "lead-acid" | "lithium";
}

export interface LoadItem {
  name: string;
  wattage: number;
  quantity: number;
}

export interface BackupResult {
  totalLoadWatts: number;
  totalLoadVA: number;
  batteryCapacityWh: number;
  usableCapacityWh: number;
  backupTimeHours: number;
  backupTimeMinutes: number;
  backupTimeFormatted: string;
  recommendedBatteryAh: number;
  powerFactor: number;
  efficiencyFactor: number;
}

const EFFICIENCY_FACTORS: Record<string, number> = {
  "lead-acid": 0.85, // 85% efficiency
  lithium: 0.95, // 95% efficiency
};

const DEPTH_OF_DISCHARGE: Record<string, number> = {
  "lead-acid": 0.5, // 50% DoD for lead-acid
  lithium: 0.8, // 80% DoD for lithium
};

const POWER_FACTOR = 0.8; // typical power factor

/**
 * Calculate battery backup time.
 */
export function calculateBackupTime(
  batteries: BatteryConfig,
  loads: LoadItem[]
): BackupResult {
  // Total load in watts
  const totalLoadWatts = loads.reduce(
    (sum, item) => sum + item.wattage * item.quantity,
    0
  );

  // Total load in VA
  const totalLoadVA = totalLoadWatts / POWER_FACTOR;

  // Total battery capacity in Wh
  const totalAh = batteries.batteryAh * batteries.batteryCount;
  const batteryCapacityWh = totalAh * batteries.batteryVoltage;

  // Usable capacity (accounting for depth of discharge)
  const dod = DEPTH_OF_DISCHARGE[batteries.batteryType] || 0.5;
  const usableCapacityWh = batteryCapacityWh * dod;

  // Efficiency factor
  const efficiency = EFFICIENCY_FACTORS[batteries.batteryType] || 0.85;

  // Backup time = (usable capacity * efficiency) / total load
  const effectiveCapacity = usableCapacityWh * efficiency;
  const backupTimeHours =
    totalLoadWatts > 0 ? effectiveCapacity / totalLoadWatts : 0;

  const backupTimeMinutes = Math.round(backupTimeHours * 60);
  const hours = Math.floor(backupTimeHours);
  const minutes = Math.round((backupTimeHours - hours) * 60);
  const backupTimeFormatted =
    hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

  // Recommended battery Ah for a target of 4 hours backup
  const targetHours = 4;
  const requiredWh = (totalLoadWatts * targetHours) / efficiency;
  const recommendedBatteryAh = Math.ceil(
    requiredWh / (dod * batteries.batteryVoltage * batteries.batteryCount)
  );

  return {
    totalLoadWatts: Math.round(totalLoadWatts),
    totalLoadVA: Math.round(totalLoadVA),
    batteryCapacityWh: Math.round(batteryCapacityWh),
    usableCapacityWh: Math.round(usableCapacityWh),
    backupTimeHours: Math.round(backupTimeHours * 100) / 100,
    backupTimeMinutes,
    backupTimeFormatted,
    recommendedBatteryAh,
    powerFactor: POWER_FACTOR,
    efficiencyFactor: efficiency,
  };
}

export function validateBatteryConfig(config: BatteryConfig): string | null {
  if (config.batteryVoltage <= 0) return "Battery voltage must be positive.";
  if (config.batteryAh <= 0) return "Battery capacity (Ah) must be positive.";
  if (config.batteryCount <= 0) return "At least one battery is required.";
  return null;
}

export const COMMON_LOADS: LoadItem[] = [
  { name: "LED Light", wattage: 10, quantity: 5 },
  { name: "Ceiling Fan", wattage: 75, quantity: 2 },
  { name: "Television (LED)", wattage: 100, quantity: 1 },
  { name: "Refrigerator", wattage: 150, quantity: 1 },
  { name: "Laptop", wattage: 65, quantity: 1 },
  { name: "Wi-Fi Router", wattage: 15, quantity: 1 },
  { name: "AC (1.5 ton)", wattage: 1500, quantity: 1 },
  { name: "Water Pump", wattage: 750, quantity: 1 },
];

export const BATTERY_PRESETS = {
  small: { batteryVoltage: 12, batteryAh: 100, batteryCount: 1, batteryType: "lead-acid" as const },
  medium: { batteryVoltage: 12, batteryAh: 150, batteryCount: 2, batteryType: "lead-acid" as const },
  large: { batteryVoltage: 24, batteryAh: 200, batteryCount: 2, batteryType: "lead-acid" as const },
  lithium: { batteryVoltage: 48, batteryAh: 100, batteryCount: 1, batteryType: "lithium" as const },
};
