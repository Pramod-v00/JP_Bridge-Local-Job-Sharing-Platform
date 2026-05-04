import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getJobFeed, getRoom } from '../utils/api';
import useLocation from '../hooks/useLocation';
import JobCard from '../components/JobCard';

const Feed = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all | urgent
  const [radius, setRadius] = useState(10);
  const { location, error: locError } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!location) return;
    const load = async () => {
      setLoading(true);
      try {
        const res = await getJobFeed(location.lat, location.lng, radius);
        setJobs(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [location, radius]);

  const handleMessage = async (userId) => {
    try {
      const res = await getRoom(userId);
      navigate(`/chat/${res.data.roomId}/${userId}`);
    } catch {}
  };

  const filtered = filter === 'urgent' ? jobs.filter((j) => j.urgency === 'urgent') : jobs;

  return (
    <div className="page">
      {/* Location bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.2rem' }}>
            📍 {location?.area || 'Bengaluru'}
          </div>
          <div className="text-muted">Nearby jobs within {radius} km</div>
        </div>
        <select
          value={radius}
          onChange={(e) => setRadius(Number(e.target.value))}
          style={{ padding: '6px 10px', borderRadius: 8, border: '2px solid #eee', fontSize: '0.85rem' }}
        >
          <option value={5}>5 km</option>
          <option value={10}>10 km</option>
          <option value={20}>20 km</option>
        </select>
      </div>

      {locError && (
        <div className="alert alert-error">
          📍 Location access denied. Please enable it to see nearby jobs.
        </div>
      )}

      {/* Filter tabs */}
      <div className="tabs">
        <button className={`tab ${filter === 'all' ? 'active' : ''}`} onClick={() => setFilter('all')}>
          All Jobs ({jobs.length})
        </button>
        <button className={`tab ${filter === 'urgent' ? 'active' : ''}`} onClick={() => setFilter('urgent')}>
          🔴 Urgent ({jobs.filter((j) => j.urgency === 'urgent').length})
        </button>
      </div>

      {loading ? (
        <div className="loading"><div className="spinner" /><span>Finding jobs near you...</span></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <p style={{ fontWeight: 700, marginBottom: 8 }}>No jobs found nearby</p>
          <p className="text-muted">Try increasing the radius or check back later</p>
        </div>
      ) : (
        <div className="feed-grid">
          {filtered.map((job) => (
            <JobCard key={job._id} job={job} onMessage={handleMessage} />
          ))}
        </div>
      )}

      {/* Post Job FAB */}
      <button className="fab" onClick={() => navigate('/post-job')} title="Post a Job">
        +
      </button>
    </div>
  );
};

export default Feed;
