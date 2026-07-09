'use client'

import { useState, useEffect, Suspense } from 'react'
import { motion } from 'framer-motion'
import MasonryGrid from '@/components/MasonryGrid'
import { useSearchParams } from 'next/navigation'

function DesignContent() {
  const [designs, setDesigns] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const searchParams = useSearchParams()
  const q = searchParams.get('q') || ''

  useEffect(() => {
    setLoading(true)
    setError(null)
    const endpoint = q.trim()
      ? `/api/search?q=${encodeURIComponent(q.trim())}`
      : '/api/media?category=Design'

    fetch(endpoint)
      .then(res => res.json().then(data => ({ res, data })))
      .then(({ res, data }) => {
        if (!res.ok) {
          setError(typeof data?.error === 'string' ? data.error : 'Failed to load designs')
          setDesigns([])
        } else {
          setDesigns(Array.isArray(data) ? data : [])
        }
        setLoading(false)
      })
      .catch(err => {
        console.error('Error fetching designs:', err)
        setError('Could not load gallery.')
        setDesigns([])
        setLoading(false)
      })
  }, [q])

  return (
    <>
      {q.trim() && (
        <div className="mb-8 border border-white/10 p-4 text-center text-sm text-white/62">
          Results for "{q}"
        </div>
      )}

      {error && (
        <div className="border border-amber-300/20 bg-amber-300/5 px-6 py-12 text-center text-sm text-amber-200/80">
          {error} Check that the database is connected.
        </div>
      )}
      {loading ? (
        <div className="border border-white/10 px-6 py-20 text-center text-[11px] font-semibold uppercase tracking-[0.24em] text-white/42">
          Loading Design System
        </div>
      ) : !error && designs.length > 0 ? (
        <MasonryGrid items={designs} />
      ) : !error ? (
        <div className="border border-white/10 px-6 py-20 text-center">
          <p className="text-lg font-semibold tracking-[-0.02em] text-white">
            {q.trim() ? 'No results found.' : 'No design work is published yet.'}
          </p>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/48">
            Add design work from the admin dashboard and it will appear here as a polished visual archive.
          </p>
        </div>
      ) : null}
    </>
  )
}

export default function DesignPage() {
  return (
    <main 
      className="min-h-screen overflow-hidden bg-black text-white"
      style={{
        paddingTop: 'max(8.5rem, calc(8.5rem + env(safe-area-inset-top)))',
      }}
    >
      <section className="relative px-4 pb-20 sm:px-6">
        <div className="pointer-events-none absolute inset-0 soft-vignette" />
        <div className="relative mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
            className="mb-14 grid gap-8 lg:grid-cols-[1fr_0.78fr] lg:items-end"
          >
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-white/42">
                Graphic Systems
              </p>
              <h1 className="mt-5 max-w-4xl text-5xl font-semibold tracking-[-0.045em] text-white sm:text-7xl lg:text-8xl">
                Design with engineered restraint.
              </h1>
            </div>
            <p className="max-w-xl text-sm leading-7 text-white/62 sm:text-base">
              A focused design archive for posters, layouts, visual systems, and graphic experiments
              built around contrast, rhythm, and clarity.
            </p>
          </motion.div>

          <Suspense fallback={<div className="border border-white/10 px-6 py-20 text-center text-white/50">Loading...</div>}>
            <DesignContent />
          </Suspense>
        </div>
      </section>
    </main>
  )
}
