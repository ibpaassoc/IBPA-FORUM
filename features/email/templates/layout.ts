export type EmailBlock =
  | { type: "text"; value: string }
  | { type: "button"; label: string; href: string };

export function ctaButton(label: string, href: string): EmailBlock {
  return { type: "button", label, href };
}

function renderBlock(block: EmailBlock) {
  if (block.type === "button") {
    return `
      <div style="text-align:center;margin:28px 0;">
        <a href="${block.href}"
           style="display:inline-block;background:#252a2d;color:#f3d881;text-decoration:none;font-size:11px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;padding:14px 32px;border-radius:100px;">
          ${block.label}
        </a>
      </div>`;
  }
  return `<p>${block.value}</p>`;
}

export function wrapEmail(title: string, blocks: Array<string | EmailBlock>) {
  const normalized: EmailBlock[] = blocks.map((b) =>
    typeof b === "string" ? { type: "text", value: b } : b
  );
  const htmlBody = normalized.map(renderBlock).join("");

  return `
    <div style="background:#fbfbfa;color:#252a2d;padding:32px;font-family:Lora,Georgia,'Times New Roman',serif;">
      <div style="max-width:640px;margin:0 auto;border:1px solid rgba(114,160,193,0.28);border-radius:24px;padding:32px;background:#ffffff;">
        <p style="font-size:11px;letter-spacing:0.28em;text-transform:uppercase;color:#72a0c1;margin:0 0 12px;">IBPA Beauty Award</p>
        <h1 style="font-family:Georgia,serif;font-size:28px;line-height:1.2;margin:0 0 20px;color:#252a2d;">${title}</h1>
        <div style="font-size:15px;line-height:1.75;color:#46525a;">${htmlBody}</div>
      </div>
    </div>
  `;
}

export function buildTextBody(lines: string[]) {
  return lines.join("\n\n");
}
