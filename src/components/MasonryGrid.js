'use client'

import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { useEffect, useMemo, useRef, useState } from 'react'

const layoutClasses = [
  'lg:col-span-7 lg:row-span-2 min-h-[520px]',
  'lg:col-span-5 min-h-[300px]',
  'lg:col-span-5 min-h-[300px]',
  'lg:col-span-4 min-h-[380px]',
  'lg:col-span-4 min-h-[380px]',
  'lg:col-span-4 min-h-[380px]',
]

export default function MasonryGrid({ items, initialSelectedId }) {
  const [selectedIndex, setSelectedIndex] = useState(null)
  const [shareStatus, setShareStatus] = useState('')
  const openedInitialIdRef = useRef(null)

  const selectedImage = selectedIndex !== null ? items[selectedIndex] : null

  const orderedItems = useMemo(() => {
    return items.map((item, index) => ({ ...item, displayIndex: index }))
  }, [items])

  useEffect(() => {
    if (!initialSelectedId || openedInitialIdRef.current === initialSelectedId) return

    const matchingIndex = items.findIndex((item) => item._id === initialSelectedId)
    if (matchingIndex === -1) return

    openedInitialIdRef.current = initialSelectedId
    setSelectedIndex(matchingIndex)
  }, [initialSelectedId, items])

  useEffect(() => {
    if (!selectedImage) return

    const onKeyDown = (event) => {
      if (event.key === 'Escape') setSelectedIndex(null)
      if (event.key === 'ArrowRight') {
        setSelectedIndex((current) => current === null ? current : Math.min(current + 1, items.length - 1))
      }
      if (event.key === 'ArrowLeft') {
        setSelectedIndex((current) => current === null ? current : Math.max(current - 1, 0))
      }
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = 'unset'
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [items.length, selectedImage])

  useEffect(() => {
    setShareStatus('')
  }, [selectedImage])

  const shareSelectedImage = async () => {
    if (!selectedImage?._id) return

    const url = `${window.location.origin}/photography?image=${encodeURIComponent(selectedImage._id)}`
    const shareData = {
      title: selectedImage.title ? `${selectedImage.title} | Heet Thakkar` : 'Heet Thakkar Portfolio',
      text: "Check out Heet's portfolio",
      url,
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
        return
      }

      await navigator.clipboard.writeText(`${shareData.text}\n${url}`)
      setShareStatus('Link copied')
    } catch (error) {
      if (error?.name !== 'AbortError') {
        setShareStatus('Unable to share')
      }
    }
  }

  return (
    <>
      <div className="grid auto-rows-[minmax(260px,auto)] grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-12 lg:gap-5">
        {orderedItems.map((item, index) => (
          <motion.button
            type="button"
            key={item._id || `${item.title}-${index}`}
            initial={{ opacity: 0, y: 48, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: "-90px" }}
            transition={{
              delay: Math.min(index * 0.06, 0.36),
              duration: 0.85,
              ease: [0.16, 1, 0.3, 1],
            }}
            className={`group image-sheen premium-surface relative block w-full overflow-hidden text-left ${layoutClasses[index % layoutClasses.length]}`}
            onClick={() => item.cloudinaryUrl && setSelectedIndex(index)}
          >
            {item.cloudinaryUrl && (
              <Image
                src={item.cloudinaryUrl}
                alt={item.title || 'Gallery image'}
                fill
                className="object-cover opacity-82 transition duration-700 ease-out group-hover:scale-[1.035] group-hover:opacity-100"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 58vw"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/92 via-black/18 to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-65" />
            <div className="absolute left-0 right-0 top-0 flex items-center justify-between p-5 text-[10px] font-semibold uppercase tracking-[0.24em] text-white/44">
              <span>{String(index + 1).padStart(2, '0')}</span>
              <span>{item.category || 'Archive'}</span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-6">
              <h3 className="text-2xl font-semibold tracking-[-0.03em] text-white sm:text-3xl">
                {item.title || 'Untitled Frame'}
              </h3>
              {(item.caption || item.tags?.length > 0) && (
                <p className="mt-3 line-clamp-2 max-w-lg text-sm leading-6 text-white/58">
                  {item.caption || item.tags.join(' / ')}
                </p>
              )}
            </div>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="fixed inset-0 z-50 flex h-[100svh] items-center justify-center overflow-hidden bg-black/96 p-3 text-white backdrop-blur-xl sm:p-4 lg:p-8"
            onClick={() => setSelectedIndex(null)}
          >
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                setSelectedIndex(null)
              }}
              className="absolute right-3 top-3 z-20 min-h-[42px] bg-white px-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-black transition-transform hover:scale-[1.02] lg:hidden"
            >
              Close
            </button>
            <div
              className="absolute bottom-3 left-3 right-3 z-20 flex items-center gap-2 lg:hidden"
              onClick={(event) => event.stopPropagation()}
            >
              {shareStatus && (
                <p className="absolute bottom-full left-0 mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/54">
                  {shareStatus}
                </p>
              )}
              <button
                type="button"
                onClick={() => setSelectedIndex((current) => Math.max((current || 0) - 1, 0))}
                disabled={selectedIndex === 0}
                className="min-h-[46px] flex-1 border border-white/18 bg-black/72 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/78 backdrop-blur-md transition-colors hover:border-white/42 hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
              >
                Prev
              </button>
              <button
                type="button"
                onClick={shareSelectedImage}
                className="min-h-[46px] flex-1 border border-white/18 bg-white px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-black backdrop-blur-md transition-transform hover:scale-[1.01]"
              >
                Share
              </button>
              <button
                type="button"
                onClick={() => setSelectedIndex((current) => Math.min((current || 0) + 1, items.length - 1))}
                disabled={selectedIndex === items.length - 1}
                className="min-h-[46px] flex-1 border border-white/18 bg-black/72 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/78 backdrop-blur-md transition-colors hover:border-white/42 hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
              >
                Next
              </button>
            </div>
            <motion.div
              initial={{ y: 24, scale: 0.98 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ y: 20, scale: 0.98 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="relative flex h-full w-full max-w-7xl min-h-0 flex-col gap-3 pb-16 pt-14 lg:grid lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-6 lg:pb-0 lg:pt-0"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-hidden bg-white/[0.03] lg:h-full">
                <Image
                  src={selectedImage.cloudinaryUrl}
                  alt={selectedImage.title || 'Full size image'}
                  width={1800}
                  height={1200}
                  className="max-h-full max-w-full object-contain"
                  priority
                />
              </div>
              <aside className="hidden border-t border-white/12 pt-3 lg:flex lg:h-full lg:flex-col lg:justify-end lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white/42">
                  {selectedImage.category || 'Selected Image'}
                </p>
                <h2 className="mt-3 line-clamp-2 text-2xl font-semibold tracking-[-0.03em] sm:text-3xl lg:mt-4">
                  {selectedImage.title || 'Untitled Frame'}
                </h2>
                {selectedImage.caption && (
                  <p className="mt-3 line-clamp-2 text-sm leading-6 text-white/62 lg:mt-4 lg:line-clamp-none">
                    {selectedImage.caption}
                  </p>
                )}
                {shareStatus && (
                  <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/42">
                    {shareStatus}
                  </p>
                )}
                <div className="mt-8 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedIndex((current) => Math.max((current || 0) - 1, 0))}
                    disabled={selectedIndex === 0}
                    className="min-h-[42px] border border-white/14 px-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/70 transition-colors hover:border-white/42 hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
                  >
                    Prev
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedIndex((current) => Math.min((current || 0) + 1, items.length - 1))}
                    disabled={selectedIndex === items.length - 1}
                    className="min-h-[42px] border border-white/14 px-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/70 transition-colors hover:border-white/42 hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
                  >
                    Next
                  </button>
                  <button
                    type="button"
                    onClick={shareSelectedImage}
                    className="min-h-[42px] border border-white/14 px-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/70 transition-colors hover:border-white/42 hover:text-white"
                  >
                    Share
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedIndex(null)}
                    className="ml-auto min-h-[42px] bg-white px-4 text-[10px] font-semibold uppercase tracking-[0.2em] text-black transition-transform hover:scale-[1.02]"
                  >
                    Close
                  </button>
                </div>
              </aside>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
