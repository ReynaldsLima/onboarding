import type { FormField } from "@/lib/form-config";

export function TextRepeatableField({
  field,
  value,
  onChange,
}: {
  field: FormField;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  const items = (value as string[] | undefined) ?? [""];

  function updateItem(index: number, newValue: string) {
    const next = [...items];
    next[index] = newValue;
    onChange(next);
  }

  function removeItem(index: number) {
    const next = items.filter((_, i) => i !== index);
    onChange(next.length > 0 ? next : [""]);
  }

  function addItem() {
    onChange([...items, ""]);
  }

  return (
    <div className="flex flex-col gap-2">
      {items.map((item, index) => (
        <div key={index} className="flex gap-2">
          <input
            type="text"
            value={item}
            onChange={(e) => updateItem(index, e.target.value)}
            placeholder={field.label}
            className="w-full rounded-lg border border-muted/40 bg-surface px-4 py-2.5 text-text outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
          />
          <button
            type="button"
            onClick={() => removeItem(index)}
            className="shrink-0 rounded-lg px-3 text-muted hover:text-error"
            aria-label="Remover"
          >
            ✕
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addItem}
        className="self-start text-sm font-medium text-accent hover:text-accent-hover"
      >
        + Adicionar outro
      </button>
    </div>
  );
}
