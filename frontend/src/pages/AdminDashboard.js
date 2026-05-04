import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  adminDashboard, adminPendingJobs, adminAllJobs,
  adminApproveJob, adminRejectJob, adminGetUsers, adminGetReports,
} from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useSearchParams } from 'react-router-dom';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const tab = params.get('tab') || 'overview';
  const [stats, setStats] = useState(null);
  const [pending, setPending] = useState([]);
  const [allJobs, setAllJobs] = useState([]);
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectTarget, setRejectTarget] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [sRes, pRes] = await Promise.all([adminDashboard(), adminPendingJobs()]);
        setStats(sRes.data);
        setPending(pRes.data);
      } catch {}
      setLoading(false);
    };
    load();
  }, []);

  const loadTab = async (t) => {
    setTab(t);
    try {
      if (t === 'all-jobs') { const r = await adminAllJobs(); setAllJobs(r.data); }
      if (t === 'users') { const r = await adminGetUsers(); setUsers(r.data); }
      if (t === 'reports') { const r = await adminGetReports(); setReports(r.data); }
    } catch {}
  };

  const approve = async (id) => {
    await adminApproveJob(id);
    setPending((prev) => prev.filter((j) => j._id !== id));
    setStats((s) => s ? { ...s, pendingJobs: s.pendingJobs - 1 } : s);
  };

  const reject = async () => {
    if (!rejectTarget) return;
    await adminRejectJob(rejectTarget, rejectReason);
    setPending((prev) => prev.filter((j) => j._id !== rejectTarget));
    setStats((s) => s ? { ...s, pendingJobs: s.pendingJobs - 1 } : s);
    setRejectTarget(null);
    setRejectReason('');
  };

  if (!user?.isAdmin) {
    navigate('/admin-login', { replace: true });
    return null;
  }

  if (loading) return <div className="loading"><div className="spinner" /></div>;

  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 800 }}>
          ⚙️ Admin Panel
        </h1>
        <button className="btn btn-sm btn-dark" onClick={() => { logout(); navigate('/admin-login'); }}>
          Logout
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="admin-stats">
          {[
            { label: 'Total Users', value: stats.totalUsers, icon: '👥' },
            { label: 'Total Jobs', value: stats.totalJobs, icon: '📋' },
            { label: 'Pending', value: stats.pendingJobs, icon: '⏳' },
            { label: 'Active Jobs', value: stats.activeJobs, icon: '🟢' },
          ].map((s) => (
            <div key={s.label} className="stat-card">
              <div style={{ fontSize: '1.5rem', marginBottom: 4 }}>{s.icon}</div>
              <span className="stat-number">{s.value}</span>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}

      {/* Pending Jobs */}
      {tab === 'overview' && (
        <>
          <div className="section-title">⏳ Pending Approval ({pending.length})</div>
          {pending.length === 0 && (
            <div className="empty-state"><div className="empty-icon">🎉</div><p>All caught up!</p></div>
          )}
          {pending.map((job) => (
            <div key={job._id} className="admin-job-card">
              {job.images?.[0] && (
                <img src={job.images[0]} alt="" style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 8, marginBottom: 10 }} />
              )}
              <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 4 }}>{job.title}</div>
              <div className="text-muted" style={{ fontSize: '0.8rem', marginBottom: 8 }}>
                👤 {job.userId?.name} • 📍 {job.location?.area || 'Bengaluru'} •{' '}
                {new Date(job.createdAt).toLocaleDateString('en-IN')}
              </div>
              {job.description && (
                <p style={{ fontSize: '0.85rem', color: 'var(--dark)', marginBottom: 8 }}>
                  {job.description.slice(0, 100)}{job.description.length > 100 ? '...' : ''}
                </p>
              )}
              {job.urgency === 'urgent' && <span className="urgent-badge" style={{ marginBottom: 8, display: 'inline-block' }}>Urgent</span>}
              {job.audioUrl && (
                <audio controls src={job.audioUrl} style={{ width: '100%', height: 32, marginBottom: 8 }} />
              )}
              <div className="admin-actions">
                <button className="btn btn-success btn-sm" style={{ flex: 1 }} onClick={() => approve(job._id)}>
                  ✅ Approve
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  style={{ flex: 1 }}
                  onClick={() => setRejectTarget(job._id)}
                >
                  ❌ Reject
                </button>
              </div>
            </div>
          ))}
        </>
      )}

      {/* All Jobs */}
      {tab === 'all-jobs' && (
        <>
          <div className="section-title">📋 All Jobs ({allJobs.length})</div>
          {allJobs.map((job) => (
            <div key={job._id} className="admin-job-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ fontWeight: 700 }}>{job.title}</div>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  <span className={`status-tag status-${job.status}`}>{job.status}</span>
                  <span className={`status-tag status-${job.jobStatus}`}>{job.jobStatus}</span>
                </div>
              </div>
              <div className="text-muted" style={{ fontSize: '0.8rem', marginTop: 4 }}>
                👤 {job.userId?.name} • 📍 {job.location?.area || 'Bengaluru'}
              </div>
            </div>
          ))}
        </>
      )}

      {/* Users */}
      {tab === 'users' && (
        <>
          <div className="section-title">👥 All Users ({users.length})</div>
          {users.map((u) => (
            <div key={u._id} className="admin-job-card" style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              {u.profilePhoto ? (
                <img src={u.profilePhoto} alt="" style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                <div className="avatar-placeholder" style={{ width: 48, height: 48 }}>{u.name?.[0]?.toUpperCase()}</div>
              )}
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600 }}>{u.name}</div>
                <div className="text-muted" style={{ fontSize: '0.8rem' }}>
                  {u.phone} • <span style={{ textTransform: 'capitalize' }}>{u.workType}</span>
                </div>
                <div className="rating" style={{ fontSize: '0.8rem' }}>⭐ {u.rating?.toFixed(1) || 'New'}</div>
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--mid)' }}>
                {new Date(u.createdAt).toLocaleDateString('en-IN')}
              </div>
            </div>
          ))}
        </>
      )}

      {/* Reports */}
      {tab === 'reports' && (
        <>
          <div className="section-title">🚩 Reports ({reports.length})</div>
          {reports.length === 0 && (
            <div className="empty-state"><div className="empty-icon">🧹</div><p>No pending reports</p></div>
          )}
          {reports.map((r) => (
            <div key={r._id} className="admin-job-card">
              <div style={{ fontWeight: 600, marginBottom: 4 }}>
                {r.targetType === 'job' ? '📋 Job Report' : '👤 User Report'}
              </div>
              <div className="text-muted" style={{ fontSize: '0.85rem' }}>
                Reporter: {r.reporterId?.name} ({r.reporterId?.phone})
              </div>
              <div style={{ marginTop: 6, padding: '8px 10px', background: '#FFF8E1', borderRadius: 8, fontSize: '0.85rem' }}>
                Reason: {r.reason}
              </div>
              <div className="text-muted" style={{ fontSize: '0.75rem', marginTop: 6 }}>
                {new Date(r.createdAt).toLocaleString('en-IN')}
              </div>
            </div>
          ))}
        </>
      )}

      {/* Reject Modal */}
      {rejectTarget && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 999,
        }}>
          <div style={{ background: 'var(--white)', borderRadius: '16px 16px 0 0', padding: 24, width: '100%', maxWidth: 480 }}>
            <h3 style={{ marginBottom: 16 }}>❌ Reject Job</h3>
            <div className="form-group">
              <label className="form-label">Reason (shown to user)</label>
              <select className="form-select" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)}>
                <option value="">Select reason</option>
                <option value="Inappropriate content">Inappropriate content</option>
                <option value="Duplicate post">Duplicate post</option>
                <option value="Insufficient details">Insufficient details</option>
                <option value="Spam or misleading">Spam or misleading</option>
                <option value="Outside service area">Outside service area</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-danger" style={{ flex: 1 }} onClick={reject}>Confirm Reject</button>
              <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setRejectTarget(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
