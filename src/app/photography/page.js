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
        <div className="text-center text-white/70 mb-6">
          Results for "{q}"
        </div>
      )}

      {/* Category: dropdown (hide when searching) */}
      {!q.trim() && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="flex justify-center mb-10"
        >
          <label htmlFor="category-select" className="sr-only">
            Category
          </label>
          <select
            id="category-select"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-black border border-white/30 text-white text-center px-6 py-3 min-h-[48px] rounded-none appearance-none cursor-pointer focus:outline-none focus:border-white/60 w-full max-w-[240px] text-base"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='rgba(255,255,255,0.7)'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 12px center',
              backgroundSize: '20px',
              paddingRight: '40px',
            }}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat} className="bg-black text-white">
                {cat === 'All' ? 'All photos' : cat}
              </option>
            ))}
          </select>
        </motion.div>
      )}

      {/* Gallery */}
      {error && (
        <div className="text-center py-20 text-amber-400">
          {error} (Check that the database is connected.)
        </div>
      )}
      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block animate-pulse text-white/60">Loading images...</div>
        </div>
      ) : !error && images.length > 0 ? (
        <MasonryGrid items={images} />
      ) : !error ? (
        <div className="text-center py-20 text-white/60">
          {q.trim() ? 'No results for your search.' : 'No images found in this category.'}
        </div>
      ) : null}
    </>
  )
}

export default function PhotographyPage() {
  return (
    <main 
      className="min-h-screen bg-black"
      style={{
        paddingTop: 'max(6rem, calc(6rem + env(safe-area-inset-top)))',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl sm:text-5xl md:text-7xl font-heading font-normal mb-6 sm:mb-8 text-center text-white"
        >
          Photography
        </motion.h1>

        <Suspense fallback={<div className="text-center py-20"><div className="inline-block animate-pulse text-white/60">Loading images...</div></div>}>
          <PhotographyContent />
        </Suspense>
      </div>
    </main>
  )
}

