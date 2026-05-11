export function wrapEmail(title: string, paragraphs: string[]) {
  const htmlParagraphs = paragraphs.map((paragraph) => `<p>${paragraph}</p>`).join("");

  return `
    <div style="background:#fbfbfa;color:#252a2d;padding:32px;font-family:Inter,Arial,sans-serif;">
      <div style="max-width:640px;margin:0 auto;border:1px solid rgba(114,160,193,0.28);border-radius:24px;padding:32px;background:#ffffff;">
        <p style="font-size:11px;letter-spacing:0.28em;text-transform:uppercase;color:#72a0c1;margin:0 0 12px;">IBPA Beauty Championship</p>
        <h1 style="font-family:Georgia,serif;font-size:28px;line-height:1.2;margin:0 0 20px;color:#252a2d;">${title}</h1>
        <div style="font-size:15px;line-height:1.75;color:#46525a;">${htmlParagraphs}</div>
      </div>
    </div>
  `;
}

export function buildTextBody(lines: string[]) {
  return lines.join("\n\n");
}
