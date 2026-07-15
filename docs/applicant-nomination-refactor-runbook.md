# Applicant Nomination Refactor Runbook

This runbook covers the staged rollout for the applicant account, multi-nomination
checkout, webhook fulfillment, nomination editor, jury-safe projections, and ticket
QR changes.

## Scope

The first release is additive:

- Legacy `Application`, `ApplicationAnswer`, and `ApplicationFile` tables remain in
  place for verification and rollback.
- New applicant purchases write through `Account`, `ApplicantProfile`,
  `Payment`, `NominationApplication`, `NominationAnswer`, and `NominationFile`.
- Public `/apply` creates only a pending payment and Stripe Checkout session.
- Stripe webhook fulfillment creates applicant accounts and purchased nominations.
- Admin `/admin/applications` reads applicant profiles and nominations.
- Jury pages receive only submitted/locked/reviewable paid nomination DTOs.

Do not run a legacy cleanup/drop migration until production validation has been
reviewed and approved.

## Environment Variables

Existing variables still apply:

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection for Prisma |
| `STRIPE_SECRET_KEY` | Server-side Stripe Checkout and webhook operations |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signature verification |
| `APP_URL` or `FRONTEND_URL` or `NEXT_PUBLIC_APP_URL` | Absolute account setup and checkout URLs |
| `RESEND_API_KEY` | Registration and account email delivery |
| `ADMIN_PASSWORD` | Admin dashboard authentication |
| `BLOB_READ_WRITE_TOKEN` | Private Vercel Blob upload/download |
| `CRON_SECRET` | Optional bearer token for protected deadline cron |

No new required environment variable is introduced by this refactor.

## Upload Limits

The current upload path uses direct private Vercel Blob uploads before nomination
save. Server-side nomination save stores only file references and metadata.

Current practical limits:

- Browser upload route validates supported MIME types before issuing Blob upload
  access.
- Supported image formats may be compressed client-side before upload.
- PDFs and other non-image documents are preserved rather than generically
  recompressed.
- Large bodies are not sent through `/api/applications`; the purchase endpoint
  rejects raw `File` payloads.

Do not advertise unlimited uploads. If limits are changed, update the upload route,
client validation copy, and this runbook together.

## Local Verification

```bash
npm install
npx prisma generate
npx prisma validate
npm run typecheck
npm run lint
npm run test:applicant-flow
npm run test:tickets
npm run test:jury-closure
```

For a local database migration rehearsal:

```bash
npx prisma migrate deploy
npm run backfill:applicant-nominations:dry-run
npm run verify:account-migration
```

Only run the real backfill against a disposable or backed-up database first:

```bash
npm run backfill:applicant-nominations
npm run verify:account-migration
```

## Staging Deployment

1. Back up the staging database.
2. Deploy the additive migration:

   ```bash
   npx prisma migrate deploy
   npx prisma generate
   ```

3. Run the dry-run backfill:

   ```bash
   npm run backfill:applicant-nominations:dry-run
   ```

4. Review counts for paid applications, unpaid applications, unique emails,
   duplicates, orphan records, and missing Stripe identifiers.
5. Run the real backfill:

   ```bash
   npm run backfill:applicant-nominations
   ```

6. Validate:

   ```bash
   npm run verify:account-migration
   ```

7. Deploy application code.
8. Verify staging manually:
   - `/apply` creates Stripe Checkout without legacy application rows.
   - Stripe webhook creates account, payment, and purchased nominations.
   - Registration email is delivered or failure is visible in admin.
   - Applicant can register, save draft, and submit.
   - Jury sees only submitted paid nomination DTOs.
   - Ticket QR fullscreen and PNG download still scan.

## Production Deployment

1. Create a database backup and keep the backup identifier in the release notes.
2. Confirm Stripe webhook endpoint points to the deployed production app and uses
   the current `STRIPE_WEBHOOK_SECRET`.
3. Deploy additive schema migration:

   ```bash
   npx prisma migrate deploy
   npx prisma generate
   ```

4. Run dry-run backfill:

   ```bash
   npm run backfill:applicant-nominations:dry-run
   ```

5. Review the dry-run report with product/ops. Do not continue if duplicate
   applicant-award pairs, orphan files, orphan payments, or missing category/award
   references are unexplained.
6. Run the real backfill:

   ```bash
   npm run backfill:applicant-nominations
   ```

7. Run post-backfill validation:

   ```bash
   npm run verify:account-migration
   ```

8. Deploy the application code.
9. Smoke test:
   - Public checkout for multiple nominations.
   - Stripe webhook retry idempotency.
   - Applicant registration setup link.
   - Admin resend registration link.
   - Admin manual paid nomination.
   - Admin close-all action on a controlled staging-like record first.
   - Jury file route authorization.
   - Ticket QR PNG download.

## Deadline Cron

Configure a protected scheduled request after deployment:

```text
GET /api/cron/applicant-deadline
Authorization: Bearer <CRON_SECRET>
```

The route is idempotent. It processes only after the configured applicant deadline
has passed and records the closure timestamp.

## Rollback

The first release keeps legacy tables. If application rollback is required:

1. Re-deploy the previous application bundle.
2. Keep the additive migration in place unless a database restore is chosen.
3. Disable the applicant deadline cron temporarily.
4. Verify Stripe webhook routing. Pending payments created by the new code should
   be reviewed before retrying webhook events against old code.

If data rollback is required, restore from the pre-release backup. Do not manually
delete partially migrated applicant accounts or nominations without an export.

## Legacy Cleanup Later

After production has run successfully and validation reports are clean:

1. Export legacy `Application`, `ApplicationAnswer`, and `ApplicationFile` tables.
2. Confirm no active routes, admin pages, webhooks, or scripts write to legacy
   applicant application tables.
3. Prepare a separate cleanup migration that drops legacy applicant tables only.
4. Review and deploy that cleanup migration as its own release.

## Known Manual Checks

- Confirm email templates/copy with stakeholders in English, Russian, and Ukrainian.
- Confirm file upload limits and allowed MIME types against current Vercel plan.
- Confirm result-release policy before exposing applicant-facing final results.
- Confirm production Stripe test event delivery before announcing the new `/apply`.
