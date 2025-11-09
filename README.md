# Photography Portfolio Website

A full-stack photography portfolio website built with Next.js, Tailwind CSS, MongoDB, and Cloudinary. Inspired by the minimalist design of [Deanie Chen's portfolio](https://deaniechen.com/).

## Features

- **Minimalist Design**: Clean, elegant interface with smooth animations
- **Responsive**: Fully responsive across desktop, tablet, and mobile
- **Photo Gallery**: Masonry grid layout with category filters
- **Video Support**: Embedded YouTube/Vimeo videos or local video uploads
- **Admin Dashboard**: Secure login and upload interface
- **Cloudinary Integration**: Automatic image compression and optimization
- **Framer Motion**: Smooth fade-in animations on scroll

## Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS, Framer Motion
- **Backend**: Next.js API Routes, Node.js, Express
- **Database**: MongoDB with Mongoose
- **Storage**: Cloudinary for image/video hosting
- **Authentication**: JWT-based authentication

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
