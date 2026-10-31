import { Field, FieldLabel } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { MUSCLE_GROUPS } from "@/domain/constants"
import type { Exercise } from "@/domain/types"

export function ExerciseSelect({
  id,
  label,
  exercises,
  value,
  onValueChange,
}: {
  id: string
  label: string
  exercises: Exercise[]
  value: string
  onValueChange: (value: string) => void
}) {
  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger id={id} className="w-full min-h-11">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {MUSCLE_GROUPS.map((muscle) => {
            const group = exercises.filter((exercise) => exercise.muscleGroups[0] === muscle.id)
            if (group.length === 0) return null
            return (
              <SelectGroup key={muscle.id}>
                <SelectLabel>{muscle.label}</SelectLabel>
                {group.map((exercise) => (
                  <SelectItem key={exercise.id} value={exercise.id}>
                    {exercise.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            )
          })}
        </SelectContent>
      </Select>
    </Field>
  )
}
