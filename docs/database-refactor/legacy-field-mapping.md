# Legacy-to-target field mapping

## Identity and profiles

| Legacy source | Target | Rule |
|---|---|---|
| `Account` | `Account` | Preserve IDs and populated password hashes byte-for-byte. Normalize email for uniqueness by role. |
| `AccountSetupToken` | `Account.setupToken*` | Migrate only the newest valid active hashed token. New issuance replaces prior state. Never migrate plaintext. |
| legacy jury/applicant identity tables | `Account` | Reconstruct by verified application/profile/account links and normalized email only when unambiguous. |
| `ApplicantProfile` | `ApplicantProfile` | Preserve used contact/professional fields; remove verification state and `membershipVerifiedAt`. |
| `ApplicantCheckInCredential` | `Ticket(kind=APPLICANT)` | Preserve token/history and check-in timestamp in credential/activity JSON. |

## Nominations

| Legacy source | Target | Rule |
|---|---|---|
| `NominationApplication` | `Nomination` | Preserve the nomination ID and verified profile/award/category ownership. |
| `NominationAnswer` | `Nomination.answers.fields[]` | Map by `nominationApplicationId`; preserve field key as `fieldId`, typed value, label/type snapshot, and timestamp. |
| active `NominationFile` | `Nomination.files.items[]` | Map by `nominationApplicationId`; preserve IDs, field key, Blob key/URL, names, MIME type, sizes, and timestamp. |
| soft-deleted `NominationFile` | excluded | Never place in active JSON. Eligible only for the separate guarded cleanup after cutover. |
| `paymentId`/verified payment evidence | `Nomination.paymentId` | Use a matching canonical paid purchase when verified. Otherwise create an idempotent zero-dollar `PAID`/`MANUAL` payment. |
| `lockedAt`, `closedIncomplete`, old status | `Nomination.status` | Convert to the explicit target state; no locking/closure booleans remain. |
| `applicationId`, `deletedAt` | removed | Ownership is the required `ApplicantProfile` relation; archival is an explicit status. |
| old scoring configuration | `Nomination.scoringSchema` | Preserve the scorecard snapshot as JSON. |

The migration excludes five broken DEV nominations and nine associated DEV file rows whose ownership/catalog mapping is not valid. It does not guess a replacement relationship. Production counts are unaffected.

## Jury

| Legacy source | Target | Rule |
|---|---|---|
| `JuryApplication` | `JuryApplication` | Preserve used application fields and link directly to `Account`. |
| requested-info fields/history | `informationRequests.requests[]` | Append historical request, resolution, and response values into one versioned document. |
| `JuryApplicationFile` | `JuryApplication.files.items[]` | Preserve active file metadata; no binary contents are stored. |
| `JuryProfile` and legacy jury identity | `JuryProfile` | Link to both the canonical account and application. Preserve approved categories and professional data. |
| `JuryNominationReview` | same target name | Preserve score JSON, total, comments, status, timestamps, nomination, and reviewer. |
| historical `Score`/`JudgeScore` | `JuryNominationReview` only when verifiably mapped | No legacy score table or runtime path remains. |
| confidentiality/check-in fields | removed/moved | Obsolete agreement state is removed; check-in credentials and activity belong to `Ticket(kind=JURY)`. |

## Tickets, payments, and Stripe

| Legacy source | Target | Rule |
|---|---|---|
| `Ticket` | `Ticket` | Preserve forum ticket/customer/package/status/check-in fields. |
| `TicketQrCredential` | `Ticket.secureToken` + `credential` | The active token becomes the unique scanner key. Preserve all active/replaced/revoked and delivery history. |
| `TicketActivity` | `Ticket.activity.events[]` | Preserve typed activity, admin ID, changed values, email delivery data, and timestamp. |
| applicant/jury check-in rows | `Ticket(kind=APPLICANT/JURY)` | Deterministic IDs make reruns idempotent. |
| `Payment` | `Payment` | Preserve IDs, customer, amounts, status, timestamps, Stripe identifiers, snapshots, and verified owner links. |
| source payment fields split across JSON/columns | target snapshots/columns | Canonical status and provider live in columns; historical price/promo/refund details live in immutable snapshots. |
| `StripeWebhookEvent` | `StripeWebhook` | Preserve event ID/type/payload/attempt/error/timestamps and link to payment where verified. |

The target models one payment to many tickets because the live special-packet purchase creates two tickets. A nullable `Payment.ticketId` would lose that verified cardinality; `Ticket.paymentId` is therefore the canonical relationship.

## Settings and tests

| Legacy source | Target | Rule |
|---|---|---|
| `Regulation` | `SiteSetting[key=regulations].value` | Combine general/category documents and EN/RU/UA metadata under schema version 1. |
| `PromoCode` | `SiteSetting[key=promocodes].value` | Store mutable configuration only; purchase-time values remain snapshotted on payments. |
| other `SiteSetting` rows | `SiteSetting` | Parse booleans/numbers where safe; otherwise preserve as JSON strings. |
| `TestScenario`, `TestAuditLog`, `EmailDeliveryLog` | `Test` | Old test data is excluded. New runs store explicit created IDs, audit events, and email test metadata in versioned JSON. |

## Ambiguity policy

The program rejects missing required mappings during dry-run and validation. It uses historical `applicationId` and normalized email only as corroborating evidence, never as a silent one-to-many guess. Reruns upsert deterministic IDs and unique provider IDs, so they do not duplicate payments, tickets, reviews, or setup state.
