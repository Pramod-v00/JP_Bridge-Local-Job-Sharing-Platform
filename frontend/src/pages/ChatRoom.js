import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { getMessages, saveMessage, getProfile } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const ChatRoom = () => {
  const { roomId, userId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [otherUser, setOtherUser] = useState(null);
  const [typing, setTyping] = useState(false);
  const socketRef = useRef(null);
  const bottomRef = useRef(null);
  const typingTimeout = useRef(null);

  useEffect(() => {
    // Load messages
    getMessages(roomId).then((res) => setMessages(res.data)).catch(console.error);
    // Load other user profile
    getProfile(userId).then((res) => setOtherUser(res.data.user)).catch(console.error);

    // Socket connection
    socketRef.current = io(process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000');
    socketRef.current.emit('user_online', user._id);
    socketRef.current.emit('join_room', roomId);

    socketRef.current.on('receive_message', (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socketRef.current.on('typing', () => setTyping(true));
    socketRef.current.on('stop_typing', () => setTyping(false));

    return () => socketRef.current?.disconnect();
  }, [roomId, userId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const msg = {
      roomId,
      senderId: { _id: user._id, name: user.name, profilePhoto: user.profilePhoto },
      receiverId: userId,
      message: input.trim(),
      createdAt: new Date().toISOString(),
    };
    socketRef.current?.emit('send_message', msg);
    socketRef.current?.emit('stop_typing', { roomId, senderId: user._id });
    setInput('');
    // Persist to DB
    saveMessage({ roomId, receiverId: userId, message: input.trim() }).catch(console.error);
  };

  const handleTyping = (e) => {
    setInput(e.target.value);
    socketRef.current?.emit('typing', { roomId, senderId: user._id });
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socketRef.current?.emit('stop_typing', { roomId, senderId: user._id });
    }, 1500);
  };

  const handleKey = (e) => { if (e.key === 'Enter') handleSend(); };

  const fmt = (d) =>
    new Date(d).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="chat-page">
      {/* Header */}
      <div className="chat-header">
        <button
          style={{ background: 'none', border: 'none', color: '#fff', fontSize: '1.2rem', cursor: 'pointer' }}
          onClick={() => navigate('/chat')}
        >
          ←
        </button>
        {otherUser?.profilePhoto ? (
          <img src={otherUser.profilePhoto} alt="" style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover' }} />
        ) : (
          <div className="avatar-placeholder">{otherUser?.name?.[0]?.toUpperCase()}</div>
        )}
        <div>
          <div style={{ fontWeight: 700 }}>{otherUser?.name || 'Loading...'}</div>
          <div style={{ fontSize: '0.75rem', color: '#aaa', textTransform: 'capitalize' }}>
            {otherUser?.workType}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">👋</div>
            <p>Say hello! Phone numbers are never shared automatically.</p>
          </div>
        )}
        {messages.map((msg, i) => {
          const isMine = (msg.senderId?._id || msg.senderId) === user._id;
          return (
            <div key={i} className={`msg ${isMine ? 'msg-sent' : 'msg-recv'}`}>
              <div className="msg-bubble">{msg.message}</div>
              <div className="msg-time">{fmt(msg.createdAt)}</div>
            </div>
          );
        })}
        {typing && (
          <div className="msg msg-recv">
            <div className="msg-bubble" style={{ color: 'var(--mid)' }}>typing...</div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="chat-input-row">
        <input
          className="chat-input"
          placeholder="Type a message..."
          value={input}
          onChange={handleTyping}
          onKeyDown={handleKey}
        />
        <button
          className="btn btn-primary"
          style={{ borderRadius: '50%', width: 44, height: 44, padding: 0, fontSize: '1.1rem' }}
          onClick={handleSend}
        >
          ➤
        </button>
      </div>
    </div>
  );
};

export default ChatRoom;
