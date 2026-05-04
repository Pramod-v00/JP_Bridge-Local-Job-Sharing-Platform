import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import './styles/global.css';

import Login from './pages/Login';
import Register from './pages/Register';
import AdminLogin from './pages/AdminLogin';
import Feed from './pages/Feed';
import JobDetail from './pages/JobDetail';
import PostJob from './pages/PostJob';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import Workers from './pages/Workers';
import Chat from './pages/Chat';
import ChatRoom from './pages/ChatRoom';
import Notifications from './pages/Notifications';
import AdminDashboard from './pages/AdminDashboard';
import MyJobs from './pages/MyJobs';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
};

const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/admin-login" replace />;
  if (user.role !== 'admin') return <Navigate to="/" replace />;
  return children;
};

const AppLayout = ({ children }) => (
  <div className="app-shell">
    <Navbar />
    <BottomNav />

    {/* 🔥 THIS IS THE MISSING PART */}
    <div className="main-content">
      {children}
    </div>
  </div>
);

function AppRoutes() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public auth routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/admin-login" element={user?.role === 'admin' ? <Navigate to="/admin" /> : <AdminLogin />} />

      {/* Protected user routes */}
      <Route path="/" element={<PrivateRoute><AppLayout><Feed /></AppLayout></PrivateRoute>} />
      <Route path="/job/:id" element={<PrivateRoute><AppLayout><JobDetail /></AppLayout></PrivateRoute>} />
      <Route path="/post-job" element={<PrivateRoute><AppLayout><PostJob /></AppLayout></PrivateRoute>} />
      <Route path="/my-jobs" element={<PrivateRoute><AppLayout><MyJobs /></AppLayout></PrivateRoute>} />
      <Route path="/workers" element={<PrivateRoute><AppLayout><Workers /></AppLayout></PrivateRoute>} />
      <Route path="/chat" element={<PrivateRoute><AppLayout><Chat /></AppLayout></PrivateRoute>} />
      <Route path="/chat/:roomId/:userId" element={<PrivateRoute><ChatRoom /></PrivateRoute>} />
      <Route path="/notifications" element={<PrivateRoute><AppLayout><Notifications /></AppLayout></PrivateRoute>} />
      <Route path="/profile" element={<PrivateRoute><AppLayout><Profile /></AppLayout></PrivateRoute>} />
      <Route path="/profile/:id" element={<PrivateRoute><AppLayout><Profile /></AppLayout></PrivateRoute>} />
      <Route path="/edit-profile" element={<PrivateRoute><AppLayout><EditProfile /></AppLayout></PrivateRoute>} />

      {/* Admin routes */}
      <Route path="/admin" element={<AdminRoute><AppLayout><AdminDashboard /></AppLayout></AdminRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <AppRoutes />
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
