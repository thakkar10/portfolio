'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'

export default function ContactPage() {
  const [submitting, setSubmitting] = useState(false)


  return (
    <main 
      className="min-h-screen pt-20 sm:pt-24 pb-20 bg-black"
      style={{
        paddingTop: 'max(7.5rem, calc(7.5rem + env(safe-area-inset-top)))',
        paddingBottom: 'max(5rem, calc(5rem + env(safe-area-inset-bottom)))',
      }}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-heading font-normal mb-4 sm:mb-6 text-white">
            Contact
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed px-2">
            Have a project in mind or want to collaborate? I'd love to hear from you.
            Send me a message and I'll respond as soon as possible.
          </p>
        </motion.div>

        {/* Form Container */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="bg-white border border-gray-300 rounded-lg p-6 sm:p-8 md:p-12 shadow-lg"
        >
          <form
            onSubmit={async (e) => {
              e.preventDefault()
              setSubmitting(true)
              const formData = new FormData(e.target)
              const data = Object.fromEntries(formData)
              
              try {
                const res = await fetch('/api/contact', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(data),
                })
                const result = await res.json()
                if (res.ok) {
                  alert('Message sent successfully!')
                  e.target.reset()
                } else {
                  alert(`Error: ${result.error || 'Failed to send message. Please try again.'}`)
                }
              } catch (err) {
                console.error('Contact form error:', err)
                alert(`Error: ${err.message || 'Failed to send message. Please try again.'}`)
              } finally {
                setSubmitting(false)
              }
            }}
            className="space-y-6"
          >
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Your name"
                required
                className="w-full px-4 py-3.5 sm:py-3 border border-gray-300 rounded-md bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400 transition-all text-base"
              />
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="your.email@example.com"
                required
                className="w-full px-4 py-3.5 sm:py-3 border border-gray-300 rounded-md bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400 transition-all text-base"
              />
            </div>

            {/* Message Field */}
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                placeholder="Tell me about your project or inquiry..."
                required
                rows="8"
                className="w-full px-4 py-3.5 sm:py-3 border border-gray-300 rounded-md bg-white text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400 resize-none transition-all text-base"
              />
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="w-full md:w-auto px-10 py-4 bg-black text-white font-light tracking-wider uppercase text-sm hover:bg-gray-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-md min-h-[48px]"
              >
                {submitting ? 'Sending...' : 'Send Message'}
              </button>
            </div>
          </form>
        </motion.div>

        {/* Additional Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-16 text-center"
        >
          <p className="text-gray-400 text-sm mb-4">Or reach out directly</p>
          <div className="flex flex-wrap justify-center gap-6">
            <a
              href="mailto:your@email.com"
              className="text-gray-400 hover:text-white transition-colors border-b border-transparent hover:border-white pb-1"
            >
              Email
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition-colors border-b border-transparent hover:border-white pb-1"
            >
              Instagram
            </a>
          </div>
        </motion.div>
      </div>
    </main>
  )
}

