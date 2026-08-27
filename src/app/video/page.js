'use client'

import { useState, useEffect, Suspense } from 'react'
import { motion } from 'framer-motion'
import { useSearchParams } from 'next/navigation'

function videoEmbedUrl(video) {
  if (video.bunnyEmbedUrl) return video.bunnyEmbedUrl
  if (video.bunnyLibraryId && video.bunnyVideoId) {
    return `https://iframe.mediadelivery.net/embed/${video.bunnyLibraryId}/${video.bunnyVideoId}`
  }
  if (video.youtubeUrl) return video.youtubeUrl.replace('watch?v=', 'embed/')
  if (video.vimeoUrl) return video.vimeoUrl.replace('vimeo.com/', 'player.vimeo.com/video/')
  return ''
}

function VideoContent() {
  const [videos, setVideos] = useState([])
  const [activeVideoIds, setActiveVideoIds] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const searchParams = useSearchParams()
  const q = searchParams.get('q') || ''

  useEffect(() => {
    setLoading(true)
    setError(null)
    const endpoint = q.trim()
      ? `/api/search?type=video&q=${encodeURIComponent(q.trim())}`
      : '/api/media?type=video'

    fetch(endpoint)
      .then(res => res.json().then(data => ({ res, data })))
      .then(({ res, data }) => {
        if (!res.ok) {
          setError(typeof data?.error === 'string' ? data.error : 'Failed to load videos')
          setVideos([])
        } else {
          setVideos(Array.isArray(data) ? data : [])
        }
        setLoading(false)
      })
      .catch(err => {
        console.error('Error fetching videos:', err)
        setError('Could not load gallery.')
        setVideos([])
        setLoading(false)
      })
  }, [q])

  return (
    <>
      {q.trim() && (
        <div className="mb-8 border border-white/10 p-4 text-center text-sm text-white/62">
          Results for "{q}"
        </div>
      )}

      {error && (
        <div className="border border-amber-300/20 bg-amber-300/5 px-6 py-12 text-center text-sm text-amber-200/80">
          {error} Check that the database is connected.
        </div>
      )}
      {loading ? (
        <div className="border border-white/10 px-6 py-20 text-center text-[11px] font-semibold uppercase tracking-[0.24em] text-white/42">
          Loading Motion System
        </div>
      ) : !error && videos.length > 0 ? (
        <div className="space-y-8">
          {videos.map((video, index) => (
            <motion.article
              key={video._id}
              initial={{ opacity: 0, y: 42 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: Math.min(index * 0.08, 0.32), duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="premium-surface grid overflow-hidden lg:grid-cols-[1fr_360px]"
            >
              <div className="relative aspect-video bg-white/[0.03]">
                {(video.bunnyEmbedUrl || video.bunnyVideoId || video.youtubeUrl || video.vimeoUrl) && video.thumbnailUrl && !activeVideoIds[video._id] ? (
                  <button
                    type="button"
                    onClick={() => setActiveVideoIds((current) => ({ ...current, [video._id]: true }))}
                    className="group relative h-full w-full overflow-hidden text-left"
                    aria-label={`Play ${video.title || 'video'}`}
                  >
                    <img
                      src={video.thumbnailUrl}
                      alt={`${video.title || 'Video'} thumbnail`}
                      className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
                    />
                    <span className="absolute inset-0 bg-black/20 transition duration-500 group-hover:bg-black/10" />
                    <span className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-black shadow-2xl transition duration-300 group-hover:scale-105">
                      <span className="ml-1 h-0 w-0 border-y-[10px] border-l-[16px] border-y-transparent border-l-black" />
                    </span>
                  </button>
                ) : video.bunnyEmbedUrl || video.bunnyVideoId || video.youtubeUrl || video.vimeoUrl ? (
                  <iframe
                    src={videoEmbedUrl(video)}
                    title={video.title}
                    className="h-full w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : video.cloudinaryUrl ? (
                  <video
                    src={video.cloudinaryUrl}
                    poster={video.thumbnailUrl || undefined}
                    controls
                    className="h-full w-full object-cover"
                  >
                    Your browser does not support the video tag.
                  </video>
                ) : null}
              </div>
              <div className="flex flex-col justify-end border-t border-white/10 p-6 lg:border-l lg:border-t-0 lg:p-8">
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/42">
                  {video.category || 'Motion Piece'} / {String(index + 1).padStart(2, '0')}
                </p>
                <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-white">
                  {video.title || 'Untitled Film'}
                </h2>
                {video.caption && (
                  <p className="mt-4 text-sm leading-6 text-white/62">
                    {video.caption}
                  </p>
                )}
              </div>
            </motion.article>
          ))}
        </div>
      ) : !error ? (
        <div className="border border-white/10 px-6 py-20 text-center">
          <p className="text-lg font-semibold tracking-[-0.02em] text-white">
            {q.trim() ? 'No results found.' : 'No videos are published yet.'}
          </p>
          <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/48">
            Add motion work from the admin dashboard and it will appear here as cinematic feature modules.
          </p>
        </div>
      ) : null}
    </>
  )
}

export default function VideoPage() {
  return (
    <main 
      className="min-h-screen overflow-hidden bg-black text-white"
      style={{
        paddingTop: 'max(8.5rem, calc(8.5rem + env(safe-area-inset-top)))',
      }}
    >
      <section className="relative px-4 pb-20 sm:px-6">
        <div className="pointer-events-none absolute inset-0 soft-vignette" />
        <div className="relative mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
            className="mb-14 grid gap-8 lg:grid-cols-[1fr_0.78fr] lg:items-end"
          >
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.34em] text-white/42">
                Motion Direction
              </p>
              <h1 className="mt-5 max-w-4xl text-5xl font-semibold tracking-[-0.045em] text-white sm:text-7xl lg:text-8xl">
                Video with cinematic pacing.
              </h1>
            </div>
            <p className="max-w-xl text-sm leading-7 text-white/62 sm:text-base">
              Motion work presented as feature releases: large-format playback, quiet metadata,
              and a layout that gives each sequence room to breathe.
            </p>
          </motion.div>

          <Suspense fallback={<div className="border border-white/10 px-6 py-20 text-center text-white/50">Loading...</div>}>
            <VideoContent />
          </Suspense>
        </div>
      </section>
    </main>
  )
}
