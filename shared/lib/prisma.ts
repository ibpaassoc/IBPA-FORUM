import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { normalizeSslMode } from "@/shared/lib/db-url";
import { getDataScopeContext } from "@/features/test/server/data-scope";

const globalForPrisma = globalThis as unknown as {
  basePrisma: PrismaClient | undefined;
};

const pool = new Pool({
  connectionString: normalizeSslMode(process.env.DATABASE_URL),
});

const adapter = new PrismaPg(
  pool,
  process.env.DATABASE_SCHEMA ? { schema: process.env.DATABASE_SCHEMA } : undefined
);

const basePrisma = globalForPrisma.basePrisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.basePrisma = basePrisma;
}

const SCOPED_MODELS = new Set([
  "Account",
  "ApplicantProfile",
  "ApplicantCheckInCredential",
  "JuryProfile",
  "AccountSetupToken",
  "JuryApplication",
  "JuryApplicationFile",
  "Payment",
  "StripeWebhookEvent",
  "NominationApplication",
  "JuryNominationReview",
  "NominationAnswer",
  "NominationFile",
  "Ticket",
  "TicketQrCredential",
  "TicketActivity",
  "EmailDeliveryLog",
]);

type QueryArgs = Record<string, unknown> & {
  where?: Record<string, unknown>;
  data?: Record<string, unknown> | Array<Record<string, unknown>>;
  create?: Record<string, unknown>;
  update?: Record<string, unknown>;
  include?: Record<string, unknown>;
  select?: Record<string, unknown>;
};

const SCOPED_RELATIONS: Record<string, Record<string, { model: string; many: boolean }>> = {
  Category: { nominationApplications: { model: "NominationApplication", many: true } },
  Award: { nominationApplications: { model: "NominationApplication", many: true } },
  Account: {
    applicantProfile: { model: "ApplicantProfile", many: false },
    juryProfile: { model: "JuryProfile", many: false },
    setupTokens: { model: "AccountSetupToken", many: true },
    tickets: { model: "Ticket", many: true },
  },
  ApplicantProfile: {
    account: { model: "Account", many: false },
    nominations: { model: "NominationApplication", many: true },
    payments: { model: "Payment", many: true },
    tickets: { model: "Ticket", many: true },
    checkInCredentials: { model: "ApplicantCheckInCredential", many: true },
  },
  ApplicantCheckInCredential: {
    applicantProfile: { model: "ApplicantProfile", many: false },
  },
  JuryProfile: {
    account: { model: "Account", many: false },
    juryApplication: { model: "JuryApplication", many: false },
    reviews: { model: "JuryNominationReview", many: true },
  },
  AccountSetupToken: { account: { model: "Account", many: false } },
  JuryApplication: {
    files: { model: "JuryApplicationFile", many: true },
    profile: { model: "JuryProfile", many: false },
    payments: { model: "Payment", many: true },
  },
  JuryApplicationFile: {
    juryApplication: { model: "JuryApplication", many: false },
  },
  Payment: {
    applicantProfile: { model: "ApplicantProfile", many: false },
    purchasedNominations: { model: "NominationApplication", many: true },
    juryApplication: { model: "JuryApplication", many: false },
    ticket: { model: "Ticket", many: false },
  },
  NominationApplication: {
    applicantProfile: { model: "ApplicantProfile", many: false },
    purchasePayment: { model: "Payment", many: false },
    answers: { model: "NominationAnswer", many: true },
    files: { model: "NominationFile", many: true },
    reviews: { model: "JuryNominationReview", many: true },
  },
  JuryNominationReview: {
    nomination: { model: "NominationApplication", many: false },
    juryProfile: { model: "JuryProfile", many: false },
  },
  NominationAnswer: {
    nominationApplication: { model: "NominationApplication", many: false },
  },
  NominationFile: {
    nominationApplication: { model: "NominationApplication", many: false },
  },
  Ticket: {
    account: { model: "Account", many: false },
    applicantProfile: { model: "ApplicantProfile", many: false },
    payments: { model: "Payment", many: true },
    qrCredentials: { model: "TicketQrCredential", many: true },
    activities: { model: "TicketActivity", many: true },
  },
  TicketQrCredential: { ticket: { model: "Ticket", many: false } },
  TicketActivity: { ticket: { model: "Ticket", many: false } },
};

function scopedWhere(where: Record<string, unknown> | undefined) {
  const { dataScope } = getDataScopeContext();
  return { ...(where ?? {}), dataScope };
}

function scopedData(data: Record<string, unknown>) {
  const { dataScope, testScenarioId } = getDataScopeContext();
  return {
    ...data,
    dataScope,
    ...(dataScope === "TEST" && testScenarioId ? { testScenarioId } : {}),
  };
}

function scopeNestedSelection(model: string, selection: Record<string, unknown> | undefined) {
  if (!selection) return selection;
  const relations = SCOPED_RELATIONS[model] ?? {};
  const result = { ...selection };

  for (const [field, relation] of Object.entries(relations)) {
    const value = result[field];
    if (!value) continue;
    if (value === true) {
      if (relation.many) result[field] = { where: scopedWhere(undefined) };
      continue;
    }
    if (typeof value !== "object" || Array.isArray(value)) continue;
    const nested = { ...(value as QueryArgs) };
    if (relation.many) nested.where = scopedWhere(nested.where);
    nested.include = scopeNestedSelection(relation.model, nested.include);
    nested.select = scopeNestedSelection(relation.model, nested.select);
    result[field] = nested;
  }

  return result;
}

function scopeNestedWrite(model: string, data: Record<string, unknown>) {
  const result = { ...data };
  const relations = SCOPED_RELATIONS[model] ?? {};
  for (const [field, relation] of Object.entries(relations)) {
    const value = result[field];
    if (!value || typeof value !== "object" || Array.isArray(value)) continue;
    const nested = { ...(value as Record<string, unknown>) };
    for (const operation of ["create", "createMany", "connectOrCreate", "upsert"] as const) {
      const payload = nested[operation];
      if (!payload || typeof payload !== "object") continue;
      if (operation === "createMany") {
        const createMany = { ...(payload as Record<string, unknown>) };
        const rows = createMany.data;
        createMany.data = Array.isArray(rows)
          ? rows.map((row) => scopeNestedWrite(relation.model, scopedData(row)))
          : rows && typeof rows === "object"
            ? scopeNestedWrite(relation.model, scopedData(rows as Record<string, unknown>))
            : rows;
        nested[operation] = createMany;
        continue;
      }
      const values = Array.isArray(payload) ? payload : [payload];
      const scopedValues = values.map((entry) => {
        const record = { ...(entry as Record<string, unknown>) };
        if (operation === "connectOrCreate") {
          if (record.create && typeof record.create === "object") {
            record.create = scopeNestedWrite(
              relation.model,
              scopedData(record.create as Record<string, unknown>),
            );
          }
          return record;
        }
        if (operation === "upsert") {
          if (record.create && typeof record.create === "object") {
            record.create = scopeNestedWrite(
              relation.model,
              scopedData(record.create as Record<string, unknown>),
            );
          }
          if (record.update && typeof record.update === "object") {
            record.update = scopeNestedWrite(
              relation.model,
              record.update as Record<string, unknown>,
            );
          }
          return record;
        }
        return scopeNestedWrite(relation.model, scopedData(record));
      });
      nested[operation] = Array.isArray(payload) ? scopedValues : scopedValues[0];
    }
    result[field] = nested;
  }
  return result;
}

function scopeQueryArgs(
  model: string,
  operation: string,
  originalArgs: unknown,
) {
  const modelIsScoped = SCOPED_MODELS.has(model);
  if (!modelIsScoped && !SCOPED_RELATIONS[model]) return originalArgs;

  const args = { ...((originalArgs ?? {}) as QueryArgs) };
  if (
    modelIsScoped &&
    [
      "findUnique",
      "findUniqueOrThrow",
      "findFirst",
      "findFirstOrThrow",
      "findMany",
      "count",
      "aggregate",
      "groupBy",
      "update",
      "updateMany",
      "delete",
      "deleteMany",
      "upsert",
    ].includes(operation)
  ) {
    args.where = scopedWhere(args.where);
  }

  if (modelIsScoped && operation === "create" && args.data && !Array.isArray(args.data)) {
    args.data = scopeNestedWrite(model, scopedData(args.data));
  }
  if (modelIsScoped && operation === "createMany" && args.data) {
    args.data = Array.isArray(args.data)
      ? args.data.map((data) => scopeNestedWrite(model, scopedData(data)))
      : scopeNestedWrite(model, scopedData(args.data));
  }
  if (modelIsScoped && operation === "upsert" && args.create) {
    args.create = scopeNestedWrite(model, scopedData(args.create));
  }
  if (modelIsScoped && operation === "upsert" && args.update) {
    args.update = scopeNestedWrite(model, args.update);
  }
  if (modelIsScoped && ["update", "updateMany"].includes(operation) && args.data && !Array.isArray(args.data)) {
    args.data = scopeNestedWrite(model, args.data);
  }

  args.include = scopeNestedSelection(model, args.include);
  args.select = scopeNestedSelection(model, args.select);

  return args;
}

export const prisma = basePrisma.$extends({
  name: "data-scope-isolation",
  query: {
    $allModels: {
      $allOperations({ model, operation, args, query }) {
        return query(scopeQueryArgs(model, operation, args) as typeof args);
      },
    },
  },
}) as unknown as PrismaClient;

// This escape hatch is intentionally not re-exported from lib/prisma. It exists
// only for guarded test cleanup and isolation verification, where callers must
// prove the target scope explicitly before mutating anything.
export const unscopedPrisma = basePrisma;
