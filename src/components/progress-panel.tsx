import { useState } from "react"
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"
import { LoadBreakdown } from "@/components/load-breakdown"
import { formatChartLabel, formatDate, formatNumber, formatWeight, presetLabel } from "@/domain/format"
import { findExercise, progressPoints } from "@/domain/queries"
import type { ProgressPoint } from "@/domain/queries"
import { useAppState } from "@/storage/store"

const chartConfig = {
  recordedKg: { label: "Peso registrado (kg)", color: "var(--foreground)" },
  estimatedKg: { label: "Carga estimada (kg)", color: "var(--chart-2)" },
} satisfies ChartConfig

export function ExerciseProgress({
  exerciseId,
  variant = "full",
}: {
  exerciseId: string
  variant?: "full" | "summary"
}) {
  const state = useAppState()
  const exercise = findExercise(state, exerciseId)
  const points = progressPoints(state, exerciseId)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selected = points.find((point) => point.id === selectedId) ?? points.at(-1)

  if (!exercise) return null

  if (points.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>Sin registros de {exercise.name}</EmptyTitle>
          <EmptyDescription>
            Cuando termines una sesión con este ejercicio, el gráfico mostrará el peso guardado.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  const data = points.map((point) => ({
    label: formatChartLabel(point.session.startedAt),
    recordedKg: Math.round(point.estimate.recordedKg * 10) / 10,
    estimatedKg:
      point.estimate.status === "estimated"
        ? Math.round(point.estimate.estimatedKg * 10) / 10
        : null,
  }))

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <ChartContainer
        config={chartConfig}
        role="img"
        aria-label={
          variant === "full"
            ? `Gráfico de ${exercise.name}. ${points.length} registros.`
            : `Gráfico resumen de ${exercise.name}. ${points.length} registros.`
        }
        className="aspect-video w-full min-w-0"
      >
        <LineChart data={data} margin={{ left: 4, right: 8, top: 8, bottom: 0 }} accessibilityLayer>
          <CartesianGrid vertical={false} />
          <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={44}
            tickFormatter={(value: number) => formatNumber(value)}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Line
            dataKey="recordedKg"
            type="monotone"
            stroke="var(--color-recordedKg)"
            strokeWidth={2}
            dot={{ r: 4 }}
            isAnimationActive={false}
          />
          <Line
            dataKey="estimatedKg"
            type="monotone"
            stroke="var(--color-estimatedKg)"
            strokeWidth={2}
            strokeDasharray="4 4"
            dot={{ r: 3 }}
            connectNulls={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ChartContainer>
      {variant === "full" ? (
        <div className="flex flex-col gap-2">
          {points.map((point) => (
            <PointButton
              key={point.id}
              point={point}
              gymName={state.gyms.find((gym) => gym.id === point.session.gymId)?.name ?? ""}
              pressed={selected?.id === point.id}
              onSelect={() => setSelectedId(point.id)}
            />
          ))}
        </div>
      ) : null}
      {selected ? (
        <PointDetail
          point={selected}
          stateGym={state.gyms.find((gym) => gym.id === selected.session.gymId)?.name ?? ""}
          exerciseName={exercise.name}
          variant={variant}
        />
      ) : null}
    </div>
  )
}

function PointButton({
  point,
  gymName,
  pressed,
  onSelect,
}: {
  point: ProgressPoint
  gymName: string
  pressed: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onSelect}
      className="flex min-h-12 w-full flex-col items-start gap-1 rounded-lg bg-card px-3 py-3 text-left text-card-foreground ring-1 ring-foreground/10"
    >
      <span>
        {formatDate(point.session.startedAt)} · {formatWeight(point.set.weight, point.set.unit)} × {point.set.reps}
      </span>
      <span>
        {point.equipment.model} · {gymName}
      </span>
    </button>
  )
}

function PointDetail({
  point,
  stateGym,
  exerciseName,
  variant,
}: {
  point: ProgressPoint
  stateGym: string
  exerciseName: string
  variant: "full" | "summary"
}) {
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle>{formatDate(point.session.startedAt)}</CardTitle>
        <CardDescription>
          {point.equipment.type} {point.equipment.brand} {point.equipment.model} · {stateGym}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          role="region"
          aria-label={
            variant === "full"
              ? `Detalle del registro de ${exerciseName}`
              : `Resumen de ${exerciseName}`
          }
          className="flex flex-col gap-2"
        >
          <LoadBreakdown weight={point.set.weight} unit={point.set.unit} equipment={point.equipment} />
          {point.notes.length > 0 ? (
            <ul className="flex flex-col gap-1">
              {point.notes.map((note) => (
                <li key={note.id}>
                  {note.presets.map((preset) => presetLabel(preset)).join(", ")}
                  {note.presets.length > 0 && note.text ? ". " : ""}
                  {note.text}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">Sin nota en este registro.</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
