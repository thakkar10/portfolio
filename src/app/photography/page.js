'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import MasonryGrid from '@/components/MasonryGrid'
import Image from 'next/image'

const categories = ['All', 'Portraits', 'Travel', 'Nature', 'Street', 'Events']

export default function PhotographyPage() {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
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
  }, [selectedCategory])

  return (
    <main className="min-h-screen pt-20">
      <div className="max-w-7xl mx-auto px-4">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-5xl md:text-7xl font-heading font-normal mb-12 text-center"
        >
          Photography
        </motion.h1>

        {/* Category Filters */}
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
              className={`px-6 py-2 border-b-2 transition-all ${
                selectedCategory === category
                  ? 'border-black font-medium'
                  : 'border-transparent hover:border-gray-400'
              }`}
            >
              {category}
            </button>
          ))}
        </motion.div>

        {/* Gallery */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-pulse text-gray-400">Loading images...</div>
          </div>
        ) : images.length > 0 ? (
          <MasonryGrid items={images} />
        ) : (
          <div className="text-center py-20 text-gray-500">
            No images found in this category.
          </div>
        )}
      </div>
    </main>
  )
}

