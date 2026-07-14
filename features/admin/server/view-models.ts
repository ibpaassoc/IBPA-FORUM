import { adminT } from "@/lib/i18n/admin";

export function formatAdminDate(date: Date | null) {
  if (!date) {
    return adminT.system.notSet;
  }

  return new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "medium"
  }).format(date);
}
