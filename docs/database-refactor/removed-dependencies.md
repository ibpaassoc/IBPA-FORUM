# Removed schema and backend dependencies

## Consolidated or replaced physical models

| Source model/table | Target |
|---|---|
| `AccountSetupToken` | token fields on `Account` |
| `ApplicantCheckInCredential` | applicant `Ticket.credential/activity` |
| `NominationApplication` | `Nomination` |
| `NominationAnswer` | `Nomination.answers` |
| `NominationFile` | active metadata in `Nomination.files`; soft-deleted objects handled by guarded cleanup |
| `JuryApplicationFile` | `JuryApplication.files` |
| `TicketQrCredential` | `Ticket.secureToken/credential` |
| `TicketActivity` | `Ticket.activity` |
| `PromoCode` | `SiteSetting[key=promocodes]` |
| `Regulation` | `SiteSetting[key=regulations]` |
| `StripeWebhookEvent` | `StripeWebhook` |
| `TestScenario`, `TestAuditLog`, `EmailDeliveryLog` | `Test` |
| historical `JuryAccount`, `Score`, `JudgeScore` | canonical `Account`, `JuryProfile`, `JuryNominationReview` |

The source-only `Application`, `ApplicationAnswer`, and `ApplicationFile` tables found in historical database drift are used only as corroborating migration evidence. There are no target models or runtime reads for them.

## Removed columns/state

- Applicant membership verification state and `membershipVerifiedAt`.
- Nomination `applicationId`, `lockedAt`, `closedIncomplete`, `deletedAt`, and split answer/file relations.
- Jury confidentiality/check-in fields and split file/request state.
- Legacy payment aliases, duplicated fulfillment/ownership columns, and provider fields not used for reconciliation.
- Separate ticket QR, activity, and applicant check-in ownership.
- `testScenarioId`; `Test.id` is the run identifier.

## Backend migration coverage

| Area | Primary refactored entry points |
|---|---|
| Registration/login/setup/reset | `features/account/server/*`, `features/auth/server/*`, `auth.ts` |
| Applicant dashboard/nominations/files | `features/account/server/*`, `app/api/applicant/nominations/*`, nomination file routes |
| Purchase and Stripe fulfillment | `features/applications/server/purchase-workflow.ts`, both webhook workflows, `app/api/stripe/webhook` |
| Jury application/profile/reviews | `features/jury/server/commands.ts`, `queries.ts`, `reviews.ts`, `scoring-shared.ts` |
| Tickets/scanner/check-in | `features/tickets/server/*`, `features/check-in/server/check-in-service.ts`, ticket QR routes |
| Admin/reporting | `features/admin/server/*`, `features/admin/actions/*` |
| Regulations/promos | `features/regulations/server/queries.ts`, `features/promos/server/promo-service.ts`, setting actions |
| Email | `features/email/server/send-email.ts`; delivery state is stored in owning aggregate/Test JSON |
| Google Sheets | `features/google-sheets/server/rows.ts`, `stats.ts` |
| Cron | applicant deadline route through centralized nomination transitions |
| Tests/seeds/scripts | `features/test/server/*`, `prisma/seed.ts`, seed/repair/verification scripts |

Runtime searches contain no Prisma delegate access for removed models. Historical table names remain only in migrations, the one-time transformation program, and source-contract regression tests.

## Intentionally retained compatibility

- UI-facing answer/file view adapters transform validated JSON into presentation rows. They are not database compatibility reads or a dual implementation.
- Migrated private Blob entries without a public URL still use the authenticated proxy route. Removing it would make valid historical files inaccessible.
- The legacy `public` schema is retained on rollback branches until the post-cutover retention period ends.
- `Ticket.paymentId` is intentionally retained instead of `Payment.ticketId` because a verified special-packet payment owns two tickets.
