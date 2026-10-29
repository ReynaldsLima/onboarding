import type { FormField } from "@/lib/form-config";

export function TextField({
  field,
  value,
  onChange,
}: {
  field: FormField;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  return (
    <input
      type="text"
      value={(value as string) ?? ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={field.label}
      className="w-full rounded-lg border border-muted/40 bg-surface px-4 py-2.5 text-text outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
    />
  );
}
