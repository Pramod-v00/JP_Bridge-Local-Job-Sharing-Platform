// components/Navbar.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getNotifications, markNotificationsRead } from '../utils/api';

const Navbar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      try {
        const res = await getNotifications();
        setUnread(res.data.filter((n) => !n.read).length);
      } catch {}
    };
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const handleNotif = async () => {
    await markNotificationsRead().catch(() => {});
    setUnread(0);
    navigate('/notifications');
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <div className="navbar-brand" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          JP-<span>Bridge</span>
        </div>
        <div className="navbar-actions">
          <button className="icon-btn" onClick={handleNotif} title="Notifications">
            🔔
            {unread > 0 && <span className="badge">{unread > 9 ? '9+' : unread}</span>}
          </button>
          {user?.isAdmin && (
            <button className="icon-btn" onClick={() => navigate('/admin')} title="Admin">
              ⚙️
            </button>
          )}
          <button
            className="icon-btn"
            onClick={() => navigate('/profile')}
            style={{ padding: 0, overflow: 'hidden' }}
          >
            {user?.profilePhoto ? (
              <img
                src={user.profilePhoto}
                alt={user.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <span>{user?.name?.[0]?.toUpperCase()}</span>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
