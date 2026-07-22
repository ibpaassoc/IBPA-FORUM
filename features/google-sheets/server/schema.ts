import "server-only";
import { SHEET_TABS } from "./config";
import { COLORS, type ColumnSpec, type ConditionalRule } from "./formatting";

/**
 * Declarative definition of each data tab: its columns (header + width + wrap),
 * which column holds the unique ID used for idempotent upserts, the conditional
 * colour rules (status colours on Scores / Tickets; green ticked-checkbox
 * highlight on Jury), plus — for the Applications and Jury tabs — the category
 * cell to colour-code and the editable checkbox tracking columns.
 *
 * The ID column is always the first column (index 0), so re-running any sync
 * updates existing rows in place instead of duplicating.
 *
 * Reviewer / internal admin identity is intentionally never represented here.
 */

/** The multi-value, colour-coded category cell for a tab. */
export type CategoryConfig = {
  /** Column holding the comma-joined, per-category coloured category text. */
  displayColumnIndex: number;
};

export type SheetDefinition = {
  /** Tab name (Russian). */
  tab: string;
  /** Zero-based index of the unique-ID column (always the first column). */
  idColumnIndex: 0;
  columns: ColumnSpec[];
  /** Conditional colour rules, evaluated in order (first match wins). */
  conditionalRules: ConditionalRule[];
  /** Columns hidden from the normal admin view (technical helpers). */
  hiddenColumnIndexes?: number[];
  /** The colour-coded category cell, when applicable. */
  category?: CategoryConfig;
  /**
   * Trailing, admin-editable checkbox columns. Their values live only in the
   * sheet (not the database) and are preserved by ID across every sync, so the
   * row mappers never produce values for them.
   */
  checkboxColumnIndexes?: number[];
  /**
   * When true, a native basic filter is applied over the whole table so admins
   * get a filter dropdown (funnel) on every column header directly on the sheet
   * — including multi-category matching (Category → "Filter by condition → Text
   * contains") and the Jury tracking-checkbox TRUE/FALSE filters.
   */
  basicFilter?: boolean;
};

/** Column headers in order — derived from the column specs. */
export function sheetHeaders(definition: SheetDefinition): string[] {
  return definition.columns.map((column) => column.header);
}

// ── Заявки (Applications) ────────────────────────────────────────────────────
// Paid applications only. The status column was removed per request; the
// category cell is multi-value ("Hair, Education, Salon") and colour-coded.
// Filtering happens directly on the sheet via a native basic filter (funnel on
// every column) — including multi-category matching on the Категория column and
// value matching on Номинация. No category tabs, no per-category slicers.

const APPLICATIONS_COLUMNS: ColumnSpec[] = [
  { header: "ID заявки", width: 130, wrap: "CLIP" },
  { header: "Участник", width: 170, wrap: "WRAP" },
  { header: "Email", width: 210, wrap: "CLIP" },
  { header: "Телефон", width: 140, wrap: "CLIP" },
  { header: "Instagram", width: 150, wrap: "CLIP" },
  { header: "Категория", width: 220, wrap: "WRAP" },
  { header: "Номинация", width: 240, wrap: "WRAP" },
  { header: "Участник IBPA", width: 110, wrap: "CLIP" },
  { header: "Номер IBPA", width: 120, wrap: "CLIP" },
  { header: "Оплачено", width: 120, wrap: "CLIP" },
  { header: "Дата подачи", width: 150, wrap: "CLIP" },
  { header: "Дата обновления", width: 150, wrap: "CLIP" },
  { header: "Итог оценок", width: 170, wrap: "CLIP" },
];

const APPLICATIONS_CATEGORY_DISPLAY_INDEX = 5;

export const APPLICATIONS_SHEET: SheetDefinition = {
  tab: SHEET_TABS.applications,
  idColumnIndex: 0,
  columns: APPLICATIONS_COLUMNS,
  conditionalRules: [],
  category: { displayColumnIndex: APPLICATIONS_CATEGORY_DISPLAY_INDEX },
  basicFilter: true,
};

// ── Жюри (Jury) ──────────────────────────────────────────────────────────────
// Paid jury applications only. The status column was removed; "Специализация"
// (areas of expertise) is the multi-value, colour-coded category cell, and the
// three trailing checkbox columns are admin-editable (green when ticked) and
// preserved across syncs. Filtering happens directly on the sheet via a native
// basic filter — the Специализация funnel filters by category and each checkbox
// funnel filters Отправлено / Не отправлено. No category tabs.

const JURY_VISIBLE: ColumnSpec[] = [
  { header: "ID заявки жюри", width: 130, wrap: "CLIP" },
  { header: "ФИО", width: 170, wrap: "WRAP" },
  { header: "Email", width: 210, wrap: "CLIP" },
  { header: "Телефон", width: 140, wrap: "CLIP" },
  { header: "Страна", width: 130, wrap: "WRAP" },
  { header: "Город", width: 130, wrap: "WRAP" },
  { header: "Должность", width: 200, wrap: "CLIP" },
  { header: "Опыт (лет)", width: 100, wrap: "CLIP" },
  { header: "Специализация", width: 260, wrap: "WRAP" },
  { header: "Участник IBPA", width: 110, wrap: "CLIP" },
  { header: "Номер IBPA", width: 120, wrap: "CLIP" },
  { header: "Стоимость", width: 110, wrap: "CLIP" },
  { header: "Дата подачи", width: 150, wrap: "CLIP" },
  { header: "Дата обновления", width: 150, wrap: "CLIP" },
  { header: "Дата рассмотрения", width: 150, wrap: "CLIP" },
  { header: "Примечания", width: 240, wrap: "WRAP" },
];

const JURY_CHECKBOX_HEADERS = [
  "Приглашение",
  "Благодарственное письмо",
  "Сертификат судьи",
] as const;

const JURY_CATEGORY_DISPLAY_INDEX = 8;
const JURY_CHECKBOX_START = JURY_VISIBLE.length; // 16

export const JURY_SHEET: SheetDefinition = {
  tab: SHEET_TABS.jury,
  idColumnIndex: 0,
  columns: [
    ...JURY_VISIBLE,
    ...JURY_CHECKBOX_HEADERS.map((header) => ({
      header,
      width: 160,
      wrap: "CLIP" as const,
    })),
  ],
  // Ticked tracking checkboxes turn green (background + green checkmark) so
  // admins can scan progress at a glance.
  conditionalRules: JURY_CHECKBOX_HEADERS.map((_, i) => ({
    columnIndex: JURY_CHECKBOX_START + i,
    matchTrue: true,
    color: COLORS.checkboxTrueBg,
    textColor: COLORS.checkboxTrueText,
    columnOnly: true,
  })),
  category: { displayColumnIndex: JURY_CATEGORY_DISPLAY_INDEX },
  checkboxColumnIndexes: JURY_CHECKBOX_HEADERS.map((_, i) => JURY_CHECKBOX_START + i),
  basicFilter: true,
};

// ── Оценки (Scores) ──────────────────────────────────────────────────────────

export const SCORES_SHEET: SheetDefinition = {
  tab: SHEET_TABS.scores,
  idColumnIndex: 0,
  columns: [
    { header: "ID оценки", width: 130, wrap: "CLIP" },
    { header: "ID номинации", width: 130, wrap: "CLIP" },
    { header: "ID члена жюри", width: 130, wrap: "CLIP" },
    { header: "Член жюри", width: 170, wrap: "WRAP" },
    { header: "Участник", width: 170, wrap: "WRAP" },
    { header: "Категория", width: 160, wrap: "WRAP" },
    { header: "Professional qualification", width: 150, wrap: "WRAP" },
    { header: "Achievements and recognition", width: 150, wrap: "WRAP" },
    { header: "Portfolio and materials", width: 150, wrap: "WRAP" },
    { header: "Professional development", width: 150, wrap: "WRAP" },
    { header: "Industry contribution", width: 150, wrap: "WRAP" },
    { header: "Professional standards", width: 150, wrap: "WRAP" },
    { header: "IBPA level alignment", width: 150, wrap: "WRAP" },
    { header: "Итоговый балл", width: 100, wrap: "CLIP" },
    { header: "Средний балл", width: 110, wrap: "CLIP" },
    { header: "Статус", width: 110, wrap: "CLIP" },
    { header: "Комментарии", width: 280, wrap: "CLIP" },
    { header: "Дата подачи", width: 150, wrap: "CLIP" },
    { header: "Дата обновления", width: 150, wrap: "CLIP" },
  ],
  // Status is column index 15 after the seven regulation criteria.
  conditionalRules: [
    { columnIndex: 15, equals: "Отправлена", color: COLORS.green },
    { columnIndex: 15, equals: "Возвращена", color: COLORS.yellow },
    { columnIndex: 15, equals: "Черновик", color: COLORS.gray },
  ],
};

// ── Билеты (Tickets) ─────────────────────────────────────────────────────────

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
