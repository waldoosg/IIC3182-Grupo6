import { PREFERRED_EQUIPMENT_TYPE } from "@/domain/constants"
import { equipmentLabel } from "@/domain/format"
import { estimateLoad, toKg } from "@/domain/load"
import type {
  AppState,
  Equipment,
  Exercise,
  Note,
  PerformedExercise,
  Routine,
  Session,
  SetLog,
} from "@/domain/types"

export type HistoryEntry = {
  session: Session
  performed: PerformedExercise
  equipment: Equipment
  notes: Note[]
}

export type ProgressPoint = {
  id: string
  session: Session
  performed: PerformedExercise
  equipment: Equipment
  set: SetLog
  notes: Note[]
  estimate: ReturnType<typeof estimateLoad>
}

export function findExercise(state: AppState, exerciseId: string): Exercise | undefined {
  return state.exercises.find((exercise) => exercise.id === exerciseId)
}

export function findEquipment(state: AppState, equipmentId: string): Equipment | undefined {
  return state.equipment.find((equipment) => equipment.id === equipmentId)
}

export function activeSession(state: AppState): Session | undefined {
  return state.sessions.find((session) => session.status === "active")
}

export function suggestedRoutine(state: AppState): Routine {
  const finished = state.sessions
    .filter((session) => session.status === "finished")
    .sort((a, b) => (b.finishedAt ?? b.startedAt).localeCompare(a.finishedAt ?? a.startedAt))
  const fallback = state.routines.find((routine) => routine.focus === "upper") ?? state.routines[0]
  const last = finished[0]
  if (!last) return fallback
  const lastRoutine = state.routines.find((routine) => routine.id === last.routineId)
  return state.routines.find((routine) => routine.focus !== lastRoutine?.focus) ?? fallback
}

export function lastFinishedSession(state: AppState): Session | undefined {
  return state.sessions
    .filter((session) => session.status === "finished")
    .sort((a, b) => (b.finishedAt ?? b.startedAt).localeCompare(a.finishedAt ?? a.startedAt))[0]
}

export function alternatives(state: AppState, exerciseId: string): Exercise[] {
  const current = findExercise(state, exerciseId)
  if (!current) return []
  return state.exercises.filter(
    (exercise) =>
      exercise.id !== exerciseId &&
      exercise.muscleGroups.some((group) => current.muscleGroups.includes(group)),
  )
}

export function equipmentForGym(state: AppState, gymId: string, exerciseId: string): Equipment[] {
  const preferred = PREFERRED_EQUIPMENT_TYPE[exerciseId]
  return state.equipment
    .filter((equipment) => equipment.gymId === gymId)
    .sort((a, b) => {
      const aPreferred = a.type === preferred ? 0 : 1
      const bPreferred = b.type === preferred ? 0 : 1
      if (aPreferred !== bPreferred) return aPreferred - bPreferred
      return equipmentLabel(a).localeCompare(equipmentLabel(b), "es")
    })
}

export function defaultEquipmentId(
  state: AppState,
  gymId: string,
  exerciseId: string,
): string | undefined {
  const sessions = [...state.sessions].sort((a, b) => b.startedAt.localeCompare(a.startedAt))
  for (const session of sessions) {
    if (session.gymId !== gymId) continue
    const match = session.performed.find(
      (item) => item.actualExerciseId === exerciseId && item.sets.length > 0,
    )
    if (!match) continue
    const equipment = findEquipment(state, match.equipmentId)
    if (equipment?.gymId === gymId) return equipment.id
  }
  return equipmentForGym(state, gymId, exerciseId)[0]?.id
}

export function notesForPerformed(state: AppState, sessionId: string, performed: PerformedExercise): Note[] {
  return state.notes.filter((note) => {
    if (note.anchor === "routine") return false
    if (note.sessionId !== sessionId) return false
    if (note.anchor === "session") return true
    return note.exerciseId === performed.actualExerciseId
  })
}

export function heaviestSet(sets: SetLog[]): SetLog {
  return sets.reduce((best, set) =>
    toKg(set.weight, set.unit) > toKg(best.weight, best.unit) ? set : best,
  )
}

export function exerciseHistory(state: AppState, exerciseId: string): HistoryEntry[] {
  const entries: HistoryEntry[] = []
  for (const session of state.sessions) {
    for (const item of session.performed) {
      if (item.actualExerciseId !== exerciseId || item.sets.length === 0) continue
      const equipment = findEquipment(state, item.equipmentId)
      if (!equipment) continue
      entries.push({
        session,
        performed: item,
        equipment,
        notes: notesForPerformed(state, session.id, item),
      })
    }
  }
  return entries.sort((a, b) => b.session.startedAt.localeCompare(a.session.startedAt))
}

export function preloadSets(
  state: AppState,
  input: { excludeSessionId: string; gymId: string; exerciseId: string; equipmentId: string },
): SetLog[] {
  const sessions = [...state.sessions].sort((a, b) => b.startedAt.localeCompare(a.startedAt))
  for (const session of sessions) {
    if (session.id === input.excludeSessionId || session.gymId !== input.gymId) continue
    const match = session.performed.find(
      (item) =>
        item.actualExerciseId === input.exerciseId &&
        item.equipmentId === input.equipmentId &&
        item.sets.length > 0,
    )
    if (match) return match.sets
  }
  return []
}

export function progressPoints(state: AppState, exerciseId: string): ProgressPoint[] {
  const points: ProgressPoint[] = []
  for (const session of state.sessions) {
    if (session.status !== "finished") continue
    const matches = session.performed.filter(
      (item) => item.actualExerciseId === exerciseId && item.sets.length > 0,
    )
    if (matches.length === 0) continue
    let best = matches[0]
    let bestSet = heaviestSet(best.sets)
    for (const item of matches.slice(1)) {
      const candidate = heaviestSet(item.sets)
      if (toKg(candidate.weight, candidate.unit) > toKg(bestSet.weight, bestSet.unit)) {
        best = item
        bestSet = candidate
      }
    }
    const equipment = findEquipment(state, best.equipmentId)
    if (!equipment) continue
    points.push({
      id: `${session.id}:${best.id}`,
      session,
      performed: best,
      equipment,
      set: bestSet,
      notes: notesForPerformed(state, session.id, best),
      estimate: estimateLoad(bestSet.weight, bestSet.unit, equipment),
    })
  }
  return points.sort((a, b) => a.session.startedAt.localeCompare(b.session.startedAt))
}

export function exercisesForMuscles(state: AppState, muscleIds: string[]): Exercise[] {
  return state.exercises.filter((exercise) =>
    exercise.muscleGroups.some((group) => muscleIds.includes(group)),
  )
}
