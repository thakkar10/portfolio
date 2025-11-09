'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import MasonryGrid from '@/components/MasonryGrid'

export default function DesignPage() {
  const [designs, setDesigns] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/media?category=Design')
      .then(res => res.json())
      .then(data => {
        setDesigns(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Error fetching designs:', err)
        setLoading(false)
      })
  }, [])

  return (
    <main className="min-h-screen pt-20">
      <div className="max-w-7xl mx-auto px-4">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-5xl md:text-7xl font-heading font-normal mb-12 text-center"
        >
          Design
        </motion.h1>

        {loading ? (
          <div className="text-center py-20">Loading...</div>
        ) : designs.length > 0 ? (
          <MasonryGrid items={designs} />
        ) : (
          <div className="text-center py-20 text-gray-500">No design work found.</div>
        )}
      </div>
    </main>
  )
}

