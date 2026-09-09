# IBPA Product UX Contract

## Product context

- Audience: IBPA applicants, jury members, and internal administrators.
- Primary jobs: submit nominations, evaluate eligible nominations, and audit judging progress and results.
- Target market(s): international; see `DESIGN.md` for the maintained visual and locale evidence.
- Active locales: `en`, `ru`, and `ua`/Ukrainian for account surfaces; Russian for the admin panel.
- Language/content register: direct operational copy; action and success labels use the same verb.
- Timezone/calendar policy: persisted timestamps are absolute instants and admin dates use the established admin formatter.
- Accessibility target: WCAG 2.2 AA.

## Business-context sources

| Domain / scope | Authoritative source | Source type | Reviewed date |
|---|---|---|---|
| Admin and jury authorization | `shared/lib/admin-auth.ts`, `features/jury/server/auth.ts` | Server authorization implementation | 2026-09-07 |
| Scoring lifecycle and final-review field | `prisma/schema.prisma`, `features/jury/server/reviews.ts` | Domain schema and service | 2026-09-07 |
| Scoring close and official-result rules | Current Admin Scoring request | Explicit product decision | 2026-09-07 |
| Nomination eligibility | `features/jury/server/scoring-shared.ts` | Domain service | 2026-09-07 |
| Visual and locale conventions | `DESIGN.md`, `lib/i18n/admin.ts`, `lib/i18n/translations.ts` | Design/content contract | 2026-09-07 |

## Visual contract

- Project `DESIGN.md`: `DESIGN.md`.
- Token ownership model: existing runtime tokens are canonical; `DESIGN.md` mirrors accepted values.
- Runtime design-system/token source: `app/globals.css` and shared admin/account components.
- Mapping/export/adapters: CSS variables are consumed by Tailwind utilities and shared components.
- Token drift gate: `designmd lint`, premium static audit, and browser inspection.
- Supported themes: maintained light theme plus system forced-colors behavior.
- Design-context owner/review policy: system-level visual changes update runtime tokens and `DESIGN.md` together.

## Canonical UI Map

| Capability | Canonical owner | Source of truth | Allowed variants | Verification |
|---|---|---|---|---|
| Select/Listbox | `shared/components/admin/IbpaDropdown.tsx` | `DESIGN.md` + this contract | Authored | Keyboard and open-popup browser check |
| Form | Shared dashboard field classes plus feature schema/service validation | This contract | Search/filter and mutation | Interaction test and failure path |
| Scrollbar | `app/globals.css` | `DESIGN.md` | Stable-gutter geometry exception | Computed style and browser check |
| Toast | Existing page-scoped status and notice primitives | This contract | Success, info, warning, error | Live-region check |
| CRUD | Feature server service behind authenticated route handler | Domain service + this contract | Pessimistic mutation | Full-flow and failure-path test |

## Component behavior

| Component | Default | Hover | Focus | Active | Disabled | Busy | Error |
|---|---|---|---|---|---|---|---|
| Button | Explicit verb and semantic intent | Tonal/elevation feedback | Visible blue ring | Pressed translation | Native disabled state | Stable geometry and progress label | Adjacent persistent status |
| Input | Persistent accessible label | Border cue | Blue ring | n/a | Native disabled state | Reserved adornment when needed | Associated text |
| Search | Explicit clear action and committed URL value | Border cue | Blue ring | n/a | n/a | Stable pending treatment | Search region recovery |
| Textarea | `resize: none` | Border cue | Blue ring | n/a | Read-only appearance | Stable control | Associated text |
| Table/list | Semantic table for comparison | Row tint | Focusable controls | Expanded disclosure | n/a | Stable frame | Retry or actionable empty state |

## Dataset navigation

- Admin tables: server-derived data with bounded pagination; no unbounded result table.
- URL state: committed search, filters, sorting, page, page size, and active scoring tab use query parameters. Each scoring tab owns prefixed parameters so state survives tab switches.
- Page sizes: 10, 25, 50, and 100 where supported.
- Empty/no-results/error/loading treatment: stable app-owned panels with reset/retry guidance.
- Back/scroll restoration: jury-progress detail links carry the originating filter parameters back to the list.
- Selection scope: not used by the scoring-management views.

## Flow ledger

| Operation | Trigger | Pending | Success destination | Success feedback | Failure recovery | Focus outcome | Source ref |
|---|---|---|---|---|---|---|---|
| Close scoring | `Закрыть оценивание` | Dialog stays open; action is busy and duplicate-safe | Current Scoring tab | Persistent closed banner | Inline dialog error and retry/cancel | Closed status region | Current request; `features/jury/server/scoring-state.ts` |
| Save review draft | `Save draft` localized | Stable busy action | Current review | Inline saved notice | Preserve values and show error | Current workspace | `features/jury/server/reviews.ts` |
| Submit final review | `Submit final score` localized | Confirmation and stable busy action | Current review, read-only | Inline submitted notice | Preserve values and show error | Current workspace | `features/jury/server/reviews.ts` |
| Search/filter | Compact controls | Preserve table frame | Current tab/query | Updated range/count | Reset filters or retry | Search/filter control | Current request |
| Cancel/back | `Отмена` / localized Back | None | Trigger/originating filtered list | None | n/a | Restored trigger or list context | Shared navigation pattern |

## Navigation and responsive behavior

- Route document title policy: `{Page} — IBPA Admin` for admin scoring routes.
- Route error behavior: app-owned error boundary with retry; authentication remains server-enforced.
- Tab policy: route-backed peer views use `tab=overview`, `tab=rankings`, and `tab=jury-progress`; tab-specific query state is preserved.
- Responsive table strategy: horizontal scroll preserves row/column comparison, with the identifier column visually anchored where practical.
- Truncation/full-value access: critical names and statuses wrap; abbreviated nomination IDs are supplemental.
- Focus restoration: dialogs restore the opening trigger and sticky content must not cover focus.

## Overlays and feedback

- Dialog primitive: app-owned modal with accessible title/description, focus containment, Escape-as-cancel, inert interaction boundary, and focus restoration.
- Destructive confirmation levels: global scoring closure uses a serious irreversible confirmation and danger intent; Cancel receives initial focus.
- Alert/banner scope: scoring closure is a persistent page/account condition, never toast-only.
- Layer contract: runtime `--z-*` tokens in `app/globals.css` own overlay order.

## Async and resilience

- Mutation default: pessimistic for scoring closure and final review submission.
- Idempotency and duplicate-submit policy: the UI blocks repeats; the database serializes closure and jury writes with the same advisory lock.
- Auto-save/draft recovery: drafts remain `IN_PROGRESS`; closure never promotes or deletes them.
- Retry/timeout behavior: mutation errors remain in context with an explicit retry path.
- Stale-request policy: server navigation is authoritative for committed filters; client mutation completion refreshes authoritative state.
- Dialog preservation: the close dialog remains open on failure and closes only after server confirmation.

## Validation

- Schema/validation layer: Zod request schemas plus server-side lifecycle assertions.
- Trigger timing: explicit save/submit/close actions.
- Server error mapping: actionable, page-scoped text; raw internals are not exposed.
- Duplicate-submit prevention and recovery: native disabled state plus server serialization/idempotency.

## Permission and clipboard

- Permission UI strategy: admin routes and APIs require admin authentication; jury write APIs require an active approved jury account. UI state is convenience only.
- Disabled-state explanation: global scoring closure is explained by a persistent notice, not color alone.

## Verification

- Required static commands: `npm run lint`, `npm run typecheck`, `npm run test:scoring-management`, existing project tests, and production build.
- Browser matrix: desktop and narrow viewport; loading, empty/no-results, failure, closure success, keyboard, and reduced motion.
- Accessibility checks: semantic navigation/tables/disclosures, modal focus loop/restoration, visible focus, and textual state cues.
- Canonical sibling flow: existing Admin Scoring overview/detail and Jury review workspace.
- Project audit: premium strict static audit scoped by `premium-ui.json`.
- CRUD full-flow and failure-path evidence: `scripts/test-scoring-management.ts` plus browser workflow.
