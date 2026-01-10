import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { adminAPI, storiesAPI } from '@/lib/api';
import { logout, isAdmin } from '@/lib/auth';
import styles from '@/styles/Admin.module.css';

export default function AdminPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('stats');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [stories, setStories] = useState([]);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Story creation/editing state
  const [showStoryForm, setShowStoryForm] = useState(false);
  const [editingStory, setEditingStory] = useState(null);
  const [storyForm, setStoryForm] = useState({
    id: '',
    title: '',
    description: '',
    difficulty: 'medium',
    coverImage: '',
    chapters: [{ chapter: 1, title: '', content: '', questions: [{ id: 'q1-1', question: '', type: 'text', answer: '' }] }]
  });

  useEffect(() => {
    // Check if user is admin
    if (!isAdmin()) {
      router.push('/stories');
      return;
    }
    loadData();
  }, [router]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes, storiesRes, progressRes] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getUsers(),
        storiesAPI.getAll(),
        adminAPI.getProgress()
      ]);
      
      setStats(statsRes.data);
      setUsers(usersRes.data.users || []);
      setStories(Array.isArray(storiesRes.data) ? storiesRes.data : []);
      setProgress(progressRes.data.progress || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load admin data');
      console.error('Error loading admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRole = async (email, newRole) => {
    try {
      await adminAPI.updateUserRole(email, newRole);
      setMessage(`User role updated successfully`);
      loadData();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update user role');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDeleteUser = async (email) => {
    if (!confirm(`Are you sure you want to delete user ${email}? This action cannot be undone.`)) {
      return;
    }
    try {
      await adminAPI.deleteUser(email);
      setMessage('User deleted successfully');
      loadData();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete user');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDeleteStory = async (storyId) => {
    if (!confirm(`Are you sure you want to delete story ${storyId}? This will also delete all progress for this story.`)) {
      return;
    }
    try {
      await adminAPI.deleteStory(storyId);
      setMessage('Story deleted successfully');
      loadData();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete story');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleStorySubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingStory) {
        await adminAPI.updateStory(editingStory.id, storyForm);
        setMessage('Story updated successfully');
      } else {
        await adminAPI.createStory(storyForm);
        setMessage('Story created successfully');
      }
      setShowStoryForm(false);
      setEditingStory(null);
      setStoryForm({
        id: '',
        title: '',
        description: '',
        difficulty: 'medium',
        coverImage: '',
        chapters: [{ chapter: 1, title: '', content: '', questions: [{ id: 'q1-1', question: '', type: 'text', answer: '' }] }]
      });
      loadData();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save story');
      setTimeout(() => setError(''), 3000);
    }
  };

  const addChapter = () => {
    setStoryForm({
      ...storyForm,
      chapters: [
        ...storyForm.chapters,
        {
          chapter: storyForm.chapters.length + 1,
          title: '',
          content: '',
          questions: [{ id: `q${storyForm.chapters.length + 1}-1`, question: '', type: 'text', answer: '' }]
        }
      ]
    });
  };

  const addQuestion = (chapterIndex) => {
    const newChapters = [...storyForm.chapters];
    const chapter = newChapters[chapterIndex];
    chapter.questions.push({
      id: `q${chapter.chapter}-${chapter.questions.length + 1}`,
      question: '',
      type: 'text',
      answer: ''
    });
    setStoryForm({ ...storyForm, chapters: newChapters });
  };

  if (loading) {
    return <div className={styles.loading}>Loading admin dashboard...</div>;
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.logo}>Admin Dashboard</h1>
        </div>
        <div className={styles.headerRight}>
          <button onClick={() => router.push('/stories')} className={styles.backBtn}>
            Back to Stories
          </button>
          <button onClick={logout} className={styles.logoutBtn}>
            Logout
          </button>
        </div>
      </header>

      {error && <div className={styles.alertError}>{error}</div>}
      {message && <div className={styles.alertSuccess}>{message}</div>}

      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'stats' ? styles.active : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          Statistics
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'users' ? styles.active : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Users ({users.length})
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'stories' ? styles.active : ''}`}
          onClick={() => setActiveTab('stories')}
        >
          Stories ({stories.length})
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'progress' ? styles.active : ''}`}
          onClick={() => setActiveTab('progress')}
        >
          Progress ({progress.length})
        </button>
      </div>

      <div className={styles.content}>
        {activeTab === 'stats' && stats && (
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <h3>Overview</h3>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Total Users:</span>
                <span className={styles.statValue}>{stats.overview?.totalUsers || 0}</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Admins:</span>
                <span className={styles.statValue}>{stats.overview?.totalAdmins || 0}</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Total Stories:</span>
                <span className={styles.statValue}>{stats.overview?.totalStories || 0}</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Active Users (30d):</span>
                <span className={styles.statValue}>{stats.overview?.activeUsers || 0}</span>
              </div>
            </div>

            <div className={styles.statCard}>
              <h3>Reading Activity</h3>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Total Books Read:</span>
                <span className={styles.statValue}>{stats.reading?.totalBooksRead || 0}</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Total Chapters Read:</span>
                <span className={styles.statValue}>{stats.reading?.totalChaptersRead || 0}</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Total Badges:</span>
                <span className={styles.statValue}>{stats.reading?.totalBadges || 0}</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Avg Books/User:</span>
                <span className={styles.statValue}>{stats.reading?.avgBooksPerUser || 0}</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Avg Chapters/User:</span>
                <span className={styles.statValue}>{stats.reading?.avgChaptersPerUser || 0}</span>
              </div>
            </div>

            <div className={styles.statCard}>
              <h3>Streaks</h3>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Longest Streak:</span>
                <span className={styles.statValue}>{stats.streaks?.longestStreak || 0} days</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Users with Active Streaks:</span>
                <span className={styles.statValue}>{stats.streaks?.usersWithActiveStreaks || 0}</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Avg Current Streak:</span>
                <span className={styles.statValue}>{stats.streaks?.avgCurrentStreak || 0} days</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className={styles.usersTable}>
            <table>
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Username</th>
                  <th>Books Read</th>
                  <th>Chapters Read</th>
                  <th>Streak</th>
                  <th>Badges</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.email}>
                    <td>{user.email}</td>
                    <td>
                      <select
                        value={user.role || 'user'}
                        onChange={(e) => handleUpdateRole(user.email, e.target.value)}
                        className={styles.roleSelect}
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td>{user.profile?.username || '-'}</td>
                    <td>{user.stats?.totalBooksRead || 0}</td>
                    <td>{user.stats?.totalChaptersRead || 0}</td>
                    <td>{user.stats?.currentStreak || 0}</td>
                    <td>{user.badges?.length || 0}</td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td>
                      <button
                        onClick={() => handleDeleteUser(user.email)}
                        className={styles.deleteBtn}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'stories' && (
          <div className={styles.storiesSection}>
            <div className={styles.storiesHeader}>
              <h2>Manage Stories</h2>
              <button
                onClick={() => {
                  setEditingStory(null);
                  setStoryForm({
                    id: '',
                    title: '',
                    description: '',
                    difficulty: 'medium',
                    coverImage: '',
                    chapters: [{ chapter: 1, title: '', content: '', questions: [{ id: 'q1-1', question: '', type: 'text', answer: '' }] }]
                  });
                  setShowStoryForm(true);
                }}
                className={styles.createBtn}
              >
                Create New Story
              </button>
            </div>

            {showStoryForm && (
              <div className={styles.storyForm}>
                <form onSubmit={handleStorySubmit}>
                  <div className={styles.formGroup}>
                    <label>Story ID (no spaces, alphanumeric/hyphens only):</label>
                    <input
                      type="text"
                      value={storyForm.id}
                      onChange={(e) => setStoryForm({ ...storyForm, id: e.target.value })}
                      required
                      disabled={!!editingStory}
                      placeholder="e.g., my-new-story"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Title:</label>
                    <input
                      type="text"
                      value={storyForm.title}
                      onChange={(e) => setStoryForm({ ...storyForm, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Description:</label>
                    <textarea
                      value={storyForm.description}
                      onChange={(e) => setStoryForm({ ...storyForm, description: e.target.value })}
                      rows="3"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Difficulty:</label>
                    <select
                      value={storyForm.difficulty}
                      onChange={(e) => setStoryForm({ ...storyForm, difficulty: e.target.value })}
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                    </select>
                  </div>

                  <div className={styles.chaptersSection}>
                    <div className={styles.chaptersHeader}>
                      <h3>Chapters</h3>
                      <button type="button" onClick={addChapter} className={styles.addBtn}>
                        Add Chapter
                      </button>
                    </div>
                    {storyForm.chapters.map((chapter, chapterIndex) => (
                      <div key={chapterIndex} className={styles.chapterCard}>
                        <h4>Chapter {chapter.chapter}</h4>
                        <div className={styles.formGroup}>
                          <label>Chapter Title:</label>
                          <input
                            type="text"
                            value={chapter.title}
                            onChange={(e) => {
                              const newChapters = [...storyForm.chapters];
                              newChapters[chapterIndex].title = e.target.value;
                              setStoryForm({ ...storyForm, chapters: newChapters });
                            }}
                            required
                          />
                        </div>
                        <div className={styles.formGroup}>
                          <label>Chapter Content:</label>
                          <textarea
                            value={chapter.content}
                            onChange={(e) => {
                              const newChapters = [...storyForm.chapters];
                              newChapters[chapterIndex].content = e.target.value;
                              setStoryForm({ ...storyForm, chapters: newChapters });
                            }}
                            rows="6"
                            required
                          />
                        </div>
                        <div className={styles.questionsSection}>
                          <div className={styles.questionsHeader}>
                            <h5>Questions</h5>
                            <button
                              type="button"
                              onClick={() => addQuestion(chapterIndex)}
                              className={styles.addBtn}
                            >
                              Add Question
                            </button>
                          </div>
                          {chapter.questions.map((question, qIndex) => (
                            <div key={qIndex} className={styles.questionCard}>
                              <div className={styles.formGroup}>
                                <label>Question ID:</label>
                                <input
                                  type="text"
                                  value={question.id}
                                  onChange={(e) => {
                                    const newChapters = [...storyForm.chapters];
                                    newChapters[chapterIndex].questions[qIndex].id = e.target.value;
                                    setStoryForm({ ...storyForm, chapters: newChapters });
                                  }}
                                  required
                                />
                              </div>
                              <div className={styles.formGroup}>
                                <label>Question:</label>
                                <input
                                  type="text"
                                  value={question.question}
                                  onChange={(e) => {
                                    const newChapters = [...storyForm.chapters];
                                    newChapters[chapterIndex].questions[qIndex].question = e.target.value;
                                    setStoryForm({ ...storyForm, chapters: newChapters });
                                  }}
                                  required
                                />
                              </div>
                              <div className={styles.formGroup}>
                                <label>Answer:</label>
                                <input
                                  type="text"
                                  value={question.answer}
                                  onChange={(e) => {
                                    const newChapters = [...storyForm.chapters];
                                    newChapters[chapterIndex].questions[qIndex].answer = e.target.value;
                                    setStoryForm({ ...storyForm, chapters: newChapters });
                                  }}
                                  required
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className={styles.formActions}>
                    <button type="submit" className={styles.submitBtn}>
                      {editingStory ? 'Update Story' : 'Create Story'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowStoryForm(false);
                        setEditingStory(null);
                      }}
                      className={styles.cancelBtn}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className={styles.storiesList}>
              {stories.map((story) => (
                <div key={story.id} className={styles.storyCard}>
                  <div className={styles.storyInfo}>
                    <h3>{story.title}</h3>
                    <p>{story.description}</p>
                    <div className={styles.storyMeta}>
                      <span>ID: {story.id}</span>
                      <span>Difficulty: {story.difficulty}</span>
                      <span>Chapters: {story.totalChapters || 0}</span>
                    </div>
                  </div>
                  <div className={styles.storyActions}>
                    <button
                      onClick={() => handleDeleteStory(story.id)}
                      className={styles.deleteBtn}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'progress' && (
          <div className={styles.progressTable}>
            <table>
              <thead>
                <tr>
                  <th>User Email</th>
                  <th>Story ID</th>
                  <th>Current Chapter</th>
                  <th>Completed Chapters</th>
                  <th>Total Attempts</th>
                </tr>
              </thead>
              <tbody>
                {progress.map((prog, index) => (
                  <tr key={index}>
                    <td>{prog.email}</td>
                    <td>{prog.storyId}</td>
                    <td>{prog.currentChapter || 1}</td>
                    <td>{prog.completedChapters?.length || 0}</td>
                    <td>{prog.totalAttempts || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
