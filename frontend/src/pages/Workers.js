import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { searchWorkers, getRoom } from '../utils/api';
import useLocation from '../hooks/useLocation';

const WORK_TYPES = [
  'all', 'plumber', 'electrician', 'driver', 'helper', 'carpenter',
  'painter', 'cleaner', 'cook', 'security', 'gardener', 'other',
];

const Workers = () => {
  const [workers, setWorkers] = useState([]);
  const [workType, setWorkType] = useState('all');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(false);

  const { location } = useLocation();
  const navigate = useNavigate();

  const load = async () => {
    if (!location) return;

    setLoading(true);
    try {
      const params = { lat: location.lat, lng: location.lng, radius: 10 };

      if (workType !== 'all') params.workType = workType;

      const res = await searchWorkers(params);
      setWorkers(res.data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [location, workType]);

  const handleMessage = async (wId) => {
    const res = await getRoom(wId);
    navigate(`/chat/${res.data.roomId}/${wId}`);
  };

  // ✅ FILTER LOGIC
  const filteredWorkers = workers.filter((w) => {
    const matchesSearch = w.name
      ?.toLowerCase()
      .includes(search.toLowerCase());

    const matchesFilter = filter
      ? w.workType?.toLowerCase() === filter.toLowerCase()
      : true;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="page">
      <div className="section-title">👷 Workers Nearby</div>

      {/* 🔍 SEARCH + FILTER */}
      <div className="workers-toolbar">
        <input
          type="text"
          placeholder="Search workers..."
          className="search-input"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="filter-select"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="">All</option>
          {WORK_TYPES.slice(1).map((w) => (
            <option key={w} value={w}>
              {w.charAt(0).toUpperCase() + w.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* 🔘 CATEGORY BUTTONS */}
      {/* DATA */}
      {loading ? (
        <div className="loading">
          <div className="spinner" />
        </div>
      ) : filteredWorkers.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <p>No workers found</p>
        </div>
      ) : (
        filteredWorkers.map((w) => (
          <div
            key={w._id}
            className="card"
            style={{
              padding: 14,
              display: 'flex',
              gap: 12,
              alignItems: 'center',
            }}
          >
            {w.profilePhoto ? (
              <img
                src={w.profilePhoto}
                alt={w.name}
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  objectFit: 'cover',
                }}
              />
            ) : (
              <div
                className="avatar-placeholder"
                style={{ width: 60, height: 60, fontSize: '1.3rem' }}
              >
                {w.name?.[0]?.toUpperCase()}
              </div>
            )}

            <div
              onClick={() => navigate(`/profile/${w._id}`)}
              style={{ cursor: 'pointer', flex: 1 }}
            >
              <div style={{ fontWeight: 700, fontSize: '1rem' }}>
                {w.name}
              </div>

              <div
                className="profile-badge"
                style={{ display: 'inline-block', margin: '4px 0' }}
              >
                {w.workType}
              </div>

              <div
                style={{
                  display: 'flex',
                  gap: 12,
                  fontSize: '0.8rem',
                  color: 'var(--mid)',
                }}
              >
                <span>⭐ {w.rating?.toFixed(1) || 'New'}</span>
                <span>📍 {w.distance} km</span>
              </div>
            </div>

            <button
              className="btn btn-primary btn-sm"
              onClick={() => handleMessage(w._id)}
            >
              💬
            </button>
          </div>
        ))
      )}
    </div>
  );
};

export default Workers;