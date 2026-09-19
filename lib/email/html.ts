const ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

/** Todo texto que escribe el cliente pasa por aquí antes de entrar a un correo. */
export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => ESCAPES[char] ?? char);
}

export function emailLayout(input: { title: string; preheader: string; body: string }): string {
  return `<!doctype html>
<html lang="es">
<body style="margin:0;padding:24px;background:#f5f6f8;font-family:Arial,Helvetica,sans-serif;color:#0b0b0c;">
<span style="display:none;max-height:0;overflow:hidden;">${escapeHtml(input.preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #e6e8ec;border-radius:12px;">
<tr><td style="padding:24px 28px;border-bottom:1px solid #e6e8ec;font-size:20px;font-weight:700;">Raymond<span style="color:#e11b22;">Unlock</span></td></tr>
<tr><td style="padding:28px;">
<h1 style="margin:0 0 16px;font-size:20px;">${escapeHtml(input.title)}</h1>
${input.body}
</td></tr>
</table>
</body>
</html>`;
}

export function emailButton(href: string, label: string): string {
  return `<p style="margin:24px 0;"><a href="${escapeHtml(href)}" style="display:inline-block;background:#e11b22;color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;padding:12px 22px;border-radius:10px;">${escapeHtml(label)}</a></p>`;
}

export function emailParagraph(text: string): string {
  return `<p style="margin:0 0 16px;font-size:15px;line-height:1.6;">${escapeHtml(text)}</p>`;
}
