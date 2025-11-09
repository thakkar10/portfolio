import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  image: {
    type: String,
    trim: true,
  },
  imageUrl: {
    type: String,
    trim: true,
  },
  link: {
    type: String,
    trim: true,
  },
  githubLink: {
    type: String,
    trim: true,
  },
  tags: [{
    type: String,
    trim: true,
  }],
  order: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

export default mongoose.model('Project', projectSchema);

