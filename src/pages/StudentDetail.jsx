import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { teacherAPI } from '../lib/api';
import './StudentDetail.css';

// Icon mapping (should match backend)
const ICON_MAP = {
  1: '🍎', 2: '🍌', 3: '🍊', 4: '🍓', 5: '🐱', 6: '🐶', 7: '🐦', 8: '🐰',
  9: '📚', 10: '✏️', 11: '⚽', 12: '🚗', 13: '☀️', 14: '🌙', 15: '⭐', 16: '❤️',
  17: '🏠', 18: '🌳', 19: '🌸', 20: '🐟', 21: '🐻', 22: '🦁', 23: '🐘', 24: '🦋',
  25: '🐼', 26: '🐯', 27: '🐮', 28: '🐷', 29: '🐸', 30: '🦆', 31: '🐴', 32: '🐑',
  33: '🦒', 34: '🦓', 35: '🐵', 36: '🐔', 37: '🐧', 38: '🦉', 39: '🐬', 40: '🐋',
  41: '🦈', 42: '🐢', 43: '🐍', 44: '🕷️', 45: '🐝', 46: '🐌', 47: '🦀', 48: '🦞',
};

export default function StudentDetail() {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const teacherId = localStorage.getItem('teacherId');
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);

  useEffect(() => {
    if (!teacherId) {
      navigate('/signin');
      return;
    }
    loadStudentDetail();
  }, [studentId, teacherId]);

  const loadStudentDetail = async () => {
    try {
      const data = await teacherAPI.getStudentDetail(studentId);
      setStudent(data);
    } catch (error) {
      console.error('Failed to load student detail:', error);
      alert('Failed to load student details');
    } finally {
      setLoading(false);
    }
  };

  const handleResetIconSequence = async () => {
    if (!confirm('Reset this student\'s icon password? They will need to use the new sequence to sign in.')) {
      return;
    }

    setResetting(true);
    try {
      const result = await teacherAPI.resetStudentAuth(teacherId, studentId);
      // Reload student detail to show new sequence
      await loadStudentDetail();
      alert('Icon password reset successfully! New sequence: ' + result.icon_sequence.map(id => ICON_MAP[id] || id).join(' '));
    } catch (error) {
      console.error('Failed to reset icon sequence:', error);
      alert('Failed to reset icon sequence');
    } finally {
      setResetting(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!student) return <div className="error">Student not found</div>;

  const studentInfo = student.student;
  const iconSequence = student.icon_sequence || [];
  const icons = student.icons || [];

  return (
    <div className="student-detail-page">
      <div className="student-detail-container">
        <div className="page-header">
          <h1>Student Details</h1>
          <Link to="/students">← Back to Students</Link>
        </div>

        <div className="student-info-card">
          <h2>{studentInfo.name}</h2>
          <div className="info-row">
            <span className="label">Class ID:</span>
            <span>{studentInfo.class_id}</span>
          </div>
          <div className="info-row">
            <span className="label">Status:</span>
            <span>{studentInfo.registration_status || 'pending'}</span>
          </div>
        </div>

        <div className="icon-sequence-card">
          <h3>Login Icon Password</h3>
          <p className="description">
            This is the student's icon password sequence. They use this to sign in.
          </p>
          
          {iconSequence.length > 0 ? (
            <>
              <div className="icon-sequence-display">
                {iconSequence.map((iconId, index) => {
                  const icon = icons.find(i => i.id === iconId) || { emoji: ICON_MAP[iconId] || '❓', id: iconId };
                  return (
                    <div key={index} className="icon-item">
                      <div className="icon-emoji-large">{icon.emoji || ICON_MAP[iconId] || '❓'}</div>
                      <div className="icon-position">{index + 1}</div>
                    </div>
                  );
                })}
              </div>
              <div className="icon-sequence-text">
                <strong>Sequence:</strong> {iconSequence.join(', ')}
              </div>
            </>
          ) : (
            <p className="no-sequence">No icon sequence assigned yet.</p>
          )}

          <button
            onClick={handleResetIconSequence}
            disabled={resetting}
            className="reset-button"
          >
            {resetting ? 'Resetting...' : '🔄 Reset & Generate New Password'}
          </button>
        </div>
      </div>
    </div>
  );
}

