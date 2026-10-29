import { REQUIRED_FIELD_IDS } from "./form-config";

export type Status = "not_started" | "in_progress" | "completed";

function isNonEmpty(value: unknown): boolean {
  if (value === undefined || value === null || value === "") return false;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

export function computeStatus(answers: Record<string, unknown>): Status {
  if (Object.keys(answers).length === 0) return "not_started";

  const allRequiredFilled = REQUIRED_FIELD_IDS.every((id) =>
    isNonEmpty(answers[id]),
  );

  return allRequiredFilled ? "completed" : "in_progress";
}
