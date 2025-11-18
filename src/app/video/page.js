'use client'

import { useState, useEffect, Suspense } from 'react'
import { motion } from 'framer-motion'
import { useSearchParams } from 'next/navigation'

function VideoContent() {
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const searchParams = useSearchParams()
  const q = searchParams.get('q') || ''

  useEffect(() => {
    setLoading(true)
    const endpoint = q.trim()
      ? `/api/semantic-image-search?type=video&q=${encodeURIComponent(q.trim())}`
      : '/api/media?type=video'

    fetch(endpoint)
      .then(res => res.json())
      .then(data => {
        setVideos(Array.isArray(data) ? data : [])
        setLoading(false)
      })
      .catch(err => {
        console.error('Error fetching videos:', err)
        setVideos([])
        setLoading(false)
      })
  }, [q])

  return (
    <>
      {q.trim() && (
        <div className="text-center text-white/70 mb-6">
          Results for "{q}"
        </div>
      )}

      {loading ? (
        <div className="text-center py-20 text-white/60">Loading...</div>
      ) : videos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {videos.map((video, index) => (
            <motion.div
              key={video._id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="aspect-video"
            >
              {video.youtubeUrl ? (
                <iframe
                  src={video.youtubeUrl.replace('watch?v=', 'embed/')}
                  title={video.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : video.vimeoUrl ? (
                <iframe
                  src={video.vimeoUrl.replace('vimeo.com/', 'player.vimeo.com/video/')}
                  title={video.title}
                  className="w-full h-full"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                />
              ) : video.cloudinaryUrl ? (
                <video
                  src={video.cloudinaryUrl}
                  controls
                  className="w-full h-full object-cover"
                >
                  Your browser does not support the video tag.
                </video>
              ) : null}
              {video.title && (
                <h3 className="mt-4 text-xl font-light text-white">{video.title}</h3>
              )}
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-white/60">{q.trim() ? 'No results for your search.' : 'No videos found.'}</div>
      )}
    </>
  )
}

export default function VideoPage() {
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
          Video
        </motion.h1>

        <Suspense fallback={<div className="text-center py-20 text-white/60">Loading...</div>}>
          <VideoContent />
        </Suspense>
      </div>
    </main>
  )
}

