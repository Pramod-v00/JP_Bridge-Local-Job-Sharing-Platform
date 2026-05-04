import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { register } from '../utils/api';

const WORK_TYPES = [
  'plumber', 'electrician', 'driver', 'helper', 'carpenter',
  'painter', 'cleaner', 'cook', 'security', 'gardener', 'other',
];

const Register = () => {
  const [form, setForm] = useState({
    name: '',
    phone: '',       // 10-digit only, +91 prefix added before submit
    password: '',
    confirmPassword: '',
    workType: '',
    profilePhoto: null,
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!/^\d{10}$/.test(form.phone)) e.phone = 'Enter a valid 10-digit mobile number';
    if (form.password.length < 6) e.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    if (!form.workType) e.workType = 'Please select your work type';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    try {
      let lat = 12.9716, lng = 77.5946, area = 'Bengaluru';
      if (navigator.geolocation) {
        await new Promise((res) =>
          navigator.geolocation.getCurrentPosition(
            (pos) => { lat = pos.coords.latitude; lng = pos.coords.longitude; res(); },
            () => res(), // fallback silently
            { timeout: 5000 }
          )
        );
      }

      const fd = new FormData();
      fd.append('name', form.name.trim());
      fd.append('phone', form.phone); // backend normalizes to +91XXXXXXXXXX
      fd.append('password', form.password);
      fd.append('workType', form.workType);
      fd.append('lat', lat);
      fd.append('lng', lng);
      fd.append('area', area);
      if (form.profilePhoto) fd.append('profilePhoto', form.profilePhoto);

      const res = await register(fd);
      login(res.data.user, res.data.token);
      navigate('/');
    } catch (err) {
      setApiError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const field = (key) => ({
    value: form[key],
    onChange: (e) => {
      setForm({ ...form, [key]: e.target.value });
      if (errors[key]) setErrors({ ...errors, [key]: '' });
    },
  });

  return (
    <div className="auth-page">
      <div className="auth-logo">JP-<span>Bridge</span></div>
      <p className="auth-tagline">Join Bengaluru's local job network</p>

      <div className="auth-card">
        <h2 className="auth-heading">Create Account</h2>

        {apiError && <div className="alert alert-error">{apiError}</div>}

        <form onSubmit={handleSubmit} noValidate>
          {/* Name */}
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className={`form-input ${errors.name ? 'error' : ''}`} placeholder="e.g. Rahul Sharma" {...field('name')} />
            {errors.name && <p className="form-error">{errors.name}</p>}
          </div>

          {/* Phone with +91 prefix */}
          <div className="form-group">
            <label className="form-label">Mobile Number</label>
            <div className="phone-input-wrap">
              <span className="phone-prefix">+91</span>
              <input
                className={`form-input phone-input ${errors.phone ? 'error' : ''}`}
                type="tel"
                inputMode="numeric"
                maxLength={10}
                placeholder="9876543210"
                value={form.phone}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                  setForm({ ...form, phone: val });
                  if (errors.phone) setErrors({ ...errors, phone: '' });
                }}
              />
            </div>
            {errors.phone && <p className="form-error">{errors.phone}</p>}
          </div>

          {/* Password */}
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className={`form-input ${errors.password ? 'error' : ''}`} type="password" placeholder="Min 6 characters" {...field('password')} />
            {errors.password && <p className="form-error">{errors.password}</p>}
          </div>

          {/* Confirm Password */}
          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <input className={`form-input ${errors.confirmPassword ? 'error' : ''}`} type="password" placeholder="Repeat password" {...field('confirmPassword')} />
            {errors.confirmPassword && <p className="form-error">{errors.confirmPassword}</p>}
          </div>

          {/* Work Type */}
          <div className="form-group">
            <label className="form-label">Work Type</label>
            <select className={`form-select ${errors.workType ? 'error' : ''}`} value={form.workType} onChange={(e) => { setForm({ ...form, workType: e.target.value }); setErrors({ ...errors, workType: '' }); }}>
              <option value="">Select your skill</option>
              {WORK_TYPES.map((w) => (
                <option key={w} value={w}>{w.charAt(0).toUpperCase() + w.slice(1)}</option>
              ))}
            </select>
            {errors.workType && <p className="form-error">{errors.workType}</p>}
          </div>

          {/* Profile Photo */}
          <div className="form-group">
            <label className="form-label">Profile Photo <span style={{ color: 'var(--mid)', fontWeight: 400 }}>(optional)</span></label>
            <input className="form-input" type="file" accept="image/*" onChange={(e) => setForm({ ...form, profilePhoto: e.target.files[0] })} />
          </div>

          <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account?{' '}
          <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
