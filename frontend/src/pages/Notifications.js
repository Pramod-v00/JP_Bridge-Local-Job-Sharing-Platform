import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getNotifications, markNotificationsRead } from '../utils/api';

const notifIcon = {
  new_job: '🏗️',
  message: '💬',
  job_approved: '✅',
  job_rejected: '❌',
  new_review: '⭐',
};

const timeAgo = (d) => {
  const diff = Math.floor((Date.now() - new Date(d)) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

const Notifications = () => {
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getNotifications()
      .then((res) => { setNotifs(res.data); setLoading(false); })
      .catch(() => setLoading(false));
    markNotificationsRead().catch(() => {});
  }, []);

  if (loading) return <div className="loading"><div className="spinner" /></div>;

  return (
    <div className="page">
      <div className="section-title">🔔 Notifications</div>

      {notifs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔕</div>
          <p>No notifications yet</p>
        </div>
      ) : (
        notifs.map((n) => (
          <div
            key={n._id}
            style={{
              display: 'flex',
              gap: 14,
              alignItems: 'flex-start',
              padding: '14px 0',
              borderBottom: '1px solid #eee',
              opacity: n.read ? 0.6 : 1,
              cursor: n.relatedId ? 'pointer' : 'default',
            }}
            onClick={() => {
              if (n.relatedId && (n.type === 'job_approved' || n.type === 'new_job')) {
                navigate(`/job/${n.relatedId}`);
              }
            }}
          >
            <div style={{
              width: 44, height: 44, borderRadius: '50%', background: 'var(--light)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.3rem', flexShrink: 0,
            }}>
              {notifIcon[n.type] || '📢'}
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '0.9rem', lineHeight: 1.4, marginBottom: 4 }}>{n.message}</p>
              <span className="text-muted" style={{ fontSize: '0.75rem' }}>{timeAgo(n.createdAt)}</span>
            </div>
            {!n.read && (
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--orange)', flexShrink: 0, marginTop: 6 }} />
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default Notifications;
