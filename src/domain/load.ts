import { KG_PER_LB } from "@/domain/constants"
import type { Equipment, Unit } from "@/domain/types"

export type LoadEstimate =
  | { status: "estimated"; recordedKg: number; estimatedKg: number }
  | { status: "unavailable"; recordedKg: number }

export function toKg(weight: number, unit: Unit): number {
  return unit === "lb" ? weight * KG_PER_LB : weight
}

/** La estimación es peso en kg × relación mecánica. Sin relación guardada, no se calcula. */
export function estimateLoad(
  weight: number,
  unit: Unit,
  equipment: Equipment,
): LoadEstimate {
  const recordedKg = toKg(weight, unit)
  if (equipment.mechanicalRatio == null || equipment.mechanicalRatio <= 0) {
    return { status: "unavailable", recordedKg }
  }
  return {
    status: "estimated",
    recordedKg,
    estimatedKg: recordedKg * equipment.mechanicalRatio,
  }
}
