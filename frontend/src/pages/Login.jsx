import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { extractErrorMessage } from '../services/api';
import ErrorMessage from '../components/ErrorMessage';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [values, setValues] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(values);
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
          <div className="pitch">Every rupee, accounted for.</div>
          <div className="pitch-sub">Track spending, set category budgets, and catch overspending before it happens — all in one ledger.</div>
        </div>
        <div style={{ fontSize: 13, color: '#8A8676' }}>A personal finance project built with React, Express &amp; MySQL.</div>
      </div>

      <div className="auth-form-side">
        <div className="auth-box">
          <h1>Welcome back</h1>
          <p className="sub">Log in to see where your money went.</p>

          <ErrorMessage>{error}</ErrorMessage>

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input id="email" type="email" required value={values.email} onChange={(e) => setValues({ ...values, email: e.target.value })} />
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <input id="password" type="password" required value={values.password} onChange={(e) => setValues({ ...values, password: e.target.value })} />
            </div>
            <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
              {submitting ? 'Logging in…' : 'Log in'}
            </button>
          </form>

          <div className="auth-switch">
            New to SmartSpend? <Link to="/register">Create an account</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
