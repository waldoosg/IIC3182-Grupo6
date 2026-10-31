import { Link, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { NoteDialog } from "@/components/note-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { presetLabel } from "@/domain/format"
import { activeSession, findExercise, lastFinishedSession, suggestedRoutine } from "@/domain/queries"
import { resetDemo, setActiveGym, startSession, useAppState } from "@/storage/store"

export function HomePage() {
  const state = useAppState()
  const navigate = useNavigate()
  const active = activeSession(state)
  const suggested = suggestedRoutine(state)
  const last = lastFinishedSession(state)
  const lastRoutine = state.routines.find((routine) => routine.id === last?.routineId)
  const activeGym = state.gyms.find((gym) => gym.id === state.activeGymId)
  const activeSessionGym = state.gyms.find((gym) => gym.id === active?.gymId)
  const ordered = [suggested, ...state.routines.filter((routine) => routine.id !== suggested.id)]

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-3xl font-medium">Hoy</h1>
        {last && lastRoutine ? (
          <p>
            La última sesión terminada fue {lastRoutine.name}, así que hoy se sugiere {suggested.name}.
          </p>
        ) : (
          <p>Elige una rutina para empezar.</p>
        )}
      </div>
      <Alert>
        <AlertTitle>Datos de demostración</AlertTitle>
        <AlertDescription>
          Los gimnasios, las máquinas y las relaciones mecánicas son ficticios. Restablecer borra lo que agregues y vuelve a cargar esos datos.
        </AlertDescription>
      </Alert>
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button type="button" variant="outline" size="lg">
            Restablecer datos
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restablecer datos de demostración</AlertDialogTitle>
            <AlertDialogDescription>
              Se borran las sesiones y los implementos que hayas agregado. Vuelven los registros de demostración.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel size="lg">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              size="lg"
              onClick={() => {
                resetDemo()
                toast.success("Datos de demostración restablecidos")
              }}
            >
              Restablecer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {active ? (
        <Card>
          <CardHeader>
            <CardTitle>Sesión en curso</CardTitle>
            <CardDescription>
              {state.routines.find((routine) => routine.id === active.routineId)?.name} · {activeSessionGym?.name}
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild size="lg">
              <Link to={`/sesion/${active.id}`}>Continuar sesión</Link>
            </Button>
          </CardFooter>
        </Card>
      ) : null}
      <section className="flex flex-col gap-3">
        <h2 className="font-heading text-lg font-medium">Entrenando en</h2>
        <p>Gimnasio activo: {activeGym?.name}</p>
        <p className="text-sm text-muted-foreground">
          El historial muestra primero los registros de este gimnasio.
        </p>
        {active && active.gymId !== state.activeGymId ? (
          <p>La sesión en curso sigue en {activeSessionGym?.name}.</p>
        ) : null}
        <ToggleGroup
          type="single"
          variant="outline"
          size="lg"
          value={state.activeGymId}
          onValueChange={(value) => {
            if (value) setActiveGym(value)
          }}
          aria-label="Entrenando en"
          className="grid w-full grid-cols-2"
        >
          {state.gyms.map((gym) => (
            <ToggleGroupItem key={gym.id} value={gym.id} className="w-full">
              {gym.name}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </section>
      <div className="flex flex-col gap-4">
        {ordered.map((routine) => {
          const routineNotes = state.notes.filter(
            (note) => note.anchor === "routine" && note.routineId === routine.id,
          )
          const isSuggested = routine.id === suggested.id
          return (
            <Card key={routine.id}>
              <CardHeader>
                <CardTitle>{routine.name}</CardTitle>
                <CardDescription>
                  {routine.focus === "upper" ? "Empuje y tracción" : "Piernas y cadera"}
                </CardDescription>
                {isSuggested ? <Badge>Sugerida hoy</Badge> : null}
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <ul aria-label={`Ejercicios de ${routine.name}`} className="flex list-disc flex-col gap-1 pl-5">
                  {routine.items.map((item) => (
                    <li key={item.id}>{findExercise(state, item.exerciseId)?.name}</li>
                  ))}
                </ul>
                {routineNotes.map((note) => (
                  <p key={note.id}>
                    Nota de la rutina: {note.presets.map((preset) => presetLabel(preset)).join(", ")}
                    {note.presets.length > 0 && note.text ? ". " : ""}
                    {note.text}
                  </p>
                ))}
                <NoteDialog
                  triggerLabel={`Agregar nota a ${routine.name}`}
                  defaultAnchor="routine"
                  anchors={["routine"]}
                  routineId={routine.id}
                />
              </CardContent>
              <CardFooter>
                {active?.routineId === routine.id ? (
                  <p>Esta rutina está en curso.</p>
                ) : active ? (
                  <p>Hay una sesión en curso. Termínala antes de empezar otra.</p>
                ) : (
                  <Button
                    type="button"
                    size="lg"
                    className="w-full"
                    onClick={() => {
                      const id = startSession(routine.id)
                      if (id) navigate(`/sesion/${id}`)
                    }}
                  >
                    Empezar {routine.name}
                  </Button>
                )}
              </CardFooter>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
