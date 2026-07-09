'use client'

import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
import { useEffect, useState, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { shuffleItems } from '@/lib/shuffle'

const showcaseFallbacks = [
  {
    title: 'Photography',
    eyebrow: 'Still Image Archive',
    description: 'Portrait, travel, street, and nature frames composed around light, texture, and atmosphere.',
    href: '/photography',
    image: null,
    cta: 'Explore Photo',
  },
  {
    title: 'Motion',
    eyebrow: 'Video Direction',
    description: 'Cinematic sequences, pacing, and visual rhythm designed to feel immersive and deliberate.',
    href: '/video',
    image: null,
    cta: 'View Video',
  },
  {
    title: 'Design',
    eyebrow: 'Graphic Systems',
    description: 'Visual design work with a focus on clarity, contrast, and modern brand expression.',
    href: '/design',
    image: null,
    cta: 'See Design',
  },
]

export default function Home() {
  const [featuredImages, setFeaturedImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const heroRef = useRef(null)
  const featuredRef = useRef(null)
  
  // Hardcoded cover photo - update this path to match your cover image filename
  const coverPhoto = '/Cover_New.png'

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  })
  
  const smoothHeroProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 })

  const heroImageY = useTransform(smoothHeroProgress, [0, 1], ['0%', '34%'])
  const heroImageOpacity = useTransform(smoothHeroProgress, [0, 0.7, 1], [1, 0.72, 0.22])
  const signatureOpacity = useTransform(smoothHeroProgress, [0, 0.5], [1, 0])
  const signatureScale = useTransform(smoothHeroProgress, [0, 0.5], [1, 0.85])
  const signatureY = useTransform(smoothHeroProgress, [0, 0.5], ['0%', '-30%'])
  const detailOpacity = useTransform(smoothHeroProgress, [0, 0.42], [1, 0])
  const detailY = useTransform(smoothHeroProgress, [0, 0.42], ['0%', '18%'])

  useEffect(() => {
    setLoading(true)
    setError(null)
    fetch('/api/media?featured=true&limit=6')
      .then(res => res.json().then(data => ({ res, data })))
      .then(({ res, data }) => {
        if (!res.ok) {
          throw new Error(typeof data?.error === 'string' ? data.error : `Failed to load gallery (${res.status})`)
        }
        setFeaturedImages(Array.isArray(data) ? shuffleItems(data) : [])
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setFeaturedImages([])
        setLoading(false)
      })
  }, [])

  const featuredCards = featuredImages.length > 0
    ? featuredImages.slice(0, 6).map((item, index) => ({
        title: item.title || `Selected Frame ${index + 1}`,
        eyebrow: item.category || 'Selected Work',
        description: item.caption || 'A curated preview from the photography archive.',
        href: '/photography',
        image: item.cloudinaryUrl,
        cta: 'Open Archive',
      }))
    : showcaseFallbacks

  return (
    <main className="bg-black text-white" style={{ margin: 0, padding: 0 }}>
      <motion.section
        ref={heroRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative min-h-screen overflow-hidden bg-black"
        style={{ marginBottom: 0 }}
      >
        {coverPhoto && (
          <motion.div 
            className="absolute inset-0 z-0"
            style={{ y: heroImageY, opacity: heroImageOpacity }}
          >
            <Image
              src={coverPhoto}
              alt="Cover photo"
              fill
              className="object-cover scale-105 md:scale-105"
              priority
              sizes="100vw"
              style={{ 
                objectPosition: 'center center'
              }}
            />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_26%,rgba(255,255,255,0.08),transparent_28%),linear-gradient(180deg,rgba(0,0,0,0.42)_0%,rgba(0,0,0,0.24)_38%,rgba(0,0,0,0.92)_100%)]" />
            <div className="absolute inset-0 bg-black/18" />
          </motion.div>
        )}
        
        {!coverPhoto && (
          <div className="absolute inset-0 z-0 bg-black" />
        )}

        <div 
          className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 text-center sm:px-6"
          style={{
            paddingTop: 'max(8rem, calc(8rem + env(safe-area-inset-top)))',
            paddingBottom: 'max(6rem, calc(6rem + env(safe-area-inset-bottom)))',
          }}
        >
          <motion.div
            style={{ opacity: detailOpacity, y: detailY }}
            className="mb-8 flex items-center gap-3 text-[10px] font-medium uppercase tracking-[0.32em] text-white/58 sm:text-xs"
          >
            <span className="h-px w-8 bg-white/28" />
            Visual Systems
            <span className="h-px w-8 bg-white/28" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="mb-8 sm:mb-12 md:mb-16"
            style={{ 
              opacity: signatureOpacity,
              scale: signatureScale,
              y: signatureY
            }}
          >
            <div className="relative w-auto h-28 sm:h-36 md:h-56 lg:h-64 signature-container">
              <Image
                src="/signature.png"
                alt="Signature"
                width={600}
                height={200}
                className="h-full w-auto object-contain signature-image drop-shadow-2xl"
                priority
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            style={{ opacity: detailOpacity, y: detailY }}
            className="mx-auto max-w-2xl"
          >
            <p className="text-base leading-7 text-white/72 sm:text-lg">
              A cinematic portfolio of photography, motion, and design built with
              the precision of a product launch and the restraint of an editorial system.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/photography"
                className="group flex min-h-[46px] items-center justify-center bg-white px-6 text-[11px] font-semibold uppercase tracking-[0.2em] text-black transition-transform duration-300 hover:scale-[1.02]"
              >
                View Photography
              </Link>
              <Link
                href="/video"
                className="flex min-h-[46px] items-center justify-center border border-white/18 px-6 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/78 transition-colors hover:border-white/48 hover:text-white"
              >
                Watch Motion
              </Link>
            </div>
          </motion.div>
        </div>

        <motion.button
          type="button"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="absolute bottom-8 left-1/2 z-10 flex flex-col items-center gap-3 text-[10px] font-medium uppercase tracking-[0.28em] text-white/50 transition-colors hover:text-white sm:bottom-10"
          style={{ opacity: detailOpacity, x: '-50%', y: detailY }}
          onClick={() => {
            const featuredSection = document.getElementById('featured-work')
            if (featuredSection) {
              featuredSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }
          }}
        >
          Explore
          <span className="relative h-11 w-px overflow-hidden bg-white/14">
            <span className="absolute left-0 top-0 h-5 w-px animate-pulse bg-white/70" />
          </span>
        </motion.button>
      </motion.section>

      <section
        ref={featuredRef}
        id="featured-work"
        className="relative overflow-hidden bg-black px-4 py-24 text-white sm:px-6 sm:py-32 lg:py-40"
      >
        <div className="pointer-events-none absolute inset-0 soft-vignette" />
        <div className="relative mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-120px" }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-white/42">
                Selected Work
              </p>
              <h2 className="mt-5 max-w-3xl text-4xl font-semibold tracking-[-0.03em] text-white sm:text-6xl lg:text-7xl">
                Cinematic work. Curated with intention.
              </h2>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-120px" }}
              transition={{ delay: 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-xl text-sm leading-7 text-white/62 sm:text-base"
            >
              <p>
                This is a preview, not the archive. Each doorway below leads into a more
                complete body of work across stills, motion, and graphic systems.
              </p>
            </motion.div>
          </div>

          {loading && (
            <div className="mt-16 border border-white/10 p-8 text-sm uppercase tracking-[0.2em] text-white/42">
              Curating selection...
            </div>
          )}
          
          {error && (
            <div className="mt-16 border border-white/10 p-8 text-sm text-white/46">
              Live featured media is unavailable, so this preview is using the curated portfolio pathways.
            </div>
          )}

          {!loading && (
            <div className="mt-16 grid gap-4 lg:grid-cols-12 lg:gap-5">
              {featuredCards.map((item, index) => (
                <motion.div
                  key={`${item.title}-${index}`}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-90px" }}
                  transition={{
                    delay: Math.min(index * 0.08, 0.32),
                    duration: 0.8,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className={index === 0 ? 'lg:col-span-7 lg:row-span-2' : 'lg:col-span-5'}
                >
                  <Link
                    href={item.href}
                    className={`group image-sheen premium-surface block ${index === 0 ? 'min-h-[620px]' : 'min-h-[300px]'}`}
                  >
                    {item.image && (
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover opacity-78 transition duration-700 ease-out group-hover:scale-[1.035] group-hover:opacity-95"
                        sizes={index === 0 ? '(max-width: 1024px) 100vw, 58vw' : '(max-width: 1024px) 100vw, 42vw'}
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/45">
                        {item.eyebrow}
                      </p>
                      <h3 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white sm:text-4xl">
                        {item.title}
                      </h3>
                      <p className="mt-4 max-w-xl text-sm leading-6 text-white/62">
                        {item.description}
                      </p>
                      <div className="mt-6 inline-flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/78">
                        {item.cta}
                        <span className="h-px w-8 bg-white/38 transition-all duration-300 group-hover:w-12 group-hover:bg-white" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
