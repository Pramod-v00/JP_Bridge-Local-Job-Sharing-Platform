# JP-Bridge 🏗️  
## Location-Based Local Job Sharing Platform  

A full-stack MERN web application that connects job providers and workers based on location, enabling quick and efficient job matching using images, voice, GPS, and real-time chat.

---

## ✨ Features
- Location-based job filtering  
- Image & voice job posting  
- Real-time chat using Socket.io  
- OTP authentication (Twilio)  
- Admin verification system  
- User profiles with ratings & reviews  

---

## 🗂 Project Structure


jp-bridge/
├── backend/
│ ├── config/
│ │ └── cloudinary.js
│ ├── controllers/
│ │ ├── authController.js
│ │ ├── jobController.js
│ │ ├── chatController.js
│ │ ├── adminController.js
│ │ └── usersController.js
│ ├── middleware/
│ │ └── auth.js
│ ├── models/
│ │ └── index.js
│ ├── routes/
│ │ ├── auth.js
│ │ ├── users.js
│ │ ├── jobs.js
│ │ ├── chat.js
│ │ ├── reviews.js
│ │ ├── admin.js
│ │ ├── notifications.js
│ │ └── reports.js
│ ├── utils/
│ │ └── helpers.js
│ ├── server.js
│ ├── package.json
│ └── .env.example
│
└── frontend/
├── public/
│ └── index.html
├── src/
│ ├── components/
│ │ ├── Navbar.js
│ │ ├── BottomNav.js
│ │ └── JobCard.js
│ ├── context/
│ │ ├── AuthContext.js
│ │ └── SocketContext.js
│ ├── hooks/
│ │ └── useLocation.js
│ ├── pages/
│ │ ├── Login.js
│ │ ├── Register.js
│ │ ├── Feed.js
│ │ ├── JobDetail.js
│ │ ├── PostJob.js
│ │ ├── MyJobs.js
│ │ ├── Workers.js
│ │ ├── Chat.js
│ │ ├── ChatRoom.js
│ │ ├── Profile.js
│ │ ├── EditProfile.js
│ │ ├── Notifications.js
│ │ └── AdminDashboard.js
│ ├── styles/
│ │ └── global.css
│ ├── utils/
│ │ └── api.js
│ ├── App.js
│ └── index.js
├── package.json
└── .env.example


---

## ⚙️ Environment Setup

### Backend — `backend/.env`
```env
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret_key
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=your_number
CLOUDINARY_CLOUD_NAME=your_cloud
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
ADMIN_SECRET_KEY=your_admin_secret
PORT=5000
CLIENT_URL=http://localhost:3000
Frontend — frontend/.env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
🚀 Run Instructions
Prerequisites
Node.js
MongoDB Atlas
Twilio account
Cloudinary account
1. Install dependencies
cd backend
npm install

cd ../frontend
npm install
2. Setup environment variables
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
3. Run backend
cd backend
npm run dev
4. Run frontend
cd frontend
npm start
👑 Creating Admin
curl -X POST http://localhost:5000/api/auth/make-admin \
  -H "Content-Type: application/json" \
  -d '{"phone": "+91XXXXXXXXXX", "secret": "your_ADMIN_SECRET_KEY"}'
🗄️ Database Models
Model	Description
User	Stores user details
OTP	OTP verification
Job	Job postings
Message	Chat messages
Review	Ratings & feedback
Notification	Alerts
Report	Reports
🔌 API Overview
Auth
POST /api/auth/register
POST /api/auth/login
POST /api/auth/send-otp
Jobs
GET /api/jobs/feed
POST /api/jobs
DELETE /api/jobs/:id
Chat
GET /api/chat/messages
POST /api/chat/messages
Admin
GET /api/admin/dashboard
PATCH /api/admin/jobs/:id/approve
🔮 Future Improvements
AI-based job recommendations
Mobile app (Android/iOS)
Multi-language support
Payment integration
🛠 Tech Stack
Frontend: React.js
Backend: Node.js, Express
Database: MongoDB
Auth: JWT + OTP
Storage: Cloudinary
Real-time: Socket.io

---

## ✅ After pasting:
Run:
```bash
git add README.md
git commit -m "Updated README"
git push
