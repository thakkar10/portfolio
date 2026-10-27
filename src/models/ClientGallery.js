import mongoose from 'mongoose'

const galleryMediaSchema = new mongoose.Schema({
  publicId: { type: String, required: true },
  assetId: { type: String, required: true },
  filename: { type: String, required: true },
  format: { type: String, required: true },
  width: { type: Number, required: true },
  height: { type: Number, required: true },
  bytes: { type: Number, default: 0 },
  order: { type: Number, default: 0 },
  set: { type: String, default: 'Highlights' },
}, { _id: true, timestamps: true })

const clientGallerySchema = new mongoose.Schema({
  title: { type: String, default: 'Untitled gallery', trim: true },
  slug: { type: String, required: true, unique: true, index: true },
  status: { type: String, enum: ['draft', 'published'], default: 'draft' },
  eventDate: { type: Date, default: null },
  description: { type: String, default: '', maxlength: 2000 },
  coverMediaId: { type: mongoose.Schema.Types.ObjectId, default: null },
  coverFocusX: { type: Number, default: 50, min: 0, max: 100 },
  coverFocusY: { type: Number, default: 50, min: 0, max: 100 },
  passwordHash: { type: String, default: '' },
  accessVersion: { type: Number, default: 1 },
  downloadsEnabled: { type: Boolean, default: false },
  favoritesEnabled: { type: Boolean, default: true },
  media: { type: [galleryMediaSchema], default: [] },
}, { timestamps: true })

export default mongoose.models.ClientGallery || mongoose.model('ClientGallery', clientGallerySchema)
