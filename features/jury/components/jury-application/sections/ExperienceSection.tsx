"use client";

import type { ChangeEventHandler } from "react";
import { categories } from "@/data/home";
import FieldShell from "@/features/jury/components/jury-application/fields/FieldShell";
import TextInput from "@/features/jury/components/jury-application/fields/TextInput";
import TextareaField from "@/features/jury/components/jury-application/fields/TextareaField";

export default function ExperienceSection({
  hasPreviousJudging,
  isPastWinner,
  selectedExpertise,
  onPreviousJudgingChange,
  onPastWinnerChange,
  onExpertiseChange,
}: {
  hasPreviousJudging: string;
  isPastWinner: string;
  selectedExpertise: string[];
  onPreviousJudgingChange: (value: string) => void;
  onPastWinnerChange: (value: string) => void;
  onExpertiseChange: ChangeEventHandler<HTMLInputElement>;
}) {
  return (
    <div className="border-b border-[var(--border-default)] pb-[var(--space-lg)]">
      <p className="text-[clamp(0.65rem,1vw,0.75rem)] font-medium uppercase tracking-[0.2em] text-[var(--color-hover)]">
        Experience
      </p>

      <div className="mt-[var(--space-md)] space-y-[var(--space-md)]">
        <FieldShell
          label="Previous Judging Experience"
          hint="If yes, tell us where, when, and in what format you served."
          required
        >
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { value: "yes", label: "Yes" },
              { value: "no", label: "No" },
            ].map((item) => (
              <label
                key={item.value}
                className="flex cursor-pointer items-center gap-3 rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--color-white)] px-[var(--space-sm)] py-[var(--space-sm)] text-sm text-[var(--color-ink)] transition hover:border-[var(--color-hover)] hover:bg-[var(--color-mist)]"
              >
                <input
                  type="radio"
                  name="previousJudgingExperience"
                  value={item.value}
                  checked={hasPreviousJudging === item.value}
                  onChange={() => onPreviousJudgingChange(item.value)}
                  className="h-4 w-4 accent-[var(--color-hover)]"
                />
                <span>{item.label}</span>
              </label>
            ))}
          </div>
        </FieldShell>

        {hasPreviousJudging === "yes" ? (
          <TextareaField
            label="Judging Experience Details"
            name="previousJudgingDetails"
            placeholder="Describe the championship, event, year, and judging format."
            required
          />
        ) : null}

        <FieldShell
          label="Are you a past IBPA Championship winner?"
          hint="If yes, include the year of your title."
        >
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { value: "yes", label: "Yes" },
              { value: "no", label: "No" },
            ].map((item) => (
              <label
                key={item.value}
                className="flex cursor-pointer items-center gap-3 rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--color-white)] px-[var(--space-sm)] py-[var(--space-sm)] text-sm text-[var(--color-ink)] transition hover:border-[var(--color-hover)] hover:bg-[var(--color-mist)]"
              >
                <input
                  type="radio"
                  name="pastWinner"
                  value={item.value}
                  checked={isPastWinner === item.value}
                  onChange={() => onPastWinnerChange(item.value)}
                  className="h-4 w-4 accent-[var(--color-hover)]"
                />
                <span>{item.label}</span>
              </label>
            ))}
          </div>
        </FieldShell>

        {isPastWinner === "yes" ? (
          <TextInput
            label="Winning Year"
            name="pastWinnerYear"
            type="number"
            min={2000}
            max={2035}
            placeholder="2025"
          />
        ) : null}

        <FieldShell
          label="Areas of Expertise"
          hint="Choose every direction you are qualified to evaluate."
          required
        >
          <div className="grid gap-3 sm:grid-cols-2">
            {categories.map((category) => (
              <label
                key={category}
                className="flex cursor-pointer items-center gap-3 rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--color-white)] px-[var(--space-sm)] py-[var(--space-sm)] text-sm text-[var(--color-ink)] transition hover:border-[var(--color-hover)] hover:bg-[var(--color-mist)]"
              >
                <input
                  type="checkbox"
                  name="expertise"
                  value={category}
                  checked={selectedExpertise.includes(category)}
                  onChange={onExpertiseChange}
                  className="h-4 w-4 rounded accent-[var(--color-hover)]"
                />
                <span>{category}</span>
              </label>
            ))}
          </div>
        </FieldShell>
      </div>
    </div>
  );
}
