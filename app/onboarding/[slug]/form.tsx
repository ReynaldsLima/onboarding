"use client";

import { useRef, useState } from "react";
import type { FormSection } from "@/lib/form-config";
import { TextField } from "@/components/fields/TextField";
import { TextRepeatableField } from "@/components/fields/TextRepeatableField";
import { YesNoField } from "@/components/fields/YesNoField";
import { SingleSelectField } from "@/components/fields/SingleSelectField";
import { MultiSelectField } from "@/components/fields/MultiSelectField";
import { WeekdayScheduleField } from "@/components/fields/WeekdayScheduleField";

const FIELD_COMPONENTS = {
  text: TextField,
  "text-repeatable": TextRepeatableField,
  "yes-no": YesNoField,
  "single-select": SingleSelectField,
  "multi-select": MultiSelectField,
  "weekday-schedule": WeekdayScheduleField,
};

type SaveState = "idle" | "saving" | "saved" | "error";

export function OnboardingForm({
  slug,
  sections,
  initialAnswers,
}: {
  slug: string;
  sections: FormSection[];
  initialAnswers: Record<string, unknown>;
}) {
  const [answers, setAnswers] = useState(initialAnswers);
  const [saveStates, setSaveStates] = useState<Record<string, SaveState>>({});
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  // Chains every PATCH behind the previous one so two fields edited close
  // together never run overlapping read-modify-write cycles on the server.
  const saveQueue = useRef<Promise<void>>(Promise.resolve());

  function handleChange(fieldId: string, value: unknown) {
    setAnswers((prev) => ({ ...prev, [fieldId]: value }));
    setSaveStates((prev) => ({ ...prev, [fieldId]: "saving" }));

    clearTimeout(timers.current[fieldId]);
    timers.current[fieldId] = setTimeout(() => {
      saveQueue.current = saveQueue.current.then(async () => {
        try {
          const res = await fetch(`/api/onboarding/${slug}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fieldId, value }),
          });
          setSaveStates((prev) => ({
            ...prev,
            [fieldId]: res.ok ? "saved" : "error",
          }));
        } catch {
          setSaveStates((prev) => ({ ...prev, [fieldId]: "error" }));
        }
      });
    }, 500);
  }

  return (
    <div className="flex flex-col gap-12">
      {sections.map((section) => (
        <section key={section.id} className="flex flex-col gap-6">
          <h2 className="text-lg font-semibold text-text">{section.title}</h2>
          {section.fields.map((field) => {
            const Component = FIELD_COMPONENTS[field.type];
            const saveState = saveStates[field.id];
            return (
              <div key={field.id} className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-text">
                  {field.label}
                  {field.required && <span className="text-error"> *</span>}
                </label>
                <Component
                  field={field}
                  value={answers[field.id]}
                  onChange={(value) => handleChange(field.id, value)}
                />
                {saveState === "saving" && (
                  <span className="text-xs text-muted">Salvando...</span>
                )}
                {saveState === "saved" && (
                  <span className="text-xs text-success">Salvo</span>
                )}
                {saveState === "error" && (
                  <span className="text-xs text-error">
                    Não foi possível salvar, tente novamente
                  </span>
                )}
              </div>
            );
          })}
        </section>
      ))}
    </div>
  );
}
