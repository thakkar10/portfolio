'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'

export default function ContactPage() {
  const [submitting, setSubmitting] = useState(false)

  return (
    <main 
      className="min-h-screen overflow-hidden bg-black text-white"
      style={{
        paddingTop: 'max(8.5rem, calc(8.5rem + env(safe-area-inset-top)))',
        paddingBottom: 'max(5rem, calc(5rem + env(safe-area-inset-bottom)))',
      }}
    >
      <section className="relative px-4 sm:px-6">
        <div className="pointer-events-none absolute inset-0 soft-vignette" />
        <div className="relative mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.8fr_1fr] lg:items-start">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-white/42">
              Collaborations
            </p>
            <h1 className="mt-5 text-5xl font-semibold tracking-[-0.045em] text-white sm:text-7xl">
              Build the next frame.
            </h1>
            <p className="mt-6 max-w-xl text-sm leading-7 text-white/62 sm:text-base">
              For shoots, motion work, design systems, or creative direction,
              send a concise brief and I will follow up with next steps.
            </p>
            <div className="mt-10 grid gap-4 text-sm text-white/58">
              <a href="mailto:your@email.com" className="border-b border-white/12 pb-4 transition-colors hover:text-white">
                Email
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="border-b border-white/12 pb-4 transition-colors hover:text-white"
              >
                Instagram
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12, duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
            className="premium-surface p-5 sm:p-8"
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
              <div>
                <label htmlFor="name" className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.24em] text-white/44">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  placeholder="Your name"
                  required
                  className="w-full border border-white/12 bg-white/[0.03] px-4 py-4 text-base text-white outline-none transition-colors placeholder:text-white/25 focus:border-white/42"
                />
              </div>

              <div>
                <label htmlFor="email" className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.24em] text-white/44">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="you@example.com"
                  required
                  className="w-full border border-white/12 bg-white/[0.03] px-4 py-4 text-base text-white outline-none transition-colors placeholder:text-white/25 focus:border-white/42"
                />
              </div>

              <div>
                <label htmlFor="message" className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.24em] text-white/44">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  placeholder="Tell me what you want to make."
                  required
                  rows="8"
                  className="w-full resize-none border border-white/12 bg-white/[0.03] px-4 py-4 text-base text-white outline-none transition-colors placeholder:text-white/25 focus:border-white/42"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="min-h-[50px] w-full bg-white px-8 text-[11px] font-semibold uppercase tracking-[0.22em] text-black transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {submitting ? 'Sending' : 'Send Message'}
              </button>
            </form>
          </motion.div>
        </div>
      </section>
    </main>
  )
}
