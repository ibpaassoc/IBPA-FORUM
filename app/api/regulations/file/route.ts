import { NextResponse } from "next/server";
import {
  isRegulationKey,
  isRegulationLanguage,
} from "@/features/regulations/types";
import { resolveRegulationUrl } from "@/features/regulations/server/queries";
import {
  inspectRegulationBlob,
  readRegulationBlob,
} from "@/features/regulations/server/storage";

function readRequest(request: Request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");
  const language = searchParams.get("language");

  if (!isRegulationKey(key) || !isRegulationLanguage(language)) return null;

  return {
    key,
    language,
    exact: searchParams.get("exact") === "1",
    download: searchParams.get("download") === "1",
  };
}

export async function HEAD(request: Request) {
  const input = readRequest(request);
  if (!input) return new Response(null, { status: 400 });

  try {
    const resolved = await resolveRegulationUrl(input);
    if (!resolved) return new Response(null, { status: 404 });

    const blob = await inspectRegulationBlob(resolved.url);
    return new Response(null, {
      headers: {
        "Cache-Control": "private, no-store",
        "Content-Length": String(blob.size),
        "Content-Type": "application/pdf",
        "X-Regulation-Language": resolved.language,
      },
    });
  } catch {
    return new Response(null, { status: 500 });
  }
}

export async function GET(request: Request) {
  const input = readRequest(request);
  if (!input) {
    return NextResponse.json({ error: "Invalid regulation request." }, { status: 400 });
  }

  try {
    const resolved = await resolveRegulationUrl(input);
    if (!resolved) {
      return NextResponse.json({ error: "No regulations available yet." }, { status: 404 });
    }

    const result = await readRegulationBlob(resolved.url);
    if (!result || result.statusCode !== 200) {
      return NextResponse.json({ error: "Regulation file was not found." }, { status: 404 });
    }

    return new Response(result.stream, {
      headers: {
        "Cache-Control": "private, no-store",
        "Content-Disposition": `${input.download ? "attachment" : "inline"}; filename="regulations-${resolved.language}.pdf"`,
        "Content-Length": String(result.blob.size),
        "Content-Type": "application/pdf",
        ETag: result.blob.etag,
        "X-Regulation-Language": resolved.language,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Could not load regulations." },
      { status: 500 },
    );
  }
}
