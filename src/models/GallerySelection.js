import mongoose from 'mongoose'

const gallerySelectionSchema = new mongoose.Schema({
  galleryId: { type: mongoose.Schema.Types.ObjectId, ref: 'ClientGallery', required: true, index: true },
  tokenHash: { type: String, required: true, unique: true },
  name: { type: String, default: '', maxlength: 100 },
  mediaIds: { type: [mongoose.Schema.Types.ObjectId], default: [] },
  submittedAt: { type: Date, default: null },
}, { timestamps: true })

export default mongoose.models.GallerySelection || mongoose.model('GallerySelection', gallerySelectionSchema)
