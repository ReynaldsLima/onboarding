import type { FormField } from "@/lib/form-config";

type WeekdayScheduleValue = {
  days: string[];
  start: string | null;
  end: string | null;
};

const WEEKDAYS = [
  { value: "mon", label: "Seg" },
  { value: "tue", label: "Ter" },
  { value: "wed", label: "Qua" },
  { value: "thu", label: "Qui" },
  { value: "fri", label: "Sex" },
  { value: "sat", label: "Sáb" },
  { value: "sun", label: "Dom" },
];

export function WeekdayScheduleField({
  value,
  onChange,
}: {
  field: FormField;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  const current = (value as WeekdayScheduleValue | undefined) ?? {
    days: [],
    start: null,
    end: null,
  };

  function toggleDay(day: string) {
    const days = current.days.includes(day)
      ? current.days.filter((d) => d !== day)
      : [...current.days, day];
    onChange({ ...current, days });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {WEEKDAYS.map((day) => (
          <button
            key={day.value}
            type="button"
            onClick={() => toggleDay(day.value)}
            className={`h-9 w-11 rounded-full text-sm font-medium transition-colors ${
              current.days.includes(day.value)
                ? "bg-accent text-white"
                : "bg-surface text-text border border-muted/40 hover:border-accent"
            }`}
          >
            {day.label}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <input
          type="time"
          value={current.start ?? ""}
          onChange={(e) => onChange({ ...current, start: e.target.value })}
          className="rounded-lg border border-muted/40 bg-surface px-3 py-2 text-text outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
        />
        <span className="text-muted">até</span>
        <input
          type="time"
          value={current.end ?? ""}
          onChange={(e) => onChange({ ...current, end: e.target.value })}
          className="rounded-lg border border-muted/40 bg-surface px-3 py-2 text-text outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
        />
      </div>
    </div>
  );
}
