import { useState, useEffect, useRef } from 'react';
import { notesAPI } from '@/lib/api';
import styles from '@/styles/NoteSidebar.module.css';

export default function NoteSidebar({ storyId, chapterNumber, storyTitle, chapterTitle, isOpen, onToggle }) {
  const [notes, setNotes] = useState({
    understanding: '',
    connection: '',
    journal: ''
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const textareaRefs = useRef({});

  useEffect(() => {
    if (isOpen) {
      loadNote();
    }
  }, [storyId, chapterNumber, isOpen]);

  const loadNote = async () => {
    try {
      const response = await notesAPI.getNote(storyId, chapterNumber);
      if (response.data.note) {
        setNotes({
          understanding: response.data.note.understanding || '',
          connection: response.data.note.connection || '',
          journal: response.data.note.journal || ''
        });
      } else {
        setNotes({ understanding: '', connection: '', journal: '' });
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

  const autoSave = async () => {
    if (!notes.understanding && !notes.connection && !notes.journal) {
      return;
    }
    
    setSaving(true);
    try {
      await notesAPI.saveNote(storyId, chapterNumber, {
        ...notes,
        storyTitle,
        chapterTitle
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Error auto-saving note:', error);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (notes.understanding || notes.connection || notes.journal) {
        autoSave();
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [notes, storyId, chapterNumber]);

  if (!isOpen) {
    return (
      <button onClick={onToggle} className={styles.toggleBtn}>
        Notes
      </button>
    );
  }

  return (
    <div className={styles.sidebar}>
      <div className={styles.header}>
        <div className={styles.headerInfo}>
          <h3>My Notes</h3>
          <span className={styles.chapterInfo}>Chapter {chapterNumber}</span>
        </div>
        <div className={styles.headerActions}>
          {saved && <span className={styles.savedIndicator}>Saved</span>}
          {saving && <span className={styles.savingIndicator}>Saving...</span>}
          <button onClick={onToggle} className={styles.closeBtn}>×</button>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.noteSection}>
          <label className={styles.sectionLabel}>
            What I understand
          </label>
          <textarea
            ref={el => textareaRefs.current.understanding = el}
            value={notes.understanding}
            onChange={(e) => handleChange('understanding', e.target.value)}
            placeholder="Key points and ideas..."
            className={styles.textarea}
            rows={4}
          />
        </div>

        <div className={styles.noteSection}>
          <label className={styles.sectionLabel}>
            My connection
          </label>
          <textarea
            ref={el => textareaRefs.current.connection = el}
            value={notes.connection}
            onChange={(e) => handleChange('connection', e.target.value)}
            placeholder="How does this relate to me?"
            className={styles.textarea}
            rows={4}
          />
        </div>

        <div className={styles.noteSection}>
          <label className={styles.sectionLabel}>
            Reflection
          </label>
          <textarea
            ref={el => textareaRefs.current.journal = el}
            value={notes.journal}
            onChange={(e) => handleChange('journal', e.target.value)}
            placeholder="Deeper thoughts and questions..."
            className={styles.textarea}
            rows={4}
          />
        </div>
      </div>
    </div>
  );
}
