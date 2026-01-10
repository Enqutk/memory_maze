# Memory Maze - Complete Setup Documentation

## 📋 Prerequisites

- **Node.js**: Version 18 or higher
- **npm**: Comes with Node.js
- **Git**: For version control (optional)

## 🏗️ Architecture Overview

### Frontend (Next.js)
- **Framework**: Next.js 14 with React
- **Port**: 3000 (default)
- **Styling**: CSS Modules
- **State Management**: React hooks + localStorage
- **API Client**: Axios

### Backend (Node.js/Express)
- **Framework**: Express.js
- **Port**: 5000 (default)
- **Authentication**: JWT tokens
- **Password Hashing**: bcryptjs
- **Data Storage**: JSON files (MVP - easily upgradeable to database)

## 📦 Installation Steps

### 1. Clone/Navigate to Project
```bash
cd memory_maze
```

### 2. Install All Dependencies
```bash
npm run install:all
```

This command installs:
- Root dependencies (concurrently)
- Frontend dependencies (Next.js, React, Axios)
- Backend dependencies (Express, bcryptjs, jsonwebtoken, etc.)

### 3. Configure Environment Files

**Automatic Setup (Recommended):**
```bash
node setup-env.js
```

This automatically creates:
- `backend/.env` with a secure random JWT_SECRET
- `frontend/.env.local` with API URL configuration

**Manual Setup:**
```bash
cd backend
cp env.example .env
```

Edit `backend/.env`:
```env
PORT=5000
JWT_SECRET=your-super-secret-jwt-key-change-this
NODE_ENV=development
```

**Important**: Change `JWT_SECRET` to a random secure string in production!

### 4. Start Development Servers

From root directory:
```bash
npm run dev
```

This runs both servers concurrently:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## 🎯 First Run Checklist

- [ ] Dependencies installed (`npm run install:all`)
- [ ] Backend `.env` file created with `JWT_SECRET`
- [ ] Both servers running (`npm run dev`)
- [ ] Frontend accessible at http://localhost:3000
- [ ] Backend API accessible at http://localhost:5000/api/health

## 🔍 Verify Installation

### Test Backend
```bash
curl http://localhost:5000/api/health
```

Should return:
```json
{"status":"ok","message":"Memory Maze API is running"}
```

### Test Frontend
1. Open http://localhost:3000
2. You should see the Memory Maze login page
3. Register a new account
4. Login should redirect to stories page

## 📁 Directory Structure Explained

```
memory_maze/
├── frontend/
│   ├── pages/              # Next.js pages (routes)
│   │   ├── index.js       # Login/Register page
│   │   └── stories/       # Story-related pages
│   ├── styles/            # CSS Modules
│   ├── lib/               # Utilities
│   │   ├── api.js        # API client
│   │   └── auth.js       # Auth helpers
│   └── package.json
│
├── backend/
│   ├── routes/            # Express routes
│   │   ├── auth.js       # /api/auth/*
│   │   ├── stories.js    # /api/stories/*
│   │   └── progress.js   # /api/progress/*
│   ├── data/             # JSON storage
│   │   ├── users/        # User accounts (auto-created)
│   │   ├── stories/      # Story content
│   │   └── progress/     # User progress (auto-created)
│   ├── server.js         # Express app entry
│   └── package.json
│
└── package.json          # Root scripts
```

## 🔧 Development Scripts

### Root Level
- `npm run dev` - Start both frontend and backend
- `npm run dev:frontend` - Start only frontend
- `npm run dev:backend` - Start only backend
- `npm run install:all` - Install all dependencies
- `npm run build` - Build frontend for production

### Frontend Only
```bash
cd frontend
npm run dev      # Development server
npm run build    # Production build
npm run start    # Production server
```

### Backend Only
```bash
cd backend
npm run dev      # Development with nodemon
npm start        # Production server
```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Stories
- `GET /api/stories` - List all stories
- `GET /api/stories/:storyId` - Get story details
- `GET /api/stories/:storyId/chapters/:chapterNumber` - Get chapter

### Progress
- `GET /api/progress/:storyId` - Get user progress
- `POST /api/progress/:storyId/checkpoint` - Submit checkpoint
- `POST /api/progress/:storyId/verify` - Verify answers

## 🔐 Authentication Flow

1. User registers/logs in
2. Backend returns JWT token
3. Frontend stores token in localStorage
4. Token sent in `Authorization: Bearer <token>` header
5. Backend verifies token on protected routes

## 💾 Data Storage

### Current (MVP)
- **Users**: `backend/data/users/users.json`
- **Stories**: `backend/data/stories/*.json`
- **Progress**: `backend/data/progress/<email>-<storyId>.json`

### Future Upgrade
Easy to migrate to:
- MongoDB
- PostgreSQL
- MySQL
- Any database with Node.js driver

## 🎨 Styling

- **CSS Modules**: Scoped component styles
- **Global Styles**: `frontend/styles/globals.css`
- **Component Styles**: `frontend/styles/*.module.css`
- **CSS Variables**: Defined in `globals.css` for theming

## 🐛 Common Issues

### Port Already in Use
**Frontend (3000)**:
```bash
# Edit frontend/package.json
"dev": "next dev -p 3001"
```

**Backend (5000)**:
```bash
# Edit backend/.env
PORT=5001
```

### CORS Errors
Backend already configured with CORS. If issues persist:
- Check `backend/server.js` CORS settings
- Verify frontend API URL matches backend port

### Module Not Found
```bash
# Delete and reinstall
rm -rf node_modules frontend/node_modules backend/node_modules
npm run install:all
```

### Backend Data Directories
Created automatically on first server start. If missing:
```bash
mkdir -p backend/data/users backend/data/stories backend/data/progress
```

## 🚀 Production Deployment

### Frontend (Vercel/Netlify)
1. Connect GitHub repository
2. Set build command: `cd frontend && npm run build`
3. Set output directory: `frontend/.next`
4. Add environment variable: `NEXT_PUBLIC_API_URL=https://your-api.com/api`

### Backend (Heroku/Railway/DigitalOcean)
1. Set environment variables:
   - `PORT` (auto-set by platform)
   - `JWT_SECRET` (generate secure random string)
   - `NODE_ENV=production`
2. Start command: `npm start`
3. Consider database migration for production

## 📚 Adding New Stories

1. Create JSON file in `backend/data/stories/`
2. Follow format from `find-the-truth.json`
3. Restart backend (or it auto-reloads with nodemon)
4. Story appears in frontend automatically

## ✅ Testing Checklist

- [ ] User can register
- [ ] User can login
- [ ] Stories list loads
- [ ] Can read Chapter 1
- [ ] Memory checkpoint appears
- [ ] Can answer questions
- [ ] Score calculated correctly
- [ ] Next chapter unlocks on pass (≥70%)
- [ ] Progress persists after refresh
- [ ] Visual progress map shows correctly

## 🎓 Learning Resources

- **Next.js**: https://nextjs.org/docs
- **Express**: https://expressjs.com/
- **JWT**: https://jwt.io/
- **React Hooks**: https://react.dev/reference/react

---

**Ready to build? Start with `npm run dev` and open http://localhost:3000!**
