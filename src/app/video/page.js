'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

export default function VideoPage() {
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/media?type=video')
      .then(res => res.json())
      .then(data => {
        setVideos(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Error fetching videos:', err)
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
          Video
        </motion.h1>

        {loading ? (
          <div className="text-center py-20">Loading...</div>
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
                  <h3 className="mt-4 text-xl font-light">{video.title}</h3>
                )}
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-gray-500">No videos found.</div>
        )}
      </div>
    </main>
  )
}

