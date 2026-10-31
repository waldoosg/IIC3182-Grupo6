import { Badge } from "@/components/ui/badge"
import { formatKg, formatWeight } from "@/domain/format"
import { estimateLoad } from "@/domain/load"
import type { Equipment, Unit } from "@/domain/types"

export function LoadBreakdown({
  weight,
  unit,
  equipment,
}: {
  weight: number
  unit: Unit
  equipment: Equipment
}) {
  const estimate = estimateLoad(weight, unit, equipment)

  return (
    <div className="flex flex-col gap-2">
      <p className="tabular-nums">Peso registrado: {formatWeight(weight, unit)}</p>
      {unit === "lb" ? (
        <p>
          Conversión de unidad: {formatKg(estimate.recordedKg)}. No es una estimación mecánica.
        </p>
      ) : null}
      {estimate.status === "estimated" ? (
        <p className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">Estimado</Badge>
          <span className="tabular-nums">Carga estimada: {formatKg(estimate.estimatedKg)}</span>
        </p>
      ) : (
        <p>No se puede estimar: este modelo no tiene relación mecánica.</p>
      )}
    </div>
  )
}
