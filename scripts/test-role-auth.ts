import assert from "node:assert/strict";
import {
  parsePublicAccountRole,
  safeInternalNext,
  safeNextForRole,
} from "@/features/auth/lib/role";

assert.equal(parsePublicAccountRole(undefined), "applicant");
assert.equal(parsePublicAccountRole("jury"), "jury");
assert.equal(parsePublicAccountRole("JURY"), "jury");

assert.equal(safeInternalNext("/account/applicant?tab=profile", "/"), "/account/applicant?tab=profile");
assert.equal(safeInternalNext("https://evil.example", "/account/applicant"), "/account/applicant");
assert.equal(safeInternalNext("//evil.example", "/account/applicant"), "/account/applicant");
assert.equal(safeNextForRole("/account/jury", "applicant"), "/account/applicant");
assert.equal(safeNextForRole("/account/applicant", "jury"), "/account/jury");
assert.equal(safeNextForRole("/apply", "jury"), "/apply");

console.log("Role-aware redirect validation passed.");
