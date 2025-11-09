import mongoose from 'mongoose'

const mediaSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    trim: true,
  },
  type: {
    type: String,
    enum: ['image', 'video'],
    required: true,
  },
  cloudinaryUrl: {
    type: String,
    trim: true,
  },
  cloudinaryPublicId: {
    type: String,
    trim: true,
  },
  youtubeUrl: {
    type: String,
    trim: true,
  },
  vimeoUrl: {
    type: String,
    trim: true,
  },
  featured: {
    type: Boolean,
    default: false,
  },
  order: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
})

export default mongoose.models.Media || mongoose.model('Media', mediaSchema)

