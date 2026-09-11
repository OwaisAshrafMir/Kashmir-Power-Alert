import nodemailer from "nodemailer";

export function getSmtpConfig() {
  const host = process.env.SMTP_HOST || "smtp.office365.com";
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER || "";
  const pass = process.env.SMTP_PASS || "";
  const fromEmail = process.env.SMTP_FROM || user;
  const fromName = process.env.SMTP_FROM_NAME || "Kashmir Power Alerts";
  return { host, port, user, pass, fromEmail, fromName, secure: port === 465 };
}

export function isSmtpConfigured() {
  const { user, pass } = getSmtpConfig();
  return Boolean(user && pass);
}

function transporter() {
  const { host, port, user, pass, secure } = getSmtpConfig();
  return nodemailer.createTransport({
    host,
    port,
    secure,
    requireTLS: !secure,
    auth: { user, pass },
  });
}

export async function sendSmtpMail(opts: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}) {
  if (!isSmtpConfigured()) {
    throw new Error("SMTP is not configured");
  }
  const { fromEmail, fromName } = getSmtpConfig();
  const info = await transporter().sendMail({
    from: `"${fromName}" <${fromEmail}>`,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
    text: opts.text,
  });
  return info;
}
