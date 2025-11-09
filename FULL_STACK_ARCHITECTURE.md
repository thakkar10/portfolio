# Full-Stack Architecture Overview

This document explains where and how the full-stack functionality works in your portfolio project.

## 📁 Project Structure

```
portfolio/
├── src/
│   ├── app/                    # Next.js App Router (Frontend Pages)
│   │   ├── page.js            # Homepage (fetches featured images)
│   │   ├── photography/       # Photography gallery page
│   │   ├── video/             # Video gallery page
│   │   ├── design/            # Design gallery page
│   │   ├── about/             # About page
│   │   ├── contact/           # Contact page
│   │   ├── admin/             # Admin dashboard page
│   │   │   └── login/         # Admin login page
│   │   │
│   │   └── api/               # 🎯 BACKEND API ROUTES (Server-side)
│   │       ├── auth/
│   │       │   ├── login/route.js      # POST /api/auth/login
│   │       │   ├── register/route.js   # POST /api/auth/register
│   │       │   └── verify/route.js     # GET /api/auth/verify
│   │       │
│   │       ├── media/
│   │       │   ├── route.js            # GET /api/media (fetch all media)
│   │       │   ├── upload/route.js     # POST /api/media/upload
│   │       │   └── [id]/route.js       # DELETE/PUT /api/media/:id
│   │       │
│   │       └── contact/route.js        # POST /api/contact
│   │
│   ├── models/                # 🗄️ DATABASE MODELS (MongoDB Schemas)
│   │   ├── User.js            # User authentication model
│   │   └── Media.js           # Media/Project model
│   │
│   ├── lib/                   # 🔧 UTILITY LIBRARIES
│   │   ├── mongodb.js         # MongoDB connection handler
│   │   ├── cloudinary.js      # Cloudinary upload utility
│   │   └── imageUtils.js      # Image optimization utilities
│   │
│   ├── middleware/            # 🛡️ AUTHENTICATION MIDDLEWARE
│   │   └── auth.js            # JWT token verification
│   │
│   └── components/            # ⚛️ REACT COMPONENTS (Frontend)
│       ├── AdminDashboard.js  # Admin UI (calls API routes)
│       ├── Navigation.js      # Navigation bar
│       └── MasonryGrid.js     # Image grid component
│
└── public/                    # Static assets
    ├── cover.jpg
    └── signature.png
```

---

## 🔄 Full-Stack Flow

### 1. **Authentication Flow**

#### Frontend → Backend → Database

**Frontend (Login Page):**
- 📄 `src/app/admin/login/page.js`
- User enters username/password
- Sends POST request to `/api/auth/login`

**Backend (API Route):**
- 📄 `src/app/api/auth/login/route.js`
- Receives credentials
- Connects to MongoDB (`connectDB()`)
- Queries User model for username
- Compares password using bcrypt
- Generates JWT token if valid
- Returns token to frontend

**Database (MongoDB):**
- 📄 `src/models/User.js`
- Stores user credentials (hashed passwords)
- Schema: `username`, `password`, `timestamps`

**Flow:**
```
User Login Form
    ↓
POST /api/auth/login
    ↓
connectDB() → MongoDB Atlas
    ↓
User.findOne({ username })
    ↓
user.comparePassword(password)
    ↓
jwt.sign() → Generate token
    ↓
Return token to frontend
    ↓
localStorage.setItem('token')
    ↓
Redirect to /admin
```

---

### 2. **Media Upload Flow**

#### Frontend → Backend → Cloudinary → Database → Frontend

**Frontend (Admin Dashboard):**
- 📄 `src/components/AdminDashboard.js`
- User selects file, enters title/category
- Compresses image if > 9MB (client-side)
- Creates FormData with file + metadata
- Sends POST request to `/api/media/upload`
- Includes JWT token in Authorization header

**Backend (API Route):**
- 📄 `src/app/api/media/upload/route.js`
- Verifies JWT token (`verifyToken()`)
- Receives FormData (file + metadata)
- Uploads file to Cloudinary (`uploadToCloudinary()`)
- Creates Media document in MongoDB
- Returns created media object

**Cloud Storage (Cloudinary):**
- 📄 `src/lib/cloudinary.js`
- Receives file buffer
- Uploads to Cloudinary
- Returns secure URL and public ID
- Automatically optimizes images

**Database (MongoDB):**
- 📄 `src/models/Media.js`
- Stores media metadata:
  - `title`, `category`, `type`
  - `cloudinaryUrl`, `cloudinaryPublicId`
  - `youtubeUrl`, `vimeoUrl`
  - `featured`, `order`, `timestamps`

**Flow:**
```
Admin Dashboard Form
    ↓
Image Compression (if needed)
    ↓
POST /api/media/upload (with JWT token)
    ↓
verifyToken() → Check authentication
    ↓
uploadToCloudinary(file) → Cloudinary
    ↓
Get cloudinaryUrl + cloudinaryPublicId
    ↓
new Media({ ... }) → Create document
    ↓
media.save() → MongoDB
    ↓
Return media object
    ↓
Frontend refreshes gallery
```

---

### 3. **Fetching Media Flow**

#### Frontend → Backend → Database → Frontend

**Frontend (Gallery Pages):**
- 📄 `src/app/page.js` (Homepage)
- 📄 `src/app/photography/page.js`
- 📄 `src/app/video/page.js`
- Fetches media from `/api/media?type=image&featured=true`

**Backend (API Route):**
- 📄 `src/app/api/media/route.js`
- Connects to MongoDB
- Queries Media collection with filters:
  - `type`: 'image' or 'video'
  - `category`: photography, video, design, etc.
  - `featured`: true/false
- Returns array of media objects

**Database (MongoDB):**
- Queries Media collection
- Sorts by `order` and `createdAt`
- Returns matching documents

**Flow:**
```
Homepage/Gallery Page
    ↓
GET /api/media?type=image&featured=true
    ↓
connectDB() → MongoDB
    ↓
Media.find(query).sort(...)
    ↓
Return media array
    ↓
Display in MasonryGrid component
```

---

### 4. **Delete Media Flow**

#### Frontend → Backend → Cloudinary → Database → Frontend

**Frontend (Admin Dashboard):**
- 📄 `src/components/AdminDashboard.js`
- User clicks delete button
- Sends DELETE request to `/api/media/[id]`

**Backend (API Route):**
- 📄 `src/app/api/media/[id]/route.js`
- Verifies JWT token
- Finds media by ID
- Deletes from Cloudinary (using publicId)
- Deletes from MongoDB
- Returns success message

**Flow:**
```
Admin Dashboard Delete Button
    ↓
DELETE /api/media/:id (with JWT token)
    ↓
verifyToken() → Check authentication
    ↓
Find media by ID
    ↓
cloudinary.uploader.destroy(publicId)
    ↓
Media.findByIdAndDelete(id)
    ↓
Return success
    ↓
Frontend refreshes gallery
```

---

## 🔑 Key Files Explained

### **Backend API Routes** (`src/app/api/`)

All files in this folder run on the **server-side** (Node.js):

1. **`auth/login/route.js`**: Handles user authentication
2. **`auth/register/route.js`**: Creates new admin users
3. **`auth/verify/route.js`**: Verifies JWT tokens
4. **`media/route.js`**: GET all media (public, no auth required)
5. **`media/upload/route.js`**: POST new media (requires auth)
6. **`media/[id]/route.js`**: DELETE/UPDATE media (requires auth)
7. **`contact/route.js`**: Handles contact form submissions

### **Database Models** (`src/models/`)

MongoDB schemas using Mongoose:

1. **`User.js`**: User authentication
   - Fields: `username`, `password` (hashed)
   - Methods: `comparePassword()`
   - Pre-save hook: Hashes password before saving

2. **`Media.js`**: Media/projects
   - Fields: `title`, `category`, `type`, `cloudinaryUrl`, `featured`, etc.
   - Used to store all uploaded images/videos

### **Utilities** (`src/lib/`)

1. **`mongodb.js`**: MongoDB connection handler
   - Caches connection to prevent multiple connections
   - Uses `MONGODB_URI` from `.env.local`

2. **`cloudinary.js`**: Cloudinary integration
   - Configures Cloudinary client
   - `uploadToCloudinary()`: Uploads files to Cloudinary
   - Returns secure URL and public ID

### **Middleware** (`src/middleware/`)

1. **`auth.js`**: JWT verification
   - `verifyToken()`: Extracts and verifies JWT from Authorization header
   - Returns `{ valid: true/false, user/error }`

### **Frontend Components** (`src/components/`)

1. **`AdminDashboard.js`**: Admin UI
   - Fetches media from `/api/media`
   - Uploads media to `/api/media/upload`
   - Deletes media via `/api/media/[id]`
   - Uses JWT token from localStorage

2. **`MasonryGrid.js`**: Displays media in grid
   - Receives media array as props
   - Renders images/videos in masonry layout

---

## 🔐 Authentication System

### JWT Token Flow:

1. **Login**: User logs in → Receives JWT token
2. **Storage**: Token stored in `localStorage`
3. **Requests**: Token sent in `Authorization: Bearer <token>` header
4. **Verification**: Backend verifies token on protected routes
5. **Expiration**: Tokens expire after 7 days (configurable)

### Protected Routes:
- `/api/media/upload` (POST)
- `/api/media/[id]` (DELETE, PUT)
- `/admin` (page)

### Public Routes:
- `/api/media` (GET)
- `/api/contact` (POST)
- All gallery pages

---

## 📊 Database Schema

### User Collection:
```javascript
{
  _id: ObjectId,
  username: String (unique, required),
  password: String (hashed, required),
  createdAt: Date,
  updatedAt: Date
}
```

### Media Collection:
```javascript
{
  _id: ObjectId,
  title: String (required),
  category: String,
  type: String (enum: 'image', 'video'),
  cloudinaryUrl: String,
  cloudinaryPublicId: String,
  youtubeUrl: String,
  vimeoUrl: String,
  featured: Boolean (default: false),
  order: Number (default: 0),
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🚀 Environment Variables

Required in `.env.local`:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
JWT_SECRET=your-secret-key-here
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

---

## 🔄 Data Flow Summary

1. **User uploads image** → Frontend compresses → Backend verifies auth → Uploads to Cloudinary → Saves to MongoDB → Returns to frontend
2. **User views gallery** → Frontend requests → Backend queries MongoDB → Returns media array → Frontend displays
3. **User deletes image** → Frontend requests → Backend verifies auth → Deletes from Cloudinary → Deletes from MongoDB → Returns success

---

## 📝 Next Steps

To add new features:
1. **New API route**: Create file in `src/app/api/[route]/route.js`
2. **New database field**: Update schema in `src/models/[Model].js`
3. **New frontend page**: Create file in `src/app/[page]/page.js`
4. **New component**: Create file in `src/components/[Component].js`

---

## 🛠️ Testing the Full-Stack

1. **Test Authentication**:
   - Go to `/admin/login`
   - Login with credentials
   - Check `localStorage.getItem('token')`

2. **Test Upload**:
   - Go to `/admin`
   - Upload an image
   - Check MongoDB for new document
   - Check Cloudinary for uploaded file

3. **Test Gallery**:
   - Go to `/photography`
   - Check if images load from MongoDB
   - Verify images display from Cloudinary URLs

---

This is your full-stack architecture! The backend (API routes) handles all database operations, file uploads, and authentication, while the frontend (React components) displays the data and handles user interactions.

