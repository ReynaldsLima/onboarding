import type { FormField } from "@/lib/form-config";

export function YesNoField({
  value,
  onChange,
}: {
  field: FormField;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  const current = value as boolean | null | undefined;

  return (
    <div className="flex gap-2">
      {[
        { label: "Sim", val: true },
        { label: "Não", val: false },
      ].map((opt) => (
        <button
          key={opt.label}
          type="button"
          onClick={() => onChange(opt.val)}
          className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${
            current === opt.val
              ? "bg-accent text-white"
              : "bg-surface text-text border border-muted/40 hover:border-accent"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
