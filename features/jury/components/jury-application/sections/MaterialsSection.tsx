"use client";

import UploadField from "@/features/applications/components/application-form/fields/UploadField";
import FieldShell from "@/features/jury/components/jury-application/fields/FieldShell";
import TextInput from "@/features/jury/components/jury-application/fields/TextInput";
import TextareaField from "@/features/jury/components/jury-application/fields/TextareaField";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { Upload } from "lucide-react";

export default function MaterialsSection() {
  const { language } = useLanguage();
  const copy = {
    en: {
      section: "Materials & Disclosure",
      certLabel: "Professional Certifications",
      certHint: "Upload up to 5 PDF or image files.",
      certUpload: "Upload certification files",
      certUploadHint: "JPG, PNG, or PDF. Up to 5 files.",
      bioLabel: "Professional Bio",
      bioPlaceholder:
        "Share your background, achievements, and role in the industry. This bio can be published on the jury page if approved.",
      bioHint: "Target length: up to 300 words.",
      photoLabel: "Profile Photo",
      photoHint: "Upload one professional JPG or PNG image for your jury profile.",
      photoUpload: "Upload profile image",
      photoUploadHint: "Use a clear professional portrait in JPG or PNG.",
      website: "Professional Website / LinkedIn",
      conflictLabel: "Conflict of Interest Disclosure",
      conflictPlaceholder:
        "Disclose any relationships with nominees, schools, salons, brands, or other participants.",
      motivationLabel: "Why do you want to serve as a judge?",
      motivationPlaceholder:
        "Describe what you would bring to the IBPA jury panel and why the role matters to you.",
      motivationHint: "Target length: up to 200 words.",
      confidentiality:
        "I agree to keep all jury deliberations, candidate information, and judging materials confidential.",
    },
    ru: {
      section: "Материалы и раскрытие информации",
      certLabel: "Профессиональные сертификаты",
      certHint: "Загрузите до 5 файлов PDF или изображений.",
      certUpload: "Загрузить файлы сертификатов",
      certUploadHint: "JPG, PNG или PDF. До 5 файлов.",
      bioLabel: "Профессиональная биография",
      bioPlaceholder:
        "Опишите ваш опыт, достижения и роль в индустрии. Эта биография может быть опубликована на странице жюри после одобрения.",
      bioHint: "Рекомендуемый объем: до 300 слов.",
      photoLabel: "Фото профиля",
      photoHint: "Загрузите одно профессиональное фото JPG или PNG для профиля жюри.",
      photoUpload: "Загрузить фото профиля",
      photoUploadHint: "Используйте четкий профессиональный портрет в JPG или PNG.",
      website: "Профессиональный сайт / LinkedIn",
      conflictLabel: "Раскрытие конфликта интересов",
      conflictPlaceholder:
        "Укажите любые связи с номинантами, школами, салонами, брендами или другими участниками.",
      motivationLabel: "Почему вы хотите быть судьей?",
      motivationPlaceholder:
        "Опишите, какой вклад вы можете внести в состав жюри IBPA и почему эта роль важна для вас.",
      motivationHint: "Рекомендуемый объем: до 200 слов.",
      confidentiality:
        "Я соглашаюсь сохранять конфиденциальность всех обсуждений жюри, информации о кандидатах и материалов оценивания.",
    },
    ua: {
      section: "Матеріали та розкриття інформації",
      certLabel: "Професійні сертифікати",
      certHint: "Завантажте до 5 файлів PDF або зображень.",
      certUpload: "Завантажити файли сертифікатів",
      certUploadHint: "JPG, PNG або PDF. До 5 файлів.",
      bioLabel: "Професійна біографія",
      bioPlaceholder:
        "Опишіть ваш досвід, досягнення та роль в індустрії. Цю біографію можуть опублікувати на сторінці журі після схвалення.",
      bioHint: "Рекомендований обсяг: до 300 слів.",
      photoLabel: "Фото профілю",
      photoHint: "Завантажте одне професійне фото JPG або PNG для профілю журі.",
      photoUpload: "Завантажити фото профілю",
      photoUploadHint: "Використовуйте чіткий професійний портрет у JPG або PNG.",
      website: "Професійний сайт / LinkedIn",
      conflictLabel: "Розкриття конфлікту інтересів",
      conflictPlaceholder:
        "Вкажіть будь-які зв’язки з номінантами, школами, салонами, брендами або іншими учасниками.",
      motivationLabel: "Чому ви хочете бути суддею?",
      motivationPlaceholder:
        "Опишіть, який внесок ви можете зробити до складу журі IBPA і чому ця роль важлива для вас.",
      motivationHint: "Рекомендований обсяг: до 200 слів.",
      confidentiality:
        "Я погоджуюся зберігати конфіденційність усіх обговорень журі, інформації про кандидатів і матеріалів оцінювання.",
    },
  }[language];

  return (
    <div className="border-b border-(--border-default) pb-(--space-lg)">
      <p className="text-[clamp(0.65rem,1vw,0.75rem)] font-medium uppercase tracking-[0.2em] text-(--color-hover)">
        {copy.section}
      </p>

      <div className="mt-(--space-md) space-y-(--space-md)">
        <FieldShell
          label={copy.certLabel}
          hint={copy.certHint}
          required
        >
          <label className="flex cursor-pointer flex-col rounded-[var(--radius-sm)] border-[1.5px] border-dashed border-(--border-default) bg-(--surface) p-(--space-md) transition hover:border-(--color-hover) hover:bg-(--surface-tint)">
            <span className="text-sm font-medium text-(--color-ink)">{copy.certUpload}</span>
            <span className="mt-1 text-xs leading-5 text-(--color-ink-soft)">
              {copy.certUploadHint}
            </span>
            <input
              type="file"
              name="certifications"
              accept=".pdf,.jpg,.jpeg,.png"
              multiple
              required
              className="mt-3 block w-full text-sm text-(--color-ink) file:mr-(--space-sm) file:rounded-full file:border-0 file:bg-(--color-hover) file:px-(--space-sm) file:py-(--space-xs) file:text-xs file:font-medium file:uppercase file:tracking-[0.16em] file:text-white"
            />
          </label>
        </FieldShell>

        <TextareaField
          label={copy.bioLabel}
          name="professionalBio"
          placeholder={copy.bioPlaceholder}
          maxLength={2200}
          hint={copy.bioHint}
          required
        />

        <FieldShell
          label={copy.photoLabel}
          hint={copy.photoHint}
          required
        >
          <label className="flex cursor-pointer flex-col rounded-[var(--radius-sm)] border-[1.5px] border-dashed border-(--border-default) bg-(--surface) p-(--space-md) transition hover:border-(--color-hover) hover:bg-(--surface-tint)">
            <span className="text-sm font-medium text-(--color-ink)">{copy.photoUpload}</span>
            <span className="mt-1 text-xs leading-5 text-(--color-ink-soft)">
              {copy.photoUploadHint}
            </span>
            <input
              type="file"
              name="profilePhoto"
              accept=".jpg,.jpeg,.png"
              required
              className="mt-3 block w-full text-sm text-(--color-ink) file:mr-(--space-sm) file:rounded-full file:border-0 file:bg-(--color-hover) file:px-(--space-sm) file:py-(--space-xs) file:text-xs file:font-medium file:uppercase file:tracking-[0.16em] file:text-white"
            />
          </label>
        </FieldShell>

        <TextInput
          label={copy.website}
          name="professionalWebsite"
          type="url"
          placeholder="https://"
        />

        <TextareaField
          label={copy.conflictLabel}
          name="conflictDisclosure"
          placeholder={copy.conflictPlaceholder}
          required
        />

        <TextareaField
          label={copy.motivationLabel}
          name="motivation"
          placeholder={copy.motivationPlaceholder}
          maxLength={1500}
          hint={copy.motivationHint}
          required
        />

        <label className="flex items-start gap-3 rounded-sm border border-(--border-default) bg-(--color-white) px-(--space-sm) py-(--space-sm) text-sm text-(--color-ink)">
          <input
            type="checkbox"
            name="confidentialityAgreement"
            value="yes"
            required
            className="mt-1 h-4 w-4 rounded accent-(--color-hover)"
          />
          <span className="leading-6 text-(--color-ink-soft)">
            {copy.confidentiality}
          </span>
        </label>
      </div>
    </div>
  );
}
