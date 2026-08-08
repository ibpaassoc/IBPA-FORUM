import { AsyncLocalStorage } from "node:async_hooks";
import type { DataScope } from "@prisma/client";

type DataScopeContext = {
  dataScope: DataScope;
  testId?: string;
  testEmailRecipient?: string;
  testTemplateType?: string;
  testEmailCategory?: string;
  relatedEntity?: { type: string; id: string };
};

const globalForDataScope = globalThis as typeof globalThis & {
  ibpaDataScopeStorage?: AsyncLocalStorage<DataScopeContext>;
};

const storage =
  globalForDataScope.ibpaDataScopeStorage ?? new AsyncLocalStorage<DataScopeContext>();

// Next.js can evaluate the request helper and the Prisma extension from
// different server bundles. Keep one process-wide store in every environment
// so both bundles observe the same request scope.
globalForDataScope.ibpaDataScopeStorage = storage;

export function getDataScopeContext(): DataScopeContext {
  return storage.getStore() ?? { dataScope: "PRODUCTION" };
}

export function activateRequestDataScope(context: DataScopeContext) {
  // Request authentication may discover the actor's scope after a test
  // run has already supplied metadata such as testId. Preserve
  // that metadata while updating the authoritative data scope.
  storage.enterWith({ ...getDataScopeContext(), ...context });
}

export async function runWithDataScope<T>(
  context: DataScopeContext,
  work: () => T | PromiseLike<T>,
): Promise<T> {
  // Prisma promises are lazy. Awaiting inside storage.run is essential:
  // returning the promise directly lets its query extension execute after the
  // AsyncLocalStorage callback has exited and silently falls back to PRODUCTION.
  return storage.run(context, async () => await work());
}

export function requireTestDataScope() {
  const context = getDataScopeContext();
  if (context.dataScope !== "TEST") {
    throw new Error("A test-scoped operation was attempted outside the test data context.");
  }
  return context;
}
