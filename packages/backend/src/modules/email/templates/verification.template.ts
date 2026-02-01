export interface VerificationEmailData {
  name: string
  verificationLink: string
}

export function getVerificationEmailTemplate(data: VerificationEmailData): {
  html: string
  text: string
} {
  const { name, verificationLink } = data

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 40px 0;">
        <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <tr>
            <td style="padding: 40px 30px;">
              <h1 style="margin: 0 0 20px 0; font-size: 24px; color: #333333;">
                Verify Your Email Address
              </h1>
              <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 24px; color: #666666;">
                Hi ${name},
              </p>
              <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 24px; color: #666666;">
                Thank you for signing up! Please verify your email address by clicking the button below.
              </p>
              <table role="presentation" style="margin: 30px 0;">
                <tr>
                  <td style="border-radius: 4px; background-color: #007bff;">
                    <a href="${verificationLink}" target="_blank" style="display: inline-block; padding: 12px 24px; font-size: 16px; color: #ffffff; text-decoration: none; border-radius: 4px;">
                      Verify Email Address
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 20px; color: #999999;">
                Or copy and paste this link into your browser:
              </p>
              <p style="margin: 0 0 20px 0; font-size: 14px; line-height: 20px; color: #007bff; word-break: break-all;">
                ${verificationLink}
              </p>
              <p style="margin: 20px 0 0 0; font-size: 14px; line-height: 20px; color: #999999;">
                <strong>This link will expire in 15 minutes.</strong>
              </p>
              <p style="margin: 20px 0 0 0; font-size: 14px; line-height: 20px; color: #999999;">
                If you didn't create an account, you can safely ignore this email.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim()

  const text = `
Hi ${name},

Thank you for signing up! Please verify your email address by clicking the link below:

${verificationLink}

This link will expire in 15 minutes.

If you didn't create an account, you can safely ignore this email.
  `.trim()

  return { html, text }
}
