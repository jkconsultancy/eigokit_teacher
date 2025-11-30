import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { teacherAPI } from '../lib/api';
import './SignIn.css';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetMessage, setResetMessage] = useState('');
  const [resetError, setResetError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await teacherAPI.signIn(email, password);
      // Store the teacher table ID (used by backend FKs), not the auth user ID
      if (result.teacher_id) {
        localStorage.setItem('teacherId', result.teacher_id);
      } else if (result.user?.id) {
        // Fallback for older backend responses, though new backend always includes teacher_id
        localStorage.setItem('teacherId', result.user.id);
      }
      
      // Multi-role support: Store roles if provided
      if (result.roles) {
        localStorage.setItem('user_roles', JSON.stringify(result.roles));
      }
      
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Sign in failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    setResetMessage('');
    setResetError('');
    try {
      const response = await teacherAPI.requestPasswordReset(email);
      setResetMessage(response.message || 'If an account exists, a reset email has been sent.');
    } catch (err) {
      setResetError(err.response?.data?.detail || 'Unable to request password reset. Please try again later.');
    }
  };

  return (
    <div className="signin-page">
      <div className="signin-container">
        <h1>Teacher Sign In</h1>
        <form onSubmit={handleSubmit} className="signin-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          {resetMessage && <div className="info-message">{resetMessage}</div>}
          {resetError && <div className="error-message">{resetError}</div>}
          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <div className="forgot-password">
          <button
            type="button"
            className="link-button"
            onClick={handlePasswordReset}
            disabled={loading || !email}
          >
            Forgot password?
          </button>
        </div>
      </div>
    </div>
  );
}

