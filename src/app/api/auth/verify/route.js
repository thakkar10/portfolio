import { NextResponse } from 'next/server'
import { verifyToken } from '@/middleware/auth'

// Mark as dynamic to prevent build-time evaluation
export const dynamic = 'force-dynamic'

export async function GET(request) {
  const auth = verifyToken(request)
  if (!auth.valid) return NextResponse.json({ valid: false, error: auth.error }, { status: 401 })
  return NextResponse.json({ valid: true, username: auth.user.username })
}

