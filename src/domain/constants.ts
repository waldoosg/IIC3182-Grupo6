import type { NotePreset } from "@/domain/types"

export const STORAGE_KEY = "bitacora-entreno-v1"

export const GYM_NORTE = "gym-norte"
export const GYM_SUR = "gym-sur"
export const ROUTINE_UPPER = "routine-upper"
export const ROUTINE_LOWER = "routine-lower"

export const EX_PRESS = "ex-press"
export const EX_PRESS_PLANO = "ex-press-plano"
export const EX_PRESS_MANC = "ex-press-manc"
export const EX_REMO = "ex-remo"
export const EX_REMO_MANC = "ex-remo-manc"
export const EX_JALON = "ex-jalon"
export const EX_SENTADILLA = "ex-sentadilla"
export const EX_PRENSA = "ex-prensa"
export const EX_RDL = "ex-rdl"
export const EX_CURL = "ex-curl"
export const EX_HIP = "ex-hip"
export const EX_PUENTE = "ex-puente"

export const MUSCLE_GROUPS = [
  { id: "pecho", label: "Pecho" },
  { id: "espalda", label: "Espalda" },
  { id: "cuadriceps", label: "Cuádriceps" },
  { id: "isquios", label: "Isquios" },
  { id: "gluteos", label: "Glúteos" },
] as const

export const NOTE_PRESETS: { id: NotePreset; label: string }[] = [
  { id: "dormi-poco", label: "Dormí poco" },
  { id: "cansancio", label: "Cansancio" },
  { id: "maquina-ocupada", label: "Máquina ocupada" },
  { id: "use-otra-maquina", label: "Usé otra máquina" },
]

export const ANCHOR_LABELS = {
  exercise: "Este ejercicio",
  session: "Este entrenamiento",
  routine: "Esta rutina",
} as const

export const PREFERRED_EQUIPMENT_TYPE: Record<string, string> = {
  [EX_PRESS]: "Máquina de press",
  [EX_PRESS_PLANO]: "Máquina de press",
  [EX_PRESS_MANC]: "Mancuernas",
  [EX_REMO]: "Máquina de remo",
  [EX_REMO_MANC]: "Mancuernas",
  [EX_JALON]: "Máquina de jalón",
  [EX_SENTADILLA]: "Máquina de sentadilla",
  [EX_PRENSA]: "Máquina de prensa",
  [EX_RDL]: "Barra",
  [EX_CURL]: "Máquina de curl femoral",
  [EX_HIP]: "Máquina de empuje",
  [EX_PUENTE]: "Máquina de empuje",
}

export const KG_PER_LB = 0.45359237
