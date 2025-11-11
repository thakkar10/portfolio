'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

export default function AboutPage() {
  return (
    <main 
      className="min-h-screen bg-black"
      style={{
        paddingTop: 'max(6rem, calc(6rem + env(safe-area-inset-top)))',
      }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 sm:pt-12">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl sm:text-5xl md:text-7xl font-heading font-normal mb-6 sm:mb-10 md:mb-12 text-center text-white"
        >
          About
        </motion.h1>

        {/* Mobile image directly under header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="md:hidden mb-8"
        >
          <div className="relative w-full">
            {/* Mobile Polaroid 1 */}
            <div className="relative w-[90%] mx-auto bg-white rounded-sm shadow-2xl p-3 pb-10 rotate-[-4deg] ring-1 ring-black/10">
              <div className="relative w-full aspect-[4/5] overflow-hidden">
                <Image
                  src="/me.jpg"
                  alt="Heet Thakkar"
                  fill
                  sizes="100vw"
                  className="object-cover"
                  priority
                />
              </div>
            </div>
            {/* Mobile Polaroid 2 overlapping more */}
            <div className="relative w-[90%] mx-auto bg-white rounded-sm shadow-2xl p-3 pb-10 rotate-[6deg] ring-1 ring-black/10 -mt-16 translate-x-4">
              <div className="relative w-full aspect-[4/5] overflow-hidden">
                <Image
                  src="/me2.jpg"
                  alt="Heet Thakkar (2)"
                  fill
                  sizes="100vw"
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Editorial layout on desktop */}
        <div className="grid md:grid-cols-12 gap-8 md:gap-12 items-start">
          {/* Left: sticky polaroid stack on desktop */}
          <motion.aside
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="hidden md:block md:col-span-5"
          >
            <div className="md:sticky md:top-28">
              <div className="relative w-full">
                {/* Polaroid 1 */}
                <div className="relative w-[88%] bg-white rounded-sm shadow-2xl p-3 pb-10 rotate-[-2.5deg] ring-1 ring-black/10">
                  <div className="relative w-full aspect-[4/5] overflow-hidden">
                    <Image
                      src="/me.jpg"
                      alt="Heet Thakkar"
                      fill
                      sizes="(min-width: 1024px) 30vw, 45vw"
                      className="object-cover"
                      priority
                    />
                  </div>
                </div>
                {/* Polaroid 2 (overlapping) */}
                <div className="relative w-[88%] bg-white rounded-sm shadow-2xl p-3 pb-10 rotate-[3deg] ring-1 ring-black/10 -mt-10 ml-auto mr-2">
                  <div className="relative w-full aspect-[4/5] overflow-hidden">
                    <Image
                      src="/me2.jpg"
                      alt="Heet Thakkar (2)"
                      fill
                      sizes="(min-width: 1024px) 30vw, 45vw"
                      className="object-cover"
                      priority
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.aside>

          {/* Right: content with vertical divider and narrow measure */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="md:col-span-7 md:border-l md:border-white/10 md:pl-10"
          >
            <div className="max-w-prose">
              <p className="text-lg leading-relaxed mb-6 text-white/90">
                Heet Thakkar is a photographer, videographer, and creative developer based in Connecticut. 
                His passion for visual storytelling began in his early teens, when capturing everyday moments with his camera 
                became a way to express how he saw the world. What started as simple experiments with light and framing 
                gradually grew into a deep fascination with how emotion, movement, and color can tell a story. 
                Whether it’s a cinematic video sequence, a landscape at golden hour, or a candid street photo, 
                Heet strives to capture scenes that feel both natural and intentional, moments that invite viewers to pause 
                and feel something real.
              </p>

              {/* Pull quote for editorial feel */}
              <div className="my-10 pl-4 border-l-2 border-white/20">
                <p className="italic text-white/80 text-xl leading-relaxed">
                  “Blending artistry, emotion, and modern design to tell authentic stories.”
                </p>
              </div>

              <p className="text-lg leading-relaxed mb-6 text-white/90">
                Drawing inspiration from travel, design, and technology, Heet’s work spans photography,
                video production, and digital art. He’s particularly interested in the intersection of 
                creativity and innovation, while also blending artistic vision with technical precision. Each project 
                is approached with a balance of structure and spontaneity, often using modern tools and editing 
                techniques to bring out the atmosphere and rhythm of a scene. His background in computer science 
                and design influences the way he constructs visuals, from composing a frame to developing digital 
                experiences that bring his work to life online.
              </p>
              <p className="text-lg leading-relaxed mb-6 text-white/90">
                For Heet, photography and video are more than creative outlets, they’re ways to connect people 
                through shared emotion and perspective. Every shoot is an opportunity to explore new ideas, refine 
                his craft, and capture fleeting moments that often go unnoticed. Whether he’s documenting quiet natural 
                landscapes, vibrant city life, or dynamic video content, his goal remains the same: to tell authentic 
                stories that blend artistry, emotion, and modern design.
              </p>
            </div>
          </motion.section>
        </div>
      </div>
    </main>
  )
}

