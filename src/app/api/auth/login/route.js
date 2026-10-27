/* global process */
import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import User from '@/models/User'
import jwt from 'jsonwebtoken'

// Mark as dynamic to prevent build-time evaluation
export const dynamic = 'force-dynamic'

export async function POST(request) {
  if (!process.env.JWT_SECRET) {
    return NextResponse.json({ error: 'Admin authentication is not configured' }, { status: 503 })
  }
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password required' },
        { status: 400 }
      )
    }

    await connectDB()
    const user = await User.findOne({ username })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    const token = jwt.sign(
      { userId: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    )

    return NextResponse.json({ token, username: user.username })
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    )
  }
}

