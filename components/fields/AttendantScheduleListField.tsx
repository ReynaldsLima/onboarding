import type { FormField } from "@/lib/form-config";
import { ScheduleInput, type ScheduleValue } from "./ScheduleInput";

export type AttendantSchedule = {
  name: string;
  schedule: ScheduleValue;
};

const EMPTY_SCHEDULE: ScheduleValue = { days: [], start: null, end: null };
const EMPTY_ENTRY: AttendantSchedule = { name: "", schedule: EMPTY_SCHEDULE };

export function AttendantScheduleListField({
  value,
  onChange,
}: {
  field: FormField;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  const entries = (value as AttendantSchedule[] | undefined) ?? [EMPTY_ENTRY];

  function updateEntry(index: number, entry: AttendantSchedule) {
    const next = [...entries];
    next[index] = entry;
    onChange(next);
  }

  function removeEntry(index: number) {
    const next = entries.filter((_, i) => i !== index);
    onChange(next.length > 0 ? next : [EMPTY_ENTRY]);
  }

  function addEntry() {
    onChange([...entries, EMPTY_ENTRY]);
  }

  return (
    <div className="flex flex-col gap-5">
      {entries.map((entry, index) => (
        <div
          key={index}
          className="flex flex-col gap-3 rounded-lg border border-muted/30 p-4"
        >
          <div className="flex gap-2">
            <input
              type="text"
              value={entry.name}
              onChange={(e) =>
                updateEntry(index, { ...entry, name: e.target.value })
              }
              placeholder="Nome do atendente"
              className="w-full rounded-lg border border-muted/40 bg-surface px-4 py-2.5 text-text outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
            />
            <button
              type="button"
              onClick={() => removeEntry(index)}
              className="shrink-0 rounded-lg px-3 text-muted hover:text-error"
              aria-label="Remover"
            >
              ✕
            </button>
          </div>
          <ScheduleInput
            value={entry.schedule}
            onChange={(schedule) => updateEntry(index, { ...entry, schedule })}
          />
        </div>
      ))}
      <button
        type="button"
        onClick={addEntry}
        className="self-start text-sm font-medium text-accent hover:text-accent-hover"
      >
        + Adicionar outro
      </button>
    </div>
  );
}
