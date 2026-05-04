// pages/Chat.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getConversations } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const Chat = () => {
  const [convos, setConvos] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    getConversations().then((res) => { setConvos(res.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading"><div className="spinner" /></div>;

  return (
    <div className="page">
      <div className="section-title">💬 Messages</div>
      {convos.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">💬</div>
          <p>No conversations yet</p>
          <p className="text-muted">Message job posters from the feed</p>
        </div>
      ) : (
        convos.map((c, i) => {
          const other = c.senderId?._id === user._id ? c.receiverId : c.senderId;
          return (
            <div
              key={i}
              className="card"
              style={{ padding: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 12 }}
              onClick={() => navigate(`/chat/${c.roomId}/${other?._id}`)}
            >
              {other?.profilePhoto ? (
                <img src={other.profilePhoto} alt="" className="avatar" style={{ width: 48, height: 48 }} />
              ) : (
                <div className="avatar-placeholder" style={{ width: 48, height: 48, fontSize: '1.1rem' }}>
                  {other?.name?.[0]?.toUpperCase()}
                </div>
              )}
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700 }}>{other?.name}</div>
                <div className="text-muted">{c.message?.slice(0, 40)}...</div>
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--mid)' }}>
                {new Date(c.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export { Chat };
export default Chat;
