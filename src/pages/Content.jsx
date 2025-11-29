import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { teacherAPI } from '../lib/api';
import './Content.css';

export default function Content() {
  const [vocabulary, setVocabulary] = useState([]);
  const [grammar, setGrammar] = useState([]);
  const [classes, setClasses] = useState([]);
  const [classesError, setClassesError] = useState(null);
  const [activeTab, setActiveTab] = useState('vocab');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showNewGrammarClassDialog, setShowNewGrammarClassDialog] = useState(false);
  const [newGrammarClassName, setNewGrammarClassName] = useState('');
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

  const [editingGrammarId, setEditingGrammarId] = useState(null);
  const [editingGrammar, setEditingGrammar] = useState({
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
    loadClasses();
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

  const loadClasses = async () => {
    setClassesError(null);
    try {
      const data = await teacherAPI.getClasses(teacherId);
      setClasses(data.classes || []);
    } catch (error) {
      console.error('Failed to load classes:', error);
      setClassesError('Failed to load classes. Class selection may be unavailable.');
    }
  };

  const handleAddVocab = async (e) => {
    e.preventDefault();
    try {
      const vocabData = {
        ...newVocab,
        class_id: newVocab.class_id || null,
        student_id: null,
      };
      await teacherAPI.addVocabulary(teacherId, vocabData);
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
        class_id: newGrammar.class_id || null,
        student_id: null,
      };
      await teacherAPI.addGrammar(teacherId, grammarData);
      setNewGrammar({ rule_name: '', rule_description: '', examples: '', class_id: '' });
      setShowAddForm(false);
      loadContent();
    } catch (error) {
      alert('Failed to add grammar');
    }
  };

  const handleCreateGrammarClass = async () => {
    if (!newGrammarClassName.trim()) {
      return;
    }
    try {
      const created = await teacherAPI.addClass(teacherId, newGrammarClassName.trim());
      const createdClass = created.class || created;
      if (createdClass?.id) {
        setClasses((prev) => [...prev, createdClass]);
        setNewGrammar((prev) => ({ ...prev, class_id: createdClass.id }));
        // Also update editing grammar if we're in edit mode
        if (editingGrammarId) {
          setEditingGrammar((prev) => ({ ...prev, class_id: createdClass.id }));
        }
      }
      setNewGrammarClassName('');
      setShowNewGrammarClassDialog(false);
    } catch (error) {
      alert(error.response?.data?.detail || 'Failed to create class');
    }
  };

  const handleEditGrammar = (item) => {
    setEditingGrammarId(item.id);
    setEditingGrammar({
      rule_name: item.rule_name || '',
      rule_description: item.rule_description || '',
      examples: Array.isArray(item.examples) ? item.examples.join(', ') : (item.examples || ''),
      class_id: item.class_id || '',
    });
    setShowAddForm(false);
  };

  const handleCancelEditGrammar = () => {
    setEditingGrammarId(null);
    setEditingGrammar({
      rule_name: '',
      rule_description: '',
      examples: '',
      class_id: '',
    });
  };

  const handleUpdateGrammar = async (e) => {
    e.preventDefault();
    try {
      const grammarData = {
        ...editingGrammar,
        examples: editingGrammar.examples.split(',').map(e => e.trim()).filter(e => e),
        class_id: editingGrammar.class_id || null,
        student_id: null,
        is_current_lesson: false,
        scheduled_date: null,
      };
      await teacherAPI.updateGrammar(teacherId, editingGrammarId, grammarData);
      setEditingGrammarId(null);
      setEditingGrammar({ rule_name: '', rule_description: '', examples: '', class_id: '' });
      loadContent();
    } catch (error) {
      alert(error.response?.data?.detail || 'Failed to update grammar');
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

        {classesError && (
          <div className="error-message">
            {classesError}
          </div>
        )}

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
            <div className="class-select-group">
              <label className="field-label">Class</label>
              <select
                value={newVocab.class_id || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  setNewVocab((prev) => ({ ...prev, class_id: value }));
                }}
              >
                <option value="">No class (applies to all)</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name || `Class ${cls.id}`}
                  </option>
                ))}
              </select>
            </div>
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
            <div className="class-select-group">
              <label className="field-label">Class</label>
              <select
                value={newGrammar.class_id || ''}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '__add_new__') {
                    setShowNewGrammarClassDialog(true);
                    return;
                  }
                  setNewGrammar((prev) => ({ ...prev, class_id: value }));
                }}
              >
                <option value="">No class (applies to all)</option>
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name || `Class ${cls.id}`}
                  </option>
                ))}
                <option value="__add_new__">+ Add new class…</option>
              </select>
            </div>
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
                {editingGrammarId === item.id ? (
                  <form onSubmit={handleUpdateGrammar} className="edit-form">
                    <input
                      type="text"
                      placeholder="Rule Name"
                      value={editingGrammar.rule_name}
                      onChange={(e) => setEditingGrammar({ ...editingGrammar, rule_name: e.target.value })}
                      required
                    />
                    <textarea
                      placeholder="Rule Description"
                      value={editingGrammar.rule_description}
                      onChange={(e) => setEditingGrammar({ ...editingGrammar, rule_description: e.target.value })}
                      required
                    />
                    <input
                      type="text"
                      placeholder="Examples (comma-separated)"
                      value={editingGrammar.examples}
                      onChange={(e) => setEditingGrammar({ ...editingGrammar, examples: e.target.value })}
                    />
                    <div className="class-select-group">
                      <label className="field-label">Class</label>
                      <select
                        value={editingGrammar.class_id || ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === '__add_new__') {
                            setShowNewGrammarClassDialog(true);
                            return;
                          }
                          setEditingGrammar((prev) => ({ ...prev, class_id: value }));
                        }}
                      >
                        <option value="">No class (applies to all)</option>
                        {classes.map((cls) => (
                          <option key={cls.id} value={cls.id}>
                            {cls.name || `Class ${cls.id}`}
                          </option>
                        ))}
                        <option value="__add_new__">+ Add new class…</option>
                      </select>
                    </div>
                    <div className="edit-form-actions">
                      <button type="button" onClick={handleCancelEditGrammar} className="cancel-button">
                        Cancel
                      </button>
                      <button type="submit" className="save-button">
                        Save Changes
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="content-card-header">
                      <h3>{item.rule_name}</h3>
                      <button
                        type="button"
                        onClick={() => handleEditGrammar(item)}
                        className="edit-button"
                        title="Edit grammar rule"
                      >
                        Edit
                      </button>
                    </div>
                    <p>{item.rule_description}</p>
                    {item.examples && (
                      <div className="examples">
                        {item.examples.map((ex, i) => (
                          <p key={i} className="example">{ex}</p>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        )}
        {showNewGrammarClassDialog && (
          <div className="modal-backdrop">
            <div className="modal">
              <h2>Add New Class</h2>
              <p>Give your new class a name. This name will appear in the Class dropdown.</p>
              <input
                type="text"
                placeholder="Class name"
                value={newGrammarClassName}
                onChange={(e) => setNewGrammarClassName(e.target.value)}
              />
              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary"
                  onClick={() => {
                    setShowNewGrammarClassDialog(false);
                    setNewGrammarClassName('');
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateGrammarClass}
                >
                  Create Class
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
