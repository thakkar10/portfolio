'use client'

import { useState, useEffect, Suspense } from 'react'
import { motion } from 'framer-motion'
import MasonryGrid from '@/components/MasonryGrid'
import { useSearchParams } from 'next/navigation'

const categories = ['All', 'Portraits', 'Travel', 'Nature', 'Street', 'Events']

function PhotographyContent() {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const searchParams = useSearchParams()
  const q = searchParams.get('q') || ''

  useEffect(() => {
    setLoading(true)
    setError(null)
    if (q.trim()) {
      fetch(`/api/search?type=image&q=${encodeURIComponent(q.trim())}`)
        .then(res => res.json())
        .then(data => {
          setImages(Array.isArray(data) ? data : [])
          setLoading(false)
        })
        .catch(err => {
          console.error('Error searching images:', err)
          setImages([])
          setLoading(false)
        })
      return
    }
    const categoryParam = selectedCategory === 'All' ? '' : `&category=${selectedCategory}`
    fetch(`/api/media?type=image${categoryParam}`)
      .then(res => res.json().then(data => ({ res, data })))
      .then(({ res, data }) => {
        if (!res.ok) {
          setError(typeof data?.error === 'string' ? data.error : 'Failed to load images')
          setImages([])
        } else {
          const raw = Array.isArray(data) ? data : []
          const filtered = selectedCategory === 'All'
            ? raw.filter((item) => item.category !== 'Design')
            : raw
          setImages(filtered)
        }
        setLoading(false)
      })
      .catch(err => {
        console.error('Error fetching images:', err)
        setError('Could not load gallery.')
        setImages([])
        setLoading(false)
      })
  }, [selectedCategory, q])

  return (
    <>
      {q.trim() && (
        <div className="mb-8 border border-white/10 p-4 text-center text-sm text-white/62">
          Results for "{q}"
        </div>
      )}

      {!q.trim() && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className="mb-14 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <div className="mx-auto flex w-max max-w-full items-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`min-h-[42px] border px-4 text-[10px] font-semibold uppercase tracking-[0.2em] transition-all ${
                  selectedCategory === cat
                    ? 'border-white bg-white text-black'
                    : 'border-white/12 text-white/56 hover:border-white/35 hover:text-white'
                }`}
              >
                {cat === 'All' ? 'All Photos' : cat}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {error && (
        <div className="border border-amber-300/20 bg-amber-300/5 px-6 py-12 text-center text-sm text-amber-200/80">
          {error} Check that the database is connected.
        </div>
      )}
      {loading ? (
        <div className="border border-white/10 px-6 py-20 text-center text-[11px] font-semibold uppercase tracking-[0.24em] text-white/42">
          Loading Image System
        </div>
      ) : !error && images.length > 0 ? (
        <MasonryGrid items={images} />
      ) : !error ? (
        <div className="border border-white/10 px-6 py-20 text-center">
          <p className="text-lg font-semibold tracking-[-0.02em] text-white">
            {q.trim() ? 'No results found.' : 'No images are published in this selection yet.'}
          </p>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/48">
            Add work from the admin dashboard and it will appear here as an editorial archive.
          </p>
        </div>
      ) : null}
    </>
  )
}

export default function PhotographyPage() {
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
                Still Image Archive
              </p>
              <h1 className="mt-5 max-w-4xl text-5xl font-semibold tracking-[-0.045em] text-white sm:text-7xl lg:text-8xl">
                Photography as atmosphere.
              </h1>
            </div>
            <p className="max-w-xl text-sm leading-7 text-white/62 sm:text-base">
              A curated visual system of portraits, travel, street, nature, and event work.
              Browse by format, then open each frame as a cinematic object.
            </p>
          </motion.div>

          <Suspense fallback={<div className="border border-white/10 px-6 py-20 text-center text-white/50">Loading images...</div>}>
            <PhotographyContent />
          </Suspense>
        </div>
      </section>
    </main>
  )
}
