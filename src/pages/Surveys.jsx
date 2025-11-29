import { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { teacherAPI } from '../lib/api';
import './Surveys.css';

export default function Surveys() {
  const [questions, setQuestions] = useState([]);
  const [classes, setClasses] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAddClassForm, setShowAddClassForm] = useState(false);
  const [newClassName, setNewClassName] = useState('');
  const [newQuestion, setNewQuestion] = useState({
    question_type: 'emoji_scale',
    question_text: '',
    question_text_jp: '',
    options: '',
    class_id: '',
  });
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const teacherId = localStorage.getItem('teacherId');

  useEffect(() => {
    if (!teacherId) {
      window.location.href = '/signin';
      return;
    }

    const initialClassId = searchParams.get('classId') || '';
    if (initialClassId) {
      setNewQuestion((prev) => ({ ...prev, class_id: initialClassId }));
    }

    loadClasses();
    loadQuestions();
  }, [teacherId, searchParams]);

  const loadClasses = async () => {
    try {
      const data = await teacherAPI.getClasses(teacherId);
      setClasses(data.classes || []);
    } catch (error) {
      console.error('Failed to load classes:', error);
    }
  };

  const loadQuestions = async () => {
    try {
      const classIdFilter = searchParams.get('classId') || null;
      const data = await teacherAPI.getSurveyQuestions(teacherId, classIdFilter);
      setQuestions(data.questions || []);
    } catch (error) {
      console.error('Failed to load questions:', error);
    }
  };

  const handleAddClass = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault();
    }
    if (!newClassName.trim()) {
      alert('Please enter a class name');
      return;
    }
    try {
      const result = await teacherAPI.addClass(teacherId, newClassName.trim());
      await loadClasses(); // Reload classes list
      setNewQuestion((prev) => ({ ...prev, class_id: result.class_id }));
      setNewClassName('');
      setShowAddClassForm(false);
    } catch (error) {
      const errorMessage = error?.response?.data?.detail || error?.message || 'Failed to create class';
      console.error('Failed to create class:', error);
      alert(`Failed to create class: ${errorMessage}`);
    }
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    try {
      // Prepare question data - convert empty strings to null
      const questionData = {
        question_type: newQuestion.question_type,
        question_text: newQuestion.question_text,
        question_text_jp: newQuestion.question_text_jp && newQuestion.question_text_jp.trim() ? newQuestion.question_text_jp : null,
        class_id: newQuestion.class_id && newQuestion.class_id.trim() ? newQuestion.class_id : null,
        options: newQuestion.options && newQuestion.options.trim() 
          ? newQuestion.options.split(',').map(o => o.trim()).filter(o => o) 
          : null,
      };
      
      await teacherAPI.createSurveyQuestion(teacherId, questionData);
      setNewQuestion({
        question_type: 'emoji_scale',
        question_text: '',
        question_text_jp: '',
        options: '',
        class_id: '',
      });
      setShowAddForm(false);
      loadQuestions();
    } catch (error) {
      const errorMessage = error?.response?.data?.detail || error?.message || 'Failed to create question';
      console.error('Failed to create question:', error);
      alert(`Failed to create question: ${errorMessage}`);
    }
  };

  return (
    <div className="surveys-page">
      <div className="surveys-container">
        <div className="page-header">
          <h1>Manage Survey Questions</h1>
          <Link to="/dashboard">← Back to Dashboard</Link>
        </div>

        <button onClick={() => setShowAddForm(!showAddForm)} className="add-button">
          {showAddForm ? 'Cancel' : '+ Add Question'}
        </button>

        {showAddForm && (
          <form onSubmit={handleAddQuestion} className="add-form">
            <select
              value={newQuestion.question_type}
              onChange={(e) => setNewQuestion({ ...newQuestion, question_type: e.target.value })}
            >
              <option value="emoji_scale">Emoji Scale</option>
              <option value="multiple_choice">Multiple Choice</option>
              <option value="yes_no">Yes/No</option>
              <option value="short_answer">Short Answer</option>
            </select>
            <input
              type="text"
              placeholder="Question Text (English)"
              value={newQuestion.question_text}
              onChange={(e) => setNewQuestion({ ...newQuestion, question_text: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Question Text (Japanese)"
              value={newQuestion.question_text_jp}
              onChange={(e) => setNewQuestion({ ...newQuestion, question_text_jp: e.target.value })}
            />
            {newQuestion.question_type === 'multiple_choice' && (
              <input
                type="text"
                placeholder="Options (comma-separated)"
                value={newQuestion.options}
                onChange={(e) => setNewQuestion({ ...newQuestion, options: e.target.value })}
              />
            )}
            <div className="class-selector-group">
              <label htmlFor="class-select">Class (optional)</label>
              <div className="class-selector-wrapper">
                <select
                  id="class-select"
                  value={newQuestion.class_id}
                  onChange={(e) => {
                    if (e.target.value === '__add_new__') {
                      setShowAddClassForm(true);
                    } else {
                      setNewQuestion({ ...newQuestion, class_id: e.target.value });
                    }
                  }}
                >
                  <option value="">No specific class (all classes)</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name}
                    </option>
                  ))}
                  <option value="__add_new__">+ Add New Class</option>
                </select>
              </div>
              {showAddClassForm && (
                <div className="add-class-form">
                  <input
                    type="text"
                    placeholder="New class name"
                    value={newClassName}
                    onChange={(e) => setNewClassName(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddClass(e);
                      }
                    }}
                  />
                  <div className="add-class-buttons">
                    <button type="button" onClick={handleAddClass}>
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddClassForm(false);
                        setNewClassName('');
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
            <button type="submit">Create Question</button>
          </form>
        )}

        <div className="questions-list">
          {questions.map((question) => (
            <div
              key={question.id}
              className="question-card clickable"
              onClick={() => navigate(`/surveys/${question.id}`)}
            >
              <h3>{question.question_text}</h3>
              {question.question_text_jp && <p className="jp-text">{question.question_text_jp}</p>}
              <div className="question-footer">
                <p className="question-type">Type: {question.question_type}</p>
                <p className="response-count">
                  {question.response_count || 0} {question.response_count === 1 ? 'response' : 'responses'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

