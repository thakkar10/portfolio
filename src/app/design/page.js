'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import MasonryGrid from '@/components/MasonryGrid'
import { useSearchParams } from 'next/navigation'

export default function DesignPage() {
  const [designs, setDesigns] = useState([])
  const [loading, setLoading] = useState(true)
  const searchParams = useSearchParams()
  const q = searchParams.get('q') || ''

  useEffect(() => {
    setLoading(true)
    const endpoint = q.trim()
      ? `/api/semantic-image-search?q=${encodeURIComponent(q.trim())}`
      : '/api/media?category=Design'

    fetch(endpoint)
      .then(res => res.json())
      .then(data => {
        setDesigns(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(err => {
        console.error('Error fetching designs:', err)
        setDesigns([])
        setLoading(false)
      })
  }, [q])

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
          Design
        </motion.h1>

        {q.trim() && (
          <div className="text-center text-white/70 mb-6">
            Results for “{q}”
          </div>
        )}

        {loading ? (
          <div className="text-center py-20 text-white/60">Loading...</div>
        ) : designs.length > 0 ? (
          <MasonryGrid items={designs} />
        ) : (
          <div className="text-center py-20 text-white/60">{q.trim() ? 'No results for your search.' : 'No design work found.'}</div>
        )}
      </div>
    </main>
  )
}

