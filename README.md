# Memory Maze - Find the Truth

A story-based web application where progress depends on memory, not clicks. Users must correctly answer memory-based questions to unlock the next chapter of a story.

## 🎯 Project Overview

Memory Maze is an interactive storytelling application that encourages deep reading and memory retention. Unlike traditional reading apps, progression is locked behind memory-based checkpoints. Users must correctly answer questions related to previous chapters to unlock the next part of the story.

## 🚀 Tech Stack

- **Frontend**: Next.js 14 (React)
- **Backend**: Node.js with Express
- **Authentication**: JWT tokens
- **Data Storage**: JSON files (easily upgradeable to database)
- **Styling**: CSS Modules

## 📁 Project Structure

```
memory_maze/
├── frontend/                 # Next.js application
│   ├── pages/               # Next.js pages
│   │   ├── index.js        # Authentication page
│   │   └── stories/        # Story pages
│   ├── styles/             # CSS modules
│   ├── lib/                # API utilities and helpers
│   └── package.json
├── backend/                 # Node.js Express API
│   ├── routes/             # API routes
│   │   ├── auth.js         # Authentication endpoints
│   │   ├── stories.js      # Story endpoints
│   │   └── progress.js     # Progress tracking endpoints
│   ├── data/               # JSON data storage
│   │   ├── users/          # User data
│   │   ├── stories/        # Story content
│   │   └── progress/       # User progress
│   ├── server.js           # Express server
│   └── package.json
└── package.json            # Root package.json
```

## 🛠️ Installation

### Prerequisites
- Node.js 18+ and npm

### Setup

1. **Install all dependencies:**
   ```bash
   npm run install:all
   ```

2. **Configure environment variables:**
   ```bash
   node setup-env.js
   ```
   
   This automatically creates:
   - `backend/.env` with a secure JWT_SECRET
   - `frontend/.env.local` with API URL
   
   Or manually:
   ```bash
   cd backend
   cp env.example .env
   # Edit .env and set your JWT_SECRET
   ```

3. **Start development servers:**
   ```bash
   npm run dev
   ```

   This will start:
   - Frontend: http://localhost:3000
   - Backend: http://localhost:5000

## 📚 Available Stories

The application comes with **6 complete stories**:

1. **Find the Truth** (Medium) - A mysterious adventure where memory is your only guide
2. **Who Moved My Cheese** (Easy) - A timeless parable about change and adaptation  
3. **The Alchemist** (Medium) - A shepherd's journey to find his Personal Legend
4. **The Little Prince** (Medium) - Profound wisdom about life, love, and what truly matters
5. **Animal Farm** (Hard) - A farm where animals rebel, but power corrupts
6. **The Great Gatsby** (Hard) - A tale of love, wealth, and the American Dream

Each story has 5 chapters with memory-based questions to unlock progression.

## 📚 Features

### Core Features

1. **User Authentication**
   - Email/password registration
   - Secure login with JWT tokens
   - Session persistence

2. **Story Library**
   - Browse available stories
   - View story metadata (difficulty, chapters)

3. **Chapter-Based Reading**
   - Read chapters one at a time
   - Only unlocked chapters are accessible
   - Chapter 1 always unlocked

4. **Memory Checkpoints**
   - Answer 3-5 questions after each chapter
   - 70% passing score required
   - Instant feedback on answers
   - Must pass to unlock next chapter

5. **Progress Tracking**
   - Track current chapter
   - Count attempts per chapter
   - Store best scores
   - Visual progress map

6. **Visual Progress Map**
   - See all chapters at a glance
   - Visual indicators for:
     - Completed chapters
     - Current chapter
     - Locked chapters
   - Attempt counts and scores displayed

## 🎮 How It Works

1. **User Registration/Login**
   - Create an account or log in
   - Authentication token stored in localStorage

2. **Select a Story**
   - Browse available stories
   - Click to start reading

3. **Read Chapter**
   - Read the chapter content carefully
   - Click "I've Finished Reading" when done

4. **Memory Checkpoint**
   - Answer questions about what you read
   - Submit answers for evaluation

5. **Results & Progress**
   - See your score and which answers were correct
   - If score ≥ 70%: Next chapter unlocks
   - If score < 70%: Must retry the checkpoint

6. **Continue Journey**
   - Progress automatically saved
   - Resume from last unlocked chapter
   - Track improvement over attempts

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Stories
- `GET /api/stories` - Get all stories
- `GET /api/stories/:storyId` - Get story details
- `GET /api/stories/:storyId/chapters/:chapterNumber` - Get chapter content

### Progress
- `GET /api/progress/:storyId` - Get user progress
- `POST /api/progress/:storyId/checkpoint` - Submit checkpoint results
- `POST /api/progress/:storyId/verify` - Verify answers (without saving)

## 📝 Story Data Format

Stories are stored as JSON files in `backend/data/stories/`:

```json
{
  "id": "story-id",
  "title": "Story Title",
  "description": "Story description",
  "difficulty": "medium",
  "chapters": [
    {
      "chapter": 1,
      "title": "Chapter Title",
      "content": "Chapter text content...",
      "questions": [
        {
          "id": "q1-1",
          "question": "What color was the door?",
          "type": "text",
          "answer": "red"
        }
      ]
    }
  ]
}
```

## 🎨 UI Features

- Modern, clean interface
- Responsive design
- Visual progress indicators
- Real-time feedback
- Smooth transitions
- Accessible forms and buttons

## 🔒 Security

- Passwords hashed with bcrypt
- JWT token authentication
- Protected API routes
- Input validation

## 🚀 Deployment

### Frontend (Vercel/Netlify)
```bash
cd frontend
npm run build
# Deploy the .next folder
```

### Backend (Heroku/Railway/DigitalOcean)
```bash
cd backend
# Set environment variables
# Deploy with Node.js support
```

## 📈 Future Enhancements

- [ ] Database integration (MongoDB/PostgreSQL)
- [ ] Multiple question types (multiple choice, true/false)
- [ ] Timed recall challenges
- [ ] Leaderboards
- [ ] User-generated stories
- [ ] Audio narration
- [ ] Mobile app version
- [ ] Teacher dashboard
- [ ] Difficulty-based scoring
- [ ] Social features

## 🤝 Contributing

This is a portfolio project demonstrating:
- Full-stack development
- API design
- State management
- User experience design
- Problem-solving logic

## 📄 License

MIT License

## 👤 Author

Built as a portfolio project to demonstrate full-stack development skills and creative problem-solving.

---

**Remember: The truth lies in what you remember, not what you see.**
