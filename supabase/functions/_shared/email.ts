const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

interface EmailTemplateOptions {
  eyebrow: string;
  title: string;
  greeting: string;
  intro: string;
  actionLabel: string;
  actionUrl: string;
  details?: Array<{ label: string; value: string }>;
  securityNote: string;
}

export const emailTemplate = ({
  eyebrow,
  title,
  greeting,
  intro,
  actionLabel,
  actionUrl,
  details = [],
  securityNote,
}: EmailTemplateOptions) => {
  const safeActionUrl = escapeHtml(actionUrl);
  const detailRows = details.map(({ label, value }) => `
    <tr>
      <td style="padding:8px 0;color:#667085;font-size:13px;">${escapeHtml(label)}</td>
      <td style="padding:8px 0;color:#142b52;font-size:13px;font-weight:700;text-align:right;">${escapeHtml(value)}</td>
    </tr>`).join("");

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>${escapeHtml(title)}</title>
  </head>
  <body style="margin:0;background:#f3f5f8;font-family:Arial,sans-serif;color:#172033;">
    <div style="display:none;max-height:0;overflow:hidden;">${escapeHtml(intro)}</div>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f3f5f8;padding:32px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border:1px solid #e4e7ec;">
            <tr>
              <td style="background:#142b52;padding:26px 32px;">
                <div style="color:#d9a62e;font-size:12px;font-weight:700;letter-spacing:1.4px;text-transform:uppercase;">UPH Investment Club</div>
                <div style="margin-top:7px;color:#ffffff;font-family:Georgia,serif;font-size:24px;font-weight:700;">${escapeHtml(title)}</div>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <div style="color:#168ac5;font-size:12px;font-weight:700;letter-spacing:1.2px;text-transform:uppercase;">${escapeHtml(eyebrow)}</div>
                <p style="margin:18px 0 8px;font-size:16px;font-weight:700;">${escapeHtml(greeting)}</p>
                <p style="margin:0 0 22px;color:#475467;font-size:15px;line-height:1.7;">${escapeHtml(intro)}</p>
                ${detailRows ? `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-bottom:24px;border-top:1px solid #e4e7ec;border-bottom:1px solid #e4e7ec;">${detailRows}</table>` : ""}
                <a href="${safeActionUrl}" style="display:inline-block;background:#142b52;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;padding:13px 22px;">${escapeHtml(actionLabel)}</a>
                <p style="margin:24px 0 6px;color:#667085;font-size:12px;line-height:1.6;">If the button does not work, open this link:</p>
                <p style="margin:0;word-break:break-all;color:#168ac5;font-size:12px;line-height:1.6;">${safeActionUrl}</p>
                <div style="margin-top:26px;padding:14px 16px;background:#f8fafc;border-left:3px solid #d9a62e;color:#667085;font-size:12px;line-height:1.6;">${escapeHtml(securityNote)}</div>
              </td>
            </tr>
            <tr>
              <td style="padding:18px 32px;background:#142b52;color:#cbd5e1;font-size:11px;line-height:1.6;">
                This automated message was sent by UPH Investment Club. Please do not reply.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
};
