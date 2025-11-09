import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

export function verifyToken(request) {
  const authHeader = request.headers.get('authorization')
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return { valid: false, error: 'No token provided' }
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your-secret-key-change-in-production'
    )
    return { valid: true, user: decoded }
  } catch (error) {
    return { valid: false, error: 'Invalid token' }
  }
}

