'use client'

import { motion } from 'framer-motion'

export default function AboutPage() {
  return (
    <main className="min-h-screen pt-20">
      <div className="max-w-3xl mx-auto px-4">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-5xl md:text-7xl font-heading font-normal mb-12 text-center"
        >
          About
        </motion.h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="prose prose-lg max-w-none mb-12"
        >
          <p className="text-lg leading-relaxed mb-6">
            Welcome to my portfolio. I'm a photographer, videographer, and designer
            passionate about capturing moments and creating visual stories.
          </p>
          <p className="text-lg leading-relaxed mb-6">
            Through my work, I explore the intersection of art and technology,
            bringing creative visions to life across various mediums.
          </p>
        </motion.div>
      </div>
    </main>
  )
}

