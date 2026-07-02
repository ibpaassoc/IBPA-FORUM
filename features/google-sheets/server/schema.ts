import "server-only";
import { SHEET_TABS, type SheetTab } from "./config";
import { COLORS, type ColumnSpec, type ConditionalRule } from "./formatting";

/**
 * Declarative definition of each data tab: its columns (header + width + wrap),
 * which column holds the unique ID used for idempotent upserts, and the
 * status-based colour rules. The ID column is always the first column (index 0),
 * so re-running any sync updates existing rows in place instead of duplicating.
 *
 * Reviewer / internal admin identity is intentionally never represented here.
 */
export type SheetDefinition = {
  tab: SheetTab;
  /** Zero-based index of the unique-ID column (always the first column). */
  idColumnIndex: 0;
  columns: ColumnSpec[];
  /** Conditional row-colour rules, evaluated in order (first match wins). */
  conditionalRules: ConditionalRule[];
};

/** Column headers in order — derived from the column specs. */
export function sheetHeaders(definition: SheetDefinition): string[] {
  return definition.columns.map((column) => column.header);
}

// ── Заявки (Applications) ────────────────────────────────────────────────────
// Removed per request: Applicant Type, Payment Status, Application Price.

export const APPLICATIONS_SHEET: SheetDefinition = {
  tab: SHEET_TABS.applications,
  idColumnIndex: 0,
  columns: [
    { header: "ID заявки", width: 130, wrap: "CLIP" },
    { header: "Участник", width: 170, wrap: "WRAP" },
    { header: "Email", width: 210, wrap: "CLIP" },
    { header: "Телефон", width: 140, wrap: "CLIP" },
    { header: "Instagram", width: 150, wrap: "CLIP" },
    { header: "Категория", width: 160, wrap: "WRAP" },
    { header: "Номинация", width: 210, wrap: "WRAP" },
    { header: "Участник IBPA", width: 110, wrap: "CLIP" },
    { header: "Номер IBPA", width: 120, wrap: "CLIP" },
    { header: "Оплачено", width: 120, wrap: "CLIP" },
    { header: "Статус заявки", width: 160, wrap: "CLIP" },
    { header: "Дата подачи", width: 150, wrap: "CLIP" },
    { header: "Дата обновления", width: 150, wrap: "CLIP" },
    { header: "Дата рассмотрения", width: 150, wrap: "CLIP" },
    { header: "Итог оценок", width: 170, wrap: "CLIP" },
  ],
  // Статус заявки is column index 10.
  conditionalRules: [
    { columnIndex: 10, equals: "Одобрена", color: COLORS.green },
    { columnIndex: 10, equals: "Отклонена", color: COLORS.red },
    { columnIndex: 10, equals: "Ожидает оплаты", color: COLORS.yellow },
    { columnIndex: 10, equals: "Подана", color: COLORS.blue },
    { columnIndex: 10, equals: "На рассмотрении", color: COLORS.blue },
    { columnIndex: 10, equals: "Черновик", color: COLORS.gray },
  ],
};

// ── Жюри (Jury) ──────────────────────────────────────────────────────────────
// Removed per request: Checked In, Payment Status.

export const JURY_SHEET: SheetDefinition = {
  tab: SHEET_TABS.jury,
  idColumnIndex: 0,
  columns: [
    { header: "ID заявки жюри", width: 130, wrap: "CLIP" },
    { header: "ФИО", width: 170, wrap: "WRAP" },
    { header: "Email", width: 210, wrap: "CLIP" },
    { header: "Телефон", width: 140, wrap: "CLIP" },
    { header: "Instagram", width: 150, wrap: "CLIP" },
    { header: "Страна", width: 130, wrap: "WRAP" },
    { header: "Город", width: 130, wrap: "WRAP" },
    { header: "Должность", width: 200, wrap: "CLIP" },
    { header: "Опыт (лет)", width: 110, wrap: "CLIP" },
    { header: "Специализация", width: 220, wrap: "CLIP" },
    { header: "Участник IBPA", width: 110, wrap: "CLIP" },
    { header: "Номер IBPA", width: 120, wrap: "CLIP" },
    { header: "Стоимость", width: 110, wrap: "CLIP" },
    { header: "Статус заявки", width: 160, wrap: "CLIP" },
    { header: "Дата подачи", width: 150, wrap: "CLIP" },
    { header: "Дата обновления", width: 150, wrap: "CLIP" },
    { header: "Дата рассмотрения", width: 150, wrap: "CLIP" },
    { header: "Примечания", width: 240, wrap: "CLIP" },
  ],
  // Статус заявки is column index 13.
  conditionalRules: [
    { columnIndex: 13, equals: "Оплачена", color: COLORS.green },
    { columnIndex: 13, equals: "Одобрена", color: COLORS.green },
    { columnIndex: 13, equals: "Отклонена", color: COLORS.red },
    { columnIndex: 13, equals: "Подана", color: COLORS.yellow },
    { columnIndex: 13, equals: "Требуется доп. информация", color: COLORS.yellow },
  ],
};

// ── Оценки (Scores) ──────────────────────────────────────────────────────────

export const SCORES_SHEET: SheetDefinition = {
  tab: SHEET_TABS.scores,
  idColumnIndex: 0,
  columns: [
    { header: "ID оценки", width: 130, wrap: "CLIP" },
    { header: "ID заявки", width: 130, wrap: "CLIP" },
    { header: "ID номинации", width: 130, wrap: "CLIP" },
    { header: "ID члена жюри", width: 130, wrap: "CLIP" },
    { header: "Член жюри", width: 170, wrap: "WRAP" },
    { header: "Участник", width: 170, wrap: "WRAP" },
    { header: "Категория", width: 160, wrap: "WRAP" },
    { header: "Техника", width: 90, wrap: "CLIP" },
    { header: "Эстетика", width: 90, wrap: "CLIP" },
    { header: "Креативность", width: 100, wrap: "CLIP" },
    { header: "Воздействие", width: 100, wrap: "CLIP" },
    { header: "Презентация", width: 100, wrap: "CLIP" },
    { header: "Итоговый балл", width: 100, wrap: "CLIP" },
    { header: "Средний балл", width: 110, wrap: "CLIP" },
    { header: "Статус", width: 110, wrap: "CLIP" },
    { header: "Комментарии", width: 280, wrap: "CLIP" },
    { header: "Дата подачи", width: 150, wrap: "CLIP" },
    { header: "Дата обновления", width: 150, wrap: "CLIP" },
  ],
  // Статус is column index 14.
  conditionalRules: [
    { columnIndex: 14, equals: "Отправлена", color: COLORS.green },
    { columnIndex: 14, equals: "Возвращена", color: COLORS.yellow },
    { columnIndex: 14, equals: "Черновик", color: COLORS.gray },
  ],
};

// ── Билеты (Tickets) ─────────────────────────────────────────────────────────
// Trimmed to the requested payment-focused columns (no Gala/Stripe columns).
// Removed per request: Quantity, the duplicate per-ticket price and Discount —
// a single "Стоимость" column now holds the amount actually paid.

export const TICKETS_SHEET: SheetDefinition = {
  tab: SHEET_TABS.tickets,
  idColumnIndex: 0,
  columns: [
    { header: "ID билета", width: 130, wrap: "CLIP" },
    { header: "Покупатель", width: 170, wrap: "WRAP" },
    { header: "Email", width: 210, wrap: "CLIP" },
    { header: "Телефон", width: 140, wrap: "CLIP" },
    { header: "Instagram", width: 150, wrap: "CLIP" },
    { header: "Тип билета", width: 160, wrap: "WRAP" },
    { header: "Стоимость", width: 110, wrap: "CLIP" },
    { header: "Статус оплаты", width: 130, wrap: "CLIP" },
    { header: "ID QR-кода", width: 210, wrap: "CLIP" },
    { header: "Отмечен", width: 100, wrap: "CLIP" },
    { header: "Время регистрации", width: 150, wrap: "CLIP" },
    { header: "Дата покупки", width: 150, wrap: "CLIP" },
    { header: "Дата обновления", width: 150, wrap: "CLIP" },
  ],
  // Статус оплаты is column index 7; Отмечен is column index 9. Отменён and
  // Ожидает take precedence over the checked-in / paid colours.
  conditionalRules: [
    { columnIndex: 7, equals: "Отменён", color: COLORS.red },
    { columnIndex: 7, equals: "Ожидает", color: COLORS.yellow },
    { columnIndex: 9, equals: "Да", color: COLORS.green },
    { columnIndex: 7, equals: "Оплачен", color: COLORS.blue },
  ],
};

/** All upsert-style data tabs (the stats tab is handled separately). */
export const DATA_SHEETS: SheetDefinition[] = [
  APPLICATIONS_SHEET,
  JURY_SHEET,
  SCORES_SHEET,
  TICKETS_SHEET,
];
