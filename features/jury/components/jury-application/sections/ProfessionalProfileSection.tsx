"use client";

import { useState } from "react";
import { countryOptions } from "@/features/applications/config/countries";
import FieldShell, { inputClassName } from "@/features/jury/components/jury-application/fields/FieldShell";
import TextInput from "@/features/jury/components/jury-application/fields/TextInput";
import { useLanguage } from "@/lib/i18n/LanguageProvider";

export default function ProfessionalProfileSection() {
  const { language } = useLanguage();
  const [selectedCountry, setSelectedCountry] = useState("");
  const copy = {
    en: {
      section: "Professional Profile",
      fullName: "Full Legal Name",
      fullNamePlaceholder: "Exactly as it should appear on official documents",
      email: "Email Address",
      phone: "Phone / WhatsApp",
      country: "Country",
      selectCountry: "Select country",
      city: "City",
      title: "Professional Title",
      titlePlaceholder: "PMU Artist & Educator",
      experience: "Years of Professional Experience",
      experienceHint: "A minimum of 5 years is required for the jury panel.",
      employer: "Current Employer / Affiliation",
      employerPlaceholder: "Salon, academy, clinic, organization, or brand",
    },
    ru: {
      section: "Профессиональный профиль",
      fullName: "Полное юридическое имя",
      fullNamePlaceholder: "Как должно быть указано в официальных документах",
      email: "Email",
      phone: "Телефон / WhatsApp",
      country: "Страна",
      selectCountry: "Выберите страну",
      city: "Город",
      title: "Профессиональный статус",
      titlePlaceholder: "PMU-мастер и преподаватель",
      experience: "Стаж профессиональной работы",
      experienceHint: "Для состава жюри требуется минимум 5 лет опыта.",
      employer: "Текущее место работы / аффилиация",
      employerPlaceholder: "Салон, академия, клиника, организация или бренд",
    },
    ua: {
      section: "Професійний профіль",
      fullName: "Повне юридичне ім'я",
      fullNamePlaceholder: "Як має бути вказано в офіційних документах",
      email: "Email",
      phone: "Телефон / WhatsApp",
      country: "Країна",
      selectCountry: "Оберіть країну",
      city: "Місто",
      title: "Професійний статус",
      titlePlaceholder: "PMU-майстер і викладач",
      experience: "Стаж професійної роботи",
      experienceHint: "Для складу журі потрібно щонайменше 5 років досвіду.",
      employer: "Поточне місце роботи / афіліація",
      employerPlaceholder: "Салон, академія, клініка, організація або бренд",
    },
  }[language];

  return (
    <div className="border-b border-[var(--border-default)] pb-[var(--space-lg)]">
      <p className="text-[clamp(0.65rem,1vw,0.75rem)] font-medium uppercase tracking-[0.2em] text-[var(--color-hover-accent)]">
        {copy.section}
      </p>
      <div className="mt-[var(--space-md)] grid gap-[var(--space-md)] md:grid-cols-2">
        <TextInput
          label="First Name"
          name="firstName"
          placeholder="As shown on official documents"
          required
        />

        <TextInput
          label="Last Name"
          name="lastName"
          placeholder="As shown on official documents"
          required
        />

        <TextInput
          label={copy.email}
          name="email"
          type="email"
          placeholder="name@example.com"
          required
        />

        <TextInput
          label={copy.phone}
          name="phone"
          type="tel"
          placeholder="+1 (555) 000-0000"
          required
        />

        <FieldShell label={copy.country} required>
          <select
            name="country"
            defaultValue=""
            required
            onChange={(event) => setSelectedCountry(event.target.value)}
            className={inputClassName}
          >
            <option value="" className="bg-[var(--color-white)] text-[var(--color-ink)]">
              {copy.selectCountry}
            </option>
            {countryOptions.map((country) => (
              <option
                key={country.value}
                value={country.value}
                className="bg-[var(--color-white)] text-[var(--color-ink)]"
              >
                {country.label}
              </option>
            ))}
          </select>
        </FieldShell>

        {selectedCountry === "Other" ? (
          <TextInput
            label="Country (Other)"
            name="countryOther"
            placeholder="Enter your country"
            required
          />
        ) : null}

        <TextInput
          label={copy.city}
          name="city"
          placeholder="Los Angeles"
          required
        />

        <TextInput
          label={copy.title}
          name="professionalTitle"
          placeholder={copy.titlePlaceholder}
          required
        />

        <TextInput
          label={copy.experience}
          name="yearsExperience"
          type="number"
          min={5}
          placeholder="5"
          hint={copy.experienceHint}
          required
        />

        <TextInput
          label={copy.employer}
          name="employerAffiliation"
          placeholder={copy.employerPlaceholder}
          required
        />
      </div>
    </div>
  );
}
