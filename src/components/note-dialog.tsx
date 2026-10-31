import { useState } from "react"
import { StickyNoteIcon } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { hasNoteContent, NoteFields } from "@/components/note-fields"
import type { NoteAnchor, NotePreset } from "@/domain/types"
import { addNote } from "@/storage/store"

export function NoteDialog({
  triggerLabel,
  defaultAnchor,
  anchors,
  sessionId,
  exerciseId,
  routineId,
}: {
  triggerLabel: string
  defaultAnchor: NoteAnchor
  anchors: NoteAnchor[]
  sessionId?: string
  exerciseId?: string
  routineId?: string
}) {
  const [open, setOpen] = useState(false)
  const [presets, setPresets] = useState<NotePreset[]>([])
  const [text, setText] = useState("")
  const [anchor, setAnchor] = useState<NoteAnchor>(defaultAnchor)
  const [error, setError] = useState("")

  function save(event: { preventDefault: () => void }) {
    if (!hasNoteContent(presets, text)) {
      event.preventDefault()
      setError("Escribe una nota o elige una opción rápida.")
      return
    }
    addNote({
      presets,
      text: text.trim(),
      anchor,
      sessionId: anchor === "routine" ? undefined : sessionId,
      exerciseId: anchor === "exercise" ? exerciseId : undefined,
      routineId: anchor === "routine" ? routineId : undefined,
    })
    toast.success("Nota guardada")
    setOpen(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        if (next) {
          setPresets([])
          setText("")
          setAnchor(defaultAnchor)
          setError("")
        }
      }}
    >
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="lg" className="w-full">
          <StickyNoteIcon data-icon="inline-start" />
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nota</DialogTitle>
          <DialogDescription>
            Puedes anclarla al ejercicio, al entrenamiento o a la rutina. Después se ve en el historial.
          </DialogDescription>
        </DialogHeader>
        <NoteFields
          presets={presets}
          onPresets={setPresets}
          text={text}
          onText={setText}
          anchor={anchor}
          onAnchor={setAnchor}
          anchors={anchors}
          error={error}
        />
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" size="lg" onClick={save}>
              Guardar nota
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
