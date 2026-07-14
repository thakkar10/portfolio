import crypto from 'crypto'
import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'

export const dynamic = 'force-dynamic'

function clean(value) {
  return String(value || '').trim()
}

export async function POST(request) {
  try {
    const { token, username, password } = await request.json()
    const cleanToken = clean(token)
    const cleanUsername = clean(username)
    const cleanPassword = clean(password)

    if (!cleanToken || !cleanUsername || !cleanPassword) {
      return NextResponse.json(
        { error: 'Reset token, username, and password are required' },
        { status: 400 }
      )
    }

    if (cleanUsername.length < 4) {
      return NextResponse.json(
        { error: 'Username must be at least 4 characters' },
        { status: 400 }
      )
    }

    if (cleanPassword.length < 10) {
      return NextResponse.json(
        { error: 'Password must be at least 10 characters' },
        { status: 400 }
      )
    }

    await connectDB()

    const hashedToken = crypto.createHash('sha256').update(cleanToken).digest('hex')
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: new Date() },
    }).select('+passwordResetToken +passwordResetExpires')

    if (!user) {
      return NextResponse.json(
        { error: 'Reset link is invalid or expired' },
        { status: 400 }
      )
    }

    const existingUsername = await User.findOne({
      username: cleanUsername,
      _id: { $ne: user._id },
    })

    if (existingUsername) {
      return NextResponse.json(
        { error: 'Username is already in use' },
        { status: 409 }
      )
    }

    user.username = cleanUsername
    user.password = cleanPassword
    user.passwordResetToken = undefined
    user.passwordResetExpires = undefined
    await user.save()

    return NextResponse.json({
      success: true,
      message: 'Admin login updated successfully.',
    })
  } catch (error) {
    console.error('Password reset error:', error)
    return NextResponse.json(
      { error: error.message || 'Could not reset admin login' },
      { status: 500 }
    )
  }
}
