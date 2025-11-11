import mongoose from 'mongoose'

let cached = global.mongoose

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null }
}

async function connectDB() {
  // Check for MONGODB_URI only when function is called (not at build time)
  let MONGODB_URI = process.env.MONGODB_URI

  if (!MONGODB_URI) {
    throw new Error('Please define the MONGODB_URI environment variable')
  }

  // Trim whitespace that might cause issues
  MONGODB_URI = MONGODB_URI.trim()

  // Validate URI format
  if (!MONGODB_URI.startsWith('mongodb://') && !MONGODB_URI.startsWith('mongodb+srv://')) {
    throw new Error('Invalid MONGODB_URI format. Must start with mongodb:// or mongodb+srv://')
  }

  // Log connection attempt (without showing full URI for security)
  const uriPreview = MONGODB_URI.split('@')[1] || 'hidden'
  console.log('🔌 Attempting MongoDB connection to:', uriPreview)

  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    }

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('✅ MongoDB connected successfully')
      return mongoose
    }).catch((error) => {
      console.error('❌ MongoDB connection error:', error.message)
      console.error('❌ Error details:', {
        name: error.name,
        code: error.code,
        codeName: error.codeName
      })
      cached.promise = null
      throw error
    })
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    cached.promise = null
    console.error('❌ MongoDB connection failed:', e.message)
    throw e
  }

  return cached.conn
}

export default connectDB

