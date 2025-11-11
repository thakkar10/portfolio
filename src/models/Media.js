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
  tags: {
    type: [String],
    default: [],
    index: true,
  },
  caption: {
    type: String,
    trim: true,
    default: '',
  },
  embedding: {
    type: [Number],
    default: undefined,
    select: true,
  },
}, {
  timestamps: true,
})

// Text index for semantic-ish search across key fields
mediaSchema.index({ title: 'text', category: 'text', tags: 'text' })

export default mongoose.models.Media || mongoose.model('Media', mediaSchema)

