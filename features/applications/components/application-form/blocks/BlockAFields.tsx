"use client";

import { heardAboutOptions } from "@/features/applications/config/application-timeline";
import { countryOptions } from "@/features/applications/config/countries";
import { SelectField, TextField } from "@/features/applications/components/application-form/fields/FormControls";
import UploadField from "@/features/applications/components/application-form/fields/UploadField";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import type {
  ApplicationValues,
  CategoryOption,
  ValidationErrors,
} from "@/features/applications/types/application.types";

export default function BlockAFields({
  values,
  errors,
  categories,
  onChange,
  onFilesChange,
}: {
  values: ApplicationValues;
  errors: ValidationErrors;
  categories: CategoryOption[];
  onChange: (name: string, value: string | string[]) => void;
  onFilesChange: (name: string, files: File[]) => void;
}) {
  const { language } = useLanguage();
  const selectedCategory = categories.find(
    (category) => category.id === String(values.categoryId ?? "")
  );

  const copy = {
    en: {
      fullLegalName: "Full Legal Name",
      fullLegalNamePlaceholder: "Exactly as it should appear on official documents",
      emailAddress: "Email Address",
      phoneWhatsapp: "Phone / WhatsApp",
      countryOfResidence: "Country of Residence",
      selectCountry: "Select country",
      stateProvince: "State / Province",
      city: "City",
      professionalTitle: "Professional Title",
      professionalTitlePlaceholder: "Master Stylist, Educator, Clinic Founder...",
      yearsOfExperience: "Years of Professional Experience",
      yearsOfExperienceHint: "A minimum of 2 years is required.",
      licenseCertification: "Professional License / Certification",
      licenseCertificationHint: "Upload PDF, JPG, or PNG. Maximum 5MB.",
      direction: "Direction",
      selectDirection: "Select direction",
      nomination: "Nomination (within direction)",
      selectNomination: "Select nomination",
      selectDirectionFirst: "Select direction first",
      website: "Professional Website",
      social: "Instagram / Social Media",
      reviews: "Client Reviews - Google / Yelp Link",
      heardAbout: "How did you hear about us?",
      selectOption: "Select an option",
      heardAboutOther: "How did you hear about us? (Other)",
      heardAboutOtherPlaceholder: "Tell us the source",
      heardAboutLabels: {
        instagram: "Instagram",
        facebook: "Facebook",
        email: "Email newsletter",
        referral: "Friend or colleague",
        google: "Google search",
        event: "Event / expo",
        other: "Other",
      },
    },
    ru: {
      fullLegalName: "Полное юридическое имя",
      fullLegalNamePlaceholder: "Как должно быть указано в официальных документах",
      emailAddress: "Email",
      phoneWhatsapp: "Телефон / WhatsApp",
      countryOfResidence: "Страна проживания",
      selectCountry: "Выберите страну",
      stateProvince: "Штат / Регион",
      city: "Город",
      professionalTitle: "Профессиональный статус",
      professionalTitlePlaceholder: "Мастер-стилист, преподаватель, владелец студии...",
      yearsOfExperience: "Стаж профессиональной работы",
      yearsOfExperienceHint: "Требуется минимум 2 года опыта.",
      licenseCertification: "Профессиональная лицензия / сертификат",
      licenseCertificationHint: "Загрузите PDF, JPG или PNG. Максимум 5MB.",
      direction: "Направление",
      selectDirection: "Выберите направление",
      nomination: "Номинация (внутри направления)",
      selectNomination: "Выберите номинацию",
      selectDirectionFirst: "Сначала выберите направление",
      website: "Профессиональный сайт",
      social: "Instagram / соцсети",
      reviews: "Отзывы клиентов - ссылка Google / Yelp",
      heardAbout: "Откуда вы узнали о нас?",
      selectOption: "Выберите вариант",
      heardAboutOther: "Откуда вы узнали о нас? (Другое)",
      heardAboutOtherPlaceholder: "Укажите источник",
      heardAboutLabels: {
        instagram: "Instagram",
        facebook: "Facebook",
        email: "Email-рассылка",
        referral: "Друг или коллега",
        google: "Поиск Google",
        event: "Событие / выставка",
        other: "Другое",
      },
    },
    ua: {
      fullLegalName: "Повне юридичне ім'я",
      fullLegalNamePlaceholder: "Як має бути вказано в офіційних документах",
      emailAddress: "Email",
      phoneWhatsapp: "Телефон / WhatsApp",
      countryOfResidence: "Країна проживання",
      selectCountry: "Оберіть країну",
      stateProvince: "Штат / Регіон",
      city: "Місто",
      professionalTitle: "Професійний статус",
      professionalTitlePlaceholder: "Майстер-стиліст, викладач, власник студії...",
      yearsOfExperience: "Стаж професійної роботи",
      yearsOfExperienceHint: "Потрібно щонайменше 2 роки досвіду.",
      licenseCertification: "Професійна ліцензія / сертифікат",
      licenseCertificationHint: "Завантажте PDF, JPG або PNG. Максимум 5MB.",
      direction: "Напрямок",
      selectDirection: "Оберіть напрямок",
      nomination: "Номінація (всередині напрямку)",
      selectNomination: "Оберіть номінацію",
      selectDirectionFirst: "Спочатку оберіть напрямок",
      website: "Професійний сайт",
      social: "Instagram / соцмережі",
      reviews: "Відгуки клієнтів - посилання Google / Yelp",
      heardAbout: "Звідки ви дізналися про нас?",
      selectOption: "Оберіть варіант",
      heardAboutOther: "Звідки ви дізналися про нас? (Інше)",
      heardAboutOtherPlaceholder: "Вкажіть джерело",
      heardAboutLabels: {
        instagram: "Instagram",
        facebook: "Facebook",
        email: "Email-розсилка",
        referral: "Друг або колега",
        google: "Пошук Google",
        event: "Подія / виставка",
        other: "Інше",
      },
    },
  }[language];

  return (
    <div className="grid gap-5 md:grid-cols-2">
      <TextField
        label="First Name"
        name="firstName"
        value={String(values.firstName ?? "")}
        required
        placeholder="As shown on official documents"
        error={errors.firstName}
        onChange={onChange}
      />

      <TextField
        label="Last Name"
        name="lastName"
        value={String(values.lastName ?? "")}
        required
        placeholder="As shown on official documents"
        error={errors.lastName}
        onChange={onChange}
      />

      <TextField
        label={copy.emailAddress}
        name="email"
        type="email"
        value={String(values.email ?? "")}
        required
        placeholder="name@example.com"
        error={errors.email}
        onChange={onChange}
      />

      <TextField
        label={copy.phoneWhatsapp}
        name="phone"
        type="tel"
        value={String(values.phone ?? "")}
        required
        placeholder="+1 (555) 123-4567"
        error={errors.phone}
        onChange={onChange}
      />

      <SelectField
        label={copy.countryOfResidence}
        name="country"
        value={String(values.country ?? "")}
        required
        placeholder={copy.selectCountry}
        options={countryOptions}
        error={errors.country}
        onChange={onChange}
      />

      {String(values.country ?? "") === "Other" ? (
        <TextField
          label="Country (Other)"
          name="countryOther"
          value={String(values.countryOther ?? "")}
          required
          placeholder="Enter your country"
          error={errors.countryOther}
          onChange={onChange}
        />
      ) : null}

      {String(values.country ?? "") === "USA" ? (
        <TextField
          label={copy.stateProvince}
          name="stateProvince"
          value={String(values.stateProvince ?? "")}
          required
          placeholder="California"
          error={errors.stateProvince}
          onChange={onChange}
        />
      ) : null}

      <TextField
        label={copy.city}
        name="city"
        value={String(values.city ?? "")}
        required
        placeholder="Los Angeles"
        error={errors.city}
        onChange={onChange}
      />

      <TextField
        label={copy.professionalTitle}
        name="professionalTitle"
        value={String(values.professionalTitle ?? "")}
        required
        placeholder={copy.professionalTitlePlaceholder}
        error={errors.professionalTitle}
        onChange={onChange}
      />

      <TextField
        label={copy.yearsOfExperience}
        name="yearsExperience"
        type="number"
        min={2}
        value={String(values.yearsExperience ?? "")}
        required
        placeholder="2"
        error={errors.yearsExperience}
        description={copy.yearsOfExperienceHint}
        onChange={onChange}
      />

      <div className="md:col-span-2">
        <UploadField
          label={copy.licenseCertification}
          name="licenseCertification"
          files={
            Array.isArray(values.licenseCertification)
              ? values.licenseCertification.filter(
                  (item): item is File => item instanceof File
                )
              : []
          }
          required
          multiple={false}
          accept={["image/jpeg", "image/png", "application/pdf"]}
          description={copy.licenseCertificationHint}
          error={errors.licenseCertification}
          onChange={onFilesChange}
        />
      </div>

      <SelectField
        label={copy.direction}
        name="categoryId"
        value={String(values.categoryId ?? "")}
        required
        placeholder={copy.selectDirection}
        options={categories.map((category) => ({
          label: category.name,
          value: category.id,
        }))}
        error={errors.categoryId}
        onChange={onChange}
      />

      <SelectField
        label={copy.nomination}
        name="awardId"
        value={String(values.awardId ?? "")}
        required
        disabled={!selectedCategory}
        placeholder={
          selectedCategory ? copy.selectNomination : copy.selectDirectionFirst
        }
        options={
          selectedCategory?.awards.map((award) => ({
            label: award.name,
            value: award.id,
          })) ?? []
        }
        error={errors.awardId}
        onChange={onChange}
      />

      <TextField
        label={copy.website}
        name="websiteUrl"
        type="url"
        value={String(values.websiteUrl ?? "")}
        placeholder="https://"
        error={errors.websiteUrl}
        onChange={onChange}
      />

      <TextField
        label={copy.social}
        name="socialUrl"
        type="url"
        value={String(values.socialUrl ?? "")}
        placeholder="https://instagram.com/yourprofile"
        error={errors.socialUrl}
        onChange={onChange}
      />

      <TextField
        label={copy.reviews}
        name="reviewsUrl"
        type="url"
        value={String(values.reviewsUrl ?? "")}
        placeholder="https://"
        error={errors.reviewsUrl}
        onChange={onChange}
      />

      <SelectField
        label={copy.heardAbout}
        name="heardAbout"
        value={String(values.heardAbout ?? "")}
        placeholder={copy.selectOption}
        options={heardAboutOptions.map((option) => ({
          ...option,
          label:
            copy.heardAboutLabels[
              option.value as keyof typeof copy.heardAboutLabels
            ] ?? option.label,
        }))}
        error={errors.heardAbout}
        onChange={onChange}
      />

      {String(values.heardAbout ?? "") === "other" ? (
        <TextField
          label={copy.heardAboutOther}
          name="heardAboutOther"
          value={String(values.heardAboutOther ?? "")}
          placeholder={copy.heardAboutOtherPlaceholder}
          error={errors.heardAboutOther}
          onChange={onChange}
        />
      ) : null}
    </div>
  );
}
