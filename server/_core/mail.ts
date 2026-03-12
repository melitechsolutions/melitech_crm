import nodemailer from 'nodemailer';

export type MailOptions = {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  from?: string;
};

const getTransporter = () => {
  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : undefined;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD;

  if (!host || !port) {
    throw new Error('SMTP_HOST and SMTP_PORT must be configured to send email');
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for 465, false for other ports
    auth: user && pass ? { user, pass } : undefined,
  });

  return transporter;
};

export async function sendEmail(opts: MailOptions) {
  try {
    const transporter = getTransporter();
    const fromEmail = process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER || `no-reply@${process.env.SMTP_HOST || 'melitech.local'}`;
    const fromName = process.env.SMTP_FROM_NAME || 'Melitech Solutions';
    const from = opts.from || `"${fromName}" <${fromEmail}>`;

    const info = await transporter.sendMail({
      from,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      text: opts.text || undefined,
    });

    console.log('[MAIL] Sent', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('[MAIL] Send failed:', error);
    return { success: false, error: (error as Error).message };
  }
}
