export interface WheelEntry {
  id: string;
  label: string;
  color: string;
}

const WHEEL_COLORS = [
  "#ef4444", "#f97316", "#eab308", "#22c55e",
  "#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899",
  "#14b8a6", "#f43f5e", "#a855f7", "#6366f1",
];

export function createEntries(labels: string[]): WheelEntry[] {
  return labels
    .map((label, i) => ({
      id: `entry-${i}-${Date.now()}`,
      label: label.trim(),
      color: WHEEL_COLORS[i % WHEEL_COLORS.length],
    }))
    .filter((e) => e.label.length > 0);
}

export function spinWheel(entries: WheelEntry[]): WheelEntry {
  if (entries.length === 0) throw new Error("No entries to spin");
  const index = Math.floor(Math.random() * entries.length);
  return entries[index];
}

export function getSpinAngle(entryIndex: number, totalEntries: number): number {
  const segmentAngle = 360 / totalEntries;
  const segmentCenter = entryIndex * segmentAngle + segmentAngle / 2;
  // Full spins (5-10) + offset to land on center of segment
  const fullSpins = (5 + Math.floor(Math.random() * 6)) * 360;
  return fullSpins + (360 - segmentCenter);
}

export const DEFAULT_ENTRIES = [
  "Option 1",
  "Option 2",
  "Option 3",
  "Option 4",
  "Option 5",
  "Option 6",
];
