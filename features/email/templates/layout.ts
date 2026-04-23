export function wrapEmail(title: string, paragraphs: string[]) {
  const htmlParagraphs = paragraphs.map((paragraph) => `<p>${paragraph}</p>`).join("");

  return `
    <div style="background:#0f0f10;color:#f5efe2;padding:32px;font-family:Georgia,serif;">
      <div style="max-width:640px;margin:0 auto;border:1px solid rgba(216,194,122,0.25);border-radius:24px;padding:32px;background:rgba(255,255,255,0.04);">
        <p style="font-size:11px;letter-spacing:0.28em;text-transform:uppercase;color:#d8c27a;margin:0 0 12px;">IBPA Beauty Championship</p>
        <h1 style="font-size:28px;line-height:1.2;margin:0 0 20px;">${title}</h1>
        <div style="font-size:15px;line-height:1.75;color:#e8dfcc;">${htmlParagraphs}</div>
      </div>
    </div>
  `;
}

export function buildTextBody(lines: string[]) {
  return lines.join("\n\n");
}
