import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { ANCHOR_LABELS, NOTE_PRESETS } from "@/domain/constants"
import type { NoteAnchor, NotePreset } from "@/domain/types"

export function hasNoteContent(presets: NotePreset[], text: string): boolean {
  return presets.length > 0 || text.trim().length > 0
}

export function NoteFields({
  presets,
  onPresets,
  text,
  onText,
  anchor,
  onAnchor,
  anchors,
  error,
}: {
  presets: NotePreset[]
  onPresets: (presets: NotePreset[]) => void
  text: string
  onText: (text: string) => void
  anchor: NoteAnchor
  onAnchor: (anchor: NoteAnchor) => void
  anchors: NoteAnchor[]
  error?: string
}) {
  return (
    <FieldGroup>
      <Field data-invalid={error ? true : undefined}>
        <FieldLabel>Opciones rápidas</FieldLabel>
        <ToggleGroup
          type="multiple"
          variant="outline"
          size="lg"
          value={presets}
          onValueChange={(value) => {
            onPresets(
              value.filter((item): item is NotePreset =>
                NOTE_PRESETS.some((preset) => preset.id === item),
              ),
            )
          }}
          aria-label="Opciones rápidas"
          className="w-full flex-wrap"
        >
          {NOTE_PRESETS.map((preset) => (
            <ToggleGroupItem key={preset.id} value={preset.id} className="min-h-12 whitespace-normal">
              {preset.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </Field>
      <Field data-invalid={error ? true : undefined}>
        <FieldLabel htmlFor="nota-texto">Texto</FieldLabel>
        <Textarea
          id="nota-texto"
          value={text}
          onChange={(event) => onText(event.target.value)}
          aria-invalid={error ? true : undefined}
          placeholder="Qué pasó en esta serie o en el día"
          rows={3}
        />
        {error ? <FieldError>{error}</FieldError> : null}
      </Field>
      {anchors.length > 1 ? (
        <Field>
          <FieldLabel>Anclar nota a</FieldLabel>
          <ToggleGroup
            type="single"
            variant="outline"
            size="lg"
            value={anchor}
            onValueChange={(value) => {
              if (value === "exercise" || value === "session" || value === "routine") onAnchor(value)
            }}
            aria-label="Anclar nota a"
            className="w-full flex-wrap"
          >
            {anchors.map((item) => (
              <ToggleGroupItem key={item} value={item} className="min-h-12 whitespace-normal">
                {ANCHOR_LABELS[item]}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </Field>
      ) : null}
    </FieldGroup>
  )
}
