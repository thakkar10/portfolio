# Setup Guide - MongoDB Atlas Connection

## Step 1: Get Your MongoDB Atlas Connection String

1. Go to [MongoDB Atlas](https://cloud.mongodb.com) and log in
2. Click on your cluster (or create one if you haven't)
3. Click the **"Connect"** button
4. Choose **"Connect your application"**
5. Select **"Node.js"** as the driver
6. Copy the connection string (it looks like this):
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

## Step 2: Create Database User (if you haven't)

1. In Atlas, go to **Database Access** (left sidebar)
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. Create a username and password (save these!)
5. Set privileges to **"Atlas Admin"** or **"Read and write to any database"**
6. Click **"Add User"**

## Step 3: Whitelist Your IP Address

1. Go to **Network Access** (left sidebar)
2. Click **"Add IP Address"**
3. For development, click **"Allow Access from Anywhere"** (0.0.0.0/0)
   - Or add your specific IP address
4. Click **"Confirm"**

## Step 4: Create .env.local File

Create a file named `.env.local` in your project root with:

```env
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/portfolio?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

**Important**: Replace:
- `YOUR_USERNAME` with your database username
- `YOUR_PASSWORD` with your database password
- `cluster0.xxxxx.mongodb.net` with your actual cluster URL
- Keep `/portfolio` at the end (this is your database name)

## Step 5: Set Up Cloudinary (for image storage)

1. Sign up at [Cloudinary](https://cloudinary.com) (free account)
2. Go to Dashboard
3. Copy your:
   - Cloud Name
   - API Key
   - API Secret
4. Add them to `.env.local`

## Step 6: Create Your Admin Account

After starting the server, you can create an admin account by:

1. Using the registration API endpoint, OR
2. Creating it manually in MongoDB Atlas

### Option A: Using API (Recommended)
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"yourpassword"}'
```

### Option B: Manual (via MongoDB Atlas)
1. Go to your cluster in Atlas
2. Click "Browse Collections"
3. Create a database called `portfolio`
4. Create a collection called `users`
5. Insert a document (we'll hash the password later)

## Step 7: Test the Connection

1. Start your dev server:
   ```bash
   npm run dev
   ```

2. Check the terminal - you should see "MongoDB connected" (no errors)

3. Visit `http://localhost:3000/admin/login` and try logging in

## Troubleshooting

- **Connection refused**: Check your IP is whitelisted in Network Access
- **Authentication failed**: Verify username/password in connection string
- **Database not found**: The database will be created automatically on first use

