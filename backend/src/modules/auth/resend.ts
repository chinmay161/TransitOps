import { Resend } from 'resend';
import { env } from '../../config/env.js';
import { verifyEmailHtml } from '../../emails/verify-email.js';

const resend = new Resend(env.RESEND_API_KEY);

interface SendVerificationEmailParams {
  to: string;
  fullName: string;
  token: string;
}

export async function sendVerificationEmail({
  to,
  fullName,
  token,
}: SendVerificationEmailParams): Promise<void> {
  const verificationUrl = `${env.FRONTEND_URL}/verify-email?token=${token}`;

  await resend.emails.send({
    from: `TransitOps <${env.RESEND_FROM_EMAIL}>`,
    to,
    subject: 'Verify your email address for TransitOps',
    html: verifyEmailHtml(fullName, verificationUrl),
  });
}
