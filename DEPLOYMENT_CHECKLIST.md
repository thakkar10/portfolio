# 🚀 Deployment Checklist

## Before Deploying

- [ ] Code is committed to Git
- [ ] All changes are pushed to GitHub
- [ ] `.env.local` is in `.gitignore` (should be already)
- [ ] MongoDB Atlas IP is whitelisted (`0.0.0.0/0` recommended)
- [ ] All environment variables are ready to copy

## Deploy to Vercel

- [ ] Sign in to Vercel with GitHub
- [ ] Import your repository
- [ ] Add environment variables in Vercel Dashboard:
  - [ ] `MONGODB_URI`
  - [ ] `JWT_SECRET`
  - [ ] `CLOUDINARY_CLOUD_NAME`
  - [ ] `CLOUDINARY_API_KEY`
  - [ ] `CLOUDINARY_API_SECRET`
- [ ] Deploy project
- [ ] Wait for build to complete (~2 minutes)

## After Deployment

- [ ] Visit your live site: `https://your-project.vercel.app`
- [ ] Test homepage loads
- [ ] Test admin login: `https://your-project.vercel.app/admin/login`
- [ ] Upload a test image
- [ ] Verify image appears on homepage (if marked as featured)
- [ ] Test photography/video/design pages
- [ ] Test contact form

## Making Changes

### Option 1: Git Push (Recommended)
1. Make changes locally
2. Test with `npm run dev`
3. Commit: `git add . && git commit -m "message"`
4. Push: `git push origin main`
5. Vercel auto-deploys (watch in dashboard)

### Option 2: Direct Upload (Images Only)
1. Go to live site → `/admin/login`
2. Login
3. Upload images directly
4. Images appear immediately (no redeploy needed)

## Troubleshooting

- **Build fails?** Check build logs in Vercel Dashboard
- **Images not loading?** Check environment variables are set
- **Database connection fails?** Check MongoDB Atlas IP whitelist
- **Admin not working?** Check JWT_SECRET is set

## Quick Commands

```bash
# Test build locally
npm run build

# Start production server locally
npm start

# Deploy with Vercel CLI (optional)
npx vercel
```

