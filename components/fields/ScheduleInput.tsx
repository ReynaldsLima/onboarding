export type ScheduleValue = {
  days: string[];
  start: string | null;
  end: string | null;
};

export const WEEKDAYS = [
  { value: "mon", label: "Seg" },
  { value: "tue", label: "Ter" },
  { value: "wed", label: "Qua" },
  { value: "thu", label: "Qui" },
  { value: "fri", label: "Sex" },
  { value: "sat", label: "Sáb" },
  { value: "sun", label: "Dom" },
];

export function ScheduleInput({
  value,
  onChange,
}: {
  value: ScheduleValue;
  onChange: (value: ScheduleValue) => void;
}) {
  function toggleDay(day: string) {
    const days = value.days.includes(day)
      ? value.days.filter((d) => d !== day)
      : [...value.days, day];
    onChange({ ...value, days });
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
              value.days.includes(day.value)
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
          value={value.start ?? ""}
          onChange={(e) => onChange({ ...value, start: e.target.value })}
          className="rounded-lg border border-muted/40 bg-surface px-3 py-2 text-text outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
        />
        <span className="text-muted">até</span>
        <input
          type="time"
          value={value.end ?? ""}
          onChange={(e) => onChange({ ...value, end: e.target.value })}
          className="rounded-lg border border-muted/40 bg-surface px-3 py-2 text-text outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
        />
      </div>
    </div>
  );
}
