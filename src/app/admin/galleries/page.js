'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { galleryDemo } from '@/data/galleryDemo'
import './style.css'

function token() { return typeof window === 'undefined' ? '' : localStorage.getItem('token') || '' }
function formatBytes(bytes) { return bytes >= 1024 ** 3 ? `${(bytes / 1024 ** 3).toFixed(1)} GB` : `${(bytes / 1024 ** 2).toFixed(1)} MB` }

async function api(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: { ...(options.body ? { 'Content-Type': 'application/json' } : {}), Authorization: `Bearer ${token()}`, ...options.headers },
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.error || `Request failed (${response.status})`)
  return data
}

function uploadToCloudinary(file, signature, onProgress) {
  return new Promise((resolve, reject) => {
    const form = new FormData()
    form.append('file', file)
    form.append('api_key', signature.apiKey)
    form.append('timestamp', String(signature.timestamp))
    form.append('signature', signature.signature)
    form.append('public_id', signature.publicId)
    form.append('type', signature.type)
    const xhr = new XMLHttpRequest()
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${signature.cloudName}/image/upload`)
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) onProgress(Math.round(event.loaded / event.total * 90))
    }
    xhr.onload = () => {
      let result = {}
      try { result = JSON.parse(xhr.responseText || '{}') } catch { result = {} }
      if (xhr.status >= 200 && xhr.status < 300) resolve(result)
      else reject(new Error(result.error?.message || `Upload failed (${xhr.status})`))
    }
    xhr.onerror = () => reject(new Error('Network interrupted. Retry this photo.'))
    xhr.send(form)
  })
}

const initialForm = {
  title: 'Untitled gallery', description: '', eventDate: '', coverMediaId: '',
  coverFocusX: 50, coverFocusY: 50, downloadsEnabled: false, favoritesEnabled: true,
  password: '', removePassword: false,
}

export default function GalleriesAdminPage() {
  const demoMode = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('demo')
  const fileInput = useRef(null)
  const folderInput = useRef(null)
  const [dragging, setDragging] = useState(false)
  const [galleries, setGalleries] = useState([])
  const [gallery, setGallery] = useState(null)
  const [form, setForm] = useState(initialForm)
  const [uploads, setUploads] = useState([])
  const [selections, setSelections] = useState([])
  const [saving, setSaving] = useState(false)
  const [preview, setPreview] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [authReady, setAuthReady] = useState(false)

  const refreshList = async () => setGalleries(await api('/api/admin/galleries'))

  const openGallery = async (id) => {
    if (demoMode) { setPreview(false); return }
    setError('')
    const data = await api(`/api/admin/galleries/${id}`)
    setGallery(data)
    setForm({
      title: data.title, description: data.description || '', eventDate: data.eventDate ? data.eventDate.slice(0, 10) : '',
      coverMediaId: data.coverMediaId || '', coverFocusX: data.coverFocusX, coverFocusY: data.coverFocusY,
      downloadsEnabled: data.downloadsEnabled, favoritesEnabled: data.favoritesEnabled,
      password: '', removePassword: false,
    })
    setPreview(false)
    api(`/api/admin/galleries/${id}/selections`).then(setSelections).catch(() => setSelections([]))
  }

  useEffect(() => {
    if (demoMode) {
      setAuthReady(true)
      setGallery(galleryDemo)
      setGalleries([{ id: 'demo', title: galleryDemo.title, slug: 'demo', status: 'draft', photoCount: galleryDemo.media.length }])
      setForm({ ...initialForm, title: galleryDemo.title, description: galleryDemo.description, eventDate: galleryDemo.eventDate, coverMediaId: galleryDemo.coverMediaId })
      return
    }
    if (!token()) { window.location.assign('/admin/login'); return }
    api('/api/auth/verify').then(() => { setAuthReady(true); return refreshList() }).catch(() => window.location.assign('/admin/login'))
  }, [demoMode])

  useEffect(() => {
    if (!uploads.some((item) => item.status === 'uploading')) return
    const beforeUnload = (event) => { event.preventDefault(); event.returnValue = '' }
    window.addEventListener('beforeunload', beforeUnload)
    return () => window.removeEventListener('beforeunload', beforeUnload)
  }, [uploads])

  const updateUpload = (key, patch) => setUploads((current) => current.map((item) => item.key === key ? { ...item, ...patch } : item))

  const uploadOne = async (galleryId, entry) => {
    updateUpload(entry.key, { status: entry.uploaded ? 'processing' : 'uploading', progress: entry.uploaded ? 100 : 0, error: '' })
    try {
      let uploaded = entry.uploaded
      if (!uploaded) {
        const signature = await api(`/api/admin/galleries/${galleryId}/upload`, { method: 'POST' })
        uploaded = await uploadToCloudinary(entry.file, signature, (progress) => updateUpload(entry.key, { progress }))
        updateUpload(entry.key, { status: 'processing', progress: 95, uploaded })
      }
      const attached = await api(`/api/admin/galleries/${galleryId}/media`, {
        method: 'POST', body: JSON.stringify({ publicId: uploaded.public_id, assetId: uploaded.asset_id, filename: entry.file.name, order: entry.order }),
      })
      setGallery((current) => current?.id === galleryId ? {
        ...current,
        coverMediaId: current.coverMediaId || attached.media.id,
        media: [...current.media, attached.media].sort((a, b) => a.order - b.order),
      } : current)
      setForm((current) => ({ ...current, coverMediaId: current.coverMediaId || attached.media.id }))
      updateUpload(entry.key, { status: 'ready', progress: 100 })
      URL.revokeObjectURL(entry.previewUrl)
    } catch (uploadError) {
      updateUpload(entry.key, { status: 'failed', error: uploadError.message })
    }
  }

  const uploadBatch = async (galleryId, entries) => {
    let next = 0
    await Promise.all(Array.from({ length: Math.min(3, entries.length) }, async () => {
      while (next < entries.length) {
        const entry = entries[next++]
        await uploadOne(galleryId, entry)
      }
    }))
    await refreshList()
  }

  const addFiles = async (files) => {
    if (!files.length) return
    if (busy > 0) { setError('Wait for the current batch to finish before adding more photos.'); return }
    const valid = files.filter((file) => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type) && file.size <= 100 * 1024 * 1024).sort((a, b) => (a.webkitRelativePath || a.name).localeCompare(b.webkitRelativePath || b.name, undefined, { numeric: true }))
    if (valid.length !== files.length) setError('Some files were skipped. Choose JPEG, PNG, or WebP images up to 100 MB each.')
    if (!valid.length) return
    if (demoMode) {
      const localMedia = valid.map((file, index) => ({ id: `local-${crypto.randomUUID()}`, filename: file.name, width: 3, height: 2, set: 'Highlights', order: index, thumbUrl: URL.createObjectURL(file), fullUrl: URL.createObjectURL(file) }))
      const next = gallery ? { ...gallery, media: [...gallery.media, ...localMedia] } : { ...galleryDemo, id: 'demo', media: localMedia, coverMediaId: localMedia[0].id, title: 'Untitled gallery', description: '', eventDate: '' }
      setGallery(next)
      setForm((current) => ({ ...current, title: next.title, coverMediaId: next.coverMediaId }))
      setGalleries([{ id: 'demo', title: next.title, slug: 'demo', status: next.status, photoCount: next.media.length }])
      setNotice('Design preview: these files stay in this browser and are not uploaded.')
      return
    }
    const entries = valid.map((file, index) => ({ key: crypto.randomUUID(), file, order: (gallery?.media.length || 0) + index, previewUrl: URL.createObjectURL(file), status: 'queued', progress: 0, error: '' }))
    setUploads((current) => [...current, ...entries])
    try {
      let galleryId = gallery?.id
      if (!galleryId) {
        const folderTitle = valid[0].webkitRelativePath?.split('/')[0] || 'Untitled gallery'
        const created = await api('/api/admin/galleries', { method: 'POST', body: JSON.stringify({ title: folderTitle }) })
        galleryId = created.id
        await openGallery(galleryId)
        await refreshList()
      } else if (gallery.status === 'published') {
        await api(`/api/admin/galleries/${galleryId}`, { method: 'PATCH', body: JSON.stringify({ status: 'draft' }) })
        await openGallery(galleryId)
        setNotice('Gallery moved to draft while you add photos. Publish it again when ready.')
      }
      await uploadBatch(galleryId, entries)
    } catch (uploadError) {
      setError(uploadError.message)
      setUploads((current) => current.map((item) => entries.some((entry) => entry.key === item.key) && item.status === 'queued' ? { ...item, status: 'failed', error: uploadError.message } : item))
    }
  }

  const chooseFiles = (event) => {
    const files = [...(event.target.files || [])]
    event.target.value = ''
    addFiles(files)
  }

  const dropFiles = (event) => {
    event.preventDefault()
    setDragging(false)
    addFiles([...(event.dataTransfer?.files || [])])
  }

  const retry = async (entry) => {
    if (!gallery) return
    await uploadOne(gallery.id, entry)
    await refreshList()
  }

  const updateSet = (id, set) => setGallery((current) => ({ ...current, media: current.media.map((item) => item.id === id ? { ...item, set } : item) }))
  const movePhoto = (index, direction) => setGallery((current) => {
    const media = [...current.media]
    const next = index + direction
    if (next < 0 || next >= media.length) return current
    ;[media[index], media[next]] = [media[next], media[index]]
    return { ...current, media }
  })

  const save = async (status) => {
    if (!gallery) return
    setSaving(true); setError(''); setNotice('')
    try {
      if (demoMode) {
        setGallery((current) => ({ ...current, title: form.title, description: form.description, eventDate: form.eventDate, coverMediaId: form.coverMediaId, coverFocusX: Number(form.coverFocusX), coverFocusY: Number(form.coverFocusY), downloadsEnabled: form.downloadsEnabled, favoritesEnabled: form.favoritesEnabled, status: status || current.status }))
        setGalleries([{ id: 'demo', title: form.title, slug: 'demo', status: status || gallery.status, photoCount: gallery.media.length }])
        setNotice('Design preview updated. No changes were saved to the server.')
        return
      }
      const payload = {
        title: form.title, description: form.description, eventDate: form.eventDate || null,
        coverMediaId: form.coverMediaId || null, coverFocusX: Number(form.coverFocusX), coverFocusY: Number(form.coverFocusY),
        downloadsEnabled: form.downloadsEnabled, favoritesEnabled: form.favoritesEnabled,
        mediaOrder: gallery.media.map((item) => item.id),
        mediaSets: Object.fromEntries(gallery.media.map((item) => [item.id, item.set])),
      }
      if (form.password) payload.password = form.password
      else if (form.removePassword) payload.password = ''
      if (status) payload.status = status
      await api(`/api/admin/galleries/${gallery.id}`, { method: 'PATCH', body: JSON.stringify(payload) })
      await openGallery(gallery.id)
      await refreshList()
      setNotice(status === 'published' ? 'Gallery published. Your private link is ready to copy.' : status === 'draft' ? 'Gallery returned to draft.' : 'Changes saved.')
    } catch (saveError) { setError(saveError.message) }
    finally { setSaving(false) }
  }

  const copyLink = async () => {
    await navigator.clipboard.writeText(`${window.location.origin}/g/${gallery.slug}`)
    setNotice('Client link copied.')
  }

  const cover = gallery?.media.find((item) => item.id === form.coverMediaId) || gallery?.media[0]
  const busy = uploads.filter((item) => ['queued', 'uploading', 'processing'].includes(item.status)).length
  const batchBytes = uploads.reduce((sum, item) => sum + item.file.size, 0)
  const batchProgress = batchBytes ? Math.round(uploads.reduce((sum, item) => sum + item.file.size * (item.status === 'ready' ? 100 : item.progress), 0) / batchBytes) : 0

  return (
    <main className="gallery-admin-app">
      <header className="gallery-admin-top">
        <Link href="/admin" className="gallery-admin-wordmark">HEET THAKKAR <span>/ STUDIO</span></Link>
        <div className="gallery-admin-top-right"><span>CLIENT GALLERIES</span><Link href="/admin">Back to dashboard ↗</Link></div>
      </header>
      <input ref={fileInput} type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={chooseFiles} />
      <input ref={folderInput} type="file" accept="image/jpeg,image/png,image/webp" webkitdirectory="" multiple hidden onChange={chooseFiles} />
      {!authReady ? <div className="gallery-admin-loading">Opening studio…</div> : (
        <div className="gallery-admin-layout">
          <aside className="gallery-admin-sidebar">
            <div className="sidebar-label">{demoMode ? 'DESIGN PREVIEW · NO FILES UPLOADED' : 'YOUR WORKSPACE'}</div>
            <h1>Client galleries<span>.</span></h1>
            <p>Beautiful, private spaces for the photographs that matter.</p>
            <button className="gallery-primary sidebar-create" disabled={busy > 0} onClick={() => { setGallery(null); setForm(initialForm); setUploads([]); setPreview(false); fileInput.current?.click() }}>
              <span>＋</span> New gallery
            </button>
            <div className="sidebar-divider" />
            <div className="sidebar-label gallery-list-label">COLLECTIONS <span>{galleries.length}</span></div>
            {galleries.length === 0 && <p className="sidebar-empty">Your galleries will appear here after you choose photos.</p>}
            {galleries.map((item) => (
              <button key={item.id} disabled={busy > 0} className={`gallery-list-item ${gallery?.id === item.id ? 'active' : ''}`} onClick={() => openGallery(item.id).catch((openError) => setError(openError.message))}>
                <span>{item.title}</span><small>{item.photoCount} photos · {item.status}</small>
              </button>
            ))}
          </aside>

          <section className="gallery-admin-main">
            {error && <div className="gallery-feedback error" role="alert">{error}<button onClick={() => setError('')}>×</button></div>}
            {notice && <div className="gallery-feedback" role="status">{notice}<button onClick={() => setNotice('')}>×</button></div>}
            {!gallery ? (
              <div className={`gallery-empty-state ${dragging ? 'is-dragging' : ''}`} onDragEnter={(event) => { event.preventDefault(); setDragging(true) }} onDragOver={(event) => event.preventDefault()} onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setDragging(false) }} onDrop={dropFiles}>
                <div className="empty-overline">THE START OF SOMETHING BEAUTIFUL</div>
                <h2>Start with your photographs.</h2>
                <p>Select your finished images. A draft gallery will take shape as they upload, ready for you to make it yours.</p>
                <button className="gallery-primary" onClick={() => fileInput.current?.click()}>Choose photographs <span>↗</span></button>
                <button className="gallery-folder-action" onClick={() => folderInput.current?.click()}>Choose a folder</button>
                <span className="empty-support">Or drop photos here · JPEG, PNG, or WebP</span>
                {uploads.length > 0 && <div className="empty-upload-progress" role="status">Preparing gallery · {uploads.length} photos selected</div>}
              </div>
            ) : (
              <>
                <div className="gallery-editor-header">
                  <div><div className="editor-kicker">{gallery.status === 'published' ? 'PUBLISHED COLLECTION' : 'DRAFT COLLECTION'} · {gallery.media.length} PHOTOS</div><h2>{gallery.title}</h2><span className="editor-slug">/g/{gallery.slug}</span></div>
                  <div className="editor-header-actions">
                    <button className="gallery-secondary" onClick={() => setPreview((value) => !value)}>{preview ? 'Edit gallery' : 'Preview gallery'}</button>
                    {gallery.status === 'published' && <button className="gallery-secondary" onClick={copyLink}>Copy link ↗</button>}
                    <button className="gallery-primary" disabled={saving || busy > 0} onClick={() => save(gallery.status === 'published' ? undefined : 'published')}>{saving ? 'Saving…' : gallery.status === 'published' ? 'Save changes' : 'Publish gallery →'}</button>
                  </div>
                </div>

                {preview ? (
                  <div className="studio-preview">
                    <div className="studio-preview-cover" style={{ backgroundImage: cover ? `linear-gradient(180deg,rgba(0,0,0,.08),rgba(0,0,0,.45)),url("${cover.fullUrl}")` : undefined, backgroundPosition: `${form.coverFocusX}% ${form.coverFocusY}%` }}>
                      <div className="studio-preview-brand">HEET THAKKAR</div><div><span>A PRIVATE COLLECTION</span><h3>{form.title || 'Untitled gallery'}</h3><p>{form.eventDate || 'A story worth keeping'}</p><button onClick={() => document.getElementById('preview-photos')?.scrollIntoView({ behavior: 'smooth' })}>View gallery ↓</button></div>
                    </div>
                    <div id="preview-photos" className="studio-preview-grid">{gallery.media.map((item) => <img key={item.id} src={item.thumbUrl} alt={item.filename} />)}</div>
                    {gallery.status === 'published' && <Link className="studio-live-link" href={`/g/${gallery.slug}`} target="_blank">Open client experience ↗</Link>}
                  </div>
                ) : (
                  <div className="gallery-editor-columns">
                    <div className={`gallery-editor-primary ${dragging ? 'is-dragging' : ''}`} onDragEnter={(event) => { event.preventDefault(); setDragging(true) }} onDragOver={(event) => event.preventDefault()} onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setDragging(false) }} onDrop={dropFiles}>
                      <div className="editor-section-title"><div><span>01 / CONTENT</span><h3>The photographs</h3></div><div className="editor-add-actions"><button className="gallery-secondary" disabled={busy > 0} onClick={() => folderInput.current?.click()}>＋ Add folder</button><button className="gallery-secondary" disabled={busy > 0} onClick={() => fileInput.current?.click()}>＋ Add photos</button></div></div>
                      {uploads.length > 0 && <div className="editor-batch-progress" role="status"><div><strong>{busy ? 'Building your gallery' : uploads.some((item) => item.status === 'failed') ? 'Some photos need attention' : 'Upload batch complete'}</strong><span>{uploads.filter((item) => item.status === 'ready').length} of {uploads.length} ready · {formatBytes(batchBytes)} · {batchProgress}%</span></div><div className="editor-progress-track"><i style={{ width: `${batchProgress}%` }} /></div></div>}
                      <div className="editor-media-grid">
                        {gallery.media.map((item) => <button key={item.id} className={`editor-media-card ${form.coverMediaId === item.id ? 'is-cover' : ''}`} onClick={() => setForm((current) => ({ ...current, coverMediaId: item.id }))} title="Set as cover"><img src={item.thumbUrl} alt={item.filename} /><span>{form.coverMediaId === item.id ? 'COVER IMAGE' : 'SET AS COVER'}</span></button>)}
                        {uploads.filter((item) => item.status !== 'ready').map((item) => <div key={item.key} className="editor-media-card upload-card"><img src={item.previewUrl} alt="" /><div><strong>{item.file.name}</strong><span>{item.status === 'failed' ? item.error : `${item.status} · ${item.progress}%`}</span>{item.status === 'failed' && gallery && <button onClick={() => retry(item)}>Retry upload</button>}</div><i style={{ width: `${item.progress}%` }} /></div>)}
                      </div>
                      {gallery.media.length > 0 && <div className="editor-organize"><div className="editor-section-title"><div><span>SEQUENCE & SETS</span><h3>Tell the story</h3></div></div><p>Arrange the viewing order and group photographs into named sections.</p>{gallery.media.map((item, index) => <div className="editor-organize-row" key={item.id}><img src={item.thumbUrl} alt="" /><span title={item.filename}>{item.filename}</span><input aria-label={`Set for ${item.filename}`} value={item.set} onChange={(event) => updateSet(item.id, event.target.value)} maxLength={60} placeholder="Set name" /><button onClick={() => movePhoto(index, -1)} disabled={index === 0} aria-label={`Move ${item.filename} earlier`}>↑</button><button onClick={() => movePhoto(index, 1)} disabled={index === gallery.media.length - 1} aria-label={`Move ${item.filename} later`}>↓</button></div>)}</div>}
                      {!demoMode && <div className="editor-selections"><div className="editor-section-title"><div><span>03 / CLIENT ACTIVITY</span><h3>Selections</h3></div><button className="gallery-secondary" onClick={() => api(`/api/admin/galleries/${gallery.id}/selections`).then(setSelections).catch((loadError) => setError(loadError.message))}>Refresh</button></div>{selections.length ? selections.map((selection) => <div className="editor-selection-row" key={selection.id}><div><strong>{selection.name}</strong><span>{selection.submittedAt ? `Sent ${new Date(selection.submittedAt).toLocaleString()}` : 'Draft'} · {selection.photos.length} photos</span></div><details><summary>View filenames</summary><p>{selection.photos.map((photo) => photo.filename).join(' · ') || 'No photos selected yet.'}</p></details></div>) : <p>No client selections yet. Submitted lists will appear here.</p>}</div>}
                      {!gallery.media.length && !uploads.length && <button className="editor-empty-upload" onClick={() => fileInput.current?.click()}>Choose photographs to fill this gallery ↗</button>}
                      {busy > 0 && <p className="editor-upload-note">{busy} photo{busy > 1 ? 's' : ''} still uploading or processing. Keep this tab open until they finish.</p>}
                      {dragging && <div className="editor-drop-hint">Drop photos to add them</div>}
                    </div>
                    <aside className="gallery-settings-panel">
                      <div className="editor-section-title"><div><span>02 / FINISHING TOUCHES</span><h3>Make it yours</h3></div></div>
                      <label>Gallery title<input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} maxLength={150} /></label>
                      <label>Event date<input type="date" value={form.eventDate} onChange={(event) => setForm({ ...form, eventDate: event.target.value })} /></label>
                      <label>Welcome note<textarea value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} rows={3} placeholder="A few words for your client…" /></label>
                      {cover && <div className="settings-cover"><span>COVER PREVIEW</span><img src={cover.thumbUrl} alt="Current gallery cover" style={{ objectPosition: `${form.coverFocusX}% ${form.coverFocusY}%` }} /><label>Horizontal focus<input type="range" min="0" max="100" value={form.coverFocusX} onChange={(event) => setForm({ ...form, coverFocusX: event.target.value })} /></label><label>Vertical focus<input type="range" min="0" max="100" value={form.coverFocusY} onChange={(event) => setForm({ ...form, coverFocusY: event.target.value })} /></label></div>}
                      <div className="settings-divider" />
                      <label>Gallery password {gallery.hasPassword && <small>Currently protected</small>}<input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value, removePassword: false })} placeholder={gallery.hasPassword ? 'Enter a new password to change it' : 'Optional'} autoComplete="new-password" /></label>
                      {gallery.hasPassword && <label className="settings-check"><input type="checkbox" checked={form.removePassword} onChange={(event) => setForm({ ...form, removePassword: event.target.checked, password: '' })} /> Remove gallery password</label>}
                      <label className="settings-check"><input type="checkbox" checked={form.downloadsEnabled} onChange={(event) => setForm({ ...form, downloadsEnabled: event.target.checked })} /> Allow individual downloads</label>
                      <label className="settings-check"><input type="checkbox" checked={form.favoritesEnabled} onChange={(event) => setForm({ ...form, favoritesEnabled: event.target.checked })} /> Show favorites control</label>
                      <button className="gallery-secondary settings-save" disabled={saving || busy > 0} onClick={() => save()}>{saving ? 'Saving…' : 'Save settings'}</button>
                      {gallery.status === 'published' && <button className="settings-unpublish" disabled={busy > 0} onClick={() => save('draft')}>Unpublish gallery</button>}
                    </aside>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      )}
    </main>
  )
}
