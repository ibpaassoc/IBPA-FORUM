import "server-only";
import { CATEGORY_ORDER } from "./categories";
import { SHEET_TABS, type SheetTab } from "./config";
import { COLORS, type ColumnSpec, type ConditionalRule } from "./formatting";

/**
 * Declarative definition of each data tab: its columns (header + width + wrap),
 * which column holds the unique ID used for idempotent upserts, the status-based
 * colour rules (Scores / Tickets only), plus — for the Applications and Jury
 * tabs — the multi-category helper configuration, hidden technical columns,
 * editable checkbox tracking columns, and the slicers admins filter with.
 *
 * The ID column is always the first column (index 0), so re-running any sync
 * updates existing rows in place instead of duplicating.
 *
 * Reviewer / internal admin identity is intentionally never represented here.
 */

/** Multi-category display + hidden TRUE/FALSE helper columns for one tab. */
export type CategoryConfig = {
  /** Column holding the comma-joined, per-category coloured category text. */
  displayColumnIndex: number;
  /** Hidden helper column indexes, one per category in `CATEGORY_ORDER`. */
  helperColumnIndexes: number[];
};

/** A slicer to (re)create on a tab, filtering the table on one column. */
export type SlicerConfig = {
  /** Zero-based column index (within the full table) the slicer filters. */
  columnIndex: number;
  /** Slicer title shown to admins (Russian for the sheet's own labels). */
  title: string;
};

export type SheetDefinition = {
  tab: SheetTab;
  /** Zero-based index of the unique-ID column (always the first column). */
  idColumnIndex: 0;
  columns: ColumnSpec[];
  /** Conditional row-colour rules, evaluated in order (first match wins). */
  conditionalRules: ConditionalRule[];
  /** Columns hidden from the normal admin view (technical helpers). */
  hiddenColumnIndexes?: number[];
  /** Multi-category display + helper-flag configuration, when applicable. */
  category?: CategoryConfig;
  /**
   * Trailing, admin-editable checkbox columns. Their values live only in the
   * sheet (not the database) and are preserved by ID across every sync, so the
   * row mappers never produce values for them.
   */
  checkboxColumnIndexes?: number[];
  /** Slicers to (re)create for this tab. */
  slicers?: SlicerConfig[];
};

/** Column headers in order — derived from the column specs. */
export function sheetHeaders(definition: SheetDefinition): string[] {
  return definition.columns.map((column) => column.header);
}

/** Hidden TRUE/FALSE helper column specs, one per canonical category. */
function categoryHelperColumns(): ColumnSpec[] {
  return CATEGORY_ORDER.map((name) => ({
    header: `Категория: ${name}`,
    width: 90,
    wrap: "CLIP" as const,
  }));
}

// ── Заявки (Applications) ────────────────────────────────────────────────────
// Paid applications only. The status column was removed per request; the
// category cell is multi-value ("Hair, Education, Salon") and colour-coded, and
// the trailing hidden helper columns make single-category slicers match rows
// that carry several categories.

const APPLICATIONS_VISIBLE: ColumnSpec[] = [
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
const APPLICATIONS_NOMINATION_INDEX = 6;
const APPLICATIONS_HELPER_START = APPLICATIONS_VISIBLE.length; // 13

export const APPLICATIONS_SHEET: SheetDefinition = {
  tab: SHEET_TABS.applications,
  idColumnIndex: 0,
  columns: [...APPLICATIONS_VISIBLE, ...categoryHelperColumns()],
  conditionalRules: [],
  hiddenColumnIndexes: CATEGORY_ORDER.map((_, i) => APPLICATIONS_HELPER_START + i),
  category: {
    displayColumnIndex: APPLICATIONS_CATEGORY_DISPLAY_INDEX,
    helperColumnIndexes: CATEGORY_ORDER.map((_, i) => APPLICATIONS_HELPER_START + i),
  },
  // One slicer per category (bound to the hidden helper flags, so filtering by a
  // single category still matches multi-category rows), plus a Nomination slicer.
  slicers: [
    ...CATEGORY_ORDER.map((name, i) => ({
      columnIndex: APPLICATIONS_HELPER_START + i,
      title: name,
    })),
    { columnIndex: APPLICATIONS_NOMINATION_INDEX, title: "Номинация" },
  ],
};

// ── Жюри (Jury) ──────────────────────────────────────────────────────────────
// Paid jury applications only. The status column was removed; "Специализация"
// (areas of expertise) is the multi-value, colour-coded category cell, and the
// three trailing checkbox columns are admin-editable and preserved across syncs.

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
const JURY_HELPER_START = JURY_VISIBLE.length; // 16
const JURY_CHECKBOX_START = JURY_HELPER_START + CATEGORY_ORDER.length; // 27

export const JURY_SHEET: SheetDefinition = {
  tab: SHEET_TABS.jury,
  idColumnIndex: 0,
  columns: [
    ...JURY_VISIBLE,
    ...categoryHelperColumns(),
    ...JURY_CHECKBOX_HEADERS.map((header) => ({
      header,
      width: 160,
      wrap: "CLIP" as const,
    })),
  ],
  conditionalRules: [],
  hiddenColumnIndexes: CATEGORY_ORDER.map((_, i) => JURY_HELPER_START + i),
  category: {
    displayColumnIndex: JURY_CATEGORY_DISPLAY_INDEX,
    helperColumnIndexes: CATEGORY_ORDER.map((_, i) => JURY_HELPER_START + i),
  },
  checkboxColumnIndexes: JURY_CHECKBOX_HEADERS.map((_, i) => JURY_CHECKBOX_START + i),
  // One slicer per category (bound to the hidden helper flags → multi-expertise
  // rows match a single-category filter), plus a slicer per tracking checkbox so
  // admins can instantly see who still needs an invitation, letter or diploma.
  slicers: [
    ...CATEGORY_ORDER.map((name, i) => ({
      columnIndex: JURY_HELPER_START + i,
      title: name,
    })),
    ...JURY_CHECKBOX_HEADERS.map((title, i) => ({
      columnIndex: JURY_CHECKBOX_START + i,
      title,
    })),
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
