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
  "JuryProfile",
  "JuryApplication",
  "Payment",
  "Nomination",
  "JuryNominationReview",
  "Ticket",
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
  Category: { nominations: { model: "Nomination", many: true } },
  Award: { nominations: { model: "Nomination", many: true } },
  Account: {
    applicantProfile: { model: "ApplicantProfile", many: false },
    juryApplication: { model: "JuryApplication", many: false },
    juryProfile: { model: "JuryProfile", many: false },
    payments: { model: "Payment", many: true },
    tickets: { model: "Ticket", many: true },
  },
  ApplicantProfile: {
    account: { model: "Account", many: false },
    nominations: { model: "Nomination", many: true },
    tickets: { model: "Ticket", many: true },
  },
  JuryProfile: {
    account: { model: "Account", many: false },
    juryApplication: { model: "JuryApplication", many: false },
    reviews: { model: "JuryNominationReview", many: true },
  },
  JuryApplication: {
    account: { model: "Account", many: false },
    profile: { model: "JuryProfile", many: false },
    payments: { model: "Payment", many: true },
  },
  Payment: {
    account: { model: "Account", many: false },
    nominations: { model: "Nomination", many: true },
    juryApplication: { model: "JuryApplication", many: false },
    tickets: { model: "Ticket", many: true },
  },
  Nomination: {
    applicantProfile: { model: "ApplicantProfile", many: false },
    payment: { model: "Payment", many: false },
    reviews: { model: "JuryNominationReview", many: true },
  },
  JuryNominationReview: {
    nomination: { model: "Nomination", many: false },
    juryProfile: { model: "JuryProfile", many: false },
  },
  Ticket: {
    account: { model: "Account", many: false },
    applicantProfile: { model: "ApplicantProfile", many: false },
    payment: { model: "Payment", many: false },
  },
};

function scopedWhere(where: Record<string, unknown> | undefined) {
  const { dataScope } = getDataScopeContext();
  return { ...(where ?? {}), dataScope };
}

function scopedData(data: Record<string, unknown>) {
  const { dataScope } = getDataScopeContext();
  return {
    ...data,
    dataScope,
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

// This escape hatch is intentionally not re-exported from lib/prisma. It is
// reserved for guarded scope discovery before authentication, plus isolated
// TEST/DEV management where callers prove the target scope explicitly.
export const unscopedPrisma = basePrisma;
