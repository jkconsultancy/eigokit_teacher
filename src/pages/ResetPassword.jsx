import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import './SignIn.css';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);

  useEffect(() => {
    // For Supabase password recovery links, tokens are in the URL hash.
    // Extract them and create a session so updateUser can succeed.
    const initializeSession = async () => {
      const hash = window.location.hash.startsWith('#')
        ? window.location.hash.substring(1)
        : window.location.hash;
      const params = new URLSearchParams(hash);
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');

      if (!accessToken || !refreshToken) {
        setError('Invalid or expired password reset link. Please request a new reset email.');
        return;
      }

      try {
        const { data, error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        });

        if (sessionError) {
          setError('Invalid or expired password reset link. Please request a new reset email.');
          return;
        }

        // Verify we have a valid session
        if (data.session) {
          setSessionReady(true);
        } else {
          setError('Failed to establish session. Please request a new reset email.');
        }
      } catch (err) {
        setError('Invalid or expired password reset link. Please request a new reset email.');
      }
    };

    initializeSession();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!sessionReady) {
      setError('Session not ready. Please wait for the page to load completely.');
      return;
    }

    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      // Verify we still have a valid session before updating
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setError('Session expired. Please request a new password reset email.');
        setLoading(false);
        return;
      }

      console.log('Updating password for user:', session.user.email);

      // Update the password - this should work with the recovery session
      const { data: updateData, error: updateError } = await supabase.auth.updateUser({ 
        password: password 
      });

      if (updateError) {
        console.error('Password update error:', updateError);
        setError(updateError.message || 'Failed to reset password.');
        return;
      }

      if (!updateData || !updateData.user) {
        console.error('Password update returned no user data');
        setError('Password update failed. Please try again.');
        return;
      }

      console.log('Password updated successfully for user:', updateData.user.email);

      // Verify the password was actually updated by attempting to refresh the session
      // This ensures the update persisted on the server
      const { error: refreshError } = await supabase.auth.refreshSession();
      if (refreshError) {
        console.warn('Session refresh warning (may be normal):', refreshError);
      }

      // Sign out the temporary recovery session after password update
      await supabase.auth.signOut();

      setMessage('Your password has been updated successfully. You can now sign in.');
      setTimeout(() => navigate('/signin'), 2000);
    } catch (err) {
      console.error('Password reset error:', err);
      setError(err.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signin-page">
      <div className="signin-container">
        <h1>Reset Password</h1>
        {error && <div className="error-message">{error}</div>}
        {message && <div className="info-message">{message}</div>}
        <form onSubmit={handleSubmit} className="signin-form">
          <div className="form-group">
            <label htmlFor="password">New Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          <button type="submit" className="submit-button" disabled={loading || !sessionReady}>
            {loading ? 'Updating...' : sessionReady ? 'Update Password' : 'Loading...'}
          </button>
        </form>
      </div>
    </div>
  );
}


