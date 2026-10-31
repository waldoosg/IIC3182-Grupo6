import { useState } from "react"
import { CheckIcon, MinusIcon, PlusIcon } from "lucide-react"
import { Link } from "react-router-dom"
import { toast } from "sonner"
import { EquipmentSheet } from "@/components/equipment-sheet"
import { ExerciseHistory } from "@/components/history-list"
import { NoteDialog } from "@/components/note-dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Toggle } from "@/components/ui/toggle"
import { equipmentLabel, changeReps, changeWeight, formatNumber, formatWeight, parsePositive, parseReps, presetLabel } from "@/domain/format"
import {
  alternatives,
  defaultEquipmentId,
  equipmentForGym,
  findEquipment,
  findExercise,
  preloadSets,
} from "@/domain/queries"
import type { SetLog, Unit } from "@/domain/types"
import {
  addNote,
  confirmSet,
  getState,
  removeSet,
  stageExercise,
  useAppState,
} from "@/storage/store"

type Draft = { weight: string; reps: string; setId?: string }

function draftsFrom(preload: SetLog[], confirmed: SetLog[], target: number): Draft[] {
  const count = Math.max(target, confirmed.length, 1)
  return Array.from({ length: count }, (_, index) => {
    const saved = confirmed[index]
    if (saved) return { weight: String(saved.weight), reps: String(saved.reps), setId: saved.id }
    const source = preload[index] ?? preload[preload.length - 1]
    if (!source) return { weight: "", reps: "" }
    return { weight: String(source.weight), reps: String(source.reps) }
  })
}

export function ExerciseLogger({ sessionId, itemId }: { sessionId: string; itemId: string }) {
  const state = useAppState()
  const session = state.sessions.find((item) => item.id === sessionId)
  const routine = state.routines.find((item) => item.id === session?.routineId)
  const item = routine?.items.find((entry) => entry.id === itemId)
  const performed = session?.performed.find((entry) => entry.routineItemId === item?.id)
  const initialExerciseId = performed?.actualExerciseId ?? item?.exerciseId ?? ""
  const initialEquipmentId =
    performed?.equipmentId ??
    (session && initialExerciseId ? defaultEquipmentId(state, session.gymId, initialExerciseId) ?? "" : "")
  const initialPreload =
    session && initialEquipmentId
      ? preloadSets(state, {
          excludeSessionId: session.id,
          gymId: session.gymId,
          exerciseId: initialExerciseId,
          equipmentId: initialEquipmentId,
        })
      : []

  const [chosenExerciseId, setChosenExerciseId] = useState(initialExerciseId)
  const [chosenEquipmentId, setChosenEquipmentId] = useState(initialEquipmentId)
  const [drafts, setDrafts] = useState<Draft[]>(() =>
    draftsFrom(initialPreload, performed?.sets ?? [], item?.targetSets ?? 1),
  )
  const [errors, setErrors] = useState<Record<number, string>>({})
  const [swapOpen, setSwapOpen] = useState(false)
  const [occupiedNote, setOccupiedNote] = useState(true)

  if (!session || !routine || !item) return null

  const locked = (performed?.sets.length ?? 0) > 0
  const exerciseId = locked && performed ? performed.actualExerciseId : chosenExerciseId
  const equipmentId = locked && performed ? performed.equipmentId : chosenEquipmentId
  const exercise = findExercise(state, exerciseId)
  const planned = findExercise(state, item.exerciseId)
  const equipment = findEquipment(state, equipmentId)
  const gym = state.gyms.find((entry) => entry.id === session.gymId)
  const options = equipmentForGym(state, session.gymId, exerciseId)
  const swapOptions = alternatives(state, item.exerciseId).filter((entry) => entry.id !== exerciseId)
  if (planned && exerciseId !== item.exerciseId) swapOptions.unshift(planned)

  const notes = state.notes.filter((note) => {
    if (note.anchor === "routine" && note.routineId === routine.id) return true
    if (note.sessionId !== session.id) return false
    if (note.anchor === "session") return true
    return note.exerciseId === exerciseId
  })

  function applySelection(nextExerciseId: string, nextEquipmentId: string) {
    if (locked) return
    setChosenExerciseId(nextExerciseId)
    setChosenEquipmentId(nextEquipmentId)
    stageExercise({
      sessionId: session!.id,
      routineItemId: item!.id,
      plannedExerciseId: item!.exerciseId,
      actualExerciseId: nextExerciseId,
      equipmentId: nextEquipmentId,
    })
    const preload = preloadSets(getState(), {
      excludeSessionId: session!.id,
      gymId: session!.gymId,
      exerciseId: nextExerciseId,
      equipmentId: nextEquipmentId,
    })
    setDrafts(draftsFrom(preload, [], item!.targetSets))
    setErrors({})
  }

  function confirmRow(index: number) {
    const draft = drafts[index]
    const weight = parsePositive(draft?.weight ?? "")
    const reps = parseReps(draft?.reps ?? "")
    if (!draft || weight == null || reps == null) {
      setErrors((current) => ({
        ...current,
        [index]: "Ingresa un peso y repeticiones mayores que 0.",
      }))
      return
    }
    const setId = confirmSet({
      sessionId: session!.id,
      routineItemId: item!.id,
      plannedExerciseId: item!.exerciseId,
      actualExerciseId: exerciseId,
      equipmentId,
      setId: draft.setId,
      weight,
      reps,
    })
    if (!setId) return
    setDrafts((current) =>
      current.map((entry, entryIndex) =>
        entryIndex === index ? { weight: String(weight), reps: String(reps), setId } : entry,
      ),
    )
    setErrors((current) => ({ ...current, [index]: "" }))
    const savedUnit = findEquipment(getState(), equipmentId)?.unit ?? "kg"
    toast.success(
      draft.setId
        ? "Serie actualizada"
        : `Serie guardada. ${formatWeight(weight, savedUnit)} × ${reps}`,
    )
  }

  function removeRow(setId: string) {
    removeSet(session!.id, item!.id, setId)
    const fresh = getState()
    const next = fresh.sessions
      .find((entry) => entry.id === session!.id)
      ?.performed.find((entry) => entry.routineItemId === item!.id)
    const preload = preloadSets(fresh, {
      excludeSessionId: session!.id,
      gymId: session!.gymId,
      exerciseId: next?.actualExerciseId ?? exerciseId,
      equipmentId: next?.equipmentId ?? equipmentId,
    })
    setDrafts(draftsFrom(preload, next?.sets ?? [], item!.targetSets))
  }

  return (
    <div className="flex flex-col gap-6 lg:grid lg:grid-cols-2 lg:items-start">
      <div className="flex min-w-0 flex-col gap-4">
        <Link to={`/sesion/${session.id}`} className="text-sm font-medium text-foreground">
          Volver a la sesión
        </Link>
        <div className="flex flex-col gap-1">
          <p className="text-sm text-muted-foreground">Entrenando en {gym?.name}</p>
          <h1 className="font-heading text-3xl font-medium">{exercise?.name}</h1>
          {exerciseId !== item.exerciseId ? <p>En la rutina: {planned?.name}</p> : null}
        </div>
        <Button type="button" variant="outline" size="lg" disabled={locked} onClick={() => setSwapOpen(true)}>
          Cambiar
        </Button>
        {locked ? (
          <p className="text-sm text-muted-foreground">
            Quita las series guardadas para cambiar el ejercicio o el implemento.
          </p>
        ) : null}
        <Field>
          <FieldLabel htmlFor="implemento">Implemento</FieldLabel>
          <Select
            value={equipmentId}
            onValueChange={(value) => applySelection(exerciseId, value)}
            disabled={locked}
          >
            <SelectTrigger id="implemento" className="w-full min-h-11" aria-label="Implemento">
              <SelectValue placeholder="Elige un implemento" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {options.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {equipmentLabel(option)}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>
        {equipment ? (
          <p>
            {equipment.mechanicalRatio != null
              ? `Relación mecánica: ${formatNumber(equipment.mechanicalRatio)}`
              : "Sin relación mecánica. No se puede estimar."}
          </p>
        ) : null}
        {equipment?.ratioNote ? <p className="text-sm text-muted-foreground">{equipment.ratioNote}</p> : null}
        {equipment?.pulleyCount != null ? <p className="text-sm text-muted-foreground">Poleas: {equipment.pulleyCount}</p> : null}
        {!locked ? (
          <EquipmentSheet gymId={session.gymId} onCreated={(id) => applySelection(exerciseId, id)} />
        ) : null}
        <div className="flex flex-col gap-3">
          {drafts.map((draft, index) => {
            const saved = performed?.sets.find((set) => set.id === draft.setId)
            const unit: Unit = saved?.unit ?? equipment?.unit ?? "kg"
            const series = index + 1
            const previousReady = index === 0 || Boolean(drafts[index - 1]?.setId)
            return (
              <div key={draft.setId ?? `fila-${index}`} className="flex flex-col gap-3 rounded-xl border p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium">Serie {series}</p>
                  {draft.setId ? <Badge variant="secondary">Guardada</Badge> : null}
                </div>
                <FieldGroup>
                  <Field data-invalid={errors[index] ? true : undefined}>
                    <FieldLabel htmlFor={`peso-${index}`}>Peso</FieldLabel>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        size="icon-lg"
                        variant="outline"
                        aria-label={`Bajar peso de la serie ${series}`}
                        onClick={() =>
                          setDrafts((current) =>
                            current.map((entry, entryIndex) =>
                              entryIndex === index
                                ? { ...entry, weight: changeWeight(entry.weight, unit, -1) }
                                : entry,
                            ),
                          )
                        }
                      >
                        <MinusIcon data-icon="inline-start" />
                      </Button>
                      <Input
                        id={`peso-${index}`}
                        aria-label={`Peso serie ${series}`}
                        inputMode="decimal"
                        autoComplete="off"
                        value={draft.weight}
                        aria-invalid={errors[index] ? true : undefined}
                        className="h-12 text-center text-xl font-semibold tabular-nums md:text-xl"
                        onChange={(event) =>
                          setDrafts((current) =>
                            current.map((entry, entryIndex) =>
                              entryIndex === index ? { ...entry, weight: event.target.value } : entry,
                            ),
                          )
                        }
                      />
                      <span>{unit}</span>
                      <Button
                        type="button"
                        size="icon-lg"
                        variant="outline"
                        aria-label={`Subir peso de la serie ${series}`}
                        onClick={() =>
                          setDrafts((current) =>
                            current.map((entry, entryIndex) =>
                              entryIndex === index
                                ? { ...entry, weight: changeWeight(entry.weight, unit, 1) }
                                : entry,
                            ),
                          )
                        }
                      >
                        <PlusIcon data-icon="inline-start" />
                      </Button>
                    </div>
                  </Field>
                  <Field data-invalid={errors[index] ? true : undefined}>
                    <FieldLabel htmlFor={`reps-${index}`}>Repeticiones</FieldLabel>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        size="icon-lg"
                        variant="outline"
                        aria-label={`Bajar repeticiones de la serie ${series}`}
                        onClick={() =>
                          setDrafts((current) =>
                            current.map((entry, entryIndex) =>
                              entryIndex === index
                                ? { ...entry, reps: changeReps(entry.reps, -1) }
                                : entry,
                            ),
                          )
                        }
                      >
                        <MinusIcon data-icon="inline-start" />
                      </Button>
                      <Input
                        id={`reps-${index}`}
                        aria-label={`Repeticiones serie ${series}`}
                        inputMode="numeric"
                        autoComplete="off"
                        value={draft.reps}
                        aria-invalid={errors[index] ? true : undefined}
                        className="h-12 text-center text-xl font-semibold tabular-nums md:text-xl"
                        onChange={(event) =>
                          setDrafts((current) =>
                            current.map((entry, entryIndex) =>
                              entryIndex === index ? { ...entry, reps: event.target.value } : entry,
                            ),
                          )
                        }
                      />
                      <Button
                        type="button"
                        size="icon-lg"
                        variant="outline"
                        aria-label={`Subir repeticiones de la serie ${series}`}
                        onClick={() =>
                          setDrafts((current) =>
                            current.map((entry, entryIndex) =>
                              entryIndex === index
                                ? { ...entry, reps: changeReps(entry.reps, 1) }
                                : entry,
                            ),
                          )
                        }
                      >
                        <PlusIcon data-icon="inline-start" />
                      </Button>
                    </div>
                  </Field>
                </FieldGroup>
                {errors[index] ? <FieldError>{errors[index]}</FieldError> : null}
                {previousReady ? null : <p className="text-sm text-muted-foreground">Confirma la serie anterior primero.</p>}
                <Button type="button" size="lg" disabled={!previousReady} onClick={() => confirmRow(index)}>
                  <CheckIcon data-icon="inline-start" />
                  {draft.setId ? `Guardar cambios de la serie ${series}` : `Confirmar serie ${series}`}
                </Button>
                {draft.setId ? (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button type="button" variant="ghost" size="lg">
                        Quitar serie {series}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Quitar serie {series}</AlertDialogTitle>
                        <AlertDialogDescription>
                          Se borra esta serie guardada. Las demás se mantienen.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel size="lg">Cancelar</AlertDialogCancel>
                        <AlertDialogAction size="lg" variant="destructive" onClick={() => removeRow(draft.setId!)}>
                          Quitar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                ) : null}
              </div>
            )
          })}
        </div>
        <Button
          type="button"
          variant="outline"
          size="lg"
          onClick={() =>
            setDrafts((current) => {
              const last = current.at(-1)
              return [...current, { weight: last?.weight ?? "", reps: last?.reps ?? "" }]
            })
          }
        >
          <PlusIcon data-icon="inline-start" />
          Agregar serie
        </Button>
      </div>
      <div className="flex min-w-0 flex-col gap-4">
        <section aria-label="Notas" className="flex flex-col gap-3">
          <h2 className="font-heading text-lg font-medium">Notas</h2>
          {notes.length === 0 ? (
            <p className="text-muted-foreground">Sin notas todavía.</p>
          ) : (
            <ul className="flex flex-col gap-2">
              {notes.map((note) => (
                <li key={note.id}>
                  {note.presets.map((preset) => presetLabel(preset)).join(", ")}
                  {note.presets.length > 0 && note.text ? ". " : ""}
                  {note.text}
                </li>
              ))}
            </ul>
          )}
          <NoteDialog
            triggerLabel="Agregar nota"
            defaultAnchor="exercise"
            anchors={["exercise", "session", "routine"]}
            sessionId={session.id}
            exerciseId={exerciseId}
            routineId={routine.id}
          />
        </section>
        <ExerciseHistory exerciseId={exerciseId} gymId={session.gymId} focusEquipmentId={equipmentId} />
      </div>
      <Sheet open={swapOpen} onOpenChange={setSwapOpen}>
        <SheetContent side="bottom" className="max-h-[85svh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Cambiar solo en esta sesión</SheetTitle>
            <SheetDescription>
              La rutina original no se modifica. El registro queda en el ejercicio que elijas.
            </SheetDescription>
          </SheetHeader>
          <div className="flex flex-col gap-3 px-4 pb-4">
            <Toggle
              variant="outline"
              size="lg"
              pressed={occupiedNote}
              onPressedChange={setOccupiedNote}
              aria-label="Agregar nota Máquina ocupada"
            >
              Agregar nota Máquina ocupada
            </Toggle>
            {swapOptions.map((option) => (
              <Button
                key={option.id}
                type="button"
                size="lg"
                variant="outline"
                className="w-full whitespace-normal"
                onClick={() => {
                  const nextEquipment = defaultEquipmentId(state, session.gymId, option.id) ?? equipmentId
                  applySelection(option.id, nextEquipment)
                  if (occupiedNote && option.id !== item.exerciseId) {
                    addNote({
                      presets: ["maquina-ocupada"],
                      text: "",
                      anchor: "exercise",
                      sessionId: session.id,
                      exerciseId: option.id,
                    })
                  }
                  setSwapOpen(false)
                  toast.success("Ejercicio cambiado solo en esta sesión")
                }}
              >
                {option.name}
              </Button>
            ))}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
