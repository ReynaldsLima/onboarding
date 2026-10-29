import type { FormField } from "@/lib/form-config";

type SingleSelectValue = { value: string; other?: string };

export function SingleSelectField({
  field,
  value,
  onChange,
}: {
  field: FormField;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  const current = value as SingleSelectValue | null | undefined;

  function select(optionValue: string) {
    onChange({ value: optionValue, other: current?.other });
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        {field.options?.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => select(opt.value)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              current?.value === opt.value
                ? "bg-accent text-white"
                : "bg-surface text-text border border-muted/40 hover:border-accent"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
      {current?.value === "other" && (
        <input
          type="text"
          value={current.other ?? ""}
          onChange={(e) => onChange({ value: "other", other: e.target.value })}
          placeholder="Descreva"
          className="w-full rounded-lg border border-muted/40 bg-surface px-4 py-2.5 text-text outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
        />
      )}
    </div>
  );
}
