/**
 * Optimize Cloudinary image URL for better performance
 * Adds transformations to reduce file size and improve loading
 */
export function getOptimizedImageUrl(cloudinaryUrl, width = 800, quality = 85) {
  if (!cloudinaryUrl) return cloudinaryUrl
  
  try {
    // If it's already a Cloudinary URL, add optimization parameters
    if (cloudinaryUrl.includes('res.cloudinary.com')) {
      // Check if transformations already exist
      if (cloudinaryUrl.includes('/upload/')) {
        const parts = cloudinaryUrl.split('/upload/')
        if (parts.length === 2) {
          // Cloudinary transformation format: /upload/w_800,q_85,f_auto,c_limit/
          const transformations = `w_${width},q_${quality},f_auto,c_limit`
          return `${parts[0]}/upload/${transformations}/${parts[1]}`
        }
      }
    }
  } catch (error) {
    console.error('Error optimizing image URL:', error)
  }
  
  return cloudinaryUrl
}

