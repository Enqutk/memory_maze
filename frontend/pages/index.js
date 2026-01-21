import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { authAPI } from '@/lib/api';
import { setAuthToken } from '@/lib/auth';
import styles from '@/styles/Auth.module.css';

export default function Home() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('login');
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Redirect if already authenticated
    const token = localStorage.getItem('token');
    if (token) {
      router.push('/stories');
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = activeTab === 'login'
        ? await authAPI.login(formData.email, formData.password)
        : await authAPI.register(formData.email, formData.password);

      setAuthToken(response.data.token);
      // Ensure user data is properly stored with role
      const userData = response.data.user || { email: formData.email, role: 'user' };
      localStorage.setItem('user', JSON.stringify(userData));
      router.push('/stories');
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authScreen}>
      <div className={styles.heroBackground}>
        <div className={styles.bookIllustration}></div>
      </div>
      <div className={styles.authContainer}>
        <div className={styles.logoSection}>
          <div className={styles.bookIcon}>📚</div>
          <h1 className={styles.appTitle}>Memory Maze</h1>
          <div className={styles.divider}></div>
        </div>
        <p className={styles.appSubtitle}>A Journey Through Literature</p>
        <p className={styles.appDescription}>
          Engage with stories, strengthen your memory, and unlock knowledge through thoughtful reading and reflection.
        </p>

        <div className={styles.authTabs}>
          <button
            className={`${styles.tabBtn} ${activeTab === 'login' ? styles.active : ''}`}
            onClick={() => {
              setActiveTab('login');
              setError('');
            }}
          >
            Login
          </button>
          <button
            className={`${styles.tabBtn} ${activeTab === 'register' ? styles.active : ''}`}
            onClick={() => {
              setActiveTab('register');
              setError('');
            }}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.authForm}>
          <div className={styles.formGroup}>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              minLength={activeTab === 'register' ? 6 : undefined}
            />
          </div>
          {error && <div className={styles.errorMessage}>{error}</div>}
          <button type="submit" className={styles.btnPrimary} disabled={loading}>
            {loading ? 'Loading...' : activeTab === 'login' ? 'Login' : 'Register'}
          </button>
        </form>
      </div>
    </div>
  );
}
