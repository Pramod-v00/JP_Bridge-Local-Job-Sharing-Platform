# JP-Bridge 🏗️

**JP-Bridge** is a location-based local job sharing platform that connects people who need short-term or local work done with nearby workers. Users can post jobs with images and audio descriptions, browse nearby approved jobs, chat in real-time, and rate each other — all within a mobile-friendly interface.

---

## 🚀 Status

✅ Completed Project

---

## Features

- **Phone + Password Authentication** — Register and log in using an Indian mobile number and password (JWT-based sessions)
- **Location-Based Job Feed** — Browse approved jobs sorted by proximity using the Haversine distance formula
- **Post a Job** — Create job listings with title, description, urgency level, up to 3 images, and an optional audio clip (uploaded to Cloudinary)
- **Admin Moderation** — All jobs go through admin approval before becoming visible in the feed
- **Real-Time Chat** — Private messaging between users powered by Socket.io, with typing indicators and online presence tracking
- **Worker Search** — Browse and search workers by work type (plumber, electrician, driver, etc.)
- **User Profiles** — View and edit profile with photo upload, work type, location, and rating
- **Reviews & Ratings** — Leave star ratings and comments on completed jobs
- **Notifications** — In-app notifications for job approvals, rejections, and new reviews
- **Report System** — Users can report jobs or other users for admin review
- **Admin Dashboard** — Manage pending jobs, all jobs, users, and unresolved reports
- **Firebase** — Initialized for future use

---

## Project Structure

```
jp-bridge/
├── backend/
│   ├── config/
│   │   └── cloudinary.js          # Cloudinary setup & multer storage config
│   ├── controllers/
│   │   ├── adminController.js
│   │   ├── authController.js
│   │   ├── chatController.js
│   │   ├── jobController.js
│   │   └── usersController.js
│   ├── middleware/
│   │   └── auth.js                # JWT protect middleware + adminOnly guard
│   ├── models/
│   │   └── index.js               # User, Job, Message, Review, Notification, Report schemas
│   ├── routes/
│   │   ├── admin.js
│   │   ├── auth.js
│   │   ├── chat.js
│   │   ├── jobs.js
│   │   ├── notifications.js
│   │   ├── reports.js
│   │   ├── reviews.js
│   │   └── users.js
│   ├── scripts/
│   │   └── createAdmin.js         # Script to seed an admin account
│   ├── utils/
│   │   └── helpers.js             # Haversine distance + room ID generator
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── BottomNav.js
    │   │   ├── JobCard.js
    │   │   └── Navbar.js
    │   ├── context/
    │   │   ├── AuthContext.js
    │   │   └── SocketContext.js
    │   ├── hooks/
    │   │   └── useLocation.js
    │   ├── pages/
    │   │   ├── AdminDashboard.js
    │   │   ├── AdminLogin.js
    │   │   ├── Chat.js
    │   │   ├── ChatRoom.js
    │   │   ├── EditProfile.js
    │   │   ├── Feed.js
    │   │   ├── JobDetail.js
    │   │   ├── Login.js
    │   │   ├── MyJobs.js
    │   │   ├── Notifications.js
    │   │   ├── PostJob.js
    │   │   ├── Profile.js
    │   │   ├── Register.js
    │   │   └── Workers.js
    │   ├── styles/
    │   │   └── global.css
    │   ├── utils/
    │   │   ├── api.js
    │   │   └── firebase.js
    │   ├── App.js
    │   └── index.js
    ├── .env.example
    └── package.json
```

---

## Environment Variables

### Backend — `backend/.env`

```env
# MongoDB
MONGO_URI=mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/jpbridge

# JWT
JWT_SECRET=your_super_secret_jwt_key_min_32_chars

# Cloudinary (Images & Audio)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Admin
ADMIN_SECRET_KEY=admin_secret_to_create_admin_account

# Server
PORT=5000
CLIENT_URL=http://localhost:3000
```

### Frontend — `frontend/.env`

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000

# Firebase
REACT_APP_FIREBASE_API_KEY=your_firebase_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

---

## Installation & Setup

### Prerequisites

- Node.js v16+
- MongoDB Atlas (or local MongoDB)
- Cloudinary account
- Firebase project (Web app)

### 1. Clone the repository

```bash
git clone https://github.com/your-username/jp-bridge.git
cd jp-bridge
```

### 2. Setup the backend

```bash
cd backend
npm install
cp .env.example .env
# Fill in your .env values
npm run dev
```

### 3. Setup the frontend

```bash
cd frontend
npm install
cp .env.example .env
# Fill in your .env values
npm start
```

### 4. Create an admin account

```bash
cd backend
node scripts/createAdmin.js
```

The backend runs on `http://localhost:5000` and the frontend on `http://localhost:3000`.

---

## API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login with phone & password |
| POST | `/api/auth/admin-login` | Admin login |
| GET | `/api/jobs/feed` | Get nearby approved jobs |
| POST | `/api/jobs` | Post a new job |
| GET | `/api/jobs/my-jobs` | Get current user's jobs |
| PATCH | `/api/jobs/:id/status` | Update job status |
| DELETE | `/api/jobs/:id` | Delete a job |
| GET | `/api/users/profile/:id` | Get user profile |
| PUT | `/api/users/profile` | Update profile |
| PATCH | `/api/users/location` | Update user location |
| GET | `/api/users/search` | Search workers |
| POST | `/api/users/block/:id` | Block a user |
| GET | `/api/chat/room/:userId` | Get/create chat room |
| GET | `/api/chat/messages/:roomId` | Get messages |
| POST | `/api/chat/messages` | Save a message |
| GET | `/api/chat/conversations` | Get all conversations |
| POST | `/api/reviews` | Leave a review |
| POST | `/api/reports` | Submit a report |
| GET | `/api/notifications` | Get notifications |
| PATCH | `/api/notifications/read` | Mark notifications as read |
| GET | `/api/admin/dashboard` | Admin stats |
| GET | `/api/admin/jobs/pending` | Pending jobs list |
| PATCH | `/api/admin/jobs/:id/approve` | Approve a job |
| PATCH | `/api/admin/jobs/:id/reject` | Reject a job |
| GET | `/api/admin/users` | All users |
| GET | `/api/admin/reports` | Unresolved reports |

> All protected routes require an `Authorization: Bearer <token>` header.

---

## Tech Stack

### Backend
- **Node.js** + **Express** — REST API server
- **MongoDB** + **Mongoose** — Database and ODM
- **Socket.io** — Real-time bidirectional communication
- **JWT** (`jsonwebtoken`) — Authentication tokens
- **bcryptjs** — Password hashing
- **Cloudinary** + **Multer** — Image and audio file uploads
- **express-validator** — Input validation

### Frontend
- **React 18** — UI library
- **React Router v6** — Client-side routing
- **Axios** — HTTP client
- **Socket.io Client** — Real-time messaging
- **Firebase** — Initialized for future use

---

## Author

**Pramod V**  
Full Stack Developer  
[GitHub](https://github.com/pramod-v00)
