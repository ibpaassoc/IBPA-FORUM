/**
 * Repairs only explicit TEST nomination file objects embedded in Nomination.files.
 * Dry-run is the default; pass --fix to upload and atomically replace each JSON document.
 */
import "dotenv/config";

import { get, put } from "@vercel/blob";
import { PrismaClient, Prisma } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { categoryFieldConfigs } from "@/features/applications/config/category-field-configs";
import { parseStoredFiles } from "@/features/database/json-fields";
import { buildSampleAsset } from "@/features/test/lib/sample-assets";
import { normalizeSslMode } from "@/shared/lib/db-url";

const apply = process.argv.includes("--fix");
const pool = new Pool({ connectionString: normalizeSslMode(process.env.DATABASE_URL) });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function blobExists(pathname: string) {
  try {
    return (await get(pathname, { access: "private" })) !== null;
  } catch {
    return false;
  }
}

async function main() {
  if (apply && !process.env.BLOB_READ_WRITE_TOKEN) throw new Error("BLOB_READ_WRITE_TOKEN is required with --fix.");
  const nominations = await prisma.nomination.findMany({
    where: { dataScope: "TEST", status: { not: "ARCHIVED" } },
    orderBy: { createdAt: "asc" },
    select: { id: true, revision: true, files: true, category: { select: { slug: true } } },
  });
  let inspected = 0;
  let missing = 0;
  let repaired = 0;
  for (const nomination of nominations) {
    const document = parseStoredFiles(nomination.files);
    let changed = false;
    for (const [index, file] of document.items.entries()) {
      inspected += 1;
      const key = file.blobKey ?? file.url;
      if (key && await blobExists(key)) continue;
      missing += 1;
      const field = (categoryFieldConfigs[nomination.category.slug] ?? []).find((candidate) => candidate.key === file.fieldId);
      const asset = buildSampleAsset({ accept: field?.accept, label: field?.label ?? file.fieldId, seed: missing });
      const fileName = file.filename.replace(/\.[^.]+$/, `.${asset.extension}`);
      console.log(`${apply ? "REPAIR" : "WOULD_REPAIR"} nomination=${nomination.id} file=${file.id}`);
      if (!apply) continue;
      const blob = await put(`applications/${nomination.id}/${file.fieldId}/${fileName}`, asset.bytes, {
        access: "private",
        addRandomSuffix: true,
        contentType: asset.mimeType,
      });
      document.items[index] = {
        ...file,
        blobKey: blob.pathname,
        url: blob.pathname,
        filename: fileName,
        mimeType: asset.mimeType,
        size: asset.bytes.length,
        originalSize: asset.bytes.length,
      };
      changed = true;
      repaired += 1;
    }
    if (changed) {
      const result = await prisma.nomination.updateMany({
        where: { id: nomination.id, dataScope: "TEST", revision: nomination.revision },
        data: { files: document as unknown as Prisma.InputJsonValue, revision: { increment: 1 } },
      });
      if (result.count !== 1) throw new Error(`Concurrent update detected for nomination ${nomination.id}.`);
    }
  }
  console.log(JSON.stringify({ mode: apply ? "apply" : "dry-run", nominations: nominations.length, inspected, missing, repaired }, null, 2));
}

main().catch((error) => {
  console.error("repair failed:", error);
  process.exitCode = 1;
}).finally(async () => {
  await prisma.$disconnect();
  await pool.end();
});
