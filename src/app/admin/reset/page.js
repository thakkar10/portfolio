'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function AdminResetPage() {
  const [token, setToken] = useState('')
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setToken(params.get('token') || '')
  }, [])

  const requestReset = async (event) => {
    event.preventDefault()
    setError('')
    setMessage('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/request-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Could not send reset link')
      }

      setMessage(data.message || 'If that email matches the admin account, a reset link has been sent.')
      setEmail('')
    } catch (err) {
      setError(err.message || 'Could not send reset link')
    } finally {
      setLoading(false)
    }
  }

  const resetLogin = async (event) => {
    event.preventDefault()
    setError('')
    setMessage('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, username, password }),
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Could not update admin login')
      }

      localStorage.removeItem('token')
      setMessage('Admin login updated. Sending you back to login...')
      setTimeout(() => router.push('/admin/login'), 1200)
    } catch (err) {
      setError(err.message || 'Could not update admin login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-4 py-16 text-white">
      <div className="w-full max-w-md">
        <p className="mb-4 text-center text-[10px] font-semibold uppercase tracking-[0.28em] text-white/42">
          Admin Access
        </p>
        <h1 className="mb-8 text-center text-4xl font-semibold tracking-[-0.04em]">
          {token ? 'Reset Login' : 'Recover Login'}
        </h1>

        <form onSubmit={token ? resetLogin : requestReset} className="space-y-5">
          {!token ? (
            <div>
              <label htmlFor="email" className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.22em] text-white/42">
                Owner Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                className="w-full border border-white/14 bg-white/[0.04] px-4 py-3 text-white outline-none transition-colors placeholder:text-white/30 focus:border-white/42"
                placeholder="you@example.com"
              />
            </div>
          ) : (
            <>
              <div>
                <label htmlFor="username" className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.22em] text-white/42">
                  New Username
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  required
                  minLength={4}
                  className="w-full border border-white/14 bg-white/[0.04] px-4 py-3 text-white outline-none transition-colors placeholder:text-white/30 focus:border-white/42"
                  placeholder="New username"
                />
              </div>
              <div>
                <label htmlFor="password" className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.22em] text-white/42">
                  New Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  minLength={10}
                  className="w-full border border-white/14 bg-white/[0.04] px-4 py-3 text-white outline-none transition-colors placeholder:text-white/30 focus:border-white/42"
                  placeholder="At least 10 characters"
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.22em] text-white/42">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
                  minLength={10}
                  className="w-full border border-white/14 bg-white/[0.04] px-4 py-3 text-white outline-none transition-colors placeholder:text-white/30 focus:border-white/42"
                  placeholder="Repeat password"
                />
              </div>
            </>
          )}

          {error && <p className="text-sm text-red-300">{error}</p>}
          {message && <p className="text-sm leading-6 text-white/62">{message}</p>}

          <button
            type="submit"
            disabled={loading}
            className="min-h-[48px] w-full bg-white px-6 text-[11px] font-semibold uppercase tracking-[0.2em] text-black transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Working...' : token ? 'Update Login' : 'Email Reset Link'}
          </button>
        </form>

        <Link
          href="/admin/login"
          className="mt-6 block text-center text-[10px] font-semibold uppercase tracking-[0.22em] text-white/44 transition-colors hover:text-white"
        >
          Back to Login
        </Link>
      </div>
    </main>
  )
}
