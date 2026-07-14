'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import imageCompression from 'browser-image-compression'

export default function AdminDashboard() {
  const [media, setMedia] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState('')
  const [savingAbout, setSavingAbout] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [aboutContent, setAboutContent] = useState({
    body: '',
    primaryImageUrl: '',
    primaryImagePublicId: '',
    secondaryImageUrl: '',
    secondaryImagePublicId: '',
  })
  const [aboutImages, setAboutImages] = useState({
    primaryImage: null,
    secondaryImage: null,
  })
  const [editFormData, setEditFormData] = useState({
    title: '',
    category: '',
    featured: false,
  })
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    type: 'image',
    youtubeUrl: '',
    vimeoUrl: '',
    featured: false,
  })
  const [selectedFile, setSelectedFile] = useState(null)
  const router = useRouter()

  useEffect(() => {
    fetchMedia()
    fetchAboutContent()
  }, [])

  const fetchMedia = async () => {
    try {
      console.log('🔄 Fetching media from API...')
      const token = localStorage.getItem('token')
      const res = await fetch('/api/media', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      
      const data = await res.json()
      console.log('✅ Fetched media data:', data)
      console.log(`📊 Received ${Array.isArray(data) ? data.length : 0} items`)
      
      // Ensure data is always an array
      if (Array.isArray(data)) {
        setMedia(data)
        if (data.length === 0) {
          console.warn('⚠️ No media items found. Database might be empty or connection issue.')
        }
      } else {
        console.error('❌ API returned non-array data:', data)
        setMedia([])
      }
      setLoading(false)
    } catch (err) {
      console.error('❌ Error fetching media:', err)
      // Don't throw error, just set empty array and show message
      setMedia([])
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    router.push('/admin/login')
  }

  const fetchAboutContent = async () => {
    try {
      const res = await fetch('/api/about-content')
      if (!res.ok) return
      const data = await res.json()
      setAboutContent({
        body: data.body || '',
        primaryImageUrl: data.primaryImageUrl || '',
        primaryImagePublicId: data.primaryImagePublicId || '',
        secondaryImageUrl: data.secondaryImageUrl || '',
        secondaryImagePublicId: data.secondaryImagePublicId || '',
      })
    } catch (err) {
      console.error('Error fetching about content:', err)
    }
  }

  const handleAboutSave = async (e) => {
    e.preventDefault()
    setSavingAbout(true)

    try {
      const token = localStorage.getItem('token')
      const data = new FormData()
      data.append('body', aboutContent.body)
      data.append('primaryImageUrl', aboutContent.primaryImageUrl)
      data.append('primaryImagePublicId', aboutContent.primaryImagePublicId)
      data.append('secondaryImageUrl', aboutContent.secondaryImageUrl)
      data.append('secondaryImagePublicId', aboutContent.secondaryImagePublicId)

      const compressAboutImage = async (file) => {
        if (!file || file.size <= 4 * 1024 * 1024) return file

        return imageCompression(file, {
          maxSizeMB: 3.5,
          maxWidthOrHeight: 2200,
          useWebWorker: true,
          fileType: file.type,
        })
      }

      const primaryImage = await compressAboutImage(aboutImages.primaryImage)
      const secondaryImage = await compressAboutImage(aboutImages.secondaryImage)

      if (primaryImage) data.append('primaryImage', primaryImage)
      if (secondaryImage) data.append('secondaryImage', secondaryImage)

      const res = await fetch('/api/about-content', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: data,
      })

      const result = await res.json()

      if (!res.ok) {
        throw new Error(result.error || 'Failed to update About page')
      }

      setAboutContent({
        body: result.body || '',
        primaryImageUrl: result.primaryImageUrl || '',
        primaryImagePublicId: result.primaryImagePublicId || '',
        secondaryImageUrl: result.secondaryImageUrl || '',
        secondaryImagePublicId: result.secondaryImagePublicId || '',
      })
      setAboutImages({ primaryImage: null, secondaryImage: null })
      alert('About page updated!')
    } catch (err) {
      alert(`Error: ${err.message || 'Failed to update About page'}`)
    } finally {
      setSavingAbout(false)
    }
  }

  const uploadDirectToCloudinary = ({ file, params, resourceType }) => {
    return new Promise((resolve, reject) => {
      const uploadForm = new FormData()
      uploadForm.append('file', file)
      uploadForm.append('api_key', params.api_key)
      uploadForm.append('timestamp', params.timestamp)
      uploadForm.append('signature', params.signature)
      uploadForm.append('folder', params.folder)

      const xhr = new XMLHttpRequest()
      xhr.open('POST', `https://api.cloudinary.com/v1_1/${params.cloud_name}/${resourceType}/upload`)
      xhr.timeout = 30 * 60 * 1000

      setUploadStatus('Uploading to Cloudinary. Keep this tab open...')

      xhr.onload = () => {
        let response = null
        try {
          response = JSON.parse(xhr.responseText || '{}')
        } catch (_) {}

        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(response)
          return
        }

        reject(new Error(response?.error?.message || `Cloudinary upload failed (${xhr.status})`))
      }

      xhr.onerror = () => {
        reject(new Error('Could not reach Cloudinary. Check your connection, turn off VPN/ad blockers, then try again.'))
      }

      xhr.ontimeout = () => {
        reject(new Error('Video upload timed out after 30 minutes. Try a smaller export or a stronger connection.'))
      }

      xhr.onabort = () => {
        reject(new Error('Video upload was cancelled.'))
      }

      xhr.send(uploadForm)
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setUploading(true)
    setUploadStatus('')

    try {
      const token = localStorage.getItem('token')
      let cloudinaryUrl = ''
      let cloudinaryPublicId = ''

      const isVideoFile = selectedFile && (
        (selectedFile.type && selectedFile.type.startsWith('video/')) ||
        /\.(mp4|webm|mov|avi|mkv)$/i.test(selectedFile.name || '')
      )
      const isOverLimit = selectedFile && selectedFile.size > 4.5 * 1024 * 1024
      const useDirectUpload = isVideoFile || isOverLimit

      // Video or any file > 4.5 MB: upload directly to Cloudinary (never send to our API)
      if (useDirectUpload && selectedFile) {
        const resourceType = isVideoFile ? 'video' : 'image'
        setUploadStatus('Preparing secure upload...')
        const paramsRes = await fetch(`/api/cloudinary-upload-params?resource_type=${resourceType}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!paramsRes.ok) {
          const err = await paramsRes.json().catch(() => ({}))
          throw new Error(err.error || 'Failed to get upload params')
        }
        const params = await paramsRes.json()
        const uploadResult = await uploadDirectToCloudinary({
          file: selectedFile,
          params,
          resourceType,
        })
        cloudinaryUrl = uploadResult.secure_url
        cloudinaryPublicId = uploadResult.public_id
        setUploadStatus('Saving media record...')
      }

      let res
      if (useDirectUpload && cloudinaryUrl && cloudinaryPublicId) {
        res = await fetch('/api/media/create', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            title: formData.title,
            category: formData.category,
            type: isVideoFile ? 'video' : formData.type,
            cloudinaryUrl,
            cloudinaryPublicId,
            youtubeUrl: formData.youtubeUrl || '',
            vimeoUrl: formData.vimeoUrl || '',
            featured: formData.featured,
          }),
        })
      } else {
        const data = new FormData()
        if (selectedFile && formData.type === 'image' && !useDirectUpload) {
          let fileToUpload = selectedFile
          if (selectedFile.size > 4 * 1024 * 1024) {
            console.log('Compressing image for upload...')
            const options = {
              maxSizeMB: 3.5,
              maxWidthOrHeight: 1920,
              useWebWorker: true,
              fileType: selectedFile.type,
            }
            fileToUpload = await imageCompression(selectedFile, options)
          }
          data.append('file', fileToUpload)
        }
        data.append('title', formData.title)
        data.append('category', formData.category)
        data.append('type', formData.type)
        if (formData.youtubeUrl) data.append('youtubeUrl', formData.youtubeUrl)
        if (formData.vimeoUrl) data.append('vimeoUrl', formData.vimeoUrl)
        data.append('featured', formData.featured)
        if (cloudinaryUrl) data.append('cloudinaryUrl', cloudinaryUrl)
        if (cloudinaryPublicId) data.append('cloudinaryPublicId', cloudinaryPublicId)

        res = await fetch('/api/media/upload', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: data,
        })
      }

      if (res.ok) {
        alert('Upload successful!')
        setUploadStatus('')
        setFormData({
          title: '',
          category: '',
          type: 'image',
          youtubeUrl: '',
          vimeoUrl: '',
          featured: false,
        })
        setSelectedFile(null)
        fetchMedia()
      } else {
        let errorMessage = `Upload failed (Status: ${res.status})`
        try {
          const contentType = res.headers.get('content-type') || ''
          const text = await res.text()
          if (contentType.includes('application/json')) {
            const error = JSON.parse(text)
            errorMessage = error.error || errorMessage
          } else if (text && text.length < 200) {
            errorMessage = text
          } else if (res.status === 413 || text.includes('Request Entity Too Large') || text.includes('too large')) {
            errorMessage = 'File is too large. Please use an image under 4 MB.'
          }
        } catch (_) {
          if (res.status === 413) {
            errorMessage = 'File is too large. Please use an image under 4 MB.'
          }
        }
        console.error('Upload error response:', errorMessage)
        alert(errorMessage)
      }
    } catch (err) {
      console.error('Upload exception:', err)
      const msg = err.message || 'Error uploading. Please try again.'
      if (msg.includes('JSON') && msg.includes('Request En')) {
        alert('Upload failed: file may be too large (max ~4 MB) or the server returned an error. Try a smaller image.')
      } else {
        alert(`Error: ${msg}`)
      }
    } finally {
      setUploading(false)
    }
  }

  const handleEdit = (item) => {
    setEditingItem(item._id)
    setEditFormData({
      title: item.title || '',
      category: item.category || '',
      featured: item.featured || false,
    })
  }

  const handleCancelEdit = () => {
    setEditingItem(null)
    setEditFormData({
      title: '',
      category: '',
      featured: false,
    })
  }

  const handleSaveEdit = async (id) => {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/media/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editFormData),
      })

      if (res.ok) {
        alert('Updated successfully!')
        setEditingItem(null)
        fetchMedia()
      } else {
        const errorData = await res.json()
        alert(`Update failed: ${errorData.error || 'Unknown error'}`)
      }
    } catch (err) {
      alert('Error updating. Please try again.')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this item?')) return

    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/media/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (res.ok) {
        alert('Deleted successfully!')
        fetchMedia()
      } else {
        const errorData = await res.json()
        alert(`Delete failed: ${errorData.error || 'Unknown error'}`)
        console.error('Delete error:', errorData)
      }
    } catch (err) {
      alert('Error deleting. Please try again.')
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  // Ensure media is always an array
  const mediaArray = Array.isArray(media) ? media : []

  return (
    <main className="min-h-screen pt-24 px-4 bg-white text-black">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-light">Admin Dashboard</h1>
          <button
            onClick={handleLogout}
            className="px-6 py-2 border border-black hover:bg-black hover:text-white transition-colors"
          >
            Logout
          </button>
        </div>

        {/* About Page Editor */}
        <div className="mb-12 p-6 border border-gray-300">
          <h2 className="text-2xl font-light mb-2">About Page Content</h2>
          <p className="mb-6 text-sm text-gray-500">
            Update the About page paragraph and the two portrait images without touching code.
          </p>
          <form onSubmit={handleAboutSave} className="space-y-6">
            <div>
              <label htmlFor="about-body" className="mb-2 block text-sm font-medium text-black">
                About Paragraph
              </label>
              <textarea
                id="about-body"
                value={aboutContent.body}
                onChange={(e) => setAboutContent({ ...aboutContent, body: e.target.value })}
                rows="9"
                required
                className="w-full resize-y px-4 py-3 border border-gray-300 bg-white text-black focus:outline-none focus:border-black"
              />
              <p className="mt-2 text-xs text-gray-500">
                Use a blank line to create a new paragraph on the public About page.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <p className="mb-3 text-sm font-medium text-black">First About Image</p>
                {aboutContent.primaryImageUrl && (
                  <div className="relative mb-4 aspect-[4/5] max-w-xs border border-gray-200">
                    <Image
                      src={aboutContent.primaryImageUrl}
                      alt="Current first About image"
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setAboutImages({ ...aboutImages, primaryImage: e.target.files[0] || null })}
                  className="w-full px-4 py-2 text-black file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-black file:text-white hover:file:bg-gray-800"
                />
              </div>

              <div>
                <p className="mb-3 text-sm font-medium text-black">Second About Image</p>
                {aboutContent.secondaryImageUrl && (
                  <div className="relative mb-4 aspect-[4/5] max-w-xs border border-gray-200">
                    <Image
                      src={aboutContent.secondaryImageUrl}
                      alt="Current second About image"
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setAboutImages({ ...aboutImages, secondaryImage: e.target.files[0] || null })}
                  className="w-full px-4 py-2 text-black file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-black file:text-white hover:file:bg-gray-800"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={savingAbout}
              className="px-8 py-3 bg-black text-white hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {savingAbout ? 'Saving...' : 'Save About Page'}
            </button>
          </form>
        </div>

        {/* Upload Form */}
        <div className="mb-12 p-6 border border-gray-300">
          <h2 className="text-2xl font-light mb-6">Upload New Media</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                placeholder="Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 bg-white text-black focus:outline-none focus:border-black"
              />
            </div>
            <div>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 bg-white text-black focus:outline-none focus:border-black"
              >
                <option value="">Select Category</option>
                <option value="Portraits">Portraits</option>
                <option value="Travel">Travel</option>
                <option value="Nature">Nature</option>
                <option value="Street">Street</option>
                <option value="Events">Events</option>
                <option value="Design">Design</option>
              </select>
            </div>
            <div>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 bg-white text-black focus:outline-none focus:border-black"
              >
                <option value="image">Image</option>
                <option value="video">Video</option>
              </select>
            </div>
            {formData.type === 'image' && (
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  required
                  className="w-full px-4 py-2 text-black file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-black file:text-white hover:file:bg-gray-800"
                />
              </div>
            )}
            {formData.type === 'video' && (
              <>
                <div>
                  <input
                    type="url"
                    placeholder="YouTube URL (optional)"
                    value={formData.youtubeUrl}
                    onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 bg-white text-black focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <input
                    type="url"
                    placeholder="Vimeo URL (optional)"
                    value={formData.vimeoUrl}
                    onChange={(e) => setFormData({ ...formData, vimeoUrl: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 bg-white text-black focus:outline-none focus:border-black"
                  />
                </div>
                <div>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => setSelectedFile(e.target.files[0])}
                    className="w-full px-4 py-2 text-black file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-black file:text-white hover:file:bg-gray-800"
                  />
                </div>
              </>
            )}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="featured"
                checked={formData.featured}
                onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
              />
              <label htmlFor="featured" className="text-black">Featured</label>
            </div>
            {formData.type === 'video' && (
              <>
                <p className="text-sm text-gray-500">Videos upload directly to Cloudinary (no size limit from our server). May take 1–2 min for large files.</p>
                <p className="text-xs text-amber-600 mt-1">If you see &quot;Request Entity Too Large&quot;, use your main production URL (not a preview link) and hard-refresh (Cmd+Shift+R).</p>
              </>
            )}
            <button
              type="submit"
              disabled={uploading}
              className="px-8 py-3 bg-black text-white hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {uploading ? (formData.type === 'video' ? 'Uploading video…' : 'Uploading...') : 'Upload'}
            </button>
            {uploading && uploadStatus && (
              <div className="max-w-xl">
                <p className="mt-3 text-sm text-gray-600">{uploadStatus}</p>
                <div className="mt-2 h-2 overflow-hidden bg-gray-200">
                  <div className="h-full w-1/2 animate-pulse bg-black" />
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Media List */}
        <div>
          <h2 className="text-2xl font-light mb-6">
            All Media ({mediaArray.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mediaArray.length > 0 ? mediaArray.map((item) => (
              <div key={item._id} className="border border-gray-300 p-4">
                {item.cloudinaryUrl && (
                  <div className="relative aspect-square mb-4">
                    <Image
                      src={item.cloudinaryUrl}
                      alt={item.title || 'Media'}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                {editingItem === item._id ? (
                  <div className="space-y-3">
                    <div>
                      <input
                        type="text"
                        placeholder="Title"
                        value={editFormData.title}
                        onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 bg-white text-black focus:outline-none focus:border-black text-sm"
                      />
                    </div>
                    <div>
                      <select
                        value={editFormData.category}
                        onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 bg-white text-black focus:outline-none focus:border-black text-sm"
                      >
                        <option value="">Select Category</option>
                        <option value="Portraits">Portraits</option>
                        <option value="Travel">Travel</option>
                        <option value="Nature">Nature</option>
                        <option value="Street">Street</option>
                        <option value="Events">Events</option>
                        <option value="Design">Design</option>
                      </select>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`featured-${item._id}`}
                        checked={editFormData.featured}
                        onChange={(e) => setEditFormData({ ...editFormData, featured: e.target.checked })}
                      />
                      <label htmlFor={`featured-${item._id}`} className="text-sm text-black">Featured</label>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSaveEdit(item._id)}
                        className="flex-1 px-4 py-2 bg-black text-white hover:bg-gray-800 transition-colors text-sm"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="flex-1 px-4 py-2 border border-gray-300 hover:bg-gray-100 transition-colors text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h3 className="font-medium mb-2">{item.title || 'Untitled'}</h3>
                    <p className="text-sm text-gray-600 mb-2">Category: {item.category || 'None'}</p>
                    <p className="text-sm text-gray-600 mb-2">Type: {item.type}</p>
                    {item.featured && (
                      <p className="text-sm text-blue-600 mb-4">⭐ Featured</p>
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="flex-1 px-4 py-2 bg-gray-800 text-white hover:bg-gray-700 transition-colors text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="flex-1 px-4 py-2 bg-red-500 text-white hover:bg-red-600 transition-colors text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            )) : (
              <div className="col-span-full text-center py-12 text-gray-500">
                No media found. Upload your first image or video above.
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
