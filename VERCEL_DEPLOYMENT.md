# Deploying to Vercel - Complete Guide

## 🚀 Quick Deploy (5 minutes)

### Step 1: Push to GitHub
1. Make sure your code is committed to Git:
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

### Step 2: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click **"Add New Project"**
4. Import your repository
5. Click **"Deploy"**

### Step 3: Add Environment Variables
**⚠️ IMPORTANT:** Add these in Vercel Dashboard → Settings → Environment Variables:

```
MONGODB_URI=mongodb+srv://hthakkar_10:DinMit%237884@cluster0.krmxqqz.mongodb.net/portfolio?retryWrites=true&w=majority
JWT_SECRET=a228e36236be818781aea0bea28cb562d4eca06246ed8d3d3bd17fe0207943cb
CLOUDINARY_CLOUD_NAME=dmhequjp8
CLOUDINARY_API_KEY=223992312334752
CLOUDINARY_API_SECRET=BTEUZqvMPRbQFKSYmz7eDm-pkv0
```

**How to add:**
1. Go to your project on Vercel
2. Click **"Settings"** → **"Environment Variables"**
3. Add each variable (name and value)
4. Select **"Production"**, **"Preview"**, and **"Development"** for each
5. Click **"Save"**
6. **Redeploy** your project (Deployments → ... → Redeploy)

### Step 4: Update MongoDB Atlas IP Whitelist
1. Go to MongoDB Atlas → Network Access
2. Make sure `0.0.0.0/0` is whitelisted (allows Vercel's servers to connect)
3. Or add Vercel's IP ranges (but `0.0.0.0/0` is easier for now)

---

## 🔄 Making Changes After Deployment

### Option 1: Push to GitHub (Recommended)
**Best for code changes:**
1. Make changes locally
2. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Your change description"
   git push origin main
   ```
3. Vercel automatically deploys (takes ~2 minutes)
4. Changes go live automatically!

### Option 2: Vercel Dashboard
**Best for quick fixes:**
1. Go to Vercel Dashboard
2. Click on your project
3. Go to **"Deployments"**
4. Click **"Redeploy"** to rebuild
5. Or use **"Settings"** to update environment variables

### Option 3: Vercel CLI
**Best for advanced users:**
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

---

## 📝 Workflow: Making Changes

### Typical Workflow:
1. **Make changes locally** (edit files, test with `npm run dev`)
2. **Test everything works** (upload images, check admin dashboard)
3. **Commit changes:**
   ```bash
   git add .
   git commit -m "Added new feature"
   git push origin main
   ```
4. **Vercel auto-deploys** (watch the deployment in Vercel dashboard)
5. **Verify on production** (check your live site)

### Adding New Images:
1. Go to your **live site** → `/admin/login`
2. Login with your admin credentials
3. Upload images directly on the live site
4. Images are saved to MongoDB and Cloudinary
5. They appear on your live site immediately!

---

## ⚙️ Environment Variables Setup

### Required Variables:
- `MONGODB_URI` - Your MongoDB connection string
- `JWT_SECRET` - Secret for authentication tokens
- `CLOUDINARY_CLOUD_NAME` - Your Cloudinary cloud name
- `CLOUDINARY_API_KEY` - Your Cloudinary API key
- `CLOUDINARY_API_SECRET` - Your Cloudinary API secret

### Where to Find Them:
- Check your `.env.local` file (don't commit this!)
- Copy the values to Vercel Dashboard

---

## 🔒 Security Notes

### MongoDB Atlas:
- Make sure IP whitelist includes `0.0.0.0/0` (or Vercel's IPs)
- Your database is secure with authentication

### Environment Variables:
- ✅ Never commit `.env.local` to GitHub
- ✅ Always add variables in Vercel Dashboard
- ✅ Use different JWT_SECRET for production (optional but recommended)

### Admin Access:
- Your `/admin` route is protected with JWT
- Only you can access it with your login credentials
- Make sure to use a strong password!

---

## 🐛 Troubleshooting

### Deployment Fails:
1. Check build logs in Vercel Dashboard
2. Make sure all environment variables are set
3. Check `package.json` has correct build script: `"build": "next build"`

### Images Not Loading:
1. Check Cloudinary environment variables are set
2. Verify MongoDB connection (check MongoDB Atlas IP whitelist)
3. Check browser console for errors

### Database Connection Issues:
1. Make sure MongoDB Atlas allows `0.0.0.0/0` (all IPs)
2. Verify `MONGODB_URI` is correct in Vercel
3. Check MongoDB Atlas connection logs

### Admin Dashboard Not Working:
1. Check JWT_SECRET is set in Vercel
2. Try logging in again
3. Check browser console for errors

---

## 📊 Monitoring

### Vercel Dashboard Shows:
- Deployment status
- Build logs
- Function logs (API routes)
- Analytics (page views, etc.)

### Useful Vercel Features:
- **Preview Deployments:** Every push creates a preview URL
- **Rollback:** Can rollback to previous deployments
- **Analytics:** Track site performance
- **Logs:** View server logs in real-time

---

## 🎯 Next Steps After Deployment

1. **Test everything:**
   - Visit your live site
   - Test admin login
   - Upload a test image
   - Check it appears on homepage

2. **Set up custom domain (optional):**
   - Go to Vercel → Settings → Domains
   - Add your custom domain
   - Update DNS settings

3. **Monitor performance:**
   - Check Vercel Analytics
   - Monitor API routes
   - Check error logs

---

## 💡 Tips

- **Always test locally first** before pushing to production
- **Use preview deployments** to test changes before merging
- **Keep environment variables updated** in Vercel
- **Monitor your MongoDB Atlas usage** (free tier has limits)
- **Monitor Cloudinary usage** (free tier has limits)

---

## 🆘 Need Help?

- Check Vercel docs: https://vercel.com/docs
- Check Next.js docs: https://nextjs.org/docs
- Check build logs in Vercel Dashboard
- Check server logs in Vercel Dashboard

---

**Your site will be live at:** `https://your-project-name.vercel.app`

**Admin dashboard:** `https://your-project-name.vercel.app/admin/login`

