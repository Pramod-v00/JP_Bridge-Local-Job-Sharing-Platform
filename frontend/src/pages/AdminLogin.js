import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { adminLogin } from '../utils/api';

const AdminLogin = () => {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!/^\d{10}$/.test(phone)) {
      setError('Enter a valid 10-digit mobile number');
      return;
    }
    if (!password) {
      setError('Password is required');
      return;
    }

    setLoading(true);
    try {
      const res = await adminLogin(phone, password);
      login(res.data.user, res.data.token);
      navigate('/admin');
    } catch (err) {
      setError(err.response?.data?.message || 'Admin login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-logo">JP-<span>Bridge</span></div>
      <p className="auth-tagline">Admin Portal</p>

      <div className="auth-card">
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <span style={{ fontSize: '2.5rem' }}>⚙️</span>
          <h2 className="auth-heading" style={{ marginTop: 8 }}>Admin Sign In</h2>
          <p style={{ color: 'var(--mid)', fontSize: '0.85rem' }}>
            Restricted access — admins only
          </p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label">Admin Mobile Number</label>
            <div className="phone-input-wrap">
              <span className="phone-prefix">+91</span>
              <input
                className="form-input phone-input"
                type="tel"
                inputMode="numeric"
                maxLength={10}
                placeholder="9876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                autoComplete="username"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className="form-input"
              type="password"
              placeholder="Admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In as Admin'}
          </button>
        </form>

        <p className="auth-switch" style={{ marginTop: 16 }}>
          <Link to="/login">← Back to user login</Link>
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
