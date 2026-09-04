import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { extractErrorMessage } from '../services/api';
import ErrorMessage from '../components/ErrorMessage';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [values, setValues] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (values.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    setSubmitting(true);
    try {
      await register(values);
      navigate('/dashboard');
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-hero">
        <div className="brand">Smart<span>Spend</span></div>
        <div>
          <div className="pitch">Start the ledger.</div>
          <div className="pitch-sub">Set up an account in under a minute — your data stays yours, scoped to you alone.</div>
        </div>
        <div style={{ fontSize: 13, color: '#8A8676' }}>A personal finance project built with React, Express &amp; MySQL.</div>
      </div>

      <div className="auth-form-side">
        <div className="auth-box">
          <h1>Create your account</h1>
          <p className="sub">Takes less than a minute.</p>

          <ErrorMessage>{error}</ErrorMessage>

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="name">Name</label>
              <input id="name" type="text" required value={values.name} onChange={(e) => setValues({ ...values, name: e.target.value })} />
            </div>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input id="email" type="email" required value={values.email} onChange={(e) => setValues({ ...values, email: e.target.value })} />
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <input id="password" type="password" required minLength={8} value={values.password} onChange={(e) => setValues({ ...values, password: e.target.value })} />
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>At least 8 characters.</span>
            </div>
            <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
              {submitting ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <div className="auth-switch">
            Already have an account? <Link to="/login">Log in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
