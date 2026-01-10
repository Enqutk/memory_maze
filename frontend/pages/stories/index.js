import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { storiesAPI, userAPI } from '@/lib/api';
import { logout, isAdmin } from '@/lib/auth';
import styles from '@/styles/Stories.module.css';

export default function StoriesPage() {
  const router = useRouter();
  const [stories, setStories] = useState([]);
  const [savedBooks, setSavedBooks] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [showDashboard, setShowDashboard] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }

    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [storiesResponse, profileResponse] = await Promise.all([
        storiesAPI.getAll(),
        userAPI.getProfile()
      ]);
      
      setStories(storiesResponse.data);
      setUserProfile(profileResponse.data.profile);
      setStats(profileResponse.data.stats);
      setBadges(profileResponse.data.badges || []);
      setSavedBooks(profileResponse.data.savedBooks || []);
      // Update user data with role if available
      if (profileResponse.data.role) {
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        localStorage.setItem('user', JSON.stringify({ ...currentUser, role: profileResponse.data.role }));
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStorySelect = (storyId) => {
    router.push(`/stories/${storyId}`);
  };

  const handleSaveBook = async (e, storyId) => {
    e.stopPropagation();
    try {
      if (savedBooks.includes(storyId)) {
        await userAPI.unsaveBook(storyId);
        setSavedBooks(savedBooks.filter(id => id !== storyId));
      } else {
        await userAPI.saveBook(storyId);
        setSavedBooks([...savedBooks, storyId]);
      }
    } catch (error) {
      console.error('Error saving book:', error);
    }
  };

  const handleLogout = () => {
    logout();
  };

  if (loading) {
    return <div className={styles.loading}>Loading stories...</div>;
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.logo}>Memory Maze</h1>
          <button 
            onClick={() => setShowDashboard(!showDashboard)}
            className={styles.dashboardToggle}
          >
            {showDashboard ? 'Hide Stats' : 'Show Stats'}
          </button>
        </div>
        <div className={styles.userInfo}>
          {isAdmin() && (
            <button 
              onClick={() => router.push('/admin')} 
              className={styles.adminBtn}
            >
              Admin
            </button>
          )}
          <button 
            onClick={() => router.push('/profile')} 
            className={styles.profileBtn}
          >
            {userProfile?.username || userProfile?.name || user?.email?.split('@')[0] || 'Profile'}
          </button>
          <button onClick={handleLogout} className={styles.logoutBtn}>
            Logout
          </button>
        </div>
      </header>

      {showDashboard && (
        <div className={styles.dashboard}>
          <div className={styles.dashboardGrid}>
            <div className={styles.dashboardCard}>
              <div className={styles.dashboardIcon}>STREAK</div>
              <div className={styles.dashboardContent}>
                <div className={styles.dashboardValue}>{stats?.currentStreak || 0}</div>
                <div className={styles.dashboardLabel}>Day Streak</div>
                {stats?.currentStreak > 0 && (
                  <div className={styles.streakBar}>
                    <div 
                      className={styles.streakFill}
                      style={{ width: `${Math.min((stats.currentStreak / 30) * 100, 100)}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
            <div className={styles.dashboardCard}>
              <div className={styles.dashboardIcon}>BOOKS</div>
              <div className={styles.dashboardContent}>
                <div className={styles.dashboardValue}>{stats?.totalBooksRead || 0}</div>
                <div className={styles.dashboardLabel}>Books Completed</div>
              </div>
            </div>
            <div className={styles.dashboardCard}>
              <div className={styles.dashboardIcon}>CHAPTERS</div>
              <div className={styles.dashboardContent}>
                <div className={styles.dashboardValue}>{stats?.totalChaptersRead || 0}</div>
                <div className={styles.dashboardLabel}>Chapters Read</div>
              </div>
            </div>
            <div className={styles.dashboardCard}>
              <div className={styles.dashboardIcon}>BADGES</div>
              <div className={styles.dashboardContent}>
                <div className={styles.dashboardValue}>{badges.length}</div>
                <div className={styles.dashboardLabel}>Badges Earned</div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={styles.storySelection}>
        <div className={styles.sectionHeader}>
          <h2>Choose Your Adventure</h2>
          <div className={styles.tabs}>
            <button className={`${styles.tab} ${styles.active}`}>All Stories</button>
            <button 
              className={styles.tab}
              onClick={() => {
                const saved = stories.filter(s => savedBooks.includes(s.id));
                // You can add filtering logic here
              }}
            >
              Saved ({savedBooks.length})
            </button>
          </div>
        </div>
        <div className={styles.storiesGrid}>
          {stories.map((story) => {
            const isSaved = savedBooks.includes(story.id);
            return (
              <div
                key={story.id}
                className={styles.storyCard}
                onClick={() => handleStorySelect(story.id)}
              >
                <div className={styles.storyCardHeader}>
                  <h3>{story.title}</h3>
                  <button
                    className={`${styles.saveBtn} ${isSaved ? styles.saved : ''}`}
                    onClick={(e) => handleSaveBook(e, story.id)}
                    title={isSaved ? 'Remove from saved' : 'Save for later'}
                  >
                    {isSaved ? 'Saved' : 'Save'}
                  </button>
                </div>
                <p className={styles.storyDescription}>{story.description}</p>
                <div className={styles.storyMeta}>
                  <span className={`${styles.difficulty} ${styles[story.difficulty]}`}>
                    {story.difficulty}
                  </span>
                  <span className={styles.chapters}>
                    {story.totalChapters} chapters
                  </span>
                  {badges.some(b => b.storyId === story.id) && (
                    <span className={styles.completedBadge}>Completed</span>
                  )}
                </div>
                <div className={styles.storyFooter}>
                  <button className={styles.readBtn}>
                    Start Reading →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
