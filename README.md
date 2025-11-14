# Photography Portfolio Website

A full-stack photography portfolio website built with Next.js, Tailwind CSS, MongoDB, and Cloudinary.

## Overview

This is a modern, AI-powered photography portfolio website that showcases photography, videography, and design work. The platform features an intelligent AI search agent that understands natural language queries to help visitors discover content based on visual elements, mood, and subject matter.

### Key Features

- **AI-Powered Semantic Search**: Natural language search agent powered by Google Gemini AI that understands image content and can find photos based on descriptions like "travel photos", "golden hour landscapes", "street candid shots", etc.
- **Dynamic Content Management**: Secure admin dashboard for uploading, categorizing, and managing media with real-time updates
- **Responsive Design**: Fully optimized for desktop, tablet, and mobile devices with iPhone-specific enhancements
- **Multiple Media Types**: Support for photography, video, and design work with category filtering
- **Contact Form**: Integrated contact form with email notifications via Resend
- **Featured Work Gallery**: Curated featured images with smooth scroll animations
- **Modern UI/UX**: Clean, minimalist design with Framer Motion animations and custom typography

## Features

- **Minimalist Design**: Clean, elegant interface with smooth animations
- **Responsive**: Fully responsive across desktop, tablet, and mobile
- **Photo Gallery**: Masonry grid layout with category filters
- **Video Support**: Embedded YouTube/Vimeo videos or local video uploads
- **Admin Dashboard**: Secure login and upload interface
- **Cloudinary Integration**: Automatic image compression and optimization
- **Framer Motion**: Smooth fade-in animations on scroll

## Tech Stack

- **Frontend**: Next.js 16, React, Tailwind CSS, Framer Motion
- **Backend**: Next.js API Routes (Serverless Functions)
- **Database**: MongoDB Atlas with Mongoose
- **Storage**: Cloudinary for image/video hosting
- **AI/ML**: Google Gemini AI (Gemini 2.5 Flash for image captioning, Text Embedding 004 for semantic search)
- **Authentication**: JWT-based authentication
- **Email**: Resend for contact form notifications

## Getting Started

### Prerequisites

- Node.js 18+ installed
- MongoDB (local or MongoDB Atlas)
- Cloudinary account (free tier available)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd portfolio
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file in the root directory:
```env
MONGODB_URI=mongodb://localhost:27017/portfolio
# Or use MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/portfolio

JWT_SECRET=your-secret-key-change-in-production

CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Creating Your Admin Account

1. Visit `/api/auth/register` endpoint or create a user manually in MongoDB
2. Or use the registration API:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"yourpassword"}'
```

3. Login at `/admin/login`

## Project Structure

```
portfolio/
├── src/
│   ├── app/              # Next.js app directory
│   │   ├── api/         # API routes
│   │   ├── admin/       # Admin pages
│   │   ├── photography/ # Photography page
│   │   ├── video/       # Video page
│   │   ├── design/      # Design page
│   │   └── about/       # About page
│   ├── components/      # React components
│   ├── lib/             # Utilities (MongoDB, Cloudinary)
│   └── models/          # Mongoose models
├── public/              # Static files
└── .env.local          # Environment variables
```

## Deployment

### Frontend (Vercel)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Backend

The backend is included in Next.js API routes, so it deploys with the frontend on Vercel.

### Database

- Use MongoDB Atlas for production
- Update `MONGODB_URI` in Vercel environment variables

## Features in Detail

### AI-Powered Semantic Search

The portfolio includes an intelligent search agent powered by Google Gemini AI:

- **Natural Language Understanding**: Users can search using conversational queries like "travel photos", "portraits at golden hour", "street candid shots"
- **Image Content Analysis**: AI automatically captions all uploaded images, understanding visual elements, mood, style, and subject matter
- **Semantic Matching**: Uses vector embeddings to find images based on meaning, not just keywords
- **Smart Routing**: Automatically routes searches to the appropriate section (Photography, Video, or Design) based on query intent
- **Floating Search Interface**: Accessible from any page via a floating search button with smooth animations

To enable AI search:
1. Get a Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey)
2. Add `GEMINI_API_KEY` to `.env.local`
3. Run the indexing script: `node src/scripts/reindexEmbeddings.js`

### Admin Dashboard

- Upload images/videos directly from device
- Assign categories and tags
- Mark items as featured
- Delete media items
- View all uploaded content

### Gallery Features

- Masonry grid layout
- Category filtering
- Lightbox for full-size viewing
- Lazy loading for performance
- Smooth animations

### Responsive Design

- Mobile-first approach
- Tablet and desktop optimizations
- Touch-friendly interactions

## Environment Variables

See `.env.example` for all required environment variables.

## License

MIT

## Support

For issues or questions, please open an issue on GitHub.
