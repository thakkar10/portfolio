'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

export default function AboutPage() {
  return (
    <main 
      className="min-h-screen overflow-hidden bg-black text-white"
      style={{
        paddingTop: 'max(8.5rem, calc(8.5rem + env(safe-area-inset-top)))',
      }}
    >
      <section className="relative px-4 pb-20 sm:px-6">
        <div className="pointer-events-none absolute inset-0 soft-vignette" />
        <div className="relative mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
            className="lg:sticky lg:top-32"
          >
            <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-white/42">
              Creative Direction
            </p>
            <h1 className="mt-5 text-5xl font-semibold tracking-[-0.045em] text-white sm:text-7xl">
              A technical eye for emotional images.
            </h1>
            <p className="mt-6 max-w-xl text-sm leading-7 text-white/62 sm:text-base">
              Heet Thakkar is a photographer, videographer, and creative developer
              working across still images, motion, and digital design.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12, duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-8"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="premium-surface relative aspect-[4/5]">
                <Image
                  src="/me.jpg"
                  alt="Heet Thakkar"
                  fill
                  sizes="(max-width: 768px) 100vw, 40vw"
                  className="object-cover opacity-90"
                  priority
                />
              </div>
              <div className="premium-surface relative aspect-[4/5] sm:mt-16">
                <Image
                  src="/me2.jpg"
                  alt="Heet Thakkar"
                  fill
                  sizes="(max-width: 768px) 100vw, 40vw"
                  className="object-cover opacity-90"
                  priority
                />
              </div>
            </div>

            <div className="border-l border-white/12 pl-6 text-sm leading-7 text-white/66 sm:text-base">
              <p>
                His work is built around the tension between structure and instinct:
                composing with technical precision, then leaving enough space for a
                frame to feel human. Across quiet landscapes, candid street moments,
                portraits, and cinematic sequences, the goal is the same: create images
                that feel intentional without losing their pulse.
              </p>
              <p className="mt-6">
                A background in computer science and design informs the way he thinks
                about systems, pacing, interaction, and presentation. The result is a
                creative practice that treats each photograph, film, and digital surface
                as part of a larger visual language.
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  )
}
