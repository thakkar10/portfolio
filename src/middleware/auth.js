/* global process */
import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

export function verifyToken(request) {
  if (!process.env.JWT_SECRET) {
    return { valid: false, error: 'Admin authentication is not configured' }
  }
  const authHeader = request.headers.get('authorization')
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return { valid: false, error: 'No token provided' }
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    )
    return { valid: true, user: decoded }
  } catch {
    return { valid: false, error: 'Invalid token' }
  }
}

