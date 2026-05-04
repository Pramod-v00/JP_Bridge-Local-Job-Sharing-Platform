# JP-Bridge 🏗️  
## Location-Based Local Job Sharing Platform  

JP-Bridge is a full-stack MERN web application that connects job providers and nearby workers using location-based filtering. It enables users to quickly find and post local jobs with images, voice input, and real-time communication.

---

## ✨ Features

- 📍 Location-based job filtering  
- 🖼️ Image & voice job posting  
- 💬 Real-time chat using Socket.io  
- 🔐 OTP-based authentication  
- 🛡️ Admin job verification system  
- ⭐ User profiles with ratings and reviews  

---

## 🏗️ Project Structure

```bash
backend/
├── config/
├── controllers/
├── middleware/
├── models/
├── routes/
├── utils/
├── server.js
└── .env.example

frontend/
├── public/
├── src/
│   ├── components/
│   ├── context/
│   ├── hooks/
│   ├── pages/
│   ├── styles/
│   ├── utils/
│   ├── App.js
│   └── index.js
└── .env.example
⚙️ Environment Setup
Backend (backend/.env)
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret_key
CLOUDINARY_CLOUD_NAME=your_cloud
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
ADMIN_SECRET_KEY=your_admin_secret
PORT=5000
CLIENT_URL=http://localhost:3000
Frontend (frontend/.env)
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_SOCKET_URL=http://localhost:5000
🚀 Getting Started
Prerequisites
Node.js
MongoDB Atlas
Cloudinary account
Install Dependencies
cd backend
npm install

cd ../frontend
npm install
Setup Environment Variables
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
Run Backend
cd backend
npm run dev
Run Frontend
cd frontend
npm start
👑 Create Admin
curl -X POST http://localhost:5000/api/auth/make-admin \
  -H "Content-Type: application/json" \
  -d '{"phone": "+91XXXXXXXXXX", "secret": "your_ADMIN_SECRET_KEY"}'
🗄️ Database Models
Model	Description
User	Stores user details
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
🤖 AI-based job recommendations
📱 Mobile application
🌐 Multi-language support
💳 Payment integration
🛠 Tech Stack
Frontend: React.js
Backend: Node.js, Express
Database: MongoDB
Authentication: JWT + OTP
Storage: Cloudinary
Real-time: Socket.io
📌 Author

Pramod V
GitHub: https://github.com/pramod-v00


---

# 🚀 After pasting

Run:

```bash
git add README.md
git commit -m "Final clean README (no Twilio)"
git push
