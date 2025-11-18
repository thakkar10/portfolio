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
  const searchParams = useSearchParams()
  const q = searchParams.get('q') || ''

  useEffect(() => {
    setLoading(true)
    if (q.trim()) {
      fetch(`/api/semantic-image-search?type=image&q=${encodeURIComponent(q.trim())}`)
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
      .then(res => res.json())
      .then(data => {
        setImages(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Error fetching images:', err)
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

      {/* Category Filters (hide when searching) */}
      {!q.trim() && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="flex flex-wrap gap-4 justify-center mb-12"
        >
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-2 border-b-2 transition-all min-h-[44px] ${
                selectedCategory === category
                  ? 'border-white text-white font-medium'
                  : 'border-transparent text-white/60 hover:border-white/40 hover:text-white/80'
              }`}
            >
              {category}
            </button>
          ))}
        </motion.div>
      )}

      {/* Gallery */}
      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block animate-pulse text-white/60">Loading images...</div>
        </div>
      ) : images.length > 0 ? (
        <MasonryGrid items={images} />
      ) : (
        <div className="text-center py-20 text-white/60">
          {q.trim() ? 'No results for your search.' : 'No images found in this category.'}
        </div>
      )}
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

