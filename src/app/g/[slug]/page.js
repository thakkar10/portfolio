'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { galleryDemo } from '@/data/galleryDemo'
import './style.css'

function mediaSrc(slug, id, variant = 'thumb') {
  if (slug === 'demo') return galleryDemo.media.find((item) => item.id === id)?.src || ''
  return `/api/galleries/${slug}/media/${id}?variant=${variant}`
}

export default function DeliveredGalleryPage() {
  const { slug } = useParams()
  const [gallery, setGallery] = useState(null)
  const [lockedTitle, setLockedTitle] = useState('Private gallery')
  const [locked, setLocked] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [password, setPassword] = useState('')
  const [activeSet, setActiveSet] = useState('All photos')
  const [lightboxIndex, setLightboxIndex] = useState(null)
  const [favorites, setFavorites] = useState([])
  const [selectionToken, setSelectionToken] = useState('')
  const [selection, setSelection] = useState(null)
  const [selectionName, setSelectionName] = useState('')
  const [selectionBusy, setSelectionBusy] = useState(false)
  const [selectionLoading, setSelectionLoading] = useState(false)
  const [selectionError, setSelectionError] = useState('')
  const [selectionNotice, setSelectionNotice] = useState('')
  const [showFavorites, setShowFavorites] = useState(false)
  const [copied, setCopied] = useState(false)
  const galleryId = gallery?.id

  const loadGallery = useCallback(async () => {
    if (slug === 'demo') { setLocked(false); setGallery({ ...galleryDemo, status: 'published' }); return }
    const response = await fetch(`/api/galleries/${slug}`, { cache: 'no-store' })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) throw new Error(data.error || 'Gallery unavailable')
    if (data.locked) { setLocked(true); setLockedTitle(data.title); setGallery(null) }
    else { setLocked(false); setGallery(data.gallery) }
  }, [slug])

  useEffect(() => {
    if (!slug) return
    loadGallery().catch((loadError) => setError(loadError.message)).finally(() => setLoading(false))
  }, [slug, loadGallery])

  useEffect(() => {
    if (!galleryId || slug === 'demo') return
    const key = `gallery-selection-${galleryId}`
    const fromLink = new URLSearchParams(window.location.search).get('selection')
    const stored = localStorage.getItem(key)
    const tokens = [fromLink, stored].filter((token, index, values) => token && values.indexOf(token) === index)
    if (!tokens.length) return
    setSelectionLoading(true)
    const restoreSelection = async () => {
      let lastError
      for (const token of tokens) {
        try {
          const response = await fetch(`/api/galleries/${slug}/selection`, { headers: { 'X-Selection-Token': token }, cache: 'no-store' })
          const data = await response.json().catch(() => ({}))
          if (!response.ok) {
            const loadError = new Error(data.error || 'Could not load your selection')
            loadError.status = response.status
            loadError.code = data.code
            throw loadError
          }
          localStorage.setItem(key, token)
          setSelectionToken(token)
          setSelection(data.selection)
          setFavorites(data.selection.mediaIds)
          setSelectionName(data.selection.name || '')
          if (fromLink) window.history.replaceState({}, '', window.location.pathname)
          return
        } catch (loadError) {
          lastError = loadError
          if (loadError.status === 404 && loadError.code === 'SELECTION_NOT_FOUND') {
            if (token === stored) localStorage.removeItem(key)
            if (token === fromLink) window.history.replaceState({}, '', window.location.pathname)
            continue
          }
          setSelectionToken(token)
          break
        }
      }
      setSelectionError(lastError.message)
    }
    restoreSelection().finally(() => setSelectionLoading(false))
  }, [galleryId, slug])

  const unlock = async (event) => {
    event.preventDefault(); setError('')
    const response = await fetch(`/api/galleries/${slug}/unlock`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }),
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) { setError(data.error || 'Could not open gallery'); return }
    setPassword('')
    await loadGallery().catch((loadError) => setError(loadError.message))
  }

  const toggleFavorite = async (id) => {
    if (selectionBusy || selectionLoading || selection?.submittedAt) return
    if (selectionToken && !selection) { setSelectionError('Refresh the page to restore your selection before editing it.'); return }
    const next = favorites.includes(id) ? favorites.filter((item) => item !== id) : [...favorites, id]
    setSelectionBusy(true); setSelectionError(''); setSelectionNotice('')
    try {
      if (slug === 'demo') { setFavorites(next); return }
      const response = await fetch(`/api/galleries/${slug}/selection`, {
        method: selectionToken ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json', ...(selectionToken ? { 'X-Selection-Token': selectionToken } : {}) },
        body: JSON.stringify({ mediaIds: next }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Could not save favorite')
      if (data.token) {
        localStorage.setItem(`gallery-selection-${gallery.id}`, data.token)
        setSelectionToken(data.token)
      }
      setSelection(data.selection)
      setFavorites(data.selection.mediaIds)
    } catch (saveError) { setSelectionError(saveError.message) }
    finally { setSelectionBusy(false) }
  }

  const copySelectionLink = async () => {
    if (!selectionToken) return
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/g/${slug}?selection=${selectionToken}`)
      setSelectionNotice('Selection link copied. Anyone with this link and the gallery password can open your list.')
    } catch { setSelectionError('Could not copy the link. Please try again.') }
  }

  const submitSelection = async (event) => {
    event.preventDefault()
    if (!selectionToken || !favorites.length || selectionBusy) return
    setSelectionBusy(true); setSelectionError(''); setSelectionNotice('')
    try {
      const response = await fetch(`/api/galleries/${slug}/selection`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json', 'X-Selection-Token': selectionToken },
        body: JSON.stringify({ name: selectionName, submit: true }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || 'Could not send selection')
      setSelection(data.selection)
      setSelectionNotice('Your selection has been sent to Heet.')
    } catch (submitError) { setSelectionError(submitError.message) }
    finally { setSelectionBusy(false) }
  }

  const share = async () => {
    try {
      if (navigator.share) await navigator.share({ title: gallery.title, url: window.location.href })
      else { await navigator.clipboard.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 1800) }
    } catch { setCopied(false) }
  }

  const sets = gallery ? ['All photos', ...new Set(gallery.media.map((item) => item.set || 'Highlights'))] : []
  const visible = gallery ? gallery.media.filter((item) => (activeSet === 'All photos' || item.set === activeSet) && (!showFavorites || favorites.includes(item.id))) : []
  const cover = gallery?.media.find((item) => item.id === gallery.coverMediaId) || gallery?.media[0]
  const selected = lightboxIndex === null ? null : visible[lightboxIndex]

  useEffect(() => {
    if (lightboxIndex !== null && lightboxIndex >= visible.length) setLightboxIndex(null)
  }, [lightboxIndex, visible.length])

  useEffect(() => {
    if (lightboxIndex === null) return
    const onKey = (event) => {
      if (event.key === 'Escape') setLightboxIndex(null)
      if (visible.length && event.key === 'ArrowRight') setLightboxIndex((index) => Math.min(visible.length - 1, index + 1))
      if (visible.length && event.key === 'ArrowLeft') setLightboxIndex((index) => Math.max(0, index - 1))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightboxIndex, visible.length])

  if (loading) return <main className="client-delivery gallery-loading"><div>HEET THAKKAR</div><p>Opening your gallery…</p></main>
  if (!gallery && !locked) return <main className="client-delivery gallery-loading"><div>HEET THAKKAR</div><p>{error || 'Gallery unavailable.'}</p></main>

  if (locked) return (
    <main className="client-delivery gallery-lock-screen">
      <div className="gallery-lock-brand">HEET THAKKAR <span>PHOTOGRAPHY</span></div>
      <div className="gallery-lock-card"><span className="gallery-overline">PRIVATE COLLECTION</span><h1>{lockedTitle}</h1><p>This gallery is reserved for you. Enter the password provided by your photographer.</p><form onSubmit={unlock}><label htmlFor="gallery-password">Gallery password</label><input id="gallery-password" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required /><button>Enter gallery <span>→</span></button></form>{error && <p className="gallery-lock-error" role="alert">{error}</p>}</div>
      <small>Made to be remembered.</small>
    </main>
  )

  return (
    <main className="client-delivery">
      <section className="delivery-cover" style={{ backgroundImage: cover ? `linear-gradient(180deg,rgba(7,7,7,.10) 25%,rgba(7,7,7,.50)),url("${mediaSrc(slug, cover.id, 'full')}")` : undefined, backgroundPosition: `${gallery.coverFocusX}% ${gallery.coverFocusY}%` }}>
        <div className="delivery-cover-top"><span>HEET THAKKAR</span><span>{slug === 'demo' ? 'DESIGN PREVIEW' : 'A PRIVATE COLLECTION'}</span></div>
        <div className="delivery-cover-content"><span className="gallery-overline">A STORY TO KEEP</span><h1>{gallery.title}</h1>{gallery.eventDate && <p>{new Date(gallery.eventDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' })}</p>}<button onClick={() => document.getElementById('gallery-images')?.scrollIntoView({ behavior: 'smooth' })}>View gallery <span>↓</span></button></div>
        <div className="delivery-cover-bottom"><span>SCROLL TO EXPLORE</span><span>{String(gallery.media.length).padStart(2, '0')} PHOTOGRAPHS</span></div>
      </section>

      <div id="gallery-images" className="delivery-content">
        <header className="delivery-nav"><div className="delivery-nav-title"><strong>{gallery.title}</strong><small>HEET THAKKAR</small></div><div className="delivery-nav-actions">{gallery.favoritesEnabled && <button className={showFavorites ? 'active' : ''} onClick={() => setShowFavorites((value) => !value)} aria-pressed={showFavorites}>♡ <span>Favorites {favorites.length || ''}</span></button>}<button onClick={share}>↗ <span>{copied ? 'Copied' : 'Share'}</span></button></div></header>
        <div className="delivery-intro"><span className="gallery-overline">YOUR COLLECTION</span><h2>{gallery.title}</h2>{gallery.description && <p>{gallery.description}</p>}</div>
        <div className="delivery-sets" role="tablist" aria-label="Photo sets">{sets.map((set) => <button key={set} role="tab" aria-selected={activeSet === set} className={activeSet === set ? 'active' : ''} onClick={() => { setActiveSet(set); setLightboxIndex(null) }}>{set}</button>)}</div>
        {gallery.favoritesEnabled && selectionError && <div className="selection-message error" role="alert">{selectionError}</div>}
        {showFavorites && <div className="selection-panel"><div><span className="gallery-overline">YOUR SELECTION</span><h3>{selection?.submittedAt ? 'Selection sent' : `${favorites.length} favorite${favorites.length === 1 ? '' : 's'}`}</h3><p>{slug === 'demo' ? 'Design preview: favorites here are temporary.' : selection?.submittedAt ? `${selection.name} · Sent ${new Date(selection.submittedAt).toLocaleDateString()}. Your choices are saved here for review.` : 'Tap a heart to gather your choices. Your list is saved online and you can open it on another device with its private link.'}</p>{selectionNotice && <p className="selection-message" role="status">{selectionNotice}</p>}</div><div className="selection-panel-actions">{selectionToken && <button type="button" className="selection-link" onClick={copySelectionLink}>Copy private selection link ↗</button>}{!selection?.submittedAt && favorites.length > 0 && slug !== 'demo' && <form onSubmit={submitSelection}><label htmlFor="selection-name">Your name</label><input id="selection-name" value={selectionName} onChange={(event) => setSelectionName(event.target.value)} maxLength={100} required placeholder="Name for your selection" /><button disabled={selectionBusy}>Send selection →</button></form>}</div></div>}
        {visible.length ? <div className="delivery-grid">{visible.map((item, index) => <div className="delivery-photo" key={item.id}><button className="delivery-photo-open" onClick={() => setLightboxIndex(index)} aria-label={`Open ${item.filename}`}><img src={mediaSrc(slug, item.id)} alt={item.filename} loading="lazy" style={{ aspectRatio: `${item.width}/${item.height}` }} /></button><div className="delivery-photo-actions">{gallery.favoritesEnabled && <button disabled={selectionBusy || selectionLoading || Boolean(selection?.submittedAt)} onClick={() => toggleFavorite(item.id)} aria-label={favorites.includes(item.id) ? 'Remove from favorites' : 'Add to favorites'} className={favorites.includes(item.id) ? 'favorited' : ''}>{favorites.includes(item.id) ? '♥' : '♡'}</button>}{gallery.downloadsEnabled && <a href={`${mediaSrc(slug, item.id)}&download=1`} aria-label={`Download ${item.filename}`}>↓</a>}</div></div>)}</div> : <div className="delivery-empty">{showFavorites ? <div>No favorites in this view yet.<br /><button onClick={() => { setShowFavorites(false); setActiveSet('All photos') }}>Browse all photos →</button></div> : 'No photographs in this set yet.'}</div>}
        <footer className="delivery-footer"><span>HEET THAKKAR</span><p>Made to be remembered.</p><button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Back to top ↑</button></footer>
      </div>

      {selected && <div className="delivery-lightbox" role="dialog" aria-modal="true" aria-label="Photo viewer"><div className="lightbox-top"><button onClick={() => setLightboxIndex(null)} aria-label="Close viewer">← <span>BACK TO GALLERY</span></button><div>{gallery.favoritesEnabled && <button disabled={selectionBusy || selectionLoading || Boolean(selection?.submittedAt)} onClick={() => toggleFavorite(selected.id)} aria-label="Toggle favorite">{favorites.includes(selected.id) ? '♥' : '♡'}</button>}{gallery.downloadsEnabled && <a href={`${mediaSrc(slug, selected.id, 'full')}&download=1`} aria-label="Download photo">↓</a>}</div></div>{selectionError && <div className="lightbox-error" role="alert">{selectionError}</div>}<div className="lightbox-stage"><button className="lightbox-arrow" onClick={() => setLightboxIndex((index) => Math.max(0, index - 1))} disabled={lightboxIndex === 0} aria-label="Previous photo">‹</button><img src={mediaSrc(slug, selected.id, 'full')} alt={selected.filename} /><button className="lightbox-arrow" onClick={() => setLightboxIndex((index) => Math.min(visible.length - 1, index + 1))} disabled={lightboxIndex === visible.length - 1} aria-label="Next photo">›</button></div><div className="lightbox-bottom"><span>{selected.filename}</span><span>{lightboxIndex + 1} / {visible.length}</span></div></div>}
    </main>
  )
}
