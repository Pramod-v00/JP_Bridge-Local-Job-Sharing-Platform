import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProfile, getRoom, getReviews, blockUser } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { id } = useParams();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const targetId = id || user._id;
  const isMe = targetId === user._id;

  useEffect(() => {
    const load = async () => {
      try {
        const [pRes, rRes] = await Promise.all([
          getProfile(targetId),
          getReviews(targetId),
        ]);
        setProfile(pRes.data.user);
        setJobs(pRes.data.jobs);
        setReviews(rRes.data);
      } catch (err) {
        console.error('Profile load error:', err);
      }
      setLoading(false);
    };
    load();
  }, [targetId]);

  const handleMessage = async () => {
    try {
      const res = await getRoom(targetId);
      navigate(`/chat/${res.data.roomId}/${targetId}`);
    } catch {}
  };

  const handleBlock = async () => {
    if (window.confirm('Block this user? They will not be able to contact you.')) {
      await blockUser(targetId);
      navigate(-1);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  if (loading) return <div className="loading"><div className="spinner" /></div>;
  if (!profile) return (
    <div className="empty-state">
      <div className="empty-icon">❌</div>
      <p>User not found</p>
    </div>
  );

  return (
    <div style={{ paddingBottom: 80 }}>
      {/* Header */}
      <div className="profile-header" style={{ position: 'relative' }}>
        {!isMe && (
          <button
            style={{ position: 'absolute', left: 16, top: 16, background: 'none', border: 'none', color: '#fff', fontSize: '1.3rem', cursor: 'pointer' }}
            onClick={() => navigate(-1)}
          >
            ←
          </button>
        )}

        {profile.profilePhoto ? (
          <img src={profile.profilePhoto} alt={profile.name} className="profile-avatar" />
        ) : (
          <div className="avatar-placeholder" style={{ width: 90, height: 90, fontSize: '2rem', margin: '0 auto 12px' }}>
            {profile.name?.[0]?.toUpperCase()}
          </div>
        )}

        <div className="profile-name">{profile.name}</div>

        <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 6 }}>
          <span className="profile-badge">{profile.workType}</span>
          {profile.role === 'admin' && (
            <span className="profile-badge" style={{ background: 'var(--orange-dark)' }}>Admin</span>
          )}
        </div>

        <div style={{ color: '#aaa', fontSize: '0.85rem', marginTop: 4 }}>
          📍 {profile.location?.area || 'Bengaluru'}
        </div>

        <div style={{ marginTop: 12, display: 'flex', gap: 24, justifyContent: 'center' }}>
          {[
            { value: profile.rating?.toFixed(1) || '—', label: 'Rating' },
            { value: jobs.length, label: 'Jobs' },
            { value: reviews.length, label: 'Reviews' },
          ].map((s) => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ color: 'var(--orange)', fontWeight: 800, fontSize: '1.4rem' }}>{s.value}</div>
              <div style={{ color: '#aaa', fontSize: '0.75rem' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="page">
        {/* My profile actions */}
        {isMe && (
          <>
            <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => navigate('/edit-profile')}>
                ✏️ Edit Profile
              </button>
              <button className="btn btn-dark" style={{ flex: 1 }} onClick={() => navigate('/my-jobs')}>
                📋 My Jobs
              </button>
            </div>
            <button
              className="btn btn-full"
              style={{ background: '#2a2a2a', color: 'var(--red)', border: '1.5px solid var(--red)', marginBottom: 20 }}
              onClick={handleLogout}
            >
              🚪 Sign Out
            </button>
          </>
        )}

        {/* Other user actions */}
        {!isMe && (
          <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleMessage}>
              💬 Message
            </button>
            <button
              className="btn btn-sm"
              style={{ border: '2px solid var(--red)', color: 'var(--red)', background: 'none', borderRadius: 10, padding: '7px 16px' }}
              onClick={handleBlock}
            >
              🚫 Block
            </button>
          </div>
        )}

        {/* Reviews */}
        <div className="section-title">⭐ Reviews ({reviews.length})</div>
        {reviews.length === 0 ? (
          <div className="empty-state" style={{ padding: '20px 0' }}>
            <p className="text-muted">No reviews yet</p>
          </div>
        ) : (
          reviews.slice(0, 5).map((r) => (
            <div key={r._id} className="card" style={{ padding: 14, marginBottom: 10 }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8 }}>
                {r.reviewerId?.profilePhoto ? (
                  <img src={r.reviewerId.profilePhoto} alt="" className="avatar" />
                ) : (
                  <div className="avatar-placeholder">{r.reviewerId?.name?.[0]?.toUpperCase()}</div>
                )}
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{r.reviewerId?.name}</div>
                  <div className="stars">{'⭐'.repeat(r.rating)}</div>
                </div>
              </div>
              {r.comment && <p style={{ fontSize: '0.85rem', color: 'var(--dark)' }}>{r.comment}</p>}
            </div>
          ))
        )}

        {/* Recent Jobs */}
        {jobs.length > 0 && (
          <>
            <div className="section-title" style={{ marginTop: 8 }}>📋 Recent Jobs</div>
            {jobs.slice(0, 3).map((job) => (
              <div
                key={job._id}
                className="card"
                style={{ padding: 14, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                onClick={() => navigate(`/job/${job._id}`)}
              >
                <div>
                  <div style={{ fontWeight: 600 }}>{job.title}</div>
                  <div className="text-muted" style={{ fontSize: '0.8rem' }}>
                    📍 {job.location?.area || 'Bengaluru'}
                  </div>
                </div>
                <span className={`status-tag status-${job.jobStatus}`}>{job.jobStatus}</span>
              </div>
            ))}
          </>
        )}

        {/* No jobs empty state */}
        {jobs.length === 0 && isMe && (
          <div className="empty-state" style={{ padding: '20px 0' }}>
            <div className="empty-icon">📋</div>
            <p style={{ fontWeight: 600, marginBottom: 8 }}>No jobs posted yet</p>
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/post-job')}>
              Post Your First Job
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
