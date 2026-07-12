export function verifyEmailHtml(fullName: string, verificationUrl: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
      <h2>Welcome to TransitOps</h2>
      <p>Hi ${fullName},</p>
      <p>An account has been created for you. Please verify your email address by clicking the link below:</p>
      <a href="${verificationUrl}"
         style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">
        Verify Email Address
      </a>
      <p>This link expires in 24 hours.</p>
      <p>If you did not expect this email, you can safely ignore it.</p>
      <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
      <p style="color: #6b7280; font-size: 12px;">TransitOps &mdash; Fleet &amp; Transport Management</p>
    </div>
  `;
}
