import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { teacherAPI } from '../lib/api';
import './Dashboard.css';

export default function Dashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [schoolsData, setSchoolsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const teacherId = localStorage.getItem('teacherId');

  useEffect(() => {
    if (!teacherId) {
      window.location.href = '/signin';
      return;
    }

    const loadDashboard = async () => {
      try {
        const [dashboardData, schoolsResponse] = await Promise.all([
          teacherAPI.getDashboard(teacherId),
          teacherAPI.getSchools(teacherId)
        ]);
        setDashboard(dashboardData);
        setSchoolsData(schoolsResponse);
      } catch (error) {
        console.error('Failed to load dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [teacherId]);

  const handleAcceptInvitation = (invitationToken) => {
    // Redirect to accept invitation page with token
    window.location.href = `/teacher/accept-invitation?token=${encodeURIComponent(invitationToken)}`;
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('teacherId');
    window.location.href = '/signin';
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1>Teacher Dashboard</h1>
          <button className="logout-button" onClick={handleLogout}>
            Log Out
          </button>
        </div>
        <nav className="dashboard-nav">
          <Link to="/classes">Manage Classes</Link>
          <Link to="/students">Manage Students</Link>
          <Link to="/content">Manage Content</Link>
          <Link to="/surveys">Manage Surveys</Link>
        </nav>

        {/* Schools and Invitations Section */}
        {schoolsData && (
          <div className="schools-section">
            {schoolsData.pending_invitations && schoolsData.pending_invitations.length > 0 && (
              <div className="invitations-card">
                <h2>Pending Invitations</h2>
                <p className="section-description">You have been invited to join these schools:</p>
                <div className="invitations-list">
                  {schoolsData.pending_invitations.map((invitation) => (
                    <div key={invitation.school_id} className="invitation-item">
                      <div className="invitation-info">
                        <h3>{invitation.school_name}</h3>
                        <span className={`invitation-status ${invitation.invitation_status}`}>
                          {invitation.invitation_status === 'expired' ? 'Expired' : 'Pending'}
                        </span>
                      </div>
                      {invitation.invitation_status === 'pending' && (
                        <button
                          className="accept-invitation-button"
                          onClick={() => handleAcceptInvitation(invitation.invitation_token)}
                        >
                          Accept Invitation
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {schoolsData.schools && schoolsData.schools.length > 0 && (
              <div className="schools-card">
                <h2>My Schools</h2>
                <p className="section-description">Schools you are currently associated with:</p>
                <div className="schools-list">
                  {schoolsData.schools.map((school) => (
                    <div key={school.school_id} className="school-item">
                      <h3>{school.school_name}</h3>
                      <span className="school-status active">Active</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {dashboard && (
          <div className="metrics-grid">
            <div className="metric-card">
              <h3>Total Classes</h3>
              <p className="metric-value">{dashboard.class_metrics?.total_classes || 0}</p>
            </div>
            <div className="metric-card">
              <h3>Total Students</h3>
              <p className="metric-value">{dashboard.class_metrics?.total_students || 0}</p>
            </div>
            <div className="metric-card">
              <h3>Survey Completion Rate</h3>
              <p className="metric-value">
                {Math.round(dashboard.class_metrics?.survey_completion_rate || 0)}%
              </p>
            </div>
            <div className="metric-card">
              <h3>Average Game Score</h3>
              <p className="metric-value">
                {Math.round(dashboard.class_metrics?.average_game_score || 0)}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

