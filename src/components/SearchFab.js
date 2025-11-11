"use client"

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

function inferTargetPage(query) {
  const q = (query || '').toLowerCase()
  const has = (w) => q.includes(w)
  if (has('video') || has('film') || has('cinema')) return { path: '/video', type: 'video' }
  if (has('design') || has('graphic') || has('poster') || has('branding')) return { path: '/design', type: 'image' }
  // default to photography/images
  return { path: '/photography', type: 'image' }
}

export default function SearchFab() {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  // Close on route change
  useEffect(() => { setOpen(false); setQuery(''); setSubmitting(false) }, [pathname])

  function handleSubmit(e) {
    e.preventDefault()
    const q = query.trim()
    if (!q) { setOpen(false); return }
    setSubmitting(true)
    const { path } = inferTargetPage(q)
    try {
      router.push(`${path}?q=${encodeURIComponent(q)}`)
    } finally {
      // Close immediately for visual feedback
      setOpen(false)
      setSubmitting(false)
    }
  }

  return (
    <>
      {/* FAB button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-50 md:bottom-8 md:right-8 rounded-full bg-white text-black shadow-xl border border-gray-300 px-4 py-3 text-sm hover:bg-gray-100"
        aria-label={open ? 'Close search' : 'Open search'}
      >
        {open ? 'Close' : 'Search'}
      </button>

      {/* Expandable input */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, x: 200 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 200 }}
            transition={{ type: 'spring', stiffness: 260, damping: 24 }}
            className="fixed bottom-24 right-4 md:right-8 z-50 w-[92vw] sm:w-[32rem] max-w-[92vw]"
          >
            <form
              onSubmit={handleSubmit}
              className="flex items-center gap-2 bg-white border border-gray-300 rounded-full pl-4 pr-2 py-2 shadow-2xl"
            >
              <span className="text-gray-500">💬</span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') { setOpen(false); setQuery('') }
                }}
                placeholder="Ask anything... e.g., travel photos, portraits, street, design"
                className="flex-1 px-2 py-2 rounded-full bg-transparent text-black placeholder-gray-500 focus:outline-none text-sm"
                aria-label="Search"
                autoFocus
              />
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-black text-white rounded-full text-sm hover:bg-gray-800 disabled:opacity-50"
              >
                {submitting ? '...' : 'Go'}
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
