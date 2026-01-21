import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { storiesAPI, userAPI } from '@/lib/api';
import { logout, isAdmin } from '@/lib/auth';
import AIChat from '@/components/AIChat';
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
  const [chatOpen, setChatOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [sortBy, setSortBy] = useState('title');

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

  const handleBookSelect = (bookTitle) => {
    const story = stories.find(s => s.title.toLowerCase() === bookTitle.toLowerCase());
    if (story) {
      router.push(`/stories/${story.id}`);
      setChatOpen(false);
    }
  };

  // Filter and sort stories
  const getFilteredStories = () => {
    let filtered = [...stories];

    // Filter by tab (all or saved)
    if (activeTab === 'saved') {
      filtered = filtered.filter(s => savedBooks.includes(s.id));
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(s => 
        s.title.toLowerCase().includes(query) ||
        s.description.toLowerCase().includes(query)
      );
    }

    // Filter by difficulty
    if (difficultyFilter !== 'all') {
      filtered = filtered.filter(s => s.difficulty === difficultyFilter);
    }

    // Sort stories
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'title':
          return a.title.localeCompare(b.title);
        case 'difficulty':
          const difficultyOrder = { easy: 1, medium: 2, hard: 3 };
          return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
        case 'chapters':
          return b.totalChapters - a.totalChapters;
        default:
          return 0;
      }
    });

    return filtered;
  };

  const filteredStories = getFilteredStories();

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
          <button 
            onClick={() => setChatOpen(!chatOpen)} 
            className={styles.chatBtn}
          >
            KimemAI
          </button>
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
            <div className={`${styles.dashboardCard} ${styles.streakCard}`}>
              <div className={styles.streakIconWrapper}>
                <div className={styles.streakFlame}>
                  {stats?.currentStreak > 0 ? '🔥' : '📚'}
                </div>
                <div className={styles.streakBadge}>{stats?.currentStreak || 0}</div>
              </div>
              <div className={styles.dashboardContent}>
                <div className={styles.streakHeader}>
                  <span className={styles.streakLabel}>Reading Streak</span>
                  {stats?.currentStreak > 0 && (
                    <span className={styles.streakDays}>{stats.currentStreak} {stats.currentStreak === 1 ? 'day' : 'days'}</span>
                  )}
                </div>
                {stats?.currentStreak > 0 && (
                  <>
                    <div className={styles.streakBar}>
                      <div 
                        className={styles.streakFill}
                        style={{ width: `${Math.min((stats.currentStreak / 30) * 100, 100)}%` }}
                      />
                    </div>
                    <div className={styles.streakProgress}>
                      <span>{Math.min(stats.currentStreak, 30)} / 30 days</span>
                      <span className={styles.streakGoal}>30-day goal</span>
                    </div>
                  </>
                )}
                {stats?.currentStreak === 0 && (
                  <p className={styles.streakMessage}>Start reading to build your streak! 📚</p>
                )}
              </div>
            </div>
            <div className={`${styles.dashboardCard} ${styles.booksCard}`}>
              <div className={styles.cardIconWrapper}>
                <div className={styles.cardIcon}>📚</div>
              </div>
              <div className={styles.dashboardContent}>
                <div className={styles.dashboardValue}>{stats?.totalBooksRead || 0}</div>
                <div className={styles.dashboardLabel}>Books Completed</div>
                {stats?.totalBooksRead > 0 && (
                  <div className={styles.cardFooter}>
                    <span className={styles.cardFooterText}>Keep reading! ⭐</span>
                  </div>
                )}
              </div>
            </div>
            <div className={`${styles.dashboardCard} ${styles.chaptersCard}`}>
              <div className={styles.cardIconWrapper}>
                <div className={styles.cardIcon}>📖</div>
              </div>
              <div className={styles.dashboardContent}>
                <div className={styles.dashboardValue}>{stats?.totalChaptersRead || 0}</div>
                <div className={styles.dashboardLabel}>Chapters Read</div>
                {stats?.totalChaptersRead > 0 && (
                  <div className={styles.cardFooter}>
                    <span className={styles.cardFooterText}>Great progress! ⭐</span>
                  </div>
                )}
              </div>
            </div>
            <div className={`${styles.dashboardCard} ${styles.badgesCard}`}>
              <div className={styles.cardIconWrapper}>
                <div className={styles.cardIcon}>🏅</div>
              </div>
              <div className={styles.dashboardContent}>
                <div className={styles.dashboardValue}>{badges.length}</div>
                <div className={styles.dashboardLabel}>Badges Earned</div>
                {badges.length > 0 && (
                  <div className={styles.cardFooter}>
                    <span className={styles.cardFooterText}>Amazing achievements! ⭐</span>
                  </div>
                )}
                {badges.length === 0 && (
                  <div className={styles.cardFooter}>
                    <span className={styles.cardFooterText}>Complete books to earn badges!</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className={styles.storySelection}>
        <div className={styles.sectionHeader}>
          <h2>Choose Your Adventure</h2>
          <div className={styles.tabs}>
            <button 
              className={`${styles.tab} ${activeTab === 'all' ? styles.active : ''}`}
              onClick={() => setActiveTab('all')}
            >
              All Stories ({stories.length})
            </button>
            <button 
              className={`${styles.tab} ${activeTab === 'saved' ? styles.active : ''}`}
              onClick={() => setActiveTab('saved')}
            >
              Saved ({savedBooks.length})
            </button>
          </div>
        </div>

        <div className={styles.searchAndFilters}>
          <div className={styles.searchContainer}>
            <input
              type="text"
              placeholder="Search books by title or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>
          <div className={styles.filtersContainer}>
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="all">All Difficulties</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="title">Sort by Title</option>
              <option value="difficulty">Sort by Difficulty</option>
              <option value="chapters">Sort by Chapters</option>
            </select>
          </div>
        </div>

        {filteredStories.length === 0 ? (
          <div className={styles.noResults}>
            <p>No books found matching your criteria.</p>
            {(searchQuery || difficultyFilter !== 'all') && (
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setDifficultyFilter('all');
                }}
                className={styles.clearFiltersBtn}
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className={styles.storiesGrid}>
            {filteredStories.map((story) => {
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
                  {badges.some(b => b.storyId === story.id && b.type === 'excellent_score') && (
                    <span className={styles.greenBadge}>Excellent ⭐</span>
                  )}
                  {badges.some(b => b.storyId === story.id && b.type === 'book_completed') && (
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
        )}
      </div>

      <AIChat 
        isOpen={chatOpen} 
        onClose={() => setChatOpen(false)}
        onBookSelect={handleBookSelect}
      />
    </div>
  );
}
