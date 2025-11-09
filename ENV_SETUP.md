# Environment Variables Setup

Create a `.env.local` file in the root of your project with the following variables:

```env
# MongoDB Atlas Connection String
# Replace username, password, and cluster URL with your actual values
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/portfolio

# JWT Secret (use a long random string in production)
JWT_SECRET=your-secret-key-change-in-production

# Cloudinary Configuration
# Get these from your Cloudinary dashboard
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

## Getting Your MongoDB Atlas Connection String

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Log in to your account
3. Select your cluster
4. Click "Connect"
5. Choose "Connect your application"
6. Copy the connection string
7. Replace `<password>` with your database user password
8. Replace `<dbname>` with `portfolio` (or your preferred database name)

Example:
```
mongodb+srv://myuser:mypassword@cluster0.xxxxx.mongodb.net/portfolio?retryWrites=true&w=majority
```

## Getting Cloudinary Credentials

1. Sign up at [Cloudinary](https://cloudinary.com) (free tier available)
2. Go to Dashboard
3. Copy your Cloud Name, API Key, and API Secret

## Important Notes

- Never commit `.env.local` to git (it's already in .gitignore)
- Use a strong, random JWT_SECRET in production
- Keep your credentials secure

