import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { teacherAPI } from '../lib/api';
import './Students.css';

export default function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentClassId, setNewStudentClassId] = useState('');
  const [searchParams] = useSearchParams();
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
      alert('Failed to add student');
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

        <button onClick={() => setShowAddForm(!showAddForm)} className="add-button">
          {showAddForm ? 'Cancel' : '+ Add Student'}
        </button>

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

        <div className="students-list">
          {students.map((student) => (
            <div key={student.id} className="student-card">
              <h3>{student.name}</h3>
              <p>Class ID: {student.class_id}</p>
              <p>Status: {student.registration_status || 'pending'}</p>
              <div className="student-actions">
                <button onClick={() => handleResetAuth(student.id)}>Reset Auth</button>
                <button onClick={() => handleDeleteStudent(student.id)} className="delete-button">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

