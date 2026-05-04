# JP-Bridge 🏗️
### Bangalore's Local Job Sharing Platform

A full-stack MERN app connecting job posters and workers nearby using images, voice, GPS, and real-time chat.

---

## 🗂 Project Structure

```
kaampay/
├── backend/
│   ├── config/
│   │   └── cloudinary.js          # Cloudinary image/audio upload config
│   ├── controllers/
│   │   ├── authController.js      # OTP (Twilio), register, login
│   │   ├── jobController.js       # CRUD + geo-filtered feed
│   │   ├── chatController.js      # Conversations + messages
│   │   ├── adminController.js     # Dashboard, approve/reject jobs
│   │   └── usersController.js     # Profile, workers, reviews, notifications, reports
│   ├── middleware/
│   │   └── auth.js                # JWT protect + adminOnly guards
│   ├── models/
│   │   └── index.js               # User, OTP, Job, Message, Review, Notification, Report
│   ├── routes/
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── jobs.js
│   │   ├── chat.js
│   │   ├── reviews.js
│   │   ├── admin.js
│   │   ├── notifications.js
│   │   └── reports.js
│   ├── utils/
│   │   └── helpers.js             # Haversine distance, room ID generator
│   ├── server.js                  # Express + Socket.io entry point
│   ├── package.json
│   └── .env.example
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── Navbar.js
    │   │   ├── BottomNav.js
    │   │   └── JobCard.js
    │   ├── context/
    │   │   ├── AuthContext.js     # User session state
    │   │   └── SocketContext.js   # Socket.io connection
    │   ├── hooks/
    │   │   └── useLocation.js     # GPS + reverse geocoding
    │   ├── pages/
    │   │   ├── Login.js
    │   │   ├── Register.js        # 3-step OTP flow
    │   │   ├── Feed.js            # Job feed with distance filter
    │   │   ├── JobDetail.js       # Images, audio, message, report
    │   │   ├── PostJob.js         # Images + voice recording upload
    │   │   ├── MyJobs.js          # Job management + review modal
    │   │   ├── Workers.js         # Search workers by type + distance
    │   │   ├── Chat.js            # Conversation list
    │   │   ├── ChatRoom.js        # Real-time Socket.io chat
    │   │   ├── Profile.js         # User profile + reviews + jobs
    │   │   ├── EditProfile.js
    │   │   ├── Notifications.js
    │   │   └── AdminDashboard.js  # Full admin panel
    │   ├── styles/
    │   │   └── global.css         # Orange/black street design system
    │   ├── utils/
    │   │   └── api.js             # All Axios API calls
    │   ├── App.js
    │   └── index.js
    ├── package.json
    └── .env.example
```

---

## ⚙️ Environment Setup

### Backend — `backend/.env`
```env
MONGO_URI=mongodb+srv://USERNAME:PASSWORD@cluster.mongodb.net/kaampay
JWT_SECRET=your_super_secret_jwt_key_min_32_chars
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1XXXXXXXXXX
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
ADMIN_SECRET_KEY=any_secret_for_creating_admins
PORT=5000
CLIENT_URL=http://localhost:3000
```

### Frontend — `frontend/.env`
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
```

---

## 🚀 Run Instructions

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (free tier works)
- Twilio account (trial works, get Account SID + Auth Token + phone number)
- Cloudinary account (free tier works)

### 1. Clone and install

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Add your environment variables
```bash
# Backend
cp backend/.env.example backend/.env
# Fill in all values in backend/.env

# Frontend
cp frontend/.env.example frontend/.env
```

### 3. Start the backend
```bash
cd backend
npm run dev
# ✅ MongoDB connected
# 🚀 Server running on port 5000
```

### 4. Start the frontend
```bash
cd frontend
npm start
# Opens http://localhost:3000
```

---

## 👑 Creating Your First Admin

After registering a user account normally:

```bash
curl -X POST http://localhost:5000/api/auth/make-admin \
  -H "Content-Type: application/json" \
  -d '{"phone": "+91XXXXXXXXXX", "secret": "your_ADMIN_SECRET_KEY"}'
```

Then log in — you'll see the ⚙️ admin button in the navbar.

---

## 🗄️ Database Schema Summary

| Model        | Key Fields |
|-------------|------------|
| User        | name, phone, password, workType, profilePhoto, location{lat,lng,area}, rating, isAdmin |
| OTP         | phone, otp, expiresAt (10 min TTL), verified |
| Job         | userId, title, images[], audioUrl, urgency, location, status(pending/approved/rejected), jobStatus(open/in-progress/completed) |
| Message     | roomId, senderId, receiverId, message, read |
| Review      | jobId, reviewerId, reviewedUserId, rating(1-5), comment |
| Notification | userId, type, message, read, relatedId |
| Report      | reporterId, targetType(job/user), targetId, reason, resolved |

---

## 🔌 API Routes Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/send-otp` | Send Twilio OTP |
| POST | `/api/auth/verify-otp` | Verify OTP |
| POST | `/api/auth/register` | Register with profile photo |
| POST | `/api/auth/login` | Login → JWT |
| POST | `/api/auth/make-admin` | Elevate user to admin |

### Jobs
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/jobs/feed?lat=&lng=&radius=` | Approved jobs nearby |
| POST | `/api/jobs` | Create job (images + audio) |
| GET | `/api/jobs/my-jobs` | My posted jobs |
| GET | `/api/jobs/:id` | Job detail |
| PATCH | `/api/jobs/:id/status` | Update job status |
| DELETE | `/api/jobs/:id` | Delete job |

### Chat
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/chat/room/:userId` | Get/create room |
| GET | `/api/chat/messages/:roomId` | Get messages |
| POST | `/api/chat/messages` | Save message |
| GET | `/api/chat/conversations` | All conversations |

### Admin (admin token required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/dashboard` | Stats |
| GET | `/api/admin/jobs/pending` | Pending jobs |
| GET | `/api/admin/jobs/all` | All jobs |
| PATCH | `/api/admin/jobs/:id/approve` | Approve job |
| PATCH | `/api/admin/jobs/:id/reject` | Reject job |
| GET | `/api/admin/users` | All users |
| GET | `/api/admin/reports` | All reports |

---

## 🔮 Future Features
- AI job categorization from images (Google Vision API)
- District-level expansion beyond Bangalore
- Anonymous job posting mode
- Push notifications (FCM)
- UPI payment integration
- Hindi/Kannada language support

---

## 🛠 Tech Stack
- **Frontend:** React 18, React Router v6, Axios, Socket.io-client, plain CSS
- **Backend:** Node.js, Express, MongoDB + Mongoose, Socket.io
- **Auth:** JWT + Twilio OTP (real SMS)
- **Storage:** Cloudinary (images + audio)
- **Location:** Browser Geolocation API + Nominatim reverse geocoding (free)
- **Distance:** Haversine formula (no Google Maps API needed)
