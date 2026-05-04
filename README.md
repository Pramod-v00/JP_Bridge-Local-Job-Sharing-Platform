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
│ ├── controllers/
│ ├── middleware/
│ ├── models/
│ ├── routes/
│ ├── utils/
│ ├── server.js
│ └── .env.example
│
└── frontend/
├── public/
├── src/
│ ├── components/
│ ├── context/
│ ├── hooks/
│ ├── pages/
│ ├── styles/
│ ├── utils/
│ ├── App.js
│ └── index.js
└── .env.example


---

## ⚙️ Environment Setup

### Backend (`backend/.env`)
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
Frontend (frontend/.env)
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
🚀 Run Instructions
Prerequisites
Node.js
MongoDB Atlas
Twilio
Cloudinary
Install dependencies
cd backend
npm install

cd ../frontend
npm install
Setup environment
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
Run backend
cd backend
npm run dev
Run frontend
cd frontend
npm start
👑 Creating Admin
curl -X POST http://localhost:5000/api/auth/make-admin \
  -H "Content-Type: application/json" \
  -d '{"phone": "+91XXXXXXXXXX", "secret": "your_ADMIN_SECRET_KEY"}'
🗄️ Database Models
Model	Description
User	User details
OTP	OTP verification
Job	Job postings
Message	Chat messages
Review	Ratings
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
AI job recommendations
Mobile app
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

## 🎯 What changed (important)
- Fixed all code blocks ✔  
- Separated sections ✔  
- Cleaned structure ✔  
- GitHub-friendly formatting ✔  

---

## 🚀 Now do this

```bash
git add README.md
git commit -m "Fixed README formatting"
git push
