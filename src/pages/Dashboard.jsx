import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { teacherAPI } from '../lib/api';
import './Dashboard.css';

export default function Dashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const teacherId = localStorage.getItem('teacherId');

  useEffect(() => {
    if (!teacherId) {
      window.location.href = '/signin';
      return;
    }

    const loadDashboard = async () => {
      try {
        const data = await teacherAPI.getDashboard(teacherId);
        setDashboard(data);
      } catch (error) {
        console.error('Failed to load dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [teacherId]);

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        <h1>Teacher Dashboard</h1>
        <nav className="dashboard-nav">
          <Link to="/classes">Manage Classes</Link>
          <Link to="/students">Manage Students</Link>
          <Link to="/content">Manage Content</Link>
          <Link to="/surveys">Manage Surveys</Link>
        </nav>

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

