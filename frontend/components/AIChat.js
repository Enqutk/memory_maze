import { useState, useEffect, useRef } from 'react';
import { chatAPI } from '@/lib/api';
import styles from '@/styles/AIChat.module.css';

export default function AIChat({ isOpen, onClose, onBookSelect }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      // Initialize with welcome message
      if (messages.length === 0) {
        setMessages([{
          role: 'assistant',
          content: "Hi! I'm your AI reading assistant. I can help you discover new books, discuss what you're reading, or answer questions about stories. What would you like to explore?"
        }]);
      }
      // Focus input when opened
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    
    // Add user message
    const newMessages = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);
    setLoading(true);

    try {
      // Get conversation history (last 10 messages)
      const conversationHistory = newMessages
        .slice(-10)
        .map(msg => ({ role: msg.role, content: msg.content }));

      const response = await chatAPI.sendMessage(userMessage, conversationHistory);
      
      // Add AI response
      setMessages([...newMessages, {
        role: 'assistant',
        content: response.data.response
      }]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Sorry, I encountered an error.';
      setMessages([...newMessages, {
        role: 'assistant',
        content: errorMessage + (errorMessage.includes('API key') ? ' Add OPENAI_API_KEY to your backend/.env file and restart the server.' : '')
      }]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleGetRecommendations = async () => {
    setLoadingRecommendations(true);
    setShowRecommendations(true);
    
    try {
      const response = await chatAPI.getRecommendations();
      setRecommendations(response.data.recommendations || []);
      
      // Add recommendation message to chat
      const recMessage = `Here are some book recommendations for you:\n\n${response.data.recommendations.map((rec, idx) => 
        `${idx + 1}. **${rec.title}** (${rec.difficulty})\n   ${rec.reason}`
      ).join('\n\n')}`;
      
      setMessages([...messages, {
        role: 'assistant',
        content: recMessage
      }]);
    } catch (error) {
      console.error('Recommendations error:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Sorry, I couldn\'t fetch recommendations right now.';
      setMessages([...messages, {
        role: 'assistant',
        content: errorMessage + (errorMessage.includes('API key') ? ' Add OPENAI_API_KEY to your backend/.env file and restart the server.' : '')
      }]);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const handleBookClick = (bookTitle) => {
    if (onBookSelect) {
      onBookSelect(bookTitle);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.chatContainer}>
      <div className={styles.chatHeader}>
        <div className={styles.headerInfo}>
          <h3>AI Reading Assistant</h3>
          <span className={styles.subtitle}>Ask me about books or get recommendations</span>
        </div>
        <div className={styles.headerActions}>
          <button 
            onClick={handleGetRecommendations}
            className={styles.recommendBtn}
            disabled={loadingRecommendations}
          >
            {loadingRecommendations ? 'Loading...' : 'Get Recommendations'}
          </button>
          <button onClick={onClose} className={styles.closeBtn}>×</button>
        </div>
      </div>

      <div className={styles.messagesContainer}>
        {messages.map((message, index) => (
          <div
            key={index}
            className={`${styles.message} ${styles[message.role]}`}
          >
            <div className={styles.messageContent}>
              {message.content.split('\n').map((line, i) => {
                // Check if line contains book title pattern
                const bookMatch = line.match(/\*\*([^*]+)\*\*/);
                if (bookMatch && onBookSelect) {
                  const parts = line.split(/\*\*/);
                  return (
                    <p key={i}>
                      {parts.map((part, j) => {
                        if (j % 2 === 1) {
                          return (
                            <button
                              key={j}
                              className={styles.bookLink}
                              onClick={() => handleBookClick(part)}
                            >
                              {part}
                            </button>
                          );
                        }
                        return part;
                      })}
                    </p>
                  );
                }
                return <p key={i}>{line || '\u00A0'}</p>;
              })}
            </div>
          </div>
        ))}
        
        {loading && (
          <div className={`${styles.message} ${styles.assistant}`}>
            <div className={styles.messageContent}>
              <div className={styles.typingIndicator}>
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className={styles.inputContainer}>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about books, get recommendations, or discuss what you're reading..."
          className={styles.input}
          disabled={loading}
        />
        <button
          type="submit"
          className={styles.sendBtn}
          disabled={loading || !input.trim()}
        >
          Send
        </button>
      </form>
    </div>
  );
}
