import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { updateProfile } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const WORK_TYPES = [
  'plumber', 'electrician', 'driver', 'helper', 'carpenter',
  'painter', 'cleaner', 'cook', 'security', 'gardener', 'other',
];

const EditProfile = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: user.name || '',
    workType: user.workType || '',
    photo: null,
  });
  const [preview, setPreview] = useState(user.profilePhoto || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handlePhoto = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm({ ...form, photo: file });
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('workType', form.workType);
      if (form.photo) fd.append('profilePhoto', form.photo);

      const res = await updateProfile(fd);
      updateUser({
        name: res.data.user.name,
        workType: res.data.user.workType,
        profilePhoto: res.data.user.profilePhoto,
      });
      setSuccess('Profile updated!');
      setTimeout(() => navigate('/profile'), 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate(-1)}>←</button>
        <h1 className="page-title">Edit Profile</h1>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {/* Photo */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        {preview ? (
          <img
            src={preview}
            alt="Profile"
            style={{ width: 100, height: 100, borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--orange)', display: 'block', margin: '0 auto 12px' }}
          />
        ) : (
          <div className="avatar-placeholder" style={{ width: 100, height: 100, fontSize: '2rem', margin: '0 auto 12px' }}>
            {user.name?.[0]?.toUpperCase()}
          </div>
        )}
        <label
          style={{ cursor: 'pointer', color: 'var(--orange)', fontWeight: 700, fontSize: '0.9rem' }}
        >
          📷 Change Photo
          <input type="file" accept="image/*" onChange={handlePhoto} style={{ display: 'none' }} />
        </label>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Full Name</label>
          <input
            className="form-input"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Work Type</label>
          <select
            className="form-select"
            value={form.workType}
            onChange={(e) => setForm({ ...form, workType: e.target.value })}
          >
            {WORK_TYPES.map((w) => (
              <option key={w} value={w}>{w.charAt(0).toUpperCase() + w.slice(1)}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Phone</label>
          <input
            className="form-input"
            value={user.phone}
            disabled
            style={{ background: '#f5f5f5', color: '#999' }}
          />
          <p className="text-muted" style={{ fontSize: '0.75rem', marginTop: 4 }}>Phone cannot be changed</p>
        </div>

        <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
          {loading ? 'Saving...' : '💾 Save Changes'}
        </button>
      </form>
    </div>
  );
};

export default EditProfile;
