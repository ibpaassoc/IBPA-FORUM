/**
 * Backfills real Blob objects for TEST-scoped nomination files whose stored
 * blob is missing.
 *
 *   npm run repair:test-uploads          # report only
 *   npm run repair:test-uploads -- --fix # upload and rewrite the references
 *
 * Test scenarios used to record invented `fileUrl` paths that were never
 * uploaded, so every preview in the applicant and jury accounts resolved to a
 * missing blob. Scenarios created from now on upload their sample files, but
 * data seeded before that still points at nothing; this repairs it in place.
 *
 * PRODUCTION-scoped rows are never read or written.
 */
import "dotenv/config";
import { get, put } from "@vercel/blob";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { categoryFieldConfigs } from "@/features/applications/config/category-field-configs";
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
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error("BLOB_READ_WRITE_TOKEN is required to repair uploads.");
  }

  const files = await prisma.nominationFile.findMany({
    where: { deletedAt: null, dataScope: "TEST" },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      fieldKey: true,
      fileName: true,
      displayFileName: true,
      fileUrl: true,
      mimeType: true,
      nominationApplicationId: true,
      nominationApplication: {
        select: { dataScope: true, category: { select: { slug: true } } },
      },
    },
  });

  console.log(`TEST nomination files: ${files.length}${apply ? "" : "  (dry run — pass --fix to repair)"}\n`);

  let missing = 0;
  let repaired = 0;
  let renamed = 0;

  for (const file of files) {
    if (file.nominationApplication?.dataScope !== "TEST") {
      console.log(`SKIP  ${file.fileName} — not TEST-scoped`);
      continue;
    }

    if (await blobExists(file.fileUrl)) {
      // A previously repaired row can still advertise the extension it had
      // before its bytes were replaced, which would download a .jpg holding a
      // PNG. Bring the display name back in line with what is actually stored.
      const expected = file.mimeType === "application/pdf" ? "pdf" : file.mimeType.split("/")[1];
      const shown = file.displayFileName || file.fileName;
      if (expected && !shown.toLowerCase().endsWith(`.${expected}`)) {
        renamed++;
        const corrected = shown.replace(/\.[^.]+$/, `.${expected}`);
        if (!apply) {
          console.log(`NAME  ${shown} -> would rename to ${corrected}`);
          continue;
        }
        await prisma.nominationFile.update({
          where: { id: file.id },
          data: { displayFileName: corrected, originalFileName: corrected },
        });
        console.log(`NAMED ${shown} -> ${corrected}`);
      }
      continue;
    }

    missing++;
    // An intentionally-broken fixture must stay broken; the upload-failure
    // scenario exists to exercise that path.
    if (file.fileName.includes("intentionally-invalid")) {
      console.log(`KEEP  ${file.fileName} — intentional upload-failure fixture`);
      continue;
    }

    const field = (categoryFieldConfigs[file.nominationApplication.category.slug] ?? []).find(
      (candidate) => candidate.key === file.fieldKey,
    );
    const asset = buildSampleAsset({
      accept: field?.accept,
      label: `${field?.label ?? file.fieldKey}`,
      seed: missing,
    });
    const fileName = file.fileName.replace(/\.[^.]+$/, `.${asset.extension}`);

    if (!apply) {
      console.log(`MISS  ${file.fileName} -> would upload ${asset.bytes.length} B ${asset.mimeType}`);
      continue;
    }

    const blob = await put(
      `applications/${file.nominationApplicationId}/${file.fieldKey}/${fileName}`,
      asset.bytes,
      { access: "private", addRandomSuffix: true, contentType: asset.mimeType },
    );

    await prisma.nominationFile.update({
      where: { id: file.id },
      data: {
        fileUrl: blob.pathname,
        storageKey: blob.pathname,
        fileName,
        displayFileName: (file.displayFileName || fileName).replace(/\.[^.]+$/, `.${asset.extension}`),
        originalFileName: fileName,
        mimeType: asset.mimeType,
        fileSize: asset.bytes.length,
        originalFileSize: asset.bytes.length,
        compressedFileSize: asset.bytes.length,
      },
    });
    repaired++;
    console.log(`FIXED ${fileName} -> ${blob.pathname}`);
  }

  console.log(
    `\nmissing blobs: ${missing}${apply ? `, repaired: ${repaired}` : ""}` +
      `, display names out of step: ${renamed}`,
  );
}

main()
  .catch((error) => {
    console.error("repair failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
