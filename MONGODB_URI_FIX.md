# MongoDB URI - Common Issues & Fixes

## ✅ Your URI Format is Correct!

The diagnostic shows your MongoDB URI is properly formatted. The connection issue is likely **not** the URI itself.

## Common Issues:

### 1. IP Whitelist (Most Common)
**Problem:** MongoDB Atlas blocks connections from IPs not on the whitelist.

**Fix:**
1. Go to MongoDB Atlas → Network Access
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (adds `0.0.0.0/0`)
4. Wait 1-2 minutes
5. Test connection again

### 2. Wrong Username/Password
**Problem:** Credentials don't match MongoDB Atlas.

**Fix:**
1. Verify username in MongoDB Atlas → Database Access
2. Verify password (check for typos)
3. If password has special characters, make sure it's URL-encoded in `.env.local`
   - `#` → `%23`
   - `@` → `%40`
   - `/` → `%2F`

### 3. Database User Not Created
**Problem:** Database user doesn't exist in MongoDB Atlas.

**Fix:**
1. Go to MongoDB Atlas → Database Access
2. Check if user `hthakkar_10` exists
3. If not, create it with password `DinMit#7884`
4. Make sure user has read/write permissions

### 4. Database Name Mismatch
**Problem:** Database `portfolio` doesn't exist.

**Fix:**
- MongoDB Atlas creates databases automatically
- First write operation will create the database
- Or manually create it in MongoDB Atlas

## Your Current URI:
```
mongodb+srv://hthakkar_10:DinMit%237884@cluster0.krmxqqz.mongodb.net/portfolio?retryWrites=true&w=majority
```

## How to Test:
1. Run: `node check-mongodb-uri.js` (diagnostic script)
2. Test API: `http://localhost:3000/api/test-db`
3. Check server logs for connection errors

## For Vercel Deployment:
Make sure to add the **exact same URI** in Vercel environment variables:
- Go to Vercel Dashboard → Settings → Environment Variables
- Add: `MONGODB_URI` = `mongodb+srv://hthakkar_10:DinMit%237884@cluster0.krmxqqz.mongodb.net/portfolio?retryWrites=true&w=majority`
- **Important:** Use the exact same value, don't add quotes

## Still Not Working?
1. Check MongoDB Atlas connection logs
2. Verify IP whitelist includes `0.0.0.0/0`
3. Test with MongoDB Compass or MongoDB shell
4. Check server terminal for detailed error messages

