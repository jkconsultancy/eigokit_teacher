import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { teacherAPI } from '../lib/api';
import './Surveys.css';

export default function Surveys() {
  const [questions, setQuestions] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newQuestion, setNewQuestion] = useState({
    question_type: 'emoji_scale',
    question_text: '',
    question_text_jp: '',
    options: '',
    class_id: '',
  });
  const [searchParams] = useSearchParams();
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

    loadQuestions();
  }, [teacherId, searchParams]);

  const loadQuestions = async () => {
    try {
      const classIdFilter = searchParams.get('classId') || null;
      const data = await teacherAPI.getSurveyQuestions(teacherId, classIdFilter);
      setQuestions(data.questions || []);
    } catch (error) {
      console.error('Failed to load questions:', error);
    }
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    try {
      const questionData = {
        ...newQuestion,
        options: newQuestion.options ? newQuestion.options.split(',').map(o => o.trim()) : null,
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
      alert('Failed to create question');
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
            <input
              type="text"
              placeholder="Class ID (optional)"
              value={newQuestion.class_id}
              onChange={(e) => setNewQuestion({ ...newQuestion, class_id: e.target.value })}
            />
            <button type="submit">Create Question</button>
          </form>
        )}

        <div className="questions-list">
          {questions.map((question) => (
            <div key={question.id} className="question-card">
              <h3>{question.question_text}</h3>
              {question.question_text_jp && <p className="jp-text">{question.question_text_jp}</p>}
              <p className="question-type">Type: {question.question_type}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

