import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { teacherAPI } from '../lib/api';
import './Classes.css';

export default function Classes() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [name, setName] = useState('');

  const navigate = useNavigate();
  const teacherId = localStorage.getItem('teacherId');

  useEffect(() => {
    if (!teacherId) {
      navigate('/signin');
      return;
    }
    loadClasses();
  }, [teacherId, navigate]);

  const loadClasses = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await teacherAPI.getClasses(teacherId);
      setClasses(data.classes || []);
    } catch (err) {
      console.error('Failed to load classes:', err);
      setError(err.response?.data?.detail || 'Failed to load classes. Make sure you are signed in and the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingClass) {
        await teacherAPI.updateClass(teacherId, editingClass.id, { name });
      } else {
        await teacherAPI.addClass(teacherId, name);
      }
      setName('');
      setEditingClass(null);
      setShowForm(false);
      loadClasses();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to save class');
    }
  };

  const handleEdit = (classItem) => {
    setEditingClass(classItem);
    setName(classItem.name || '');
    setShowForm(true);
  };

  const handleDelete = async (classId) => {
    if (!window.confirm('Delete this class? This will also remove any students in the class.')) return;
    try {
      await teacherAPI.deleteClass(teacherId, classId);
      loadClasses();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to delete class');
    }
  };

  if (loading) {
    return <div className="classes-page"><div className="classes-container">Loading...</div></div>;
  }

  return (
    <div className="classes-page">
      <div className="classes-container">
        <div className="page-header">
          <h1>Manage Classes</h1>
          <Link to="/dashboard" className="back-button">← Back to Dashboard</Link>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="actions-bar">
          <button
            className="add-button"
            onClick={() => {
              setShowForm(true);
              setEditingClass(null);
              setName('');
            }}
          >
            + Add Class
          </button>
        </div>

        {showForm && (
          <div className="form-card">
            <h2>{editingClass ? 'Edit Class' : 'Add New Class'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Class Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Class name"
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="save-button">
                  {editingClass ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingClass(null);
                    setName('');
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="classes-list">
          {classes.length === 0 ? (
            <div className="empty-state">
              <p>No classes yet. Create your first class to get started.</p>
            </div>
          ) : (
            classes.map((classItem) => (
              <div key={classItem.id} className="class-card">
                <div className="class-info">
                  <h3>{classItem.name}</h3>
                </div>
                <div className="class-actions">
                  <button
                    className="secondary-button"
                    onClick={() => navigate(`/students?classId=${classItem.id}`)}
                  >
                    Manage Students
                  </button>
                  <button
                    className="secondary-button"
                    onClick={() => navigate(`/content?classId=${classItem.id}`)}
                  >
                    Manage Vocab & Grammar
                  </button>
                  <button
                    className="secondary-button"
                    onClick={() => navigate(`/surveys?classId=${classItem.id}`)}
                  >
                    Manage Surveys
                  </button>
                  <button className="edit-button" onClick={() => handleEdit(classItem)}>
                    Edit
                  </button>
                  <button className="delete-button" onClick={() => handleDelete(classItem.id)}>
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}


