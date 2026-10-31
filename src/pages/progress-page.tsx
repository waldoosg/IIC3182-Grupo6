import { useState } from "react"
import { ExerciseSelect } from "@/components/exercise-select"
import { ExerciseProgress } from "@/components/progress-panel"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { EX_REMO, MUSCLE_GROUPS } from "@/domain/constants"
import { exercisesForMuscles, progressPoints } from "@/domain/queries"
import { useAppState } from "@/storage/store"

export function ProgressPage() {
  const state = useAppState()
  const [exerciseId, setExerciseId] = useState(EX_REMO)
  const [muscles, setMuscles] = useState<string[]>([])
  const grouped = exercisesForMuscles(state, muscles).filter(
    (exercise) => progressPoints(state, exercise.id).length > 0,
  )

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="font-heading text-3xl font-medium">Progreso</h1>
        <p>El gráfico usa los registros guardados. La línea continua es el peso registrado en kg y la punteada es la estimación.</p>
      </div>
      <Tabs defaultValue="ejercicio">
        <TabsList className="w-full min-h-12">
          <TabsTrigger value="ejercicio" className="min-h-11">
            Por ejercicio
          </TabsTrigger>
          <TabsTrigger value="musculo" className="min-h-11">
            Por grupo muscular
          </TabsTrigger>
        </TabsList>
        <TabsContent value="ejercicio" className="flex flex-col gap-4">
          <ExerciseSelect
            id="ejercicio-progreso"
            label="Ejercicio"
            exercises={state.exercises}
            value={exerciseId}
            onValueChange={setExerciseId}
          />
          <Alert>
            <AlertTitle>Cómo se calcula la carga estimada</AlertTitle>
            <AlertDescription>
              Se conserva el peso registrado. Las libras se convierten a kilos (1 lb = 0,45359237 kg). La carga estimada es ese valor en kilos multiplicado por la relación mecánica del modelo, y solo aparece si el modelo tiene una relación guardada. No representa la fuerza real.
            </AlertDescription>
          </Alert>
          <ExerciseProgress key={exerciseId} exerciseId={exerciseId} />
        </TabsContent>
        <TabsContent value="musculo" className="flex flex-col gap-4">
          <Alert>
            <AlertTitle>Ejercicios por separado</AlertTitle>
            <AlertDescription>
              Cada ejercicio se muestra por separado. No se suman cargas de ejercicios distintos.
            </AlertDescription>
          </Alert>
          <ToggleGroup
            type="multiple"
            variant="outline"
            size="lg"
            value={muscles}
            onValueChange={setMuscles}
            aria-label="Grupos musculares"
            className="w-full flex-wrap"
          >
            {MUSCLE_GROUPS.map((muscle) => (
              <ToggleGroupItem key={muscle.id} value={muscle.id} className="min-h-12 whitespace-normal">
                {muscle.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
          {muscles.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyTitle>Elige un grupo muscular</EmptyTitle>
                <EmptyDescription>
                  Puedes marcar más de uno. Verás un gráfico por ejercicio, sin un total combinado.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : grouped.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyTitle>Sin registros en estos grupos</EmptyTitle>
                <EmptyDescription>Termina una sesión con alguno de estos ejercicios para ver el gráfico.</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            grouped.map((exercise) => (
              <section key={exercise.id} className="flex flex-col gap-3">
                <h2 className="font-heading text-xl font-medium">{exercise.name}</h2>
                <ExerciseProgress exerciseId={exercise.id} variant="summary" />
              </section>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
