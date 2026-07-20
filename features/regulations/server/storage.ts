import "server-only";

import { del, get, head } from "@vercel/blob";

export async function readRegulationBlob(url: string, requestHeaders?: Headers) {
  return get(url, {
    access: "private",
    useCache: false,
    headers: requestHeaders,
  });
}

export async function inspectRegulationBlob(url: string) {
  return head(url);
}

export async function deleteRegulationBlob(url: string) {
  await del(url);
}
