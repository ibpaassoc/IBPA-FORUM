# Migration validation report

## Rehearsal environment

- Neon project: `orange-math-89997858`
- Rehearsal branch: `forum-db-refactor-20260807` (`br-mute-star-ak2dcvxn`)
- Parent: production branch
- Target schema: `forum_next`
- Original production and audited source branches were not mutated.

## Aggregate before/after counts

| Entity | Source total | Target total | Explanation |
|---|---:|---:|---|
| Account | 92 | 120 | Canonical applicant/jury identities reconstructed; role-scoped accounts are explicit. |
| ApplicantProfile | 50 | 49 | One non-production/broken source row was excluded by verified scope/ownership rules. |
| JuryApplication | 71 | 71 | All applications retained. |
| JuryProfile | 44 | 43 | One invalid/non-production profile was not promoted. |
| Nomination | 92 | 87 | Five broken DEV nominations were excluded; all 85 production nominations plus valid DEV rows migrated. |
| Active nomination files | 1,379 eligible | 1,370 | Nine files belonged to the excluded broken DEV nominations. Production active-file counts match. |
| Payment | 207 | 208 | One deterministic zero-dollar manual payment was required for a nomination without verified Stripe payment. |
| Ticket | 48 | 102 | Forum tickets plus consolidated applicant and jury credential/check-in tickets. |
| StripeWebhook | 172 | 172 | Event IDs preserved uniquely. |
| Category / Award | 11 / 35 | 11 / 35 | Catalog preserved. |
| SiteSetting | 5 plus 3 promos and 12 regulations | 7 | Settings consolidated into keyed JSON documents. |

`Test` rows created by rehearsal checks are target-only and contain no migrated legacy test data. Test-created business rows are explicitly registered and cleaned.

## Integrity results

All final checks returned zero:

- broken applicant/account links;
- nomination owner, payment, award, or category links;
- broken jury profile/application/account links;
- broken or duplicate reviewer/nomination pairs;
- invalid nomination, jury, ticket, regulations, or promo JSON contracts;
- migrated test-scoped accounts, payments, nominations, or tickets.

The idempotent migration was applied repeatedly to the same clone. The final rerun produced the same business counts and no duplicate unique identifiers.

## Protected applicants

The detailed before/after report, including exact emails and record IDs, is intentionally stored only in the gitignored local manifest because repository policy forbids committing customer data:

`.local-audit/forum-db-refactor/post-migration-manifest-2026-08-08T01-50-12-102Z.json`

Aggregate protected-user results:

| Case | Accounts | Profiles | Nominations | Answers | Active files | Password handling | Result |
|---|---:|---:|---:|---:|---:|---|---|
| Protected 1 | 1 | 1 | 1 | 4 | 19 | Missing hash: secure expiring setup token issued | Pass |
| Protected 2 | 1 | 1 | 1 | 4 | 46 | Missing hash: secure expiring setup token issued | Pass |
| Protected 3 | 1 | 1 | 2 | 6 | 30 | Populated hash fingerprint unchanged | Pass |
| Protected 4 | 1 | 1 | 1 | 4 | 30 | Missing hash: secure expiring setup token issued | Pass |

No plaintext token, password hash, or private file URL is in this report or tracked files. Generated one-time setup token material remains only in mode-0600 gitignored local output.

## File deletion rehearsal

- Soft-deleted source file rows found: 336
- Missing explicit Blob keys: 0
- Active target references: 0
- Dry-run eligible: 336
- Blob or metadata deletions executed: 0

Local manifests:

- `.local-audit/forum-db-refactor/soft-deleted-file-manifest-2026-08-08T01-52-46-827Z.json`
- `.local-audit/forum-db-refactor/file-cleanup-dry-run-2026-08-08T01-53-23-223Z.json`

Deletion is deferred because Blob storage is shared and the application has not cut over. The cleanup tool requires an exact manifest, an expected non-protected Neon branch, post-cutover confirmation, and rechecks every active reference immediately before deleting an explicit key.

## Automated verification

- Prisma generation and production build: pass
- TypeScript: pass
- ESLint: pass with 16 unrelated existing warnings and no refactor errors
- All project test scripts: pass
- Clone integration suite: pass, including JSON validation, protected accounts, manual payments, review uniqueness, scanner lookup, webhook uniqueness, settings, and Test cleanup
- Browser smoke: public application catalog rendered from the clone; applicant, jury, admin, and test route protections behaved as expected

## Known non-blocking exceptions

- Source totals include broken DEV records. They were deliberately not guessed into production relationships.
- Legacy `public` tables still exist on the rehearsal clone for rollback. Runtime Prisma uses only `forum_next`.
- Permanent Blob cleanup remains deferred until after guarded cutover and a final active-reference check.
