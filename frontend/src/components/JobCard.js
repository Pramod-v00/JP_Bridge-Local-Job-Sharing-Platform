import React from 'react';
import { useNavigate } from 'react-router-dom';

const workTypeEmoji = {
  plumber: '🔧', electrician: '⚡', driver: '🚗', helper: '🤝',
  carpenter: '🪚', painter: '🎨', cleaner: '🧹', cook: '👨‍🍳',
  security: '🛡️', gardener: '🌱', other: '💼',
};

const timeAgo = (date) => {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

const JobCard = ({ job, onMessage }) => {
  const navigate = useNavigate();
  const poster = job.userId;

  return (
    <div className="card job-card" onClick={() => navigate(`/job/${job._id}`)}>
      {job.images && job.images.length > 0 ? (
        <img src={job.images[0]} alt={job.title} className="job-card-img" />
      ) : (
        <div className="job-card-img-placeholder">
          {workTypeEmoji[poster?.workType] || '💼'}
        </div>
      )}

      <div className="job-card-body">
        <div className="job-card-header">
          <h3 className="job-card-title">{job.title}</h3>
          {job.urgency === 'urgent' && (
            <span className="urgent-badge">🔴 Urgent</span>
          )}
        </div>

        <div className="job-card-meta">
          {job.distance !== undefined && (
            <span>📍 {job.distance} km • {job.location.area || 'Bengaluru'}</span>
          )}
          <span>⏰ {timeAgo(job.createdAt)}</span>
        </div>

        <div className="job-card-footer">
          <div className="poster-info">
            {poster?.profilePhoto ? (
              <img src={poster.profilePhoto} alt={poster.name} className="avatar" />
            ) : (
              <div className="avatar-placeholder">{poster?.name?.[0]?.toUpperCase()}</div>
            )}
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{poster?.name}</div>
              <div className="rating">⭐ {poster?.rating?.toFixed(1) || 'New'}</div>
            </div>
          </div>

          <button
            className="btn btn-primary btn-sm"
            onClick={(e) => {
              e.stopPropagation();
              onMessage && onMessage(poster?._id);
            }}
          >
            💬 Message
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobCard;
