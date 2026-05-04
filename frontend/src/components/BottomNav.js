import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const BottomNav = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isAdminPage =
    location.pathname.startsWith('/admin') && user?.isAdmin;

  return (
    <nav className="bottom-nav">

      {/* 🔥 ADMIN SIDEBAR */}
      {isAdminPage ? (
        <>
          <div
            className={location.search.includes('overview') || !location.search ? 'active' : ''}
            onClick={() => navigate('/admin?tab=overview')}
          >
            <span className="nav-icon">⏳</span>
            Pending
          </div>

          <div
            className={location.search.includes('all-jobs') ? 'active' : ''}
            onClick={() => navigate('/admin?tab=all-jobs')}
          >
            <span className="nav-icon">📋</span>
            All Jobs
          </div>

          <div
            className={location.search.includes('users') ? 'active' : ''}
            onClick={() => navigate('/admin?tab=users')}
          >
            <span className="nav-icon">👥</span>
            Users
          </div>

          <div
            className={location.search.includes('reports') ? 'active' : ''}
            onClick={() => navigate('/admin?tab=reports')}
          >
            <span className="nav-icon">🚩</span>
            Reports
          </div>
        </>
      ) : (
        <>
          {/* 🔥 NORMAL USER SIDEBAR */}
          <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>
            <span className="nav-icon">🏠</span>
            Feed
          </NavLink>

          <NavLink to="/workers" className={({ isActive }) => isActive ? 'active' : ''}>
            <span className="nav-icon">👷</span>
            Workers
          </NavLink>

          <NavLink to="/post-job" className={({ isActive }) => isActive ? 'active' : ''}>
            <span className="nav-icon">➕</span>
            Post
          </NavLink>

          <NavLink to="/chat" className={({ isActive }) => isActive ? 'active' : ''}>
            <span className="nav-icon">💬</span>
            Chat
          </NavLink>

          <NavLink to="/profile" className={({ isActive }) => isActive ? 'active' : ''}>
            <span className="nav-icon">👤</span>
            Profile
          </NavLink>
        </>
      )}
    </nav>
  );
};

export default BottomNav;