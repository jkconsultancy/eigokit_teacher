import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { teacherAPI } from '../lib/api';
import './Students.css';

export default function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentClassId, setNewStudentClassId] = useState('');
  const [viewMode, setViewMode] = useState('card'); // 'card' or 'list'
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const teacherId = localStorage.getItem('teacherId');

  useEffect(() => {
    const initialClassId = searchParams.get('classId') || '';
    if (initialClassId) {
      setNewStudentClassId(initialClassId);
    }

    if (!teacherId) {
      window.location.href = '/signin';
      return;
    }

    loadStudents();
  }, [teacherId]);

  const loadStudents = async () => {
    try {
      const data = await teacherAPI.getStudents(teacherId);
      const classIdFilter = searchParams.get('classId');
      const allStudents = data.students || [];
      setStudents(
        classIdFilter
          ? allStudents.filter((s) => s.class_id === classIdFilter)
          : allStudents
      );
    } catch (error) {
      console.error('Failed to load students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    try {
      await teacherAPI.addStudent(teacherId, newStudentName, newStudentClassId);
      setNewStudentName('');
      setNewStudentClassId('');
      setShowAddForm(false);
      loadStudents();
    } catch (error) {
      const errorMessage = error?.response?.data?.detail || error?.message || 'Failed to add student';
      console.error('Failed to add student:', error);
      alert(`Failed to add student: ${errorMessage}`);
    }
  };

  const handleDeleteStudent = async (studentId) => {
    if (confirm('Are you sure you want to remove this student?')) {
      try {
        await teacherAPI.deleteStudent(studentId);
        loadStudents();
      } catch (error) {
        alert('Failed to delete student');
      }
    }
  };

  const handleResetAuth = async (studentId) => {
    if (confirm('Reset student authentication? They will need to re-register.')) {
      try {
        await teacherAPI.resetStudentAuth(teacherId, studentId);
        alert('Student authentication reset');
        loadStudents();
      } catch (error) {
        alert('Failed to reset authentication');
      }
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="students-page">
      <div className="students-container">
        <div className="page-header">
          <h1>Manage Students</h1>
          <Link to="/dashboard">← Back to Dashboard</Link>
        </div>

        <div className="page-controls">
          <button onClick={() => setShowAddForm(!showAddForm)} className="add-button">
            {showAddForm ? 'Cancel' : '+ Add Student'}
          </button>
          
          <div className="view-toggle">
            <button
              className={viewMode === 'card' ? 'active' : ''}
              onClick={() => setViewMode('card')}
            >
              Card View
            </button>
            <button
              className={viewMode === 'list' ? 'active' : ''}
              onClick={() => setViewMode('list')}
            >
              List View
            </button>
          </div>
        </div>

        {showAddForm && (
          <form onSubmit={handleAddStudent} className="add-student-form">
            <input
              type="text"
              placeholder="Student Name"
              value={newStudentName}
              onChange={(e) => setNewStudentName(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Class ID"
              value={newStudentClassId}
              onChange={(e) => setNewStudentClassId(e.target.value)}
              required
            />
            <button type="submit">Add Student</button>
          </form>
        )}

        {viewMode === 'card' ? (
          <div className="students-grid">
            {students.map((student) => (
              <div
                key={student.id}
                className="student-card clickable"
                onClick={() => navigate(`/students/${student.id}`)}
              >
                <h3>{student.name}</h3>
                <p>Class ID: {student.class_id}</p>
                <p>Status: {student.registration_status || 'pending'}</p>
                <div className="student-actions" onClick={(e) => e.stopPropagation()}>
                  <button onClick={() => handleResetAuth(student.id)}>Reset Auth</button>
                  <button onClick={() => handleDeleteStudent(student.id)} className="delete-button">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <table className="students-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Class ID</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr
                  key={student.id}
                  className="clickable-row"
                  onClick={() => navigate(`/students/${student.id}`)}
                >
                  <td>{student.name}</td>
                  <td>{student.class_id}</td>
                  <td>{student.registration_status || 'pending'}</td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => handleResetAuth(student.id)}>Reset Auth</button>
                    <button onClick={() => handleDeleteStudent(student.id)} className="delete-button">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

