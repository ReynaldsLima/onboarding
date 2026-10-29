import type { FormField } from "@/lib/form-config";
import { ScheduleInput, type ScheduleValue } from "./ScheduleInput";

export function WeekdayScheduleField({
  value,
  onChange,
}: {
  field: FormField;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  const current = (value as ScheduleValue | undefined) ?? {
    days: [],
    start: null,
    end: null,
  };

  return <ScheduleInput value={current} onChange={onChange} />;
}
