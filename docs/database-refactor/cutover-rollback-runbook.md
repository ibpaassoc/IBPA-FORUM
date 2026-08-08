# Cutover and rollback runbook

## Invariants

- Never run `apply` or file cleanup against `br-ancient-night-aknk0wql` or `br-nameless-block-akc62q54`.
- Never reuse the rehearsal branch for final cutover data. A Neon branch is a point-in-time copy and cannot see later production writes.
- Keep the original production branch unchanged and read-only after cutover for the rollback window.
- No migration command sends email, calls Stripe fulfillment, or creates external side effects.
- Permanent Blob deletion is the last step and makes rollback of those objects impossible.

## Rehearsal completed

The current validated rehearsal branch is `br-mute-star-ak2dcvxn`. It proves schema creation, transformation, reruns, application behavior, and validation. It is not the final cutover branch.

## Guarded final cutover (short write-freeze strategy)

1. Announce the maintenance window and disable all write paths: registration, nomination saves/uploads, jury updates/reviews, ticket purchase/scans, admin mutations, webhooks, cron writes, test routes, and Google Sheets-triggered writes. Keep read-only pages available if operationally safe.
2. Verify the Stripe webhook endpoint is paused or queues retryable delivery; do not acknowledge events that have not been durably recorded.
3. Record the production Neon branch ID, latest migration ID, table counts, maximum `updatedAt` values, Stripe event count, and active Blob object manifest.
4. Create a **fresh** Neon branch from the frozen production branch. Give it a new explicit branch ID and no auto-delete.
5. Point only the migration shell at that fresh branch using `FORUM_MIGRATION_DATABASE_URL`, or `DATABASE_URL` plus `FORUM_MIGRATION_BRANCH_HOST`. Do not edit or commit `.env`.
6. Run:

   ```text
   npx tsx scripts/forum-db-refactor.ts manifest --expected-branch <fresh-branch-id>
   npx tsx scripts/forum-db-refactor.ts dry-run --expected-branch <fresh-branch-id>
   npx tsx scripts/forum-db-refactor.ts apply --expected-branch <fresh-branch-id>
   npx tsx scripts/forum-db-refactor.ts validate --expected-branch <fresh-branch-id>
   npm run test:db-refactor -- --integration --expected-branch <fresh-branch-id>
   ```

7. Compare frozen production counts/maximum timestamps to the fresh branch's `public` source manifest. Any delta means the freeze was incomplete: abort, restore writes to the original branch, discard the candidate, and repeat.
8. Verify all protected-applicant rows from the local before/after manifest. Confirm password hash fingerprints, setup-token state, profiles, nominations, answers/files, payments, awards/categories, and no duplicates/orphans.
9. Build the exact application commit with `DATABASE_SCHEMA=forum_next` and the fresh branch connection. Run the complete test matrix and browser smoke against that build.
10. Atomically change the application database connection to the fresh branch and set `DATABASE_SCHEMA=forum_next`. Deploy the already-tested commit. Do not run the migration during app startup.
11. Verify health, login/setup/reset, applicant nomination read/write, jury queue/review, admin counts, scanner lookup/check-in, one test-scoped create/cleanup, and a controlled Stripe test event. Then resume webhook delivery, cron, and user writes.
12. Record cutover time and the last event IDs on both branches. Monitor webhook failures, setup-email delivery, ticket scans, payment reconciliation, and JSON validation.

This strategy needs no delta copier because the final branch is cloned only after writes are frozen. If a fresh post-freeze clone cannot be used, stop: an explicit cross-database delta migrator must be designed and rehearsed first.

## Rollback checkpoints

- **Before connection switch:** discard the candidate branch; resume original production.
- **After connection switch, before new writes:** point the app back to the original production branch and prior application commit.
- **After target writes begin:** freeze again. Export a target write manifest by stable IDs/timestamps, assess whether writes can be replayed safely into production, and obtain incident approval before switching. Do not silently lose post-cutover writes.
- Keep original production read-only after successful cutover. Do not drop or rewrite it during the retention window.

## Post-cutover file cleanup

1. Generate a new manifest from the final branch after all target validation:

   ```text
   npx tsx scripts/forum-db-refactor.ts file-manifest --expected-branch <fresh-branch-id>
   npm run cleanup:nomination-files -- dry-run --manifest <manifest> --expected-branch <fresh-branch-id>
   ```

2. Review every non-eligible item. Resolve ambiguity; never override it.
3. Confirm the original branch is no longer a required Blob rollback source or retain a separate Blob backup.
4. Apply only with change approval:

   ```text
   npm run cleanup:nomination-files -- apply --manifest <manifest> --expected-branch <fresh-branch-id> --confirm-post-cutover
   ```

5. For interruption recovery, rerun with `--resume <prior-results-file>`. The tool skips completed IDs, rechecks active references, deletes explicit keys only, and deletes the exact soft-deleted metadata row only after Blob deletion succeeds.
6. Archive the aggregate results securely; do not commit the manifest because it contains customer object identifiers.

## Final legacy retirement

After the rollback/retention period and verified production usage:

1. Prove no deployed application version accesses `public` legacy tables.
2. Take a final Neon snapshot/branch and export aggregate validation results.
3. Revoke runtime access to `public`; observe before dropping anything.
4. Drop legacy tables/schema only in a separately reviewed destructive migration.
5. Drop review data last only if business retention rules permit it.

## Proposed commit/deployment sequence

1. Target schema and migration foundation.
2. Idempotent transformation, validation, and cleanup tooling.
3. Account, applicant, nomination, jury, settings, and reporting backend migration.
4. Ticket, Stripe, scanner, email, and test-system migration.
5. Regression/integration tests and legacy runtime cleanup.
6. Documentation and guarded cutover runbook.
7. Deploy code plus connection switch only during the approved freeze.
8. Separate post-cutover Blob cleanup and, later, separate legacy-schema retirement.
