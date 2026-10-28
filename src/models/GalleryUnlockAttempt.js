import mongoose from 'mongoose'

const galleryUnlockAttemptSchema = new mongoose.Schema({
  _id: String,
  attempts: { type: [Date], default: [] },
  expiresAt: { type: Date, required: true },
}, { versionKey: false })

galleryUnlockAttemptSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 })

export default mongoose.models.GalleryUnlockAttempt || mongoose.model('GalleryUnlockAttempt', galleryUnlockAttemptSchema)
