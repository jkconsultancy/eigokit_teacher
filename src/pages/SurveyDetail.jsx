import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { teacherAPI } from '../lib/api';
import './SurveyDetail.css';

const EMOJI_SCALE = ['😞', '😐', '🙂', '😊', '😄'];

export default function SurveyDetail() {
  const { questionId } = useParams();
  const navigate = useNavigate();
  const teacherId = localStorage.getItem('teacherId');
  const [question, setQuestion] = useState(null);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!teacherId) {
      navigate('/signin');
      return;
    }
    loadQuestionDetail();
  }, [questionId, teacherId]);

  const loadQuestionDetail = async () => {
    try {
      const data = await teacherAPI.getSurveyQuestionDetail(questionId);
      setQuestion(data.question);
      setResponses(data.responses || []);
    } catch (error) {
      console.error('Failed to load question detail:', error);
      alert('Failed to load question details');
    } finally {
      setLoading(false);
    }
  };

  const formatResponse = (response, questionType) => {
    if (questionType === 'emoji_scale') {
      const index = parseInt(response);
      if (!isNaN(index) && index >= 0 && index < EMOJI_SCALE.length) {
        return EMOJI_SCALE[index];
      }
      return response;
    }
    return response;
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!question) return <div className="error">Question not found</div>;

  return (
    <div className="survey-detail-page">
      <div className="survey-detail-container">
        <div className="page-header">
          <h1>Survey Question Details</h1>
          <Link to="/surveys">← Back to Surveys</Link>
        </div>

        <div className="question-info-card">
          <h2>{question.question_text}</h2>
          {question.question_text_jp && (
            <p className="question-jp">{question.question_text_jp}</p>
          )}
          <div className="question-meta">
            <span className="question-type">Type: {question.question_type}</span>
            <span className="response-count-badge">
              {responses.length} {responses.length === 1 ? 'response' : 'responses'}
            </span>
          </div>
        </div>

        <div className="responses-section">
          <h3>Student Responses</h3>
          {responses.length === 0 ? (
            <p className="no-responses">No responses yet</p>
          ) : (
            <div className="responses-list">
              {responses.map((response) => (
                <div key={response.id} className="response-card">
                  <div className="response-header">
                    <h4>{response.student_name || 'Unknown Student'}</h4>
                    <span className="response-date">
                      {response.created_at
                        ? new Date(response.created_at).toLocaleDateString()
                        : ''}
                    </span>
                  </div>
                  <div className="response-content">
                    {question.question_type === 'emoji_scale' ? (
                      <div className="emoji-response">
                        <span className="emoji-large">{formatResponse(response.response, question.question_type)}</span>
                        <span className="response-value">({response.response})</span>
                      </div>
                    ) : question.question_type === 'short_answer' ? (
                      <p className="text-response">{response.response}</p>
                    ) : (
                      <p className="response-value">{response.response}</p>
                    )}
                  </div>
                  {response.lesson_id && (
                    <p className="lesson-id">Lesson: {response.lesson_id}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

