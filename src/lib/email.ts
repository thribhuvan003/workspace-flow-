import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM = process.env.RESEND_FROM_EMAIL ?? "WorkspaceFlow <onboarding@resend.dev>";

type InviteEmailArgs = {
  to: string;
  inviterName: string;
  workspaceName: string;
  inviteUrl: string;
  role: string;
};

export async function sendInviteEmail({ to, inviterName, workspaceName, inviteUrl, role }: InviteEmailArgs) {
  if (!resend) {
    console.warn("RESEND_API_KEY not set — skipping email to", to);
    return { skipped: true };
  }

  const result = await resend.emails.send({
    from: FROM,
    to,
    subject: `${inviterName} invited you to ${workspaceName} on WorkspaceFlow`,
    html: inviteEmailHtml({ inviterName, workspaceName, inviteUrl, role }),
  });

  return result;
}

function inviteEmailHtml({ inviterName, workspaceName, inviteUrl, role }: Omit<InviteEmailArgs, "to">) {
  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>You're invited to ${escapeHtml(workspaceName)}</title>
  </head>
  <body style="margin:0;padding:0;background:#0f0d0b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0f0d0b;padding:48px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#1c1916;border:1px solid rgba(255,255,255,0.06);border-radius:16px;overflow:hidden;">

            <!-- Header bar -->
            <tr>
              <td style="padding:24px 32px;border-bottom:1px solid rgba(255,255,255,0.05);">
                <table width="100%"><tr>
                  <td style="vertical-align:middle;">
                    <span style="display:inline-block;width:10px;height:10px;background:#ff5c00;border-radius:2px;margin-right:4px;vertical-align:middle;"></span>
                    <span style="display:inline-block;width:10px;height:10px;background:#ff5c00;opacity:0.5;border-radius:2px;margin-right:4px;vertical-align:middle;"></span>
                    <span style="display:inline-block;width:10px;height:10px;background:#ff5c00;opacity:0.25;border-radius:2px;margin-right:10px;vertical-align:middle;"></span>
                    <span style="color:#f0f0f8;font-weight:700;font-size:14px;letter-spacing:-0.02em;vertical-align:middle;">WorkspaceFlow</span>
                  </td>
                </tr></table>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:48px 32px 24px;">
                <p style="margin:0 0 16px;color:rgba(240,240,248,0.45);font-size:13px;text-transform:uppercase;letter-spacing:0.12em;font-weight:600;">You're invited</p>
                <h1 style="margin:0 0 24px;color:#f0f0f8;font-size:32px;line-height:1.15;letter-spacing:-0.02em;font-weight:700;">
                  Join <span style="color:#ff5c00;">${escapeHtml(workspaceName)}</span> on WorkspaceFlow.
                </h1>
                <p style="margin:0 0 32px;color:rgba(240,240,248,0.7);font-size:16px;line-height:1.55;">
                  <strong style="color:#f0f0f8;">${escapeHtml(inviterName)}</strong> added you as a <strong style="color:#f0f0f8;">${escapeHtml(role.toLowerCase())}</strong> in their workspace. Click below to accept and start collaborating in real time.
                </p>

                <table width="100%"><tr><td>
                  <a href="${inviteUrl}" style="display:inline-block;background:#ff5c00;color:#0f0d0b;font-weight:700;font-size:15px;text-decoration:none;padding:14px 28px;border-radius:10px;letter-spacing:-0.01em;">
                    Accept invite →
                  </a>
                </td></tr></table>

                <p style="margin:24px 0 0;color:rgba(240,240,248,0.35);font-size:12px;line-height:1.55;">
                  Or paste this link in your browser:<br/>
                  <span style="color:rgba(240,240,248,0.55);word-break:break-all;font-family:ui-monospace,monospace;font-size:11px;">${inviteUrl}</span>
                </p>
              </td>
            </tr>

            <!-- Divider with feature chips -->
            <tr>
              <td style="padding:16px 32px 24px;border-top:1px solid rgba(255,255,255,0.05);">
                <p style="margin:0 0 12px;color:rgba(240,240,248,0.35);font-size:11px;text-transform:uppercase;letter-spacing:0.15em;font-weight:600;">Inside your workspace</p>
                <table><tr>
                  <td style="padding:4px 8px 4px 0;"><span style="display:inline-block;padding:5px 10px;background:rgba(255,92,0,0.08);color:#ff5c00;border:1px solid rgba(255,92,0,0.18);border-radius:6px;font-size:11px;font-weight:600;">Kanban</span></td>
                  <td style="padding:4px 8px 4px 0;"><span style="display:inline-block;padding:5px 10px;background:rgba(255,92,0,0.08);color:#ff5c00;border:1px solid rgba(255,92,0,0.18);border-radius:6px;font-size:11px;font-weight:600;">Live chat</span></td>
                  <td style="padding:4px 8px 4px 0;"><span style="display:inline-block;padding:5px 10px;background:rgba(255,92,0,0.08);color:#ff5c00;border:1px solid rgba(255,92,0,0.18);border-radius:6px;font-size:11px;font-weight:600;">Shared docs</span></td>
                  <td style="padding:4px 0;"><span style="display:inline-block;padding:5px 10px;background:rgba(255,92,0,0.08);color:#ff5c00;border:1px solid rgba(255,92,0,0.18);border-radius:6px;font-size:11px;font-weight:600;">AI insights</span></td>
                </tr></table>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding:20px 32px;background:rgba(255,255,255,0.02);">
                <p style="margin:0;color:rgba(240,240,248,0.3);font-size:11px;line-height:1.6;">
                  This invite expires in 7 days. If you weren't expecting this email, you can safely ignore it.
                </p>
              </td>
            </tr>

          </table>

          <p style="margin:24px 0 0;color:rgba(240,240,248,0.2);font-size:11px;">WorkspaceFlow · real-time project management</p>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}
