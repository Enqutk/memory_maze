import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { userAPI } from '@/lib/api';
import styles from '@/styles/Profile.module.css';

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [settings, setSettings] = useState(null);
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await userAPI.getProfile();
      setProfile(response.data.profile);
      setStats(response.data.stats);
      setSettings(response.data.settings);
      setBadges(response.data.badges || []);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const formData = new FormData(e.target);
      const profileData = {
        username: formData.get('username'),
        name: formData.get('name'),
        bio: formData.get('bio'),
        theme: formData.get('theme'),
      };

      await userAPI.updateProfile(profileData);
      await loadProfile();
      setMessage('Profile updated successfully!');
      setIsEditingProfile(false);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(error.response?.data?.error || 'Error updating profile');
    } finally {
      setSaving(false);
    }
  };

  const handleSettingsUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const formData = new FormData(e.target);
      const settingsData = {
        notifications: formData.get('notifications') === 'on',
        dailyReminder: formData.get('dailyReminder') === 'on',
        readingGoal: parseInt(formData.get('readingGoal')) || 1,
      };

      await userAPI.updateSettings(settingsData);
      await loadProfile();
      setMessage('Settings updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error updating settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading profile...</div>;
  }

  const getLevel = () => {
    const totalPoints = (stats?.totalBooksRead || 0) * 100 + (stats?.totalChaptersRead || 0) * 10;
    return Math.floor(totalPoints / 500) + 1;
  };

  const getRank = () => {
    const level = getLevel();
    if (level >= 50) return 'LEGEND';
    if (level >= 30) return 'MASTER';
    if (level >= 20) return 'EXPERT';
    if (level >= 10) return 'ADVANCED';
    if (level >= 5) return 'INTERMEDIATE';
    return 'BEGINNER';
  };

  return (
    <div className={styles.container}>
      <button onClick={() => router.push('/stories')} className={styles.backBtn}>
        ← Back
      </button>

      {message && (
        <div className={`${styles.message} ${message.includes('Error') ? styles.error : ''}`}>
          {message}
        </div>
      )}

      {/* Profile Header - Telegram Style */}
      <div className={styles.profileHeader}>
        <div className={styles.avatarSection}>
          <div className={styles.avatarContainer}>
            <div className={styles.avatar}>
              {profile?.username?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className={styles.statusIndicator}></div>
          </div>
          <div className={styles.profileInfo}>
            <h1 className={styles.profileName}>{profile?.username || profile?.name || 'User'}</h1>
            <p className={styles.profileSubtitle}>{profile?.name || profile?.username || 'Reader'}</p>
            <div className={styles.rankBadge}>
              <span className={styles.rankText}>{getRank()}</span>
              <span className={styles.levelText}>Level {getLevel()}</span>
            </div>
          </div>
        </div>
        <div className={styles.bioSection}>
          <p>{profile?.bio || 'No bio added yet. Click Edit Profile to add one.'}</p>
        </div>
      </div>

      {/* Stats Section - PUBG Style */}
      <div className={styles.statsSection}>
        <h2 className={styles.sectionTitle}>STATISTICS</h2>
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <span className={styles.statLabel}>Books Completed</span>
              <span className={styles.statValue}>{stats?.totalBooksRead || 0}</span>
            </div>
            <div className={styles.statBar}>
              <div 
                className={styles.statBarFill}
                style={{ width: `${Math.min(((stats?.totalBooksRead || 0) / 10) * 100, 100)}%` }}
              />
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <span className={styles.statLabel}>Chapters Read</span>
              <span className={styles.statValue}>{stats?.totalChaptersRead || 0}</span>
            </div>
            <div className={styles.statBar}>
              <div 
                className={styles.statBarFill}
                style={{ width: `${Math.min(((stats?.totalChaptersRead || 0) / 50) * 100, 100)}%` }}
              />
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <span className={styles.statLabel}>Current Streak</span>
              <span className={styles.statValue}>{stats?.currentStreak || 0} days</span>
            </div>
            <div className={styles.statBar}>
              <div 
                className={styles.statBarFill}
                style={{ width: `${Math.min(((stats?.currentStreak || 0) / 30) * 100, 100)}%` }}
              />
            </div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statHeader}>
              <span className={styles.statLabel}>Longest Streak</span>
              <span className={styles.statValue}>{stats?.longestStreak || 0} days</span>
            </div>
            <div className={styles.statBar}>
              <div 
                className={styles.statBarFill}
                style={{ width: `${Math.min(((stats?.longestStreak || 0) / 30) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs - Telegram Style */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'profile' ? styles.active : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          Profile
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'badges' ? styles.active : ''}`}
          onClick={() => setActiveTab('badges')}
        >
          Badges
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'settings' ? styles.active : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          Settings
        </button>
      </div>

      {/* Content Sections */}
      {activeTab === 'profile' && (
        <div className={styles.contentCard}>
          {!isEditingProfile ? (
            <>
              <div className={styles.profileView}>
                <div className={styles.profileViewHeader}>
                  <h2 className={styles.sectionTitle}>PROFILE INFORMATION</h2>
                  <button 
                    onClick={() => setIsEditingProfile(true)} 
                    className={styles.editBtn}
                  >
                    Edit Profile
                  </button>
                </div>
                <div className={styles.profileInfoGrid}>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Username</span>
                    <span className={styles.infoValue}>{profile?.username || 'Not set'}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Display Name</span>
                    <span className={styles.infoValue}>{profile?.name || 'Not set'}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Bio</span>
                    <span className={styles.infoValue}>{profile?.bio || 'No bio added yet'}</span>
                  </div>
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Theme</span>
                    <span className={styles.infoValue}>
                      {profile?.theme ? profile.theme.charAt(0).toUpperCase() + profile.theme.slice(1) : 'Light'}
                    </span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <form onSubmit={handleProfileUpdate} className={styles.form}>
              <div className={styles.formHeader}>
                <h2 className={styles.sectionTitle}>EDIT PROFILE</h2>
                <button 
                  type="button"
                  onClick={() => setIsEditingProfile(false)} 
                  className={styles.cancelBtn}
                >
                  Cancel
                </button>
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  defaultValue={profile?.username || ''}
                  placeholder="Choose a unique username"
                  pattern="[a-zA-Z0-9_]{3,20}"
                  title="Username must be 3-20 characters and can only contain letters, numbers, and underscores"
                  required
                />
                <small className={styles.helpText}>
                  3-20 characters, letters, numbers, and underscores only
                </small>
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="name">Display Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  defaultValue={profile?.name || ''}
                  placeholder="Your display name"
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="bio">Bio</label>
                <textarea
                  id="bio"
                  name="bio"
                  defaultValue={profile?.bio || ''}
                  placeholder="Tell us about yourself..."
                  rows="4"
                />
              </div>
              <div className={styles.formGroup}>
                <label htmlFor="theme">Theme</label>
                <select id="theme" name="theme" defaultValue={profile?.theme || 'light'}>
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="auto">Auto</option>
                </select>
              </div>
              <div className={styles.formActions}>
                <button 
                  type="button"
                  onClick={() => setIsEditingProfile(false)} 
                  className={styles.cancelBtn}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.saveBtn} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {activeTab === 'badges' && (
        <div className={styles.contentCard}>
          <div className={styles.badgesSection}>
            <h2 className={styles.sectionTitle}>ACHIEVEMENTS</h2>
            {badges.length === 0 ? (
              <div className={styles.noBadges}>
                <div className={styles.noBadgesIcon}>BADGE</div>
                <p>Complete books to earn badges!</p>
              </div>
            ) : (
              <div className={styles.badgesGrid}>
                {badges.map((badge) => (
                  <div key={badge.id} className={styles.badgeCard}>
                    <div className={styles.badgeIcon}>BADGE</div>
                    <div className={styles.badgeContent}>
                      <div className={styles.badgeTitle}>{badge.storyTitle}</div>
                      <div className={styles.badgeDate}>
                        {new Date(badge.earnedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className={styles.contentCard}>
          <form onSubmit={handleSettingsUpdate} className={styles.form}>
            <div className={styles.settingItem}>
              <div className={styles.settingInfo}>
                <label htmlFor="notifications" className={styles.settingLabel}>
                  Enable Notifications
                </label>
                <span className={styles.settingDescription}>
                  Receive updates about your reading progress
                </span>
              </div>
              <label className={styles.toggle}>
                <input
                  type="checkbox"
                  name="notifications"
                  defaultChecked={settings?.notifications}
                />
                <span className={styles.toggleSlider}></span>
              </label>
            </div>
            <div className={styles.settingItem}>
              <div className={styles.settingInfo}>
                <label htmlFor="dailyReminder" className={styles.settingLabel}>
                  Daily Reading Reminder
                </label>
                <span className={styles.settingDescription}>
                  Get reminded to read every day
                </span>
              </div>
              <label className={styles.toggle}>
                <input
                  type="checkbox"
                  name="dailyReminder"
                  defaultChecked={settings?.dailyReminder}
                />
                <span className={styles.toggleSlider}></span>
              </label>
            </div>
            <div className={styles.settingItem}>
              <div className={styles.settingInfo}>
                <label htmlFor="readingGoal" className={styles.settingLabel}>
                  Daily Reading Goal
                </label>
                <span className={styles.settingDescription}>
                  Number of chapters to read per day
                </span>
              </div>
              <input
                type="number"
                id="readingGoal"
                name="readingGoal"
                min="1"
                max="10"
                defaultValue={settings?.readingGoal || 1}
                className={styles.goalInput}
              />
            </div>
            <button type="submit" className={styles.saveBtn} disabled={saving}>
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
