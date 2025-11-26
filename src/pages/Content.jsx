import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { teacherAPI } from '../lib/api';
import './Content.css';

export default function Content() {
  const [vocabulary, setVocabulary] = useState([]);
  const [grammar, setGrammar] = useState([]);
  const [activeTab, setActiveTab] = useState('vocab');
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchParams] = useSearchParams();
  const teacherId = localStorage.getItem('teacherId');

  const [newVocab, setNewVocab] = useState({
    english_word: '',
    japanese_word: '',
    example_sentence: '',
    class_id: '',
  });

  const [newGrammar, setNewGrammar] = useState({
    rule_name: '',
    rule_description: '',
    examples: '',
    class_id: '',
  });

  useEffect(() => {
    if (!teacherId) {
      window.location.href = '/signin';
      return;
    }

    const initialClassId = searchParams.get('classId') || '';
    if (initialClassId) {
      setNewVocab((prev) => ({ ...prev, class_id: initialClassId }));
      setNewGrammar((prev) => ({ ...prev, class_id: initialClassId }));
    }

    loadContent();
  }, [teacherId, searchParams]);

  const loadContent = async () => {
    try {
      const classIdFilter = searchParams.get('classId') || null;
      const [vocabData, grammarData] = await Promise.all([
        teacherAPI.getVocabulary(teacherId, classIdFilter),
        teacherAPI.getGrammar(teacherId, classIdFilter),
      ]);
      setVocabulary(vocabData.vocabulary || []);
      setGrammar(grammarData.grammar || []);
    } catch (error) {
      console.error('Failed to load content:', error);
    }
  };

  const handleAddVocab = async (e) => {
    e.preventDefault();
    try {
      await teacherAPI.addVocabulary(teacherId, newVocab);
      setNewVocab({ english_word: '', japanese_word: '', example_sentence: '', class_id: '' });
      setShowAddForm(false);
      loadContent();
    } catch (error) {
      alert('Failed to add vocabulary');
    }
  };

  const handleAddGrammar = async (e) => {
    e.preventDefault();
    try {
      const grammarData = {
        ...newGrammar,
        examples: newGrammar.examples.split(',').map(e => e.trim()),
      };
      await teacherAPI.addGrammar(teacherId, grammarData);
      setNewGrammar({ rule_name: '', rule_description: '', examples: '', class_id: '' });
      setShowAddForm(false);
      loadContent();
    } catch (error) {
      alert('Failed to add grammar');
    }
  };

  return (
    <div className="content-page">
      <div className="content-container">
        <div className="page-header">
          <h1>Manage Content</h1>
          <Link to="/dashboard">← Back to Dashboard</Link>
        </div>

        <div className="tabs">
          <button
            className={activeTab === 'vocab' ? 'active' : ''}
            onClick={() => setActiveTab('vocab')}
          >
            Vocabulary
          </button>
          <button
            className={activeTab === 'grammar' ? 'active' : ''}
            onClick={() => setActiveTab('grammar')}
          >
            Grammar
          </button>
        </div>

        <button onClick={() => setShowAddForm(!showAddForm)} className="add-button">
          {showAddForm ? 'Cancel' : '+ Add ' + (activeTab === 'vocab' ? 'Vocabulary' : 'Grammar')}
        </button>

        {showAddForm && activeTab === 'vocab' && (
          <form onSubmit={handleAddVocab} className="add-form">
            <input
              type="text"
              placeholder="English Word"
              value={newVocab.english_word}
              onChange={(e) => setNewVocab({ ...newVocab, english_word: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Japanese Word"
              value={newVocab.japanese_word}
              onChange={(e) => setNewVocab({ ...newVocab, japanese_word: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Example Sentence"
              value={newVocab.example_sentence}
              onChange={(e) => setNewVocab({ ...newVocab, example_sentence: e.target.value })}
            />
            <input
              type="text"
              placeholder="Class ID (optional)"
              value={newVocab.class_id}
              onChange={(e) => setNewVocab({ ...newVocab, class_id: e.target.value })}
            />
            <button type="submit">Add Vocabulary</button>
          </form>
        )}

        {showAddForm && activeTab === 'grammar' && (
          <form onSubmit={handleAddGrammar} className="add-form">
            <input
              type="text"
              placeholder="Rule Name"
              value={newGrammar.rule_name}
              onChange={(e) => setNewGrammar({ ...newGrammar, rule_name: e.target.value })}
              required
            />
            <textarea
              placeholder="Rule Description"
              value={newGrammar.rule_description}
              onChange={(e) => setNewGrammar({ ...newGrammar, rule_description: e.target.value })}
              required
            />
            <input
              type="text"
              placeholder="Examples (comma-separated)"
              value={newGrammar.examples}
              onChange={(e) => setNewGrammar({ ...newGrammar, examples: e.target.value })}
            />
            <input
              type="text"
              placeholder="Class ID (optional)"
              value={newGrammar.class_id}
              onChange={(e) => setNewGrammar({ ...newGrammar, class_id: e.target.value })}
            />
            <button type="submit">Add Grammar</button>
          </form>
        )}

        {activeTab === 'vocab' && (
          <div className="content-list">
            {vocabulary.map((item) => (
              <div key={item.id} className="content-card">
                <h3>{item.english_word}</h3>
                <p>{item.japanese_word}</p>
                {item.example_sentence && <p className="example">{item.example_sentence}</p>}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'grammar' && (
          <div className="content-list">
            {grammar.map((item) => (
              <div key={item.id} className="content-card">
                <h3>{item.rule_name}</h3>
                <p>{item.rule_description}</p>
                {item.examples && (
                  <div className="examples">
                    {item.examples.map((ex, i) => (
                      <p key={i} className="example">{ex}</p>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

