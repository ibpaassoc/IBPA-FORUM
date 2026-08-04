import { AsyncLocalStorage } from "node:async_hooks";
import type { DataScope } from "@prisma/client";

type DataScopeContext = {
  dataScope: DataScope;
  testScenarioId?: string;
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

if (process.env.NODE_ENV !== "production") {
  globalForDataScope.ibpaDataScopeStorage = storage;
}

export function getDataScopeContext(): DataScopeContext {
  return storage.getStore() ?? { dataScope: "PRODUCTION" };
}

export function activateRequestDataScope(context: DataScopeContext) {
  storage.enterWith(context);
}

export function runWithDataScope<T>(
  context: DataScopeContext,
  work: () => T,
): T {
  return storage.run(context, work);
}

export function requireTestDataScope() {
  const context = getDataScopeContext();
  if (context.dataScope !== "TEST") {
    throw new Error("A test-scoped operation was attempted outside the test data context.");
  }
  return context;
}
