'use client'

import { motion, useScroll, useTransform, useSpring } from 'framer-motion'
import { useEffect, useState, useRef } from 'react'
import Image from 'next/image'

export default function Home() {
  const [featuredImages, setFeaturedImages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [query, setQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [searchResults, setSearchResults] = useState(null)
  const heroRef = useRef(null)
  const featuredRef = useRef(null)
  
  const quickPrompts = [
    'travel',
    'portraits',
    'street',
    'nature',
    'design',
  ]

  // Hardcoded cover photo - update this path to match your cover image filename
  const coverPhoto = '/cover.jpg'

  // Scroll animations - track scroll progress relative to viewport
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  })
  
  // Smooth spring animations
  const smoothHeroProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 })

  // Transform values for parallax and fade effects
  const heroImageY = useTransform(smoothHeroProgress, [0, 1], ['0%', '50%'])
  const heroImageOpacity = useTransform(smoothHeroProgress, [0, 0.6, 1], [1, 0.6, 0.2])
  const signatureOpacity = useTransform(smoothHeroProgress, [0, 0.5], [1, 0])
  const signatureScale = useTransform(smoothHeroProgress, [0, 0.5], [1, 0.85])
  const signatureY = useTransform(smoothHeroProgress, [0, 0.5], ['0%', '-30%'])
  const scrollPromptOpacity = useTransform(smoothHeroProgress, [0, 0.4], [1, 0])
  const scrollPromptY = useTransform(smoothHeroProgress, [0, 0.4], ['0%', '30%'])

  useEffect(() => {
    // Fetch featured images for the grid (cover photo is hardcoded, so all featured images go to grid)
    setLoading(true)
    setError(null)
    fetch('/api/media?featured=true&limit=10')
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`)
        }
        return res.json()
      })
      .then(data => {
        setFeaturedImages(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(err => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  async function handleSearch(e) {
    e?.preventDefault()
    if (!query.trim()) {
      setSearchResults(null)
      return
    }
    try {
      setSearching(true)
      const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`)
      const data = await res.json()
      setSearchResults(Array.isArray(data) ? data : [])
    } catch (err) {
      setSearchResults([])
    } finally {
      setSearching(false)
    }
  }

  const itemsToShow = searchResults !== null ? searchResults : featuredImages

  return (
    <main className="bg-black" style={{ margin: 0, padding: 0 }}>
      {/* Hero Section with Image */}
      <motion.section
        ref={heroRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative min-h-screen flex items-center justify-center bg-black overflow-hidden"
        style={{ marginBottom: 0 }}
      >
        {/* Background Image - Hero Cover with Parallax */}
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
            <motion.div 
              className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70"
              style={{ opacity: heroImageOpacity }}
            />
            <div className="absolute inset-0 bg-black/20" />
          </motion.div>
        )}
        
        {/* Solid background when no image */}
        {!coverPhoto && (
          <div className="absolute inset-0 z-0 bg-black" />
        )}

        {/* Content Overlay */}
        <div 
          className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 text-center"
          style={{
            paddingTop: 'max(2rem, env(safe-area-inset-top))',
            paddingBottom: 'max(2rem, env(safe-area-inset-bottom))',
          }}
        >
          {/* Signature Image with Scroll-triggered Fade */}
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
        </div>

        {/* Animated Scroll Prompt with Scroll-triggered Fade */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="absolute left-0 right-0 z-10 flex justify-center items-center"
          style={{ 
            bottom: 'max(3rem, calc(3rem + env(safe-area-inset-bottom)))',
            opacity: scrollPromptOpacity,
            y: scrollPromptY
          }}
          onClick={() => {
            const featuredSection = document.getElementById('featured-work')
            if (featuredSection) {
              featuredSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }
          }}
        >
          <div className="flex flex-col items-center justify-center gap-2 sm:gap-3 cursor-pointer group min-h-[60px] min-w-[120px]">
            {/* Animated Text */}
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="text-xs sm:text-sm md:text-base text-white/70 tracking-[0.15em] sm:tracking-[0.2em] uppercase font-light group-hover:text-white/90 transition-colors duration-300 text-center"
            >
              Scroll to explore
            </motion.div>
            
            {/* Animated Arrow */}
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="flex items-center justify-center"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-white/60 group-hover:text-white/80 transition-colors duration-300 sm:w-6 sm:h-6"
              >
                <path d="M7 13l5 5 5-5M7 6l5 5 5-5" />
              </svg>
            </motion.div>
          </div>
        </motion.div>
      </motion.section>

      {/* Featured Grid */}
      <section 
          ref={featuredRef}
          id="featured-work" 
          className="relative pt-20 sm:pt-24 md:pt-32 pb-20 sm:pb-24 md:pb-32 px-4 sm:px-6 bg-black" 
          style={{ 
            marginTop: 0, 
            marginBottom: 0,
            paddingBottom: 'max(5rem, calc(5rem + env(safe-area-inset-bottom)))',
          }}
        >
          <div className="max-w-7xl mx-auto">
            <motion.h2
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, margin: "-150px" }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="text-4xl md:text-5xl font-light tracking-wider mb-16 md:mb-20 text-center text-white/90"
            >
              Featured Work
            </motion.h2>
            
            {loading && (
              <div className="text-center text-white/60 py-12">
                Loading images...
              </div>
            )}
            
            {error && (
              <div className="text-center text-red-400 py-12">
                Error loading images: {error}
              </div>
            )}
            
            {featuredImages && featuredImages.length === 0 && (
              <div className="text-center text-white/60 py-12">
                <p className="mb-2">No results.</p>
                <p className="text-sm">Upload images from the admin dashboard and mark them as featured.</p>
              </div>
            )}
            
            {featuredImages && featuredImages.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                {featuredImages.map((item, index) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, y: 60, scale: 0.9 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: false, margin: "-100px" }}
                  transition={{ 
                    delay: Math.min(index * 0.1, 0.5), 
                    duration: 0.9, 
                    ease: [0.16, 1, 0.3, 1],
                    opacity: { duration: 0.6 },
                    scale: { duration: 0.8 }
                  }}
                  className="relative aspect-square overflow-hidden group cursor-pointer"
                  whileHover={{ scale: 1.02, transition: { duration: 0.3 } }}
                >
                  {item.type === 'image' && item.cloudinaryUrl && (
                    <>
                      <Image
                        src={item.cloudinaryUrl}
                        alt={item.title || 'Work'}
                        fill
                        className="object-cover transition-all duration-700 ease-out group-hover:scale-110"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-500" />
                      <div className="absolute inset-0 border border-white/0 group-hover:border-white/10 transition-all duration-500" />
                    </>
                  )}
                </motion.div>
                ))}
              </div>
            )}
          </div>
        </section>
    </main>
  )
}

