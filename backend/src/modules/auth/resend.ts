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
  console.log('[5] sendVerificationEmail() entered');
  const verificationUrl = `${env.FRONTEND_URL}/verify-email?token=${token}`;

  console.log('[6] resend.emails.send() about to execute');
  const response = await resend.emails.send({
    from: `TransitOps <${env.RESEND_FROM_EMAIL}>`,
    to,
    subject: 'Verify your email address for TransitOps',
    html: verifyEmailHtml(fullName, verificationUrl),
  });
  console.log('[7] Resend response received', JSON.stringify(response));
  if (response.error) {
    if (env.NODE_ENV === 'development') {
      console.warn(`[Resend Bypass] Email delivery bypassed in development: ${response.error.message}`);
      console.log(`[Verification URL] ${verificationUrl}`);
      console.log('[8] Email sent successfully');
      return;
    }
    throw new Error(`Resend API error: ${response.error.message} (${response.error.name})`);
  }
  console.log('[8] Email sent successfully');
}
