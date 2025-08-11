import { Resend } from 'resend'

import { env } from '@/lib/env'

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null

export interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendEmail(options: EmailOptions) {
  if (!resend) {
    console.warn('RESEND_API_KEY not configured - email sending disabled')
    console.log('Would send email:', {
      to: options.to,
      subject: options.subject,
      from: env.FROM_EMAIL,
    })
    return { id: 'mock-email-id' }
  }

  try {
    const { data, error } = await resend.emails.send({
      from: env.FROM_EMAIL,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    })

    if (error) {
      console.error('Email send error:', error)
      throw new Error(`Failed to send email: ${error.message}`)
    }

    return data
  } catch (error) {
    console.error('Email send error:', error)
    throw error
  }
}

export function generateVerificationEmailHtml(token: string, baseUrl: string) {
  const verificationUrl = `${baseUrl}/auth/verify?token=${token}`

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <title>Email Verification</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            text-align: center;
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
          }
          .button {
            display: inline-block;
            background: #007bff;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 4px;
            margin: 20px 0;
          }
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            font-size: 14px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Welcome to Todo Vibe!</h1>
        </div>
        
        <p>Thank you for registering with Todo Vibe. To complete your registration, please verify your email address by clicking the button below:</p>
        
        <div style="text-align: center;">
          <a href="${verificationUrl}" class="button">Verify Email Address</a>
        </div>
        
        <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
        <p><a href="${verificationUrl}">${verificationUrl}</a></p>
        
        <div class="footer">
          <p><strong>Important:</strong> This verification link will expire in 24 hours.</p>
          <p>If you didn't create an account with Todo Vibe, please ignore this email.</p>
        </div>
      </body>
    </html>
  `
}

export function generateVerificationEmailText(token: string, baseUrl: string) {
  const verificationUrl = `${baseUrl}/auth/verify?token=${token}`

  return `
Welcome to Todo Vibe!

Thank you for registering with Todo Vibe. To complete your registration, please verify your email address by visiting the following link:

${verificationUrl}

This verification link will expire in 24 hours.

If you didn't create an account with Todo Vibe, please ignore this email.
  `.trim()
}

export async function sendVerificationEmail(email: string, token: string) {
  const baseUrl = env.NEXTAUTH_URL || 'http://localhost:3000'

  return sendEmail({
    to: email,
    subject: 'Verify your email address - Todo Vibe',
    html: generateVerificationEmailHtml(token, baseUrl),
    text: generateVerificationEmailText(token, baseUrl),
  })
}
