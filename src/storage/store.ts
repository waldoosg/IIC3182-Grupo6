import { STORAGE_KEY } from "@/domain/constants"
import { createSeed } from "@/domain/seed"
import type { AppState, Equipment, Note } from "@/domain/types"
import { useSyncExternalStore } from "react"

let state = readStorage()
const listeners = new Set<() => void>()

function readStorage(): AppState {
  if (typeof localStorage === "undefined") return createSeed()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return createSeed()
    const parsed = JSON.parse(raw) as AppState
    if (parsed?.version !== 1 || !Array.isArray(parsed.sessions) || !Array.isArray(parsed.routines)) {
      return createSeed()
    }
    return parsed
  } catch {
    return createSeed()
  }
}

function persist() {
  if (typeof localStorage === "undefined") return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

function emit() {
  for (const listener of listeners) listener()
}

function commit(recipe: (current: AppState) => AppState) {
  state = recipe(state)
  persist()
  emit()
}

export function getState(): AppState {
  return state
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useAppState(): AppState {
  return useSyncExternalStore(subscribe, getState, getState)
}

export function resetDemo() {
  state = createSeed()
  persist()
  emit()
}

export function setActiveGym(gymId: string) {
  commit((current) => {
    if (!current.gyms.some((gym) => gym.id === gymId)) return current
    return { ...current, activeGymId: gymId }
  })
}

export function startSession(routineId: string): string | null {
  const current = getState()
  if (current.sessions.some((session) => session.status === "active")) return null
  if (!current.routines.some((routine) => routine.id === routineId)) return null
  const id = crypto.randomUUID()
  commit((snapshot) => ({
    ...snapshot,
    sessions: [
      ...snapshot.sessions,
      {
        id,
        gymId: snapshot.activeGymId,
        routineId,
        status: "active",
        startedAt: new Date().toISOString(),
        performed: [],
      },
    ],
  }))
  return id
}

export function stageExercise(input: {
  sessionId: string
  routineItemId: string
  plannedExerciseId: string
  actualExerciseId: string
  equipmentId: string
}) {
  commit((current) => ({
    ...current,
    sessions: current.sessions.map((session) => {
      if (session.id !== input.sessionId) return session
      const existing = session.performed.find((item) => item.routineItemId === input.routineItemId)
      if (existing && existing.sets.length > 0) return session
      if (existing) {
        return {
          ...session,
          performed: session.performed.map((item) =>
            item.id === existing.id
              ? {
                  ...item,
                  plannedExerciseId: input.plannedExerciseId,
                  actualExerciseId: input.actualExerciseId,
                  equipmentId: input.equipmentId,
                }
              : item,
          ),
        }
      }
      return {
        ...session,
        performed: [
          ...session.performed,
          {
            id: crypto.randomUUID(),
            routineItemId: input.routineItemId,
            plannedExerciseId: input.plannedExerciseId,
            actualExerciseId: input.actualExerciseId,
            equipmentId: input.equipmentId,
            sets: [],
          },
        ],
      }
    }),
  }))
}

export function confirmSet(input: {
  sessionId: string
  routineItemId: string
  plannedExerciseId: string
  actualExerciseId: string
  equipmentId: string
  setId?: string
  weight: number
  reps: number
}): string | null {
  const current = getState()
  const equipment = current.equipment.find((item) => item.id === input.equipmentId)
  if (!equipment) return null
  const setId = input.setId ?? crypto.randomUUID()
  commit((snapshot) => ({
    ...snapshot,
    sessions: snapshot.sessions.map((session) => {
      if (session.id !== input.sessionId) return session
      const existing = session.performed.find((item) => item.routineItemId === input.routineItemId)
      if (!existing) {
        return {
          ...session,
          performed: [
            ...session.performed,
            {
              id: crypto.randomUUID(),
              routineItemId: input.routineItemId,
              plannedExerciseId: input.plannedExerciseId,
              actualExerciseId: input.actualExerciseId,
              equipmentId: input.equipmentId,
              sets: [{ id: setId, weight: input.weight, unit: equipment.unit, reps: input.reps }],
            },
          ],
        }
      }
      if (input.setId) {
        return {
          ...session,
          performed: session.performed.map((item) =>
            item.id === existing.id
              ? {
                  ...item,
                  sets: item.sets.map((set) =>
                    set.id === input.setId ? { ...set, weight: input.weight, reps: input.reps } : set,
                  ),
                }
              : item,
          ),
        }
      }
      return {
        ...session,
        performed: session.performed.map((item) =>
          item.id === existing.id
            ? {
                ...item,
                actualExerciseId: item.sets.length === 0 ? input.actualExerciseId : item.actualExerciseId,
                equipmentId: item.sets.length === 0 ? input.equipmentId : item.equipmentId,
                sets: [...item.sets, { id: setId, weight: input.weight, unit: equipment.unit, reps: input.reps }],
              }
            : item,
        ),
      }
    }),
  }))
  return setId
}

export function removeSet(sessionId: string, routineItemId: string, setId: string) {
  commit((current) => ({
    ...current,
    sessions: current.sessions.map((session) => {
      if (session.id !== sessionId) return session
      return {
        ...session,
        performed: session.performed.flatMap((item) => {
          if (item.routineItemId !== routineItemId) return [item]
          const sets = item.sets.filter((set) => set.id !== setId)
          if (sets.length === 0) return []
          return [{ ...item, sets }]
        }),
      }
    }),
  }))
}

export function addNote(input: Omit<Note, "id" | "createdAt">) {
  commit((current) => ({
    ...current,
    notes: [
      ...current.notes,
      { ...input, id: crypto.randomUUID(), createdAt: new Date().toISOString() },
    ],
  }))
}

export function addEquipment(input: Omit<Equipment, "id">): string {
  const id = crypto.randomUUID()
  commit((current) => ({
    ...current,
    equipment: [...current.equipment, { ...input, id }],
  }))
  return id
}

export function finishSession(sessionId: string) {
  commit((current) => ({
    ...current,
    sessions: current.sessions.map((session) =>
      session.id === sessionId
        ? { ...session, status: "finished", finishedAt: new Date().toISOString() }
        : session,
    ),
  }))
}

export function sessionSetCount(session: AppState["sessions"][number]): number {
  return session.performed.reduce((total, item) => total + item.sets.length, 0)
}
