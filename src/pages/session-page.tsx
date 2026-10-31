import { useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import { toast } from "sonner"
import { ExerciseLogger } from "@/components/exercise-logger"
import { Missing } from "@/components/missing"
import { hasNoteContent, NoteFields } from "@/components/note-fields"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { findExercise } from "@/domain/queries"
import type { NoteAnchor, NotePreset } from "@/domain/types"
import { addNote, finishSession, sessionSetCount, useAppState } from "@/storage/store"

export function SessionPage() {
  const { sessionId = "" } = useParams()
  const state = useAppState()
  const navigate = useNavigate()
  const session = state.sessions.find((item) => item.id === sessionId)
  const routine = state.routines.find((item) => item.id === session?.routineId)
  const gym = state.gyms.find((item) => item.id === session?.gymId)
  const [open, setOpen] = useState(false)
  const [presets, setPresets] = useState<NotePreset[]>([])
  const [text, setText] = useState("")
  const [anchor, setAnchor] = useState<NoteAnchor>("session")

  if (!session || !routine) {
    return (
      <Missing
        title="No encontramos esta sesión"
        description="Puede que se haya restablecido la demostración."
      />
    )
  }

  const total = sessionSetCount(session)

  function finish() {
    if (!session || !routine) return
    if (hasNoteContent(presets, text)) {
      addNote({
        presets,
        text: text.trim(),
        anchor,
        sessionId: anchor === "session" ? session.id : undefined,
        routineId: anchor === "routine" ? routine.id : undefined,
      })
    }
    finishSession(session.id)
    toast.success("Entrenamiento terminado")
    setOpen(false)
    navigate("/historial")
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <p className="text-sm text-muted-foreground">Sede: {gym?.name}</p>
        <h1 className="font-heading text-3xl font-medium">{routine.name}</h1>
        {session.status === "finished" ? <Badge variant="secondary">Terminada</Badge> : null}
      </div>
      <div className="flex flex-col gap-3">
        {routine.items.map((item) => {
          const exercise = findExercise(state, item.exerciseId)
          const performed = session.performed.find((entry) => entry.routineItemId === item.id)
          const actual = performed ? findExercise(state, performed.actualExerciseId) : undefined
          const count = performed?.sets.length ?? 0
          return (
            <Link
              key={item.id}
              to={`/sesion/${session.id}/ejercicio/${item.id}`}
              className={cn(
                buttonVariants({ variant: "outline", size: "lg" }),
                "h-auto min-h-16 w-full flex-col items-start gap-1 whitespace-normal px-4",
              )}
            >
              <span>{exercise?.name}</span>
              <span>
                {count === 1 ? "1 serie guardada" : `${count} series guardadas`}
              </span>
              {performed && performed.actualExerciseId !== item.exerciseId ? (
                <span>En esta sesión: {actual?.name}</span>
              ) : null}
            </Link>
          )
        })}
      </div>
      {session.status === "active" ? (
        <>
          <Button type="button" size="lg" disabled={total === 0} onClick={() => setOpen(true)}>
            Terminar entrenamiento
          </Button>
          {total === 0 ? <p>Confirma al menos una serie para terminar.</p> : null}
        </>
      ) : (
        <p>Este entrenamiento ya está terminado. Puedes corregir una serie abriendo el ejercicio.</p>
      )}
      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next)
          if (next) {
            setPresets([])
            setText("")
            setAnchor("session")
          }
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Terminar entrenamiento</DialogTitle>
            <DialogDescription>
              Se guardan las series confirmadas. La nota es opcional.
            </DialogDescription>
          </DialogHeader>
          <NoteFields
            presets={presets}
            onPresets={setPresets}
            text={text}
            onText={setText}
            anchor={anchor}
            onAnchor={setAnchor}
            anchors={["session", "routine"]}
          />
          <DialogFooter>
            <Button type="button" size="lg" onClick={finish}>
              Terminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export function ExercisePage() {
  const { sessionId = "", itemId = "" } = useParams()
  const state = useAppState()
  const session = state.sessions.find((item) => item.id === sessionId)
  const routine = state.routines.find((item) => item.id === session?.routineId)
  const item = routine?.items.find((entry) => entry.id === itemId)

  if (!session || !routine || !item) {
    return (
      <Missing
        title="No encontramos este ejercicio"
        description="Vuelve al inicio y abre la sesión de nuevo."
      />
    )
  }

  return <ExerciseLogger sessionId={session.id} itemId={item.id} />
}
