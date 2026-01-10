import { useState, useEffect } from 'react';
import { notesAPI } from '@/lib/api';
import styles from '@/styles/NoteTaking.module.css';

export default function NoteTaking({ storyId, chapterNumber, onClose }) {
  const [notes, setNotes] = useState({
    understanding: '',
    connection: '',
    journal: ''
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNote();
  }, [storyId, chapterNumber]);

  const loadNote = async () => {
    try {
      const response = await notesAPI.getNote(storyId, chapterNumber);
      if (response.data.note) {
        setNotes({
          understanding: response.data.note.understanding || '',
          connection: response.data.note.connection || '',
          journal: response.data.note.journal || ''
        });
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading note:', error);
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setNotes({ ...notes, [field]: value });
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await notesAPI.saveNote(storyId, chapterNumber, notes);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Error saving note:', error);
      alert('Failed to save notes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const autoSave = async () => {
    try {
      await notesAPI.saveNote(storyId, chapterNumber, notes);
      setSaved(true);
      setTimeout(() => setSaved(false), 1000);
    } catch (error) {
      console.error('Error auto-saving note:', error);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (notes.understanding || notes.connection || notes.journal) {
        autoSave();
      }
    }, 2000);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notes, storyId, chapterNumber]);

  if (loading) {
    return <div className={styles.loading}>Loading your notes...</div>;
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.container} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3>Take Notes</h3>
          <div className={styles.headerActions}>
            {saved && <span className={styles.savedIndicator}>Saved</span>}
            <button onClick={onClose} className={styles.closeBtn}>×</button>
          </div>
        </div>

        <div className={styles.sections}>
          <div className={styles.section}>
            <label className={styles.sectionLabel}>
              What I understand from here
            </label>
            <textarea
              value={notes.understanding}
              onChange={(e) => handleChange('understanding', e.target.value)}
              placeholder="Write down what you understood from this chapter. What were the key points, themes, or ideas?"
              className={styles.textarea}
              rows={6}
            />
          </div>

          <div className={styles.section}>
            <label className={styles.sectionLabel}>
              What connects it with me
            </label>
            <textarea
              value={notes.connection}
              onChange={(e) => handleChange('connection', e.target.value)}
              placeholder="How does this relate to your life? What personal experiences, memories, or feelings does it bring up?"
              className={styles.textarea}
              rows={6}
            />
          </div>

          <div className={styles.section}>
            <label className={styles.sectionLabel}>
              Journal & Reflection
            </label>
            <textarea
              value={notes.journal}
              onChange={(e) => handleChange('journal', e.target.value)}
              placeholder="Reflect deeper: What questions does this raise? What would you do differently? What new perspectives did you gain?"
              className={styles.textarea}
              rows={6}
            />
          </div>
        </div>

        <div className={styles.footer}>
          <button 
            onClick={handleSave} 
            className={styles.saveBtn}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Notes'}
          </button>
          <button onClick={onClose} className={styles.cancelBtn}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
