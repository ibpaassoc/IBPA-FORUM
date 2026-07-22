# Applicant Nomination Migration Runbook

This runbook covers the final migration from the legacy competitor application
tables to account-owned nominations and jury-profile-owned reviews.

## Final data model

- `Account` and `ApplicantProfile` own participant identity and profile data.
- `Payment.purchaseManifest` owns pending checkout details.
- `NominationApplication`, `NominationAnswer`, and `NominationFile` own entries.
- `JuryNominationReview` owns jury scoring through `JuryProfile`.
- `ApplicantCheckInCredential` preserves participant QR tokens independently of
  nomination records.
- `JuryApplication` remains the active jury onboarding and approval aggregate.

The legacy `Application`, `ApplicationAnswer`, `ApplicationFile`, and
`JudgeScore` tables are removed by migration
`20260721120000_remove_legacy_applications_and_scores`.

## What the cleanup migration preserves

Before dropping a legacy table, the migration:

1. Creates or reuses an applicant account and profile for every legacy email.
2. Creates a fallback nomination for any application missing one.
3. Links all nominations and competitor payments to the applicant profile.
4. Copies lifecycle, payment, Stripe, answer, file, and check-in data.
5. Stores a valid purchase manifest on legacy competitor payments so outstanding
   Stripe sessions can still complete through the nomination purchase handler.
6. Preserves every old participant QR token as an applicant check-in credential.
7. Copies the latest `JudgeScore` state into `JuryNominationReview`.
8. Soft-deletes duplicate applicant/award entries while retaining their data.

The migration raises an exception before destructive cleanup if any nomination
lacks an applicant profile, any jury score lacks a corresponding review, or a
legacy applicant email collides with a non-applicant account. The last guard is
required because the current account model has one role per account; resolve the
email ownership before retrying instead of silently changing a jury/admin role.

## Pre-deployment checks

1. Back up the target database and record the backup identifier.
2. Deploy the application release containing the new migration and runtime code
   together; do not deploy the schema cleanup separately from its consumers.
3. Run:

   ```bash
   npm install
   npx prisma validate
   npm run typecheck
   npm run lint
   npm run test:applicant-flow
   npm run test:tickets
   ```

4. Review normalized duplicate account emails, applicant emails owned by a
   jury/admin account, and applicant/award duplicates on a restored staging copy.
   Duplicate historical nominations are retained but only the newest paid entry
   remains active. The migration stops before changing data when it finds an
   account-role collision or ambiguous normalized accounts.

## Staging rehearsal

Use a restored, disposable copy of production data:

```bash
npx prisma migrate deploy
npm run verify:account-migration
```

Then smoke test:

- Public checkout and an outstanding pre-migration Stripe checkout.
- Applicant setup, nomination draft/save/submit, and add-nomination checkout.
- Admin applicant list/detail, manual nominations, and scoring overview/detail.
- Jury list/detail, score draft, final submission, and admin reopen.
- Participant legacy QR check-in and ticket/jury check-in.
- Full Google Sheets rebuild.

Do not continue if the verifier reports ownerless nominations, orphan reviews,
orphan files, ownerless payments, duplicate active applicant/award pairs, or
paid Stripe payments without a session.

## Production deployment

1. Confirm the backup is restorable.
2. Put application writes behind the normal deployment maintenance window.
3. Run `npx prisma migrate deploy`.
4. Deploy/restart the application using the generated Prisma client.
5. Run `npm run verify:account-migration`.
6. Complete the staging smoke-test list against controlled production records.
7. Run the Google Sheets full sync so removed legacy score/application columns
   are rebuilt from profiles, nominations, and reviews.

## Rollback

This migration drops legacy tables and enums. Code rollback alone is not enough.
If rollback is required, restore the pre-deployment database backup and deploy
the previous application release together.
