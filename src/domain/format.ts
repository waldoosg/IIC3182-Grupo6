import type { Equipment, Unit } from "@/domain/types"
import { NOTE_PRESETS } from "@/domain/constants"
import type { NotePreset } from "@/domain/types"

const numberFormat = new Intl.NumberFormat("es-CL", {
  maximumFractionDigits: 1,
  minimumFractionDigits: 0,
})

export function formatNumber(value: number): string {
  return numberFormat.format(value)
}

export function formatWeight(weight: number, unit: Unit): string {
  return `${formatNumber(weight)} ${unit}`
}

export function formatKg(weightKg: number): string {
  return `${formatNumber(weightKg)} kg`
}

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("es-CL", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "America/Santiago",
  }).format(new Date(iso))
}

export function formatChartLabel(iso: string): string {
  return new Intl.DateTimeFormat("es-CL", {
    day: "numeric",
    month: "short",
    timeZone: "America/Santiago",
  }).format(new Date(iso))
}

export function equipmentLabel(equipment: Equipment): string {
  return `${equipment.type} ${equipment.brand} ${equipment.model}`
}

export function presetLabel(id: NotePreset): string {
  return NOTE_PRESETS.find((preset) => preset.id === id)?.label ?? id
}

export function parsePositive(value: string): number | null {
  const normalized = value.trim().replace(",", ".")
  if (!normalized) return null
  const parsed = Number(normalized)
  if (!Number.isFinite(parsed) || parsed <= 0) return null
  return parsed
}

export function parseReps(value: string): number | null {
  const normalized = value.trim()
  if (!/^\d+$/.test(normalized)) return null
  const parsed = Number(normalized)
  if (!Number.isInteger(parsed) || parsed <= 0) return null
  return parsed
}

export function roundToTenth(value: number): number {
  return Math.round(value * 10) / 10
}

export function changeWeight(current: string, unit: Unit, direction: 1 | -1): string {
  const step = unit === "lb" ? 5 : 2.5
  const base = parsePositive(current) ?? 0
  const next = roundToTenth(base + direction * step)
  if (next <= 0) return ""
  return String(next)
}

export function changeReps(current: string, direction: 1 | -1): string {
  const parsed = Number.parseInt(current, 10)
  const base = Number.isFinite(parsed) ? parsed : 0
  const next = base + direction
  if (next <= 0) return ""
  return String(next)
}
