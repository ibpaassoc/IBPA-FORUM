import { deflateSync } from "node:zlib";

/**
 * Dependency-free generators for the binary files a test scenario needs.
 *
 * Test nominations used to record invented `fileUrl` paths that were never
 * uploaded anywhere, so every preview in the applicant and jury accounts
 * resolved to a missing blob and rendered broken. Scenarios now upload these
 * real bytes instead, which means the preview path is exercised end to end
 * exactly as it is for a genuine submission.
 */

const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

const crcTable = (() => {
  const table = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c;
  }
  return table;
})();

function crc32(buffer: Buffer) {
  let crc = -1;
  for (const byte of buffer) crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ -1) >>> 0;
}

function pngChunk(type: string, data: Buffer) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const typeAndData = Buffer.concat([Buffer.from(type, "ascii"), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(typeAndData), 0);
  return Buffer.concat([length, typeAndData, crc]);
}

/** HSL→RGB for readable, evenly spaced sample hues. */
function hsl(h: number, s: number, l: number): [number, number, number] {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  const [r, g, b] =
    h < 60 ? [c, x, 0]
    : h < 120 ? [x, c, 0]
    : h < 180 ? [0, c, x]
    : h < 240 ? [0, x, c]
    : h < 300 ? [x, 0, c]
    : [c, 0, x];
  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255),
  ];
}

/**
 * A real truecolour PNG: a tinted field with a darker band and a lighter
 * corner block, so thumbnails are visually distinguishable from one another
 * and before/after pairs read as different images.
 */
export function createSamplePng({
  width = 640,
  height = 480,
  seed = 0,
}: {
  width?: number;
  height?: number;
  seed?: number;
} = {}) {
  const hue = (seed * 47) % 360;
  const base = hsl(hue, 0.42, 0.62);
  const band = hsl(hue, 0.46, 0.34);
  const corner = hsl((hue + 24) % 360, 0.35, 0.86);

  const raw = Buffer.alloc(height * (width * 3 + 1));
  let offset = 0;
  for (let y = 0; y < height; y++) {
    raw[offset++] = 0; // filter: none
    for (let x = 0; x < width; x++) {
      const inBand = y > height * 0.62 && y < height * 0.78;
      const inCorner = x < width * 0.22 && y < height * 0.22;
      const pixel = inCorner ? corner : inBand ? band : base;
      raw[offset++] = pixel[0];
      raw[offset++] = pixel[1];
      raw[offset++] = pixel[2];
    }
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // colour type: truecolour
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  return Buffer.concat([
    PNG_SIGNATURE,
    pngChunk("IHDR", ihdr),
    pngChunk("IDAT", deflateSync(raw, { level: 9 })),
    pngChunk("IEND", Buffer.alloc(0)),
  ]);
}

/** A minimal but structurally valid single-page PDF with a caption. */
export function createSamplePdf(label: string) {
  const caption = label.replace(/[\\()]/g, "");
  const content = `BT /F1 24 Tf 62 700 Td (${caption}) Tj ET`;
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>",
    `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
  ];

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [];
  objects.forEach((body, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${body}\nendobj\n`;
  });

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const offset of offsets) pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

  return Buffer.from(pdf, "latin1");
}

export type SampleAsset = {
  bytes: Buffer;
  mimeType: string;
  extension: string;
};

/**
 * Build a file whose type is genuinely allowed by the field. Staying inside
 * `accept` matters: the same list authorizes real uploads, so a scenario that
 * ignored it would not represent anything a participant could actually submit.
 */
export function buildSampleAsset({
  accept,
  label,
  seed = 0,
}: {
  accept?: string[];
  label: string;
  seed?: number;
}): SampleAsset {
  const allowed = accept?.length ? accept : ["image/png"];

  if (allowed.includes("image/png")) {
    // Vary the dimensions so responsive thumbnails and the lightbox get a mix
    // of portrait, landscape, and square sources.
    const shape = seed % 3;
    const width = shape === 0 ? 640 : shape === 1 ? 480 : 560;
    const height = shape === 0 ? 480 : shape === 1 ? 640 : 560;
    return { bytes: createSamplePng({ width, height, seed }), mimeType: "image/png", extension: "png" };
  }

  if (allowed.includes("application/pdf")) {
    return { bytes: createSamplePdf(label), mimeType: "application/pdf", extension: "pdf" };
  }

  // Remaining accept lists are video-only; those fields are optional and are
  // not generated, but keep the contract total rather than throwing.
  return { bytes: createSamplePdf(label), mimeType: "application/pdf", extension: "pdf" };
}
