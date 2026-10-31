import { useState } from "react"
import { ExerciseSelect } from "@/components/exercise-select"
import { ExerciseHistory } from "@/components/history-list"
import { EX_REMO } from "@/domain/constants"
import { presetLabel } from "@/domain/format"
import { findExercise } from "@/domain/queries"
import { useAppState } from "@/storage/store"

export function HistoryPage() {
  const state = useAppState()
  const [exerciseId, setExerciseId] = useState(EX_REMO)
  const exercise = findExercise(state, exerciseId)
  const routineNotes = state.notes.filter((note) => {
    if (note.anchor !== "routine" || !note.routineId) return false
    const routine = state.routines.find((item) => item.id === note.routineId)
    return routine?.items.some((item) => item.exerciseId === exerciseId)
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-3xl font-medium">Historial</h1>
        <p>Los registros del gimnasio activo van primero. Los de otros lugares quedan aparte.</p>
      </div>
      <ExerciseSelect
        id="ejercicio-historial"
        label="Ejercicio"
        exercises={state.exercises}
        value={exerciseId}
        onValueChange={setExerciseId}
      />
      {exercise ? <p className="font-medium">{exercise.name}</p> : null}
      {routineNotes.length > 0 ? (
        <section aria-label="Notas de la rutina" className="flex flex-col gap-2">
          <h2 className="font-heading text-lg font-medium">Notas de la rutina</h2>
          {routineNotes.map((note) => (
            <p key={note.id}>
              {note.presets.map((preset) => presetLabel(preset)).join(", ")}
              {note.presets.length > 0 && note.text ? ". " : ""}
              {note.text}
            </p>
          ))}
        </section>
      ) : null}
      <ExerciseHistory exerciseId={exerciseId} gymId={state.activeGymId} />
    </div>
  )
}
