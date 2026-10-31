export type Unit = "kg" | "lb"

export type NotePreset =
  | "dormi-poco"
  | "cansancio"
  | "maquina-ocupada"
  | "use-otra-maquina"

export type NoteAnchor = "session" | "exercise" | "routine"

export type SessionStatus = "active" | "finished"

export type Gym = {
  id: string
  name: string
}

export type Equipment = {
  id: string
  type: string
  brand: string
  model: string
  unit: Unit
  gymId: string
  mechanicalRatio?: number
  pulleyCount?: number
  ratioNote?: string
}

export type Exercise = {
  id: string
  name: string
  muscleGroups: string[]
}

export type RoutineItem = {
  id: string
  exerciseId: string
  targetSets: number
}

export type Routine = {
  id: string
  name: string
  focus: "upper" | "lower"
  items: RoutineItem[]
}

export type Note = {
  id: string
  presets: NotePreset[]
  text: string
  anchor: NoteAnchor
  createdAt: string
  sessionId?: string
  exerciseId?: string
  performedId?: string
  routineId?: string
}

export type SetLog = {
  id: string
  weight: number
  unit: Unit
  reps: number
}

export type PerformedExercise = {
  id: string
  routineItemId: string
  plannedExerciseId: string
  actualExerciseId: string
  equipmentId: string
  sets: SetLog[]
}

export type Session = {
  id: string
  gymId: string
  routineId: string
  status: SessionStatus
  startedAt: string
  finishedAt?: string
  performed: PerformedExercise[]
}

export type AppState = {
  version: 1
  gyms: Gym[]
  equipment: Equipment[]
  exercises: Exercise[]
  routines: Routine[]
  sessions: Session[]
  notes: Note[]
  activeGymId: string
}
