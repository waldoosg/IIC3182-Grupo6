import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"
import { LoadBreakdown } from "@/components/load-breakdown"
import { formatDate, formatWeight, presetLabel } from "@/domain/format"
import { exerciseHistory, findExercise, heaviestSet } from "@/domain/queries"
import type { HistoryEntry } from "@/domain/queries"
import { useAppState } from "@/storage/store"

export function ExerciseHistory({
  exerciseId,
  gymId,
  focusEquipmentId,
}: {
  exerciseId: string
  gymId: string
  focusEquipmentId?: string
}) {
  const state = useAppState()
  const gym = state.gyms.find((item) => item.id === gymId)
  const entries = exerciseHistory(state, exerciseId)
  const current = entries.filter((entry) => entry.session.gymId === gymId)
  const others = entries.filter((entry) => entry.session.gymId !== gymId)

  if (focusEquipmentId) {
    const sameEquipment = current.filter((entry) => entry.equipment.id === focusEquipmentId)
    const otherEquipment = current.filter((entry) => entry.equipment.id !== focusEquipmentId)
    return (
      <div className="flex flex-col gap-6">
        <HistorySection
          label="Con este implemento"
          title="Con este implemento"
          entries={sameEquipment}
          stateExercises={state}
          emptyTitle="Sin registros con este implemento"
          emptyDescription="Cuando confirmes una serie en este gimnasio, el peso y las repeticiones quedarán aquí."
          gymId={gymId}
        />
        <HistorySection
          label="Otros implementos en este gimnasio"
          title="Otros implementos en este gimnasio"
          entries={otherEquipment}
          stateExercises={state}
          emptyTitle="No hay otros implementos"
          emptyDescription="No hay otros implementos en este gimnasio para este ejercicio."
          gymId={gymId}
        />
        <HistorySection
          label="Otros gimnasios"
          title="Otros gimnasios"
          entries={others}
          stateExercises={state}
          emptyTitle="Sin registros en otros gimnasios"
          emptyDescription="Los registros de otros gimnasios aparecen aquí, separados de los de este lugar."
          gymId={gymId}
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <HistorySection
        label={`En ${gym?.name ?? "este gimnasio"}`}
        title={`En ${gym?.name ?? "este gimnasio"}`}
        entries={current}
        stateExercises={state}
        emptyTitle="Sin registros en este gimnasio"
        emptyDescription="Los registros de este ejercicio en el gimnasio activo aparecen primero."
        gymId={gymId}
      />
      <HistorySection
        label="Otros gimnasios"
        title="Otros gimnasios"
        entries={others}
        stateExercises={state}
        emptyTitle="Sin registros en otros gimnasios"
        emptyDescription="Cuando exista un registro en otro gimnasio, se muestra aparte y con el nombre del lugar."
        gymId={gymId}
      />
    </div>
  )
}

function HistorySection({
  label,
  title,
  entries,
  stateExercises,
  emptyTitle,
  emptyDescription,
  gymId,
}: {
  label: string
  title: string
  entries: HistoryEntry[]
  stateExercises: ReturnType<typeof useAppState>
  emptyTitle: string
  emptyDescription: string
  gymId: string
}) {
  return (
    <section aria-label={label} className="flex flex-col gap-3">
      <h2 className="font-heading text-lg font-medium">{title}</h2>
      {entries.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>{emptyTitle}</EmptyTitle>
            <EmptyDescription>{emptyDescription}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        entries.map((entry) => (
          <HistoryCard key={entry.performed.id} entry={entry} gymId={gymId} state={stateExercises} />
        ))
      )}
    </section>
  )
}

function HistoryCard({
  entry,
  gymId,
  state,
}: {
  entry: HistoryEntry
  gymId: string
  state: ReturnType<typeof useAppState>
}) {
  const otherGym = entry.session.gymId !== gymId
  const gym = state.gyms.find((item) => item.id === entry.session.gymId)
  const planned = findExercise(state, entry.performed.plannedExerciseId)
  const actual = findExercise(state, entry.performed.actualExerciseId)
  const heaviest = heaviestSet(entry.performed.sets)
  const swapped = entry.performed.plannedExerciseId !== entry.performed.actualExerciseId

  return (
    <Card
      size="sm"
      data-gym-scope={otherGym ? "other" : "current"}
      className={otherGym ? "text-muted-foreground" : undefined}
    >
      <CardHeader>
        <CardTitle>{formatDate(entry.session.startedAt)}</CardTitle>
        <CardDescription>
          {entry.equipment.type} {entry.equipment.brand} {entry.equipment.model}
        </CardDescription>
        <Badge variant={otherGym ? "outline" : "secondary"}>{gym?.name}</Badge>
        {otherGym ? <Badge variant="outline">Otro gimnasio</Badge> : null}
        {entry.session.status === "active" ? <Badge variant="secondary">En curso</Badge> : null}
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {swapped ? <p>En la rutina: {planned?.name}. Hecho: {actual?.name}.</p> : null}
        <ul className="flex flex-col gap-1">
          {entry.performed.sets.map((set) => (
            <li key={set.id} className="text-base font-semibold tabular-nums">
              {formatWeight(set.weight, set.unit)} × {set.reps}
            </li>
          ))}
        </ul>
        <p className="font-medium">Serie más pesada</p>
        <LoadBreakdown weight={heaviest.weight} unit={heaviest.unit} equipment={entry.equipment} />
        {entry.notes.length > 0 ? (
          <ul className="flex flex-col gap-1">
            {entry.notes.map((note) => (
              <li key={note.id}>
                {note.presets.map((preset) => presetLabel(preset)).join(", ")}
                {note.presets.length > 0 && note.text ? ". " : ""}
                {note.text}
              </li>
            ))}
          </ul>
        ) : null}
      </CardContent>
    </Card>
  )
}
