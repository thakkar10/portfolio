import crypto from 'crypto'
import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'

export const dynamic = 'force-dynamic'

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase()
}

function getOwnerEmail() {
  return normalizeEmail(process.env.ADMIN_EMAIL || process.env.CONTACT_EMAIL || process.env.RESEND_FROM_EMAIL)
}

function getOrigin(request) {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_PROJECT_PRODUCTION_URL
  if (configuredUrl) {
    return configuredUrl.startsWith('http') ? configuredUrl : `https://${configuredUrl}`
  }

  return request.headers.get('origin') || new URL(request.url).origin
}

async function sendResetEmail({ request, email, token }) {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not configured')
  }

  const resetUrl = `${getOrigin(request)}/admin/reset?token=${encodeURIComponent(token)}`
  const resend = new Resend(process.env.RESEND_API_KEY)

  const { error } = await resend.emails.send({
    from: 'Portfolio Admin <onboarding@resend.dev>',
    to: [email],
    subject: 'Reset your portfolio admin login',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 24px; color: #111;">
        <h1 style="font-size: 24px; margin-bottom: 12px;">Reset your admin login</h1>
        <p style="line-height: 1.6;">Use this secure link to change your portfolio admin username and password. The link expires in 30 minutes.</p>
        <p style="margin: 28px 0;">
          <a href="${resetUrl}" style="background:#111;color:#fff;padding:12px 18px;text-decoration:none;display:inline-block;letter-spacing:.08em;text-transform:uppercase;font-size:12px;">Reset Login</a>
        </p>
        <p style="line-height: 1.6; color: #555;">If you did not request this, you can ignore this email.</p>
      </div>
    `,
    text: `Reset your portfolio admin login:\n\n${resetUrl}\n\nThis link expires in 30 minutes. If you did not request it, ignore this email.`,
  })

  if (error) throw new Error(error.message || 'Failed to send reset email')
}

export async function POST(request) {
  try {
    const { email } = await request.json()
    const requestedEmail = normalizeEmail(email)
    const ownerEmail = getOwnerEmail()

    if (!requestedEmail) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    await connectDB()

    let user = await User.findOne({ email: requestedEmail }).select('+passwordResetToken +passwordResetExpires')

    if (!user && ownerEmail && requestedEmail === ownerEmail) {
      user = await User.findOne({}).sort({ createdAt: 1 }).select('+passwordResetToken +passwordResetExpires')
      if (user && !user.email) {
        user.email = ownerEmail
      }
    }

    if (user) {
      const token = crypto.randomBytes(32).toString('hex')
      user.passwordResetToken = crypto.createHash('sha256').update(token).digest('hex')
      user.passwordResetExpires = new Date(Date.now() + 30 * 60 * 1000)
      await user.save()
      await sendResetEmail({ request, email: user.email || requestedEmail, token })
    }

    return NextResponse.json({
      success: true,
      message: 'If that email matches the admin account, a reset link has been sent.',
    })
  } catch (error) {
    console.error('Password reset request error:', error)
    return NextResponse.json(
      { error: error.message || 'Could not request reset link' },
      { status: 500 }
    )
  }
}
