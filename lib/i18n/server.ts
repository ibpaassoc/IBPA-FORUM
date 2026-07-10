import "server-only";
import { cookies } from "next/headers";
import { languages, translations, type Language } from "@/lib/i18n/translations";

/** Coerce an arbitrary cookie value into a supported site language. */
export function resolveLanguage(value: string | undefined): Language {
  if (value && languages.includes(value as Language)) {
    return value as Language;
  }
  return "en";
}

/**
 * Read the visitor's selected site language from the `ibpa-language` cookie set
 * by the client-side LanguageProvider. Used by server components and route
 * handlers that need to localize a response without a React context.
 */
export async function getServerLanguage(): Promise<Language> {
  const cookieStore = await cookies();
  return resolveLanguage(cookieStore.get("ibpa-language")?.value);
}

/** Convenience: the translation dictionary for the visitor's current language. */
export async function getServerTranslations() {
  return translations[await getServerLanguage()];
}
