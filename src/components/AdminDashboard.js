'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import imageCompression from 'browser-image-compression'

export default function AdminDashboard() {
  const [media, setMedia] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setUploading(true)

    try {
      const token = localStorage.getItem('token')
      const data = new FormData()
      
      if (selectedFile) {
        let fileToUpload = selectedFile
        
        // Compress images if they're too large (over 9MB to be safe)
        if (formData.type === 'image' && selectedFile.size > 9 * 1024 * 1024) {
          console.log('Compressing large image...')
          const options = {
            maxSizeMB: 9, // Maximum file size in MB
            maxWidthOrHeight: 1920, // Maximum width or height
            useWebWorker: true,
            fileType: selectedFile.type,
          }
          fileToUpload = await imageCompression(selectedFile, options)
          console.log('Image compressed:', fileToUpload.size, 'bytes')
        }
        
        data.append('file', fileToUpload)
      }
      data.append('title', formData.title)
      data.append('category', formData.category)
      data.append('type', formData.type)
      if (formData.youtubeUrl) data.append('youtubeUrl', formData.youtubeUrl)
      if (formData.vimeoUrl) data.append('vimeoUrl', formData.vimeoUrl)
      data.append('featured', formData.featured)

      const res = await fetch('/api/media/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: data,
      })

      if (res.ok) {
        alert('Upload successful!')
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
        const error = await res.json()
        alert(error.error || 'Upload failed')
      }
    } catch (err) {
      alert('Error uploading. Please try again.')
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
            <button
              type="submit"
              disabled={uploading}
              className="px-8 py-3 bg-black text-white hover:bg-gray-800 transition-colors disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
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

