/**
 * Framework-free checks for the applicant nomination purchase refactor.
 *
 * The project uses tsx smoke scripts instead of a unit-test runner. These tests
 * keep DB/Stripe out of process and exercise pure helpers plus source-level
 * guarantees for the webhook, privacy filters, QR access, setup tokens, and
 * deadline closure.
 *
 *   npm run test:applicant-flow
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import {
  allocateApplicantNominationAmounts,
  computeApplicantNominationPrice,
} from "@/features/applications/lib/pricing";
import { isApplicationFileRef } from "@/features/applications/lib/file-ref";

const ROOT = process.cwd();
let passed = 0;
let failed = 0;

function assert(condition: boolean, label: string) {
  if (condition) {
    passed += 1;
    console.log(`  PASS ${label}`);
  } else {
    failed += 1;
    console.error(`  FAIL ${label}`);
  }
}

function eq<T>(actual: T, expected: T, label: string) {
  assert(
    JSON.stringify(actual) === JSON.stringify(expected),
    `${label} (expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)})`
  );
}

function read(rel: string) {
  return readFileSync(join(ROOT, rel), "utf8");
}

function has(source: string, pattern: string | RegExp) {
  return typeof pattern === "string" ? source.includes(pattern) : pattern.test(source);
}

// -- Account navigation --------------------------------------------------------
console.log("account navigation");
const accountGuards = read("features/account/server/accounts.ts");
const accountLoginForm = read("features/auth/components/LoginForm.tsx");
assert(
  has(accountGuards, 'redirect("/account/profile-unavailable")'),
  "applicant accounts without a profile are sent to a recovery page instead of looping"
);
assert(
  has(accountLoginForm, "window.location.assign(destination)"),
  "successful login uses a document navigation so the new session is available to role routing"
);
assert(has(accountLoginForm, "} catch {"), "login returns to an actionable state when authentication requests fail");

// -- Pricing and allocation ----------------------------------------------------
console.log("applicant pricing");
eq(
  computeApplicantNominationPrice({ nominationCount: 1, isIbpaMember: true }).amountCents,
  5000,
  "member first nomination is $50"
);
eq(
  computeApplicantNominationPrice({ nominationCount: 1, isIbpaMember: false }).amountCents,
  7000,
  "non-member first nomination is $70"
);
eq(
  computeApplicantNominationPrice({ nominationCount: 3, isIbpaMember: true }).amountCents,
  13000,
  "member three-nomination package is $130"
);
eq(
  computeApplicantNominationPrice({ nominationCount: 5, isIbpaMember: false }).amountCents,
  30000,
  "non-member five-nomination package is $300"
);
eq(
  computeApplicantNominationPrice({ nominationCount: 6, isIbpaMember: true }).billableCount,
  5,
  "six nominations bill as 5+ package"
);
eq(
  computeApplicantNominationPrice({ nominationCount: 0, isIbpaMember: false }).nominationCount,
  1,
  "zero nominations clamps to one for pricing safety"
);
eq(
  allocateApplicantNominationAmounts(19000, 3),
  [6334, 6333, 6333],
  "allocation preserves total cents with remainder on first nomination"
);
eq(
  allocateApplicantNominationAmounts(0, 0),
  [0],
  "allocation safely handles empty counts"
);

// -- File-ref guard ------------------------------------------------------------
console.log("file reference guard");
const blobRef = {
  fieldKey: "portfolioPhotos",
  fileName: "portfolio.pdf",
  fileUrl: "applications/applicant/portfolio.pdf",
  mimeType: "application/pdf",
  fileSize: 12345,
};
assert(isApplicationFileRef(blobRef), "uploaded blob reference is accepted");
assert(!isApplicationFileRef("applications/applicant/portfolio.pdf"), "plain strings are rejected");
assert(!isApplicationFileRef({ ...blobRef, fileSize: "12345" }), "invalid file sizes are rejected");
assert(
  has(read("features/applications/lib/file-ref.ts"), 'typeof File !== "undefined"'),
  "file-ref guard is safe when File is not a server global"
);

// -- Public purchase endpoint --------------------------------------------------
console.log("public apply endpoint");
const publicApplyRoute = read("app/api/applications/route.ts");
assert(
  has(publicApplyRoute, "createPublicApplicantNominationCheckout"),
  "POST /api/applications creates an applicant purchase checkout"
);
assert(has(publicApplyRoute, "RAW_FILE_REJECTED"), "POST /api/applications rejects raw file payloads");
assert(has(publicApplyRoute, "validateProductionEnv"), "POST /api/applications validates production env");
assert(!has(publicApplyRoute, "submitApplication("), "POST /api/applications no longer calls legacy submit command");
assert(
  !has(publicApplyRoute, "prisma.application.create"),
  "POST /api/applications no longer creates legacy Application rows before payment"
);
assert(has(publicApplyRoute, "isAdminAuthenticated"), "GET /api/applications is admin-gated");
assert(has(publicApplyRoute, "prisma.applicantProfile.findMany"), "GET /api/applications reads applicant profiles");
assert(!has(publicApplyRoute, "include: {\n        category: true"), "GET /api/applications no longer returns legacy Application payloads");

// -- Purchase workflow and webhook --------------------------------------------
console.log("purchase workflow");
const purchaseWorkflow = read("features/applications/server/purchase-workflow.ts");
assert(has(purchaseWorkflow, "validateMembershipNumber"), "membership discount is validated server-side");
assert(has(purchaseWorkflow, "assertNoOwnedDuplicateNominations"), "duplicate nominations are blocked server-side");
assert(has(purchaseWorkflow, "purchaseManifest"), "pending payment stores a purchase manifest");
assert(has(purchaseWorkflow, 'source: "applicant_account"'), "account add-nomination checkout uses account profile data");
assert(
  has(purchaseWorkflow, "APPLICATIONS_CLOSED"),
  "purchase workflow rejects checkout after deadline closure"
);

const webhookWorkflow = read("features/applications/server/webhook.workflow.ts");
assert(
  has(webhookWorkflow, "return handleApplicantNominationCheckoutCompleted(event)"),
  "competitor webhook completion uses the nomination purchase handler"
);
assert(has(webhookWorkflow, "amountTotal !== payment.amount"), "webhook validates Stripe amount");
assert(has(webhookWorkflow, "existingNomination"), "webhook fulfills nominations idempotently");
assert(has(webhookWorkflow, 'status: "PURCHASED"'), "new paid nominations start in PURCHASED state");
assert(has(webhookWorkflow, "purchasePaymentId"), "nominations are linked to the purchase payment");
assert(has(webhookWorkflow, "fulfilledAt: paidAt"), "payment fulfillment is marked idempotently");
assert(has(webhookWorkflow, "issueApplicantRegistrationLink"), "webhook issues setup links through the shared service");

// -- Account token lifecycle ---------------------------------------------------
console.log("account setup tokens");
const tokens = read("features/account/server/tokens.ts");
assert(has(tokens, "SETUP_TOKEN_TTL_MS = 3 * 24 * 60 * 60 * 1000"), "setup token TTL is three days");
assert(has(tokens, "setupTokenHash"), "setup tokens are stored on Account as a hash");
assert(has(tokens, 'source: "account"'), "validator recognizes account-backed setup tokens");
assert(
  has(tokens, /purpose === "SETUP"[\s\S]*tx\.account\.update/),
  "SETUP purpose writes token state to Account"
);

const setupActions = read("features/auth/server/setup.actions.ts");
assert(has(setupActions, "setupTokenUsedAt"), "password setup marks account token as used");
assert(has(setupActions, "setupTokenHash: null"), "password setup clears account token hash");
assert(has(setupActions, "tx.account.updateMany"), "password setup consumes account tokens atomically");
assert(has(setupActions, "setupTokenExpiresAt: { gte: now }"), "password setup rechecks expiry during activation");
assert(has(setupActions, 'status: { not: "DISABLED" }'), "password setup cannot reactivate a disabled account");
assert(has(setupActions, "deletedAt: null"), "password setup cannot reactivate a deleted account");

const forgotPasswordActions = read("features/auth/server/forgot-password.actions.ts");
assert(!has(forgotPasswordActions, "$transaction"), "forgot password does not require an interactive transaction");
assert(has(forgotPasswordActions, "createPasswordResetToken"), "forgot password uses direct reset token issuance");
assert(has(forgotPasswordActions, "lastSetupEmailDeliveryStatus"), "forgot password records reset email delivery status");
assert(has(forgotPasswordActions, "accountSetupToken.updateMany"), "forgot password invalidates undelivered reset tokens");

const registrationService = read("features/account/server/applicant-registration.ts");
assert(has(registrationService, 'paymentStatus: "PAID"'), "registration links require a paid nomination");
assert(has(registrationService, 'where: { status: "PAID" }'), "registration links accept a paid applicant payment");
assert(has(registrationService, "FOR UPDATE"), "registration token issuance is serialized per account");
assert(has(registrationService, "setupTokenHash: null"), "failed email delivery invalidates its setup token");
assert(has(registrationService, "lastSetupEmailDeliveryStatus === \"delivered\""), "cooldown only follows successful delivery");

// -- Admin applicant operations ------------------------------------------------
console.log("admin applicant operations");
const participantQueries = read("features/admin/server/participant-queries.ts");
assert(has(participantQueries, "prisma.applicantProfile.findMany"), "admin application list reads applicant profiles");
assert(has(participantQueries, "nominations:"), "admin application detail loads owned nominations");
assert(!has(participantQueries, "prisma.application.findMany"), "admin application list no longer reads legacy Application rows");
assert(!has(participantQueries, "prisma.application.findUnique"), "admin application detail no longer reads legacy Application rows");

const applicantAdminActions = read("features/admin/actions/applicant.actions.ts");
assert(has(applicantAdminActions, "addManualApplicantNominationAction"), "admin can add manual paid nominations");
assert(has(applicantAdminActions, 'provider: "manual_admin"'), "manual admin payments do not fake Stripe identifiers");
assert(has(applicantAdminActions, "resendApplicantRegistrationLinkAction"), "admin can resend one registration link");
assert(has(applicantAdminActions, "bulkResendApplicantRegistrationLinksAction"), "admin can bulk resend registration links");
assert(has(applicantAdminActions, "issueApplicantRegistrationLink"), "admin resend uses shared registration service");
assert(has(applicantAdminActions, "updateApplicantDeadlineOverrideAction"), "admin can set applicant deadline overrides");
assert(has(applicantAdminActions, "processApplicantDeadlineClosure"), "admin close-all action uses deadline closure workflow");

const loginForm = read("features/auth/components/LoginForm.tsx");
assert(!has(loginForm, "resendRegistrationLinkAction"), "login page does not expose public registration resend");
assert(!has(loginForm, "Need a registration link"), "login page has no resend registration panel");
assert(!has(loginForm, "unregistered applicant account"), "resend copy is not applicant-only");

const accountAuth = read("auth.ts");
const roleLogin = read("features/auth/server/login.actions.ts");
const roleRedirects = read("features/auth/lib/role.ts");
assert(has(accountAuth, 'role: {'), "credentials authentication receives the selected account role");
assert(has(roleLogin, "No ${requestedRole} account was found"), "login reports a missing account for the selected role");
assert(has(roleLogin, "switchRole"), "opposite-role accounts offer a role switch");
assert(has(roleRedirects, "safeNextForRole"), "cross-role dashboard redirects are rejected");

// -- Applicant account and deadline closure -----------------------------------
console.log("applicant account editing and closure");
const saveNominationRoute = read("app/api/applicant/nominations/[nominationId]/route.ts");
assert(has(saveNominationRoute, "requireEditableNomination"), "nomination editor enforces account ownership");
assert(has(saveNominationRoute, "validateNominationBlockB"), "nomination submit validates category requirements");
assert(has(saveNominationRoute, "deletedAt"), "file replacement uses soft-delete metadata");
assert(has(saveNominationRoute, "categoryFieldConfigs"), "empty video selections also replace stored nomination files");

const applicantFileRoute = read("app/api/account/applicant/nomination-files/[fileId]/route.ts");
assert(has(applicantFileRoute, "requireApplicantAccount"), "saved applicant files require actor-aware applicant auth");
assert(
  has(applicantFileRoute, "applicantProfileId: applicantProfile.id"),
  "saved applicant files enforce nomination ownership"
);
assert(
  has(applicantFileRoute, "streamPrivateBlobFile"),
  "saved applicant files are streamed through the shared private-Blob helper"
);

const editorValues = read("features/account/components/nomination-review/editor-values.ts");
assert(
  has(editorValues, "/api/account/applicant/nomination-files/${file.id}"),
  "saved draft values expose an authenticated preview URL"
);
const applicantUploadField = read(
  "features/applications/components/application-form/fields/UploadField.tsx"
);
assert(
  has(applicantUploadField, "item.previewUrl ?? item.fileUrl"),
  "applicant upload cards prefer authenticated saved-file previews"
);

const categoryFields = read("features/applications/config/category-field-configs/index.ts");
assert(has(categoryFields, 'key: "portfolioVideo"'), "legacy portfolio video link field remains available");
assert(has(categoryFields, 'key: "portfolioVideoFiles"'), "nominations support uploaded portfolio videos");
assert(has(categoryFields, "maxFiles: 3"), "portfolio video uploads are capped at three files");

const applicationUploadRoute = read("app/api/applications/upload/route.ts");
const commonCategoryFields = read(
  "features/applications/config/category-field-configs/common.ts",
);
assert(has(applicationUploadRoute, "field.accept"), "application upload tokens use field-specific content types");
assert(has(commonCategoryFields, '"video/mp4"'), "application uploads allow MP4 portfolio videos");
assert(has(commonCategoryFields, '"video/webm"'), "application uploads allow WebM portfolio videos");
assert(has(commonCategoryFields, '"video/quicktime"'), "application uploads allow MOV portfolio videos");

const filePreviewGallery = read("shared/components/files/FilePreviewGallery.tsx");
assert(has(filePreviewGallery, "function isVideo"), "file previews recognize video assets");
assert(has(filePreviewGallery, "<video"), "file previews render playable videos");

const closure = read("features/applications/server/closure.ts");
assert(has(closure, "validateNominationBlockB"), "deadline closure validates draft completeness");
assert(has(closure, 'status: "LOCKED"'), "deadline closure locks incomplete nominations");
assert(has(closure, "isApplicationFileRef"), "deadline closure only reuses stored file references");
assert(!has(closure, "instanceof File"), "deadline closure does not reference browser File in server code");

// -- Jury privacy and file access ---------------------------------------------
console.log("jury privacy");
const juryServer = read("features/jury/server/reviews.ts");
assert(has(juryServer, 'paymentStatus: "PAID"'), "jury queries only expose paid nominations");
assert(has(juryServer, "closedIncompleteAt: null"), "jury queries exclude closed incomplete nominations");
assert(has(juryServer, "deletedAt: null"), "jury queries exclude deleted nominations");
assert(!has(juryServer, "email: true"), "jury queries do not select applicant email");
assert(!has(juryServer, "city: true"), "jury queries do not select applicant city");
assert(!has(juryServer, "country: true"), "jury queries do not select applicant country");
assert(!has(juryServer, "storageKey: true"), "jury queries do not select storage keys");

const juryDetail = read("features/account/components/jury/JuryNominationReviewPage.tsx");
assert(has(juryDetail, "/api/account/jury/nomination-files/"), "jury detail loads files through account-scoped route");
assert(!has(juryDetail, "fileUrl"), "jury detail does not render direct blob URLs");
assert(!has(juryDetail, "storageKey"), "jury detail does not render storage keys");
assert(has(juryDetail, "FilePreviewGallery"), "jury detail uses the shared playable file preview gallery");

const juryScorecard = read("features/account/components/jury/JuryReviewScorecard.tsx");
assert(has(juryScorecard, "/api/account/jury/nominations/"), "jury scorecard uses account-scoped review API");
assert(
  has(juryScorecard, "presentScoreCount !== scoringDefinition.criteria.length"),
  "jury scorecard blocks incomplete regulation reviews"
);

assert(!existsSync(join(ROOT, "app/jury/dashboard/page.tsx")), "legacy jury dashboard route is removed");
assert(!existsSync(join(ROOT, "app/api/jury/scoring/route.ts")), "legacy jury scoring API is removed");

const juryCommands = read("features/jury/server/commands.ts");
const accountServer = read("features/account/server/accounts.ts");
assert(has(accountServer, "existingProfile"), "jury account upsert reuses application-linked profiles");
assert(has(accountServer, "where: { juryApplicationId: application.id }"), "jury account upsert checks unique application link");
assert(has(juryCommands, "upsertJuryAccountForApplication"), "manual paid jury activation creates a jury account");
assert(has(juryCommands, "sendSetupEmailForAccount(setupAccountId)"), "manual paid jury activation sends setup email");
assert(has(juryCommands, "resendJuryRegistrationLink"), "jury registration links can be resent by admin");

const juryAdminActions = read("features/admin/actions/jury.actions.ts");
assert(has(juryAdminActions, "resendJuryRegistrationLinkAction"), "admin can resend a jury registration link");

const juryAdminDetail = read("features/admin/components/jury-applications/JuryApplicationDetailPage.tsx");
assert(has(juryAdminDetail, "resendJuryRegistrationLinkAction"), "jury admin page exposes resend registration action");
assert(has(juryAdminDetail, "isRegistered"), "jury admin resend detects already registered accounts");
assert(has(juryAdminDetail, "juryRegistrationAlreadyComplete"), "jury admin page explains completed registration");

const juryFileRoute = read("app/api/account/jury/nomination-files/[fileId]/route.ts");
assert(has(juryFileRoute, "requireJuryAuth"), "jury file route requires jury auth");
assert(has(juryFileRoute, 'paymentStatus !== "PAID"'), "jury file route rejects unpaid nominations");
assert(has(juryFileRoute, "closedIncompleteAt"), "jury file route rejects incomplete closed nominations");
assert(
  has(juryFileRoute, "approvedCategories.includes"),
  "jury file route enforces approved category access",
);
assert(has(juryFileRoute, "displayFileName || fileRecord.fileName"), "jury file route uses display-safe filenames");

// -- File preview delivery -----------------------------------------------------
// A raw non-ASCII filename in Content-Disposition makes the Response
// constructor throw, so the route 500s and every preview renders broken.
console.log("file preview delivery");
const contentDispositionLib = read("shared/lib/content-disposition.ts");
assert(
  has(contentDispositionLib, "filename*=UTF-8''"),
  "the shared header helper emits an RFC 5987 filename",
);
assert(
  has(contentDispositionLib, "[^\\x20-\\x7E]"),
  "the shared header helper strips non-ASCII from the fallback filename",
);
const blobFileResponse = read("shared/lib/blob-file-response.ts");
assert(
  has(blobFileResponse, "contentDisposition("),
  "the shared streaming helper builds its header with the shared header helper",
);
assert(
  has(blobFileResponse, 'access: "private"'),
  "the shared streaming helper reads from private Blob storage",
);
for (const routePath of [
  "app/api/account/jury/nomination-files/[fileId]/route.ts",
  "app/api/account/applicant/nomination-files/[fileId]/route.ts",
  "app/api/admin/nomination-files/[fileId]/route.ts",
]) {
  const source = read(routePath);
  assert(
    has(source, "streamPrivateBlobFile("),
    `${routePath} streams through the shared helper`,
  );
  assert(
    !has(source, 'inline; filename="${'),
    `${routePath} does not interpolate a raw filename into a header`,
  );
}

// Range support is the other half of a working video preview: WebKit's first
// media request is a range request and it will not start without a 206.
assert(
  has(blobFileResponse, 'request.headers.get("range")'),
  "the shared streaming helper forwards the client range header",
);
assert(
  has(blobFileResponse, "contentRange ? 206 : 200"),
  "the shared streaming helper answers 206 only when the store served a partial body",
);

const gallery = read("shared/components/files/FilePreviewGallery.tsx");
assert(has(gallery, 'status === "error"'), "file previews render an explicit error state");
assert(has(gallery, "ThumbSkeleton"), "file previews render a loading placeholder");
assert(has(gallery, 'pairing === "before-after"'), "file previews keep before/after images paired");
assert(has(gallery, "MAX_ZOOM"), "the preview lightbox supports zoom");
assert(!has(gallery, "formatFileSize"), "file previews do not surface raw file sizes");
// Chromium answers canPlayType("video/quicktime") with "", so a typed <source>
// is discarded before a byte is fetched — and its error never reaches <video>.
assert(
  !has(gallery, "<source src="),
  "the preview lightbox does not filter video through a typed <source>",
);

// A just-uploaded file has no database row yet, so its ref carries no
// authenticated previewUrl and the gallery would fall back to the private Blob
// pathname — a relative URL the browser resolves against the current page.
const nominationEditor = read(
  "features/account/components/nomination-review/NominationReviewForm.tsx",
);
assert(
  has(nominationEditor, "createLocalPreview(task.file)"),
  "a completed upload previews the bytes the browser already holds",
);
assert(
  has(nominationEditor, "map(toStoredRef)"),
  "persisted file refs drop their browser-only preview URL",
);

// -- Ticket QR ownership -------------------------------------------------------
console.log("ticket QR");
const qrRoute = read("app/api/account/tickets/[ticketId]/qr/route.ts");
assert(has(qrRoute, "requireAccount"), "account QR route requires account auth");
assert(has(qrRoute, "ownershipFilters"), "account QR route builds explicit ownership filters");
assert(has(qrRoute, "account.applicantProfile ?"), "account QR route conditionally includes applicant ownership");
assert(!has(qrRoute, "{}"), "account QR route does not include empty OR ownership objects");
assert(has(qrRoute, "new Uint8Array(buffer)"), "account QR route returns a NextResponse-compatible binary body");
assert(has(qrRoute, "safeSlug(ticket.fullName)"), "account QR filename omits the raw QR token");

const ticketEmailWorkflow = read("features/tickets/server/ticket-email.workflow.ts");
const ticketEmailTemplate = read("features/tickets/templates/ticket-confirmation.ts");
assert(has(ticketEmailWorkflow, "contentId: QR_CID"), "ticket email sends the QR with Resend's inline content ID");
assert(!has(ticketEmailWorkflow, "content_id:"), "ticket email does not use Resend's internal API field name");
assert(has(ticketEmailTemplate, 'src="cid:${QR_CID}"'), "ticket email references the inline QR content ID");
assert(has(ticketEmailTemplate, 'role="presentation"'), "ticket email uses email-client-safe QR layout markup");

// -- Migration verification ----------------------------------------------------
console.log("migration verification scripts");
const verifyMigration = read("scripts/verify-account-migration.ts");
assert(has(verifyMigration, "duplicateApplicantAwards"), "migration verifier checks duplicate applicant/award pairs");
assert(has(verifyMigration, "nominationFilesWithoutNomination"), "migration verifier checks orphan nomination files");
assert(has(verifyMigration, "paymentsWithoutOwner"), "migration verifier checks orphan payments");
assert(has(verifyMigration, "paidStripePaymentsMissingSession"), "migration verifier checks paid Stripe session linkage");

const prismaSchema = read("prisma/schema.prisma");
assert(!has(prismaSchema, /^model Application \{/m), "legacy Application model is removed");
assert(!has(prismaSchema, /^model JudgeScore \{/m), "legacy JudgeScore model is removed");
assert(has(prismaSchema, /^model JuryNominationReview \{/m), "jury scoring uses nomination reviews");

const cleanupMigration = read(
  "prisma/migrations/20260721120000_remove_legacy_applications_and_scores/migration.sql"
);
assert(
  cleanupMigration.indexOf('INSERT INTO "ApplicantProfile"') < cleanupMigration.indexOf('DROP TABLE "Application"'),
  "cleanup migration creates applicant profiles before dropping applications"
);
assert(
  cleanupMigration.indexOf('INSERT INTO "JuryNominationReview"') < cleanupMigration.indexOf('DROP TABLE "JudgeScore"'),
  "cleanup migration creates nomination reviews before dropping judge scores"
);
assert(has(cleanupMigration, "Legacy cleanup aborted"), "cleanup migration aborts on unmigrated owners");
assert(
  has(cleanupMigration, "applicant emails conflict with non-applicant accounts"),
  "cleanup migration rejects single-role account conflicts"
);
assert(has(cleanupMigration, 'CREATE TABLE "ApplicantCheckInCredential"'), "legacy participant QR tokens are preserved");

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exitCode = 1;
