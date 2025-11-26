import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { teacherAPI } from '../lib/api';
import './AcceptInvitation.css';

export default function AcceptInvitation() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checkingToken, setCheckingToken] = useState(true);

  useEffect(() => {
    if (!token) {
      setError('Invalid invitation link. No token provided.');
      setCheckingToken(false);
      return;
    }

    // Optionally validate token with backend before showing form
    // For now, we'll just show the form and validate on submit
    setCheckingToken(false);
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      const response = await teacherAPI.acceptInvitation(token, password, name || undefined);
      
      if (response.access_token) {
        // Auto-login: Store token and redirect to dashboard
        localStorage.setItem('access_token', response.access_token);
        if (response.user_id) {
          localStorage.setItem('teacherId', response.user_id);
        }
        
        // Show success message briefly, then redirect
        alert('Invitation accepted! Redirecting to dashboard...');
        navigate('/dashboard');
      } else if (response.email_confirmation_required) {
        // Email confirmation needed
        setError('Please check your email to confirm your account before signing in.');
        setTimeout(() => navigate('/signin'), 3000);
      } else {
        // No token but success - redirect to sign in
        alert('Account created successfully. Please sign in.');
        navigate('/signin');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.detail || err.message || 'Failed to accept invitation';
      setError(errorMessage);
      
      // If token is invalid or expired, redirect to sign in after a delay
      if (err.response?.status === 404 || err.response?.status === 400) {
        if (errorMessage.includes('expired') || errorMessage.includes('Invalid')) {
          setTimeout(() => navigate('/signin'), 3000);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  if (checkingToken) {
    return (
      <div className="accept-invitation-page">
        <div className="accept-invitation-container">
          <div className="loading-message">Validating invitation...</div>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="accept-invitation-page">
        <div className="accept-invitation-container">
          <h1>Invalid Invitation</h1>
          <p>The invitation link is invalid or missing a token.</p>
          <button className="signin-button" onClick={() => navigate('/signin')}>
            Go to Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="accept-invitation-page">
      <div className="accept-invitation-container">
        <h1>Accept Teacher Invitation</h1>
        <p className="subtitle">Set up your account to get started</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit} className="accept-invitation-form">
          <div className="form-group">
            <label htmlFor="name">Name (Optional)</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
            <small>You can update your name later in settings</small>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password *</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="At least 6 characters"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password *</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              placeholder="Re-enter your password"
            />
          </div>

          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? 'Accepting Invitation...' : 'Accept Invitation & Sign In'}
          </button>
        </form>

        <div className="signin-link">
          <p>Already have an account? <a href="/signin">Sign in</a></p>
        </div>
      </div>
    </div>
  );
}

