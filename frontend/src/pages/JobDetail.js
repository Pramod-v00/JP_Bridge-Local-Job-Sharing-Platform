import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getJob, getRoom, createReport, updateJobStatus } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const timeAgo = (d) => {
  const diff = Math.floor((Date.now() - new Date(d)) / 1000);
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imgIdx, setImgIdx] = useState(0);
  const [reporting, setReporting] = useState(false);
  const [reportReason, setReportReason] = useState('');

  useEffect(() => {
    getJob(id).then((res) => { setJob(res.data); setLoading(false); }).catch(() => setLoading(false));
  }, [id]);

  const handleMessage = async () => {
    try {
      const res = await getRoom(job.userId._id);
      navigate(`/chat/${res.data.roomId}/${job.userId._id}`);
    } catch {}
  };

  const handleReport = async () => {
    if (!reportReason) return;
    await createReport({ targetType: 'job', targetId: id, reason: reportReason });
    setReporting(false);
    alert('Report submitted. Thank you.');
  };

  const handleStatusChange = async (jobStatus) => {
    await updateJobStatus(id, jobStatus);
    setJob({ ...job, jobStatus });
  };

  if (loading) return <div className="loading"><div className="spinner" /></div>;
  if (!job) return <div className="empty-state"><div className="empty-icon">❌</div><p>Job not found</p></div>;

  const poster = job.userId;
  const isOwner = user._id === poster._id;

  return (
    <div className="page" style={{ paddingBottom: 100 }}>
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate(-1)}>←</button>
        <h1 className="page-title" style={{ fontSize: '1.1rem' }}>{job.title}</h1>
        {job.urgency === 'urgent' && <span className="urgent-badge">🔴 Urgent</span>}
      </div>

      {/* Image gallery */}
      {job.images && job.images.length > 0 ? (
        <div style={{ position: 'relative', marginBottom: 16 }}>
          <img
            src={job.images[imgIdx]}
            alt=""
            style={{ width: '100%', height: 240, objectFit: 'cover', borderRadius: 'var(--radius)' }}
          />
          {job.images.length > 1 && (
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 8 }}>
              {job.images.map((_, i) => (
                <div
                  key={i}
                  onClick={() => setImgIdx(i)}
                  style={{
                    width: 8, height: 8, borderRadius: '50%', cursor: 'pointer',
                    background: i === imgIdx ? 'var(--orange)' : '#ccc',
                  }}
                />
              ))}
            </div>
          )}
        </div>
      ) : null}

      {/* Audio */}
      {job.audioUrl && (
        <div className="card" style={{ padding: 16, marginBottom: 16 }}>
          <div className="section-title">🎙️ Voice Description</div>
          <audio controls src={job.audioUrl} style={{ width: '100%' }} />
        </div>
      )}

      {/* Meta */}
      <div className="card" style={{ padding: 16, marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
          <span className={`status-tag status-${job.jobStatus?.replace(' ', '-')}`}>
            {job.jobStatus}
          </span>
          <span className="text-muted">📍 {job.location.area || 'Bengaluru'}</span>
          <span className="text-muted">⏰ {timeAgo(job.createdAt)}</span>
        </div>

        {job.description && (
          <p style={{ fontSize: '0.95rem', lineHeight: 1.6, color: 'var(--dark)' }}>
            {job.description}
          </p>
        )}
      </div>

      {/* Poster profile */}
      <div className="card" style={{ padding: 16, marginBottom: 16 }}>
        <div className="section-title">Posted by</div>
        <div
          style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}
          onClick={() => navigate(`/profile/${poster._id}`)}
        >
          {poster.profilePhoto ? (
            <img src={poster.profilePhoto} alt={poster.name} style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover' }} />
          ) : (
            <div className="avatar-placeholder" style={{ width: 56, height: 56, fontSize: '1.2rem' }}>
              {poster.name?.[0]?.toUpperCase()}
            </div>
          )}
          <div>
            <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{poster.name}</div>
            <div style={{ color: 'var(--mid)', fontSize: '0.85rem', textTransform: 'capitalize' }}>
              {poster.workType}
            </div>
            <div className="rating">⭐ {poster.rating?.toFixed(1) || 'New'} ({poster.ratingCount || 0} reviews)</div>
          </div>
        </div>
      </div>

      {/* Actions */}
      {!isOwner && (
        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleMessage}>
            💬 Message
          </button>
          <button
            className="btn btn-outline btn-sm"
            style={{ border: '2px solid var(--red)', color: 'var(--red)' }}
            onClick={() => setReporting(true)}
          >
            🚩 Report
          </button>
        </div>
      )}

      {/* Owner controls */}
      {isOwner && (
        <div className="card" style={{ padding: 16 }}>
          <div className="section-title">Manage Job</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['open', 'in-progress', 'completed'].map((s) => (
              <button
                key={s}
                className={`btn btn-sm ${job.jobStatus === s ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => handleStatusChange(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Report modal */}
      {reporting && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 999,
        }}>
          <div style={{ background: 'var(--white)', borderRadius: '16px 16px 0 0', padding: 24, width: '100%', maxWidth: 480 }}>
            <h3 style={{ marginBottom: 16 }}>Report this job</h3>
            <select
              className="form-select"
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
            >
              <option value="">Select a reason</option>
              <option value="spam">Spam</option>
              <option value="fake">Fake job</option>
              <option value="inappropriate">Inappropriate content</option>
              <option value="scam">Scam</option>
            </select>
            <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
              <button className="btn btn-danger" style={{ flex: 1 }} onClick={handleReport}>Submit Report</button>
              <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setReporting(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDetail;
