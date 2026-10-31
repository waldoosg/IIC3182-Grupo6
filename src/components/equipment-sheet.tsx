import { useState } from "react"
import { PlusIcon } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { parsePositive, parseReps } from "@/domain/format"
import type { Unit } from "@/domain/types"
import { addEquipment } from "@/storage/store"

export function EquipmentSheet({
  gymId,
  onCreated,
}: {
  gymId: string
  onCreated: (equipmentId: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [type, setType] = useState("")
  const [brand, setBrand] = useState("")
  const [model, setModel] = useState("")
  const [unit, setUnit] = useState<Unit>("kg")
  const [ratio, setRatio] = useState("")
  const [pulleys, setPulleys] = useState("")
  const [error, setError] = useState("")

  function reset() {
    setType("")
    setBrand("")
    setModel("")
    setUnit("kg")
    setRatio("")
    setPulleys("")
    setError("")
  }

  function save() {
    if (!type.trim() || !brand.trim() || !model.trim()) {
      setError("Completa tipo, marca y modelo.")
      return
    }
    let mechanicalRatio: number | undefined
    if (ratio.trim()) {
      const parsed = parsePositive(ratio)
      if (parsed == null) {
        setError("La relación mecánica tiene que ser un número mayor que 0, o quedar vacía.")
        return
      }
      mechanicalRatio = parsed
    }
    let pulleyCount: number | undefined
    if (pulleys.trim()) {
      const parsed = parseReps(pulleys)
      if (parsed == null) {
        setError("Las poleas tienen que ser un entero mayor que 0, o quedar vacías.")
        return
      }
      pulleyCount = parsed
    }
    const id = addEquipment({
      type: type.trim(),
      brand: brand.trim(),
      model: model.trim(),
      unit,
      gymId,
      mechanicalRatio,
      pulleyCount,
      ratioNote: mechanicalRatio
        ? "Relación ingresada en este dispositivo. Es un dato del modelo, no una medida de fuerza real."
        : undefined,
    })
    toast.success("Implemento guardado")
    onCreated(id)
    setOpen(false)
    reset()
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (next) reset()
      }}
    >
      <SheetTrigger asChild>
        <Button type="button" variant="outline" size="lg" className="w-full">
          <PlusIcon data-icon="inline-start" />
          Agregar implemento
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="max-h-[85svh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Nuevo implemento</SheetTitle>
          <SheetDescription>
            Queda asociado al gimnasio de esta sesión. Si no conoces la relación mecánica, déjala vacía.
          </SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-4 px-4 pb-4">
          <FieldGroup>
            <Field data-invalid={error ? true : undefined}>
              <FieldLabel htmlFor="equipo-tipo">Tipo</FieldLabel>
              <Input id="equipo-tipo" value={type} onChange={(event) => setType(event.target.value)} className="min-h-11" />
            </Field>
            <Field>
              <FieldLabel htmlFor="equipo-marca">Marca</FieldLabel>
              <Input id="equipo-marca" value={brand} onChange={(event) => setBrand(event.target.value)} className="min-h-11" />
            </Field>
            <Field>
              <FieldLabel htmlFor="equipo-modelo">Modelo</FieldLabel>
              <Input id="equipo-modelo" value={model} onChange={(event) => setModel(event.target.value)} className="min-h-11" />
            </Field>
            <Field>
              <FieldLabel>Unidad</FieldLabel>
              <ToggleGroup
                type="single"
                variant="outline"
                size="lg"
                value={unit}
                onValueChange={(value) => {
                  if (value === "kg" || value === "lb") setUnit(value)
                }}
                aria-label="Unidad"
                className="w-full"
              >
                <ToggleGroupItem value="kg" className="flex-1">kg</ToggleGroupItem>
                <ToggleGroupItem value="lb" className="flex-1">lb</ToggleGroupItem>
              </ToggleGroup>
            </Field>
            <Field data-invalid={error ? true : undefined}>
              <FieldLabel htmlFor="equipo-relacion">Relación mecánica</FieldLabel>
              <Input
                id="equipo-relacion"
                inputMode="decimal"
                value={ratio}
                onChange={(event) => setRatio(event.target.value)}
                aria-label="Relación mecánica"
                className="min-h-11"
              />
              <FieldDescription>
                Opcional. La carga estimada será el peso en kg multiplicado por este número. Las poleas no se aplican aparte.
              </FieldDescription>
            </Field>
            <Field>
              <FieldLabel htmlFor="equipo-poleas">Poleas</FieldLabel>
              <Input
                id="equipo-poleas"
                inputMode="numeric"
                value={pulleys}
                onChange={(event) => setPulleys(event.target.value)}
                className="min-h-11"
              />
            </Field>
            {error ? <FieldError>{error}</FieldError> : null}
          </FieldGroup>
          <Button type="button" size="lg" onClick={save}>
            Guardar implemento
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}
