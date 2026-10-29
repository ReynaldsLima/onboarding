import type { FormField } from "@/lib/form-config";

const WEEKDAY_LABELS: Record<string, string> = {
  mon: "Seg",
  tue: "Ter",
  wed: "Qua",
  thu: "Qui",
  fri: "Sex",
  sat: "Sáb",
  sun: "Dom",
};

function Empty() {
  return <span className="text-muted">Não respondido</span>;
}

function optionLabel(field: FormField, value: string): string {
  return field.options?.find((opt) => opt.value === value)?.label ?? value;
}

export function AnswerValue({
  field,
  value,
}: {
  field: FormField;
  value: unknown;
}) {
  switch (field.type) {
    case "text": {
      const text = value as string | undefined;
      return text ? <span>{text}</span> : <Empty />;
    }

    case "text-repeatable": {
      const items = (value as string[] | undefined)?.filter(Boolean) ?? [];
      if (items.length === 0) return <Empty />;
      return (
        <ul className="list-disc pl-5">
          {items.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      );
    }

    case "yes-no": {
      if (value === true) return <span>Sim</span>;
      if (value === false) return <span>Não</span>;
      return <Empty />;
    }

    case "single-select": {
      const current = value as { value: string; other?: string } | undefined;
      if (!current?.value) return <Empty />;
      const label = optionLabel(field, current.value);
      return (
        <span>
          {label}
          {current.value === "other" && current.other ? `: ${current.other}` : ""}
        </span>
      );
    }

    case "multi-select": {
      const current = value as { value: string[]; other?: string } | undefined;
      if (!current?.value || current.value.length === 0) return <Empty />;
      const labels = current.value.map((v) => optionLabel(field, v));
      return (
        <span>
          {labels.join(", ")}
          {current.value.includes("other") && current.other
            ? `: ${current.other}`
            : ""}
        </span>
      );
    }

    case "weekday-schedule": {
      const schedule = value as
        | { days: string[]; start: string | null; end: string | null }
        | undefined;
      if (!schedule || schedule.days.length === 0) return <Empty />;
      const days = schedule.days.map((d) => WEEKDAY_LABELS[d] ?? d).join(", ");
      const hours =
        schedule.start && schedule.end
          ? ` · ${schedule.start} às ${schedule.end}`
          : "";
      return (
        <span>
          {days}
          {hours}
        </span>
      );
    }

    default:
      return <Empty />;
  }
}
