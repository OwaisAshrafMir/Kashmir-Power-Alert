import { APP_NAME, HELPLINE_PRIMARY, HELPLINE_TOLL_FREE } from "@/lib/constants";

const BRAND = {
  green: "#0b5f4b",
  greenDark: "#0a3f34",
  ink: "#14241e",
  muted: "#5b6b64",
  mist: "#f3f7f5",
  card: "#ffffff",
  border: "#d7e3dd",
};

export function wrapEmail(opts: {
  preheader?: string;
  heading: string;
  bodyHtml: string;
  ctaLabel?: string;
  ctaUrl?: string;
  footnote?: string;
}) {
  const cta = opts.ctaUrl
    ? `<p style="margin:28px 0 8px;">
        <a href="${opts.ctaUrl}" style="display:inline-block;background:${BRAND.green};color:#ffffff;text-decoration:none;padding:13px 22px;border-radius:10px;font-weight:700;font-size:14px;">
          ${opts.ctaLabel || "Continue"}
        </a>
      </p>
      <p style="margin:0;font-size:12px;line-height:1.5;color:${BRAND.muted};word-break:break-all;">
        If the button does not work, copy this link:<br/>
        <a href="${opts.ctaUrl}" style="color:${BRAND.green};">${opts.ctaUrl}</a>
      </p>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${opts.heading}</title>
</head>
<body style="margin:0;padding:0;background:${BRAND.mist};font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  ${opts.preheader ? `<div style="display:none;max-height:0;overflow:hidden;">${opts.preheader}</div>` : ""}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.mist};padding:28px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="width:560px;max-width:100%;background:${BRAND.card};border:1px solid ${BRAND.border};border-radius:18px;overflow:hidden;">
          <tr>
            <td style="background:linear-gradient(135deg,${BRAND.green},${BRAND.greenDark});padding:26px 28px;color:#ffffff;">
              <div style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;opacity:0.8;">Kashmir · Power alerts</div>
              <div style="margin-top:6px;font-size:22px;font-weight:700;letter-spacing:-0.02em;">${APP_NAME}</div>
            </td>
          </tr>
          <tr>
            <td style="padding:28px;">
              <h1 style="margin:0 0 12px;font-size:22px;line-height:1.3;color:${BRAND.ink};">${opts.heading}</h1>
              <div style="font-size:15px;line-height:1.65;color:${BRAND.muted};">${opts.bodyHtml}</div>
              ${cta}
            </td>
          </tr>
          <tr>
            <td style="padding:0 28px 24px;">
              <div style="border-top:1px solid ${BRAND.border};padding-top:16px;font-size:12px;line-height:1.6;color:${BRAND.muted};">
                ${opts.footnote || `Helpline <strong>${HELPLINE_PRIMARY}</strong> · Toll-free ${HELPLINE_TOLL_FREE}. ${APP_NAME} is an unofficial helper — always confirm emergencies with KPDCL.`}
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function signupConfirmEmail(confirmUrl: string) {
  return {
    subject: `Confirm your ${APP_NAME} account`,
    html: wrapEmail({
      preheader: "One tap to confirm your email and start area alerts.",
      heading: "Confirm your email",
      bodyHtml: `<p style="margin:0 0 12px;">Welcome. Confirm this email so we can send shutdown alerts for your Kashmir locality.</p>
        <p style="margin:0;">This link expires shortly and can be used once.</p>`,
      ctaLabel: "Confirm email",
      ctaUrl: confirmUrl,
    }),
  };
}

export function resetPasswordEmail(resetUrl: string) {
  return {
    subject: `Reset your ${APP_NAME} password`,
    html: wrapEmail({
      preheader: "Use this secure link to choose a new password.",
      heading: "Reset your password",
      bodyHtml: `<p style="margin:0 0 12px;">We received a request to reset your password. If this was you, continue below.</p>
        <p style="margin:0;">If you did not ask for this, you can ignore this email — your password stays unchanged.</p>`,
      ctaLabel: "Choose a new password",
      ctaUrl: resetUrl,
    }),
  };
}

export function magicLinkEmail(signInUrl: string) {
  return {
    subject: `Your ${APP_NAME} sign-in link`,
    html: wrapEmail({
      preheader: "Secure one-time sign-in link.",
      heading: "Sign in",
      bodyHtml: `<p style="margin:0;">Use this one-time link to sign in. It expires shortly.</p>`,
      ctaLabel: "Sign in",
      ctaUrl: signInUrl,
    }),
  };
}

export function inviteEmail(acceptUrl: string) {
  return {
    subject: `You are invited to ${APP_NAME}`,
    html: wrapEmail({
      preheader: "Accept your invitation to Kashmir Power Alerts.",
      heading: "You are invited",
      bodyHtml: `<p style="margin:0;">You have been invited to create an account on ${APP_NAME}. Accept to finish setup.</p>`,
      ctaLabel: "Accept invitation",
      ctaUrl: acceptUrl,
    }),
  };
}

export function emailChangeEmail(confirmUrl: string, newEmail?: string) {
  return {
    subject: `Confirm your new ${APP_NAME} email`,
    html: wrapEmail({
      preheader: "Confirm the new email address for your account.",
      heading: "Confirm new email",
      bodyHtml: `<p style="margin:0;">Confirm ${newEmail ? `<strong>${newEmail}</strong>` : "your new address"} as the email for this account.</p>`,
      ctaLabel: "Confirm new email",
      ctaUrl: confirmUrl,
    }),
  };
}

export function otpEmail(token: string) {
  return {
    subject: `${token} is your ${APP_NAME} code`,
    html: wrapEmail({
      preheader: "Your verification code.",
      heading: "Your verification code",
      bodyHtml: `<p style="margin:0 0 16px;">Use this code to verify your identity. It expires shortly.</p>
        <p style="margin:0;font-size:28px;letter-spacing:0.18em;font-weight:700;color:${BRAND.ink};">${token}</p>`,
    }),
  };
}

export function emailForAuthAction(type: string, url: string, token?: string, newEmail?: string) {
  switch (type) {
    case "recovery":
      return resetPasswordEmail(url);
    case "magiclink":
      return magicLinkEmail(url);
    case "invite":
      return inviteEmail(url);
    case "email_change":
      return emailChangeEmail(url, newEmail);
    case "reauthentication":
      return otpEmail(token || "");
    case "signup":
    case "email":
    default:
      return signupConfirmEmail(url);
  }
}

/** Go-template HTML for Supabase dashboard / Management API. */
export function supabaseGoTemplates() {
  const confirm = wrapEmail({
    heading: "Confirm your email",
    bodyHtml:
      "<p style=\"margin:0 0 12px;\">Welcome to Kashmir Power Alerts. Confirm this email so we can send shutdown alerts for your locality.</p><p style=\"margin:0;\">This link expires shortly and can be used once.</p>",
    ctaLabel: "Confirm email",
    ctaUrl: "{{ .ConfirmationURL }}",
  });
  const recovery = wrapEmail({
    heading: "Reset your password",
    bodyHtml:
      "<p style=\"margin:0 0 12px;\">We received a request to reset your password. If this was you, continue below.</p><p style=\"margin:0;\">If you did not ask for this, ignore this email — your password stays unchanged.</p>",
    ctaLabel: "Choose a new password",
    ctaUrl: "{{ .ConfirmationURL }}",
  });
  const magic = wrapEmail({
    heading: "Sign in",
    bodyHtml: "<p style=\"margin:0;\">Use this one-time link to sign in. It expires shortly.</p>",
    ctaLabel: "Sign in",
    ctaUrl: "{{ .ConfirmationURL }}",
  });
  const invite = wrapEmail({
    heading: "You are invited",
    bodyHtml: "<p style=\"margin:0;\">You have been invited to create an account on Kashmir Power Alerts.</p>",
    ctaLabel: "Accept invitation",
    ctaUrl: "{{ .ConfirmationURL }}",
  });
  const change = wrapEmail({
    heading: "Confirm new email",
    bodyHtml: "<p style=\"margin:0;\">Confirm <strong>{{ .NewEmail }}</strong> as the email for this account.</p>",
    ctaLabel: "Confirm new email",
    ctaUrl: "{{ .ConfirmationURL }}",
  });
  const reauth = wrapEmail({
    heading: "Your verification code",
    bodyHtml:
      "<p style=\"margin:0 0 16px;\">Use this code to verify your identity. It expires shortly.</p><p style=\"margin:0;font-size:28px;letter-spacing:0.18em;font-weight:700;\">{{ .Token }}</p>",
  });
  return { confirm, recovery, magic, invite, change, reauth };
}
