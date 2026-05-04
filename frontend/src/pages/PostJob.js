import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createJob } from '../utils/api';
import useLocation from '../hooks/useLocation';

const WORK_TYPES = [
  'plumber', 'electrician', 'driver', 'helper', 'carpenter',
  'painter', 'cleaner', 'cook', 'security', 'gardener', 'other',
];

const PostJob = () => {
  const [form, setForm] = useState({ title: '', description: '', urgency: 'normal' });
  const [images, setImages] = useState([]);
  const [audio, setAudio] = useState(null);
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const mediaRef = useRef(null);
  const { location } = useLocation();
  const navigate = useNavigate();

  const handleImages = (e) => {
    const files = Array.from(e.target.files).slice(0, 3);
    setImages(files);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];
      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setAudioBlob(blob);
        setAudio(new File([blob], 'voice.webm', { type: 'audio/webm' }));
        stream.getTracks().forEach((t) => t.stop());
      };
      recorder.start();
      mediaRef.current = recorder;
      setRecording(true);
    } catch {
      setError('Microphone access denied');
    }
  };

  const stopRecording = () => {
    if (mediaRef.current) { mediaRef.current.stop(); setRecording(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title) { setError('Job title is required'); return; }
    if (!location) { setError('Location not detected. Please enable GPS.'); return; }
    setError('');
    setLoading(true);

    try {
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('description', form.description);
      fd.append('urgency', form.urgency);
      fd.append('lat', location.lat);
      fd.append('lng', location.lng);
      fd.append('area', location.area || '');
      images.forEach((img) => fd.append('images', img));
      if (audio) fd.append('audio', audio);

      await createJob(fd);
      navigate('/my-jobs');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="form-page-inner">
      <div className="page-header">
        <button className="back-btn" onClick={() => navigate(-1)}>←</button>
        <h1 className="page-title">Post a Job</h1>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Job Title *</label>
          <input
            className="form-input"
            placeholder="e.g. Need plumber urgently"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Description (optional if using voice)</label>
          <textarea
            className="form-input"
            rows={3}
            placeholder="Describe the work needed..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            style={{ resize: 'vertical' }}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Urgency</label>
          <div style={{ display: 'flex', gap: 12 }}>
            {['normal', 'urgent'].map((u) => (
              <button
                key={u}
                type="button"
                className={`btn ${form.urgency === u ? 'btn-primary' : 'btn-outline'}`}
                style={{ flex: 1 }}
                onClick={() => setForm({ ...form, urgency: u })}
              >
                {u === 'urgent' ? '🔴 Urgent' : '🟢 Normal'}
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Photos (up to 3)</label>
          <input
            className="form-input"
            type="file"
            accept="image/*"
            multiple
            onChange={handleImages}
          />
          {images.length > 0 && (
            <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
              {images.map((img, i) => (
                <img
                  key={i}
                  src={URL.createObjectURL(img)}
                  alt=""
                  style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 8 }}
                />
              ))}
            </div>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">Voice Description</label>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {!recording ? (
              <button type="button" className="btn btn-dark" onClick={startRecording}>
                🎙️ Start Recording
              </button>
            ) : (
              <button type="button" className="btn btn-danger" onClick={stopRecording}>
                ⏹️ Stop Recording
              </button>
            )}
            {audioBlob && (
              <audio controls src={URL.createObjectURL(audioBlob)} style={{ flex: 1, height: 36 }} />
            )}
          </div>
          {recording && (
            <div style={{ color: 'var(--red)', fontSize: '0.85rem', marginTop: 6 }}>
              🔴 Recording in progress...
            </div>
          )}
        </div>

        <div className="form-group">
          <label className="form-label">Location</label>
          <div className="alert alert-info" style={{ margin: 0 }}>
            📍 {location ? `${location.area || 'Detected'} (${location.lat.toFixed(4)}, ${location.lng.toFixed(4)})` : 'Detecting...'}
          </div>
        </div>

        <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
          {loading ? 'Posting...' : '🚀 Submit Job for Approval'}
        </button>

        <p className="text-muted text-center mt-1" style={{ fontSize: '0.8rem' }}>
          Jobs are reviewed by the JP-Bridge team before going live
        </p>
      </form>
      </div> {/* form-page-inner */}
    </div>
  );
};
export default PostJob;