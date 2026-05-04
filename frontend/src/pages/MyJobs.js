import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyJobs, updateJobStatus, deleteJob, createReview } from '../utils/api';

const statusColors = {
  open: 'status-open',
  'in-progress': 'status-in-progress',
  completed: 'status-completed',
};

const MyJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewModal, setReviewModal] = useState(null); // { jobId, assignedTo }
  const [review, setReview] = useState({ rating: 5, comment: '' });
  const navigate = useNavigate();

  useEffect(() => {
    getMyJobs()
      .then((res) => { setJobs(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleStatus = async (jobId, jobStatus) => {
    await updateJobStatus(jobId, jobStatus);
    setJobs((prev) => prev.map((j) => j._id === jobId ? { ...j, jobStatus } : j));
  };

  const handleDelete = async (jobId) => {
    if (!window.confirm('Delete this job?')) return;
    await deleteJob(jobId);
    setJobs((prev) => prev.filter((j) => j._id !== jobId));
  };

  const handleReview = async () => {
    if (!reviewModal) return;
    await createReview({
      jobId: reviewModal.jobId,
      reviewedUserId: reviewModal.assignedTo,
      rating: review.rating,
      comment: review.comment,
    });
    setReviewModal(null);
    setReview({ rating: 5, comment: '' });
  };

  if (loading) return <div className="loading"><div className="spinner" /></div>;

  const byStatus = (status) => jobs.filter((j) => j.jobStatus === status);

  return (
    <div className="page">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate(-1)}>←</button>
        <h1 className="page-title">My Jobs</h1>
      </div>

      {jobs.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <p style={{ fontWeight: 700, marginBottom: 8 }}>No jobs posted yet</p>
          <button className="btn btn-primary" onClick={() => navigate('/post-job')}>Post Your First Job</button>
        </div>
      ) : (
        ['open', 'in-progress', 'completed'].map((status) => {
          const list = byStatus(status);
          if (list.length === 0) return null;
          return (
            <div key={status}>
              <div className="section-title" style={{ textTransform: 'capitalize' }}>
                {status === 'open' ? '🟢' : status === 'in-progress' ? '🔵' : '✅'} {status} ({list.length})
              </div>
              {list.map((job) => (
                <div key={job._id} className="card" style={{ padding: 14, marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 4 }}>{job.title}</div>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <span className={`status-tag ${statusColors[job.jobStatus]}`}>{job.jobStatus}</span>
                        <span className={`status-tag status-${job.status}`}>{job.status}</span>
                        {job.urgency === 'urgent' && <span className="urgent-badge">Urgent</span>}
                      </div>
                    </div>
                    <button
                      style={{ background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer', fontSize: '1.1rem' }}
                      onClick={() => handleDelete(job._id)}
                    >🗑️</button>
                  </div>

                  <div className="text-muted" style={{ fontSize: '0.8rem', marginBottom: 10 }}>
                    📍 {job.location?.area || 'Bengaluru'} • {new Date(job.createdAt).toLocaleDateString('en-IN')}
                  </div>

                  {/* Status control */}
                  {job.status === 'approved' && (
                    <div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--mid)', marginBottom: 6 }}>Update status:</div>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {['open', 'in-progress', 'completed'].map((s) => (
                          <button
                            key={s}
                            className={`btn btn-sm ${job.jobStatus === s ? 'btn-primary' : 'btn-outline'}`}
                            onClick={() => handleStatus(job._id, s)}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {job.status === 'pending' && (
                    <div className="alert alert-info" style={{ margin: '10px 0 0', fontSize: '0.82rem' }}>
                      ⏳ Pending admin approval
                    </div>
                  )}

                  {job.status === 'rejected' && (
                    <div className="alert alert-error" style={{ margin: '10px 0 0', fontSize: '0.82rem' }}>
                      ❌ Rejected by admin
                    </div>
                  )}

                  {/* Leave review once completed */}
                  {job.jobStatus === 'completed' && job.assignedTo && (
                    <button
                      className="btn btn-sm btn-success"
                      style={{ marginTop: 10 }}
                      onClick={() => setReviewModal({ jobId: job._id, assignedTo: job.assignedTo })}
                    >
                      ⭐ Leave Review
                    </button>
                  )}
                </div>
              ))}
            </div>
          );
        })
      )}

      {/* Review Modal */}
      {reviewModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center', zIndex: 999,
        }}>
          <div style={{ background: 'var(--white)', borderRadius: '16px 16px 0 0', padding: 24, width: '100%', maxWidth: 480 }}>
            <h3 style={{ marginBottom: 16 }}>⭐ Leave a Review</h3>
            <div className="form-group">
              <label className="form-label">Rating</label>
              <div style={{ display: 'flex', gap: 8 }}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    style={{
                      fontSize: '1.8rem', background: 'none', border: 'none', cursor: 'pointer',
                      opacity: n <= review.rating ? 1 : 0.3,
                    }}
                    onClick={() => setReview({ ...review, rating: n })}
                  >⭐</button>
                ))}
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Comment (optional)</label>
              <textarea
                className="form-input"
                rows={3}
                placeholder="How was the work?"
                value={review.comment}
                onChange={(e) => setReview({ ...review, comment: e.target.value })}
              />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleReview}>Submit</button>
              <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setReviewModal(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyJobs;
