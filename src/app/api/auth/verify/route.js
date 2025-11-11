import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

// Mark as dynamic to prevent build-time evaluation
export const dynamic = 'force-dynamic'

export async function GET(request) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
      return NextResponse.json(
        { valid: false, error: 'No token provided' },
        { status: 401 }
      )
    }

    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'your-secret-key-change-in-production'
      )
      return NextResponse.json({ valid: true, username: decoded.username })
    } catch (err) {
      return NextResponse.json(
        { valid: false, error: 'Invalid token' },
        { status: 403 }
      )
    }
  } catch (error) {
    return NextResponse.json(
      { valid: false, error: error.message },
      { status: 500 }
    )
  }
}

