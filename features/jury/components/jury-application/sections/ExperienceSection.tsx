"use client";

import type { ChangeEventHandler } from "react";
import { categories } from "@/data/home";
import FieldShell, { inputClassName } from "@/features/jury/components/jury-application/fields/FieldShell";
import TextareaField from "@/features/jury/components/jury-application/fields/TextareaField";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function ExperienceSection({
  hasPreviousJudging,
  selectedExpertise,
  onPreviousJudgingChange,
  onExpertiseChange,
  isIbpaMember,
  onIbpaMemberChange,
}: {
  hasPreviousJudging: string;
  selectedExpertise: string[];
  onPreviousJudgingChange: (value: string) => void;
  onExpertiseChange: ChangeEventHandler<HTMLInputElement>;
  isIbpaMember: string;
  onIbpaMemberChange: (value: string) => void;
}) {
  const { language } = useLanguage();
  const copy = {
    en: {
      section: "Experience",
      previousJudging: "Previous Judging Experience",
      previousJudgingHint: "If yes, tell us where, when, and in what format you served.",
      yes: "Yes",
      no: "No",
      details: "Judging Experience Details",
      detailsPlaceholder: "Describe the award, event, year, and judging format.",
      expertise: "Areas of Expertise",
      expertiseHint: "Choose every category you are qualified to evaluate.",
      ibpaMember: "Are you an accredited IBPA member?",
      ibpaNumber: "IBPA ID",
      ibpaNumberPlaceholder: "e.g. CERT-2026-XXXXX",
      ibpaNumberHint: "Enter the certificate ID of an accredited IBPA member.",
    },
    ru: {
      section: "Опыт",
      previousJudging: "Опыт судейства",
      previousJudgingHint: "Если да, укажите где, когда и в каком формате вы судили.",
      yes: "Да",
      no: "Нет",
      details: "Детали опыта судейства",
      detailsPlaceholder: "Опишите премию, событие, год и формат судейства.",
      expertise: "Области экспертизы",
      expertiseHint: "Выберите все категории, которые вы можете оценивать.",
      ibpaMember: "Являетесь ли вы аккредитованным участником IBPA?",
      ibpaNumber: "ID IBPA",
      ibpaNumberPlaceholder: "Пример: CERT-2026-XXXXX",
      ibpaNumberHint: "Введите ID сертификата аккредитованного участника IBPA.",
    },
    ua: {
      section: "Досвід",
      previousJudging: "Досвід суддівства",
      previousJudgingHint: "Якщо так, вкажіть де, коли і в якому форматі ви судили.",
      yes: "Так",
      no: "Ні",
      details: "Деталі досвіду суддівства",
      detailsPlaceholder: "Опишіть премію, подію, рік і формат суддівства.",
      expertise: "Сфери експертизи",
      expertiseHint: "Оберіть усі категорії, які ви можете оцінювати.",
      ibpaMember: "Чи є ви акредитованим учасником IBPA?",
      ibpaNumber: "ID IBPA",
      ibpaNumberPlaceholder: "Приклад: CERT-2026-XXXXX",
      ibpaNumberHint: "Введіть ID сертифіката акредитованого учасника IBPA.",
    },
  }[language];

  return (
    <div className="border-b border-[var(--border-default)] pb-[var(--space-lg)]">
      <p className="text-[clamp(0.65rem,1vw,0.75rem)] font-medium uppercase tracking-[0.2em] text-[var(--color-hover-accent)]">
        {copy.section}
      </p>

      <div className="mt-[var(--space-md)] space-y-[var(--space-md)]">
        <FieldShell
          label={copy.previousJudging}
          hint={copy.previousJudgingHint}
          required
        >
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { value: "yes", label: copy.yes },
              { value: "no", label: copy.no },
            ].map((item) => (
              <label
                key={item.value}
                className="flex cursor-pointer items-center gap-3 rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--color-white)] px-[var(--space-sm)] py-[var(--space-sm)] text-sm text-[var(--color-ink)] transition hover:border-[var(--color-hover-accent)] hover:bg-[var(--color-mist)]"
              >
                <input
                  type="radio"
                  name="previousJudgingExperience"
                  value={item.value}
                  checked={hasPreviousJudging === item.value}
                  onChange={() => onPreviousJudgingChange(item.value)}
                  className="h-4 w-4 accent-[var(--color-hover-accent)]"
                />
                <span>{item.label}</span>
              </label>
            ))}
          </div>
        </FieldShell>

        {hasPreviousJudging === "yes" ? (
          <TextareaField
            label={copy.details}
            name="previousJudgingDetails"
            placeholder={copy.detailsPlaceholder}
            required
          />
        ) : null}

        <FieldShell
          label={copy.expertise}
          hint={copy.expertiseHint}
          required
        >
          <div className="grid gap-3 sm:grid-cols-2">
            {categories.map((category) => (
              <label
                key={category}
                className="flex cursor-pointer items-center gap-3 rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--color-white)] px-[var(--space-sm)] py-[var(--space-sm)] text-sm text-[var(--color-ink)] transition hover:border-[var(--color-hover-accent)] hover:bg-[var(--color-mist)]"
              >
                <input
                  type="checkbox"
                  name="expertise"
                  value={category}
                  checked={selectedExpertise.includes(category)}
                  onChange={onExpertiseChange}
                  className="h-4 w-4 rounded accent-[var(--color-hover-accent)]"
                />
                <span>{category}</span>
              </label>
            ))}
          </div>
        </FieldShell>

        <FieldShell label={copy.ibpaMember} required>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { value: "yes", label: copy.yes },
              { value: "no", label: copy.no },
            ].map((item) => (
              <label
                key={item.value}
                className="flex cursor-pointer items-center gap-3 rounded-[var(--radius-sm)] border border-[var(--border-default)] bg-[var(--color-white)] px-[var(--space-sm)] py-[var(--space-sm)] text-sm text-[var(--color-ink)] transition hover:border-[var(--color-hover-accent)] hover:bg-[var(--color-mist)]"
              >
                <input
                  type="radio"
                  name="ibpaAssociationMember"
                  value={item.value}
                  checked={isIbpaMember === item.value}
                  onChange={() => onIbpaMemberChange(item.value)}
                  className="h-4 w-4 accent-[var(--color-hover-accent)]"
                />
                <span>{item.label}</span>
              </label>
            ))}
          </div>
        </FieldShell>

        {isIbpaMember === "yes" ? (
          <FieldShell label={copy.ibpaNumber} hint={copy.ibpaNumberHint} required>
            <input
              type="text"
              name="ibpaNumber"
              placeholder={copy.ibpaNumberPlaceholder}
              required
              className={inputClassName}
            />
          </FieldShell>
        ) : null}
      </div>
    </div>
  );
}
