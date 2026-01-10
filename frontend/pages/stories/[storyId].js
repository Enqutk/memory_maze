import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { storiesAPI, progressAPI, userAPI } from '@/lib/api';
import NoteTaking from '@/components/NoteTaking';
import styles from '@/styles/Story.module.css';

export default function StoryPage() {
  const router = useRouter();
  const { storyId } = router.query;
  
  const [story, setStory] = useState(null);
  const [progress, setProgress] = useState(null);
  const [currentChapter, setCurrentChapter] = useState(null);
  const [chapterData, setChapterData] = useState(null);
  const [view, setView] = useState('map'); // 'map', 'reading', 'checkpoint', 'results'
  const [answers, setAnswers] = useState({});
  const [checkpointResults, setCheckpointResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBadge, setShowBadge] = useState(false);
  const [earnedBadge, setEarnedBadge] = useState(null);
  const [showNotes, setShowNotes] = useState(false);

  useEffect(() => {
    if (storyId) {
      loadStory();
      loadProgress();
    }
  }, [storyId]);

  const loadStory = async () => {
    try {
      const response = await storiesAPI.getById(storyId);
      setStory(response.data);
      setCurrentChapter(response.data.chapters[0]);
    } catch (error) {
      console.error('Error loading story:', error);
    }
  };

  const loadProgress = async () => {
    try {
      const response = await progressAPI.get(storyId);
      setProgress(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error loading progress:', error);
      setLoading(false);
    }
  };

  const loadChapter = async (chapterNumber) => {
    try {
      const response = await storiesAPI.getChapter(storyId, chapterNumber);
      setChapterData(response.data);
      setCurrentChapter(story.chapters.find(ch => ch.chapter === chapterNumber));
      setView('reading');
      setAnswers({});
    } catch (error) {
      console.error('Error loading chapter:', error);
    }
  };

  const handleFinishReading = () => {
    setView('checkpoint');
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers({ ...answers, [questionId]: value });
  };

  const handleSubmitCheckpoint = async (e) => {
    e.preventDefault();
    
    try {
      // Verify answers first
      const answerArray = chapterData.questions.map(q => answers[q.id] || '');
      const verifyResponse = await progressAPI.verifyAnswers(
        storyId,
        chapterData.chapter,
        answerArray
      );

      setCheckpointResults(verifyResponse.data);
      setView('results');

      // Update progress
      if (verifyResponse.data.passed) {
        await progressAPI.submitCheckpoint(
          storyId,
          chapterData.chapter,
          answerArray,
          verifyResponse.data.score
        );
        await loadProgress(); // Reload to get updated progress
        
        // Check if book is completed
        const updatedProgress = await progressAPI.get(storyId);
        if (updatedProgress.data.currentChapter > story.chapters.length) {
          // Book completed! Show badge
          try {
            const badgeResponse = await userAPI.addBadge(storyId, story.title);
            if (badgeResponse.data.isNew) {
              setEarnedBadge(badgeResponse.data.badge);
              setShowBadge(true);
              setTimeout(() => setShowBadge(false), 5000);
            }
          } catch (error) {
            console.error('Error adding badge:', error);
          }
        }
      }
    } catch (error) {
      console.error('Error submitting checkpoint:', error);
    }
  };

  const handleRetryReading = () => {
    setView('reading');
    setAnswers({});
    setCheckpointResults(null);
  };

  const handleNextChapter = () => {
    const nextChapterNum = chapterData.chapter + 1;
    if (nextChapterNum <= story.chapters.length) {
      loadChapter(nextChapterNum);
      setView('reading');
      setCheckpointResults(null);
    }
  };

  const handleRetryCheckpoint = () => {
    setView('checkpoint');
    setAnswers({});
    setCheckpointResults(null);
  };

  if (loading || !story || !progress) {
    return <div className={styles.loading}>Loading...</div>;
  }

  const isChapterUnlocked = (chapterNum) => {
    return progress.unlockedChapters.includes(chapterNum);
  };

  const getChapterAttempts = (chapterNum) => {
    return progress.attempts[`chapter${chapterNum}`] || 0;
  };

  const getChapterScore = (chapterNum) => {
    return progress.scores[`chapter${chapterNum}`] || null;
  };

  return (
    <div className={styles.container}>
      {showBadge && earnedBadge && (
        <div className={styles.badgeNotification}>
          <div className={styles.badgeContent}>
            <div className={styles.badgeIcon}>BADGE</div>
            <div className={styles.badgeText}>
              <h3>Congratulations!</h3>
              <p>You've completed "{earnedBadge.storyTitle}"!</p>
              <span className={styles.badgeEarned}>Badge Earned</span>
            </div>
            <button 
              className={styles.badgeClose}
              onClick={() => setShowBadge(false)}
            >
              ×
            </button>
          </div>
        </div>
      )}
      <header className={styles.header}>
        <button onClick={() => router.push('/stories')} className={styles.backBtn}>
          ← Back to Stories
        </button>
        <h2>{story.title}</h2>
        <div className={styles.progressInfo}>
          <div className={styles.progressBar}>
            <div 
              className={styles.progressFill}
              style={{ width: `${(progress.currentChapter / story.chapters.length) * 100}%` }}
            />
          </div>
          <span>Chapter {progress.currentChapter} of {story.chapters.length}</span>
        </div>
      </header>

      {view === 'map' && (
        <div className={styles.progressMap}>
          <h3>Your Progress</h3>
          <div className={styles.chaptersGrid}>
            {story.chapters.map((chapter) => {
              const unlocked = isChapterUnlocked(chapter.chapter);
              const attempts = getChapterAttempts(chapter.chapter);
              const score = getChapterScore(chapter.chapter);
              
              return (
                <div
                  key={chapter.chapter}
                  className={`${styles.chapterNode} ${
                    unlocked ? styles.unlocked : styles.locked
                  } ${chapter.chapter === progress.currentChapter ? styles.current : ''}`}
                  onClick={() => unlocked && loadChapter(chapter.chapter)}
                >
                  <div className={styles.chapterNumber}>{chapter.chapter}</div>
                  <div className={styles.chapterTitle}>{chapter.title}</div>
                  {attempts > 0 && (
                    <div className={styles.chapterMeta}>
                      <span>Attempts: {attempts}</span>
                      {score !== null && <span>Best: {score}%</span>}
                    </div>
                  )}
                  {!unlocked && <div className={styles.lockedBadge}>Locked</div>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {view === 'reading' && chapterData && (
        <div className={styles.chapterView}>
          <div className={styles.chapterHeader}>
            <h3>{chapterData.title}</h3>
            <div className={styles.chapterMeta}>
              <span>Chapter {chapterData.chapter}</span>
              {getChapterAttempts(chapterData.chapter) > 0 && (
                <span className={styles.attemptBadge}>
                  Attempt {getChapterAttempts(chapterData.chapter) + 1}
                </span>
              )}
            </div>
          </div>
          <div className={styles.chapterContent}>
            {chapterData.content.split('\n').map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))}
          </div>
          <div className={styles.readingActions}>
            <button 
              onClick={() => setShowNotes(true)} 
              className={styles.notesBtn}
            >
              Take Notes
            </button>
            <button onClick={handleFinishReading} className={styles.finishBtn}>
              I've Finished Reading
            </button>
          </div>
          {showNotes && (
            <NoteTaking
              storyId={storyId}
              chapterNumber={chapterData.chapter}
              onClose={() => setShowNotes(false)}
            />
          )}
        </div>
      )}

      {view === 'checkpoint' && chapterData && (
        <div className={styles.checkpointView}>
          <div className={styles.checkpointHeader}>
            <h3>Memory Checkpoint</h3>
            <p>Answer these questions to unlock the next chapter</p>
          </div>
          <form onSubmit={handleSubmitCheckpoint} className={styles.checkpointForm}>
            {chapterData.questions.map((question, idx) => (
              <div key={question.id} className={styles.questionGroup}>
                <label>
                  {idx + 1}. {question.question}
                </label>
                <input
                  type="text"
                  value={answers[question.id] || ''}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  placeholder="Your answer..."
                  required
                />
              </div>
            ))}
            <div className={styles.checkpointActions}>
              <button type="submit" className={styles.btnPrimary}>
                Submit Answers
              </button>
              <button
                type="button"
                onClick={handleRetryReading}
                className={styles.btnSecondary}
              >
                Reread Chapter
              </button>
            </div>
          </form>
        </div>
      )}

      {view === 'results' && checkpointResults && (
        <div className={styles.resultsView}>
          <div className={styles.resultsContent}>
            <h3>
              {checkpointResults.passed ? '✓ You Passed!' : '✗ Try Again'}
            </h3>
            <div className={styles.scoreDisplay}>
              Your Score: {checkpointResults.score}%
              {checkpointResults.passed ? (
                <span className={styles.passedBadge}>Unlocked Next Chapter!</span>
              ) : (
                <span className={styles.failedBadge}>Need 70% to Pass</span>
              )}
            </div>
            <div className={styles.resultsDetails}>
              {checkpointResults.results.map((result, idx) => (
                <div
                  key={idx}
                  className={`${styles.resultItem} ${
                    result.isCorrect ? styles.correct : styles.incorrect
                  }`}
                >
                  <span className={styles.resultIcon}>
                    {result.isCorrect ? '✓' : '✗'}
                  </span>
                  <div className={styles.resultText}>
                    <div>Your answer: {result.userAnswer || '(empty)'}</div>
                    {!result.isCorrect && (
                      <div className={styles.correctAnswer}>
                        Correct: {result.correctAnswer}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className={styles.resultsActions}>
            {checkpointResults.passed ? (
              <button onClick={handleNextChapter} className={styles.btnPrimary}>
                Continue to Next Chapter
              </button>
            ) : (
              <button onClick={handleRetryCheckpoint} className={styles.btnSecondary}>
                Try Again
              </button>
            )}
            <button onClick={() => setView('map')} className={styles.btnSecondary}>
              Back to Map
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
