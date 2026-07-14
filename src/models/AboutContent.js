import mongoose from 'mongoose'

const aboutContentSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    default: 'about',
  },
  body: {
    type: String,
    trim: true,
    default: '',
  },
  primaryImageUrl: {
    type: String,
    trim: true,
    default: '',
  },
  primaryImagePublicId: {
    type: String,
    trim: true,
    default: '',
  },
  secondaryImageUrl: {
    type: String,
    trim: true,
    default: '',
  },
  secondaryImagePublicId: {
    type: String,
    trim: true,
    default: '',
  },
}, {
  timestamps: true,
})

export default mongoose.models.AboutContent || mongoose.model('AboutContent', aboutContentSchema)
