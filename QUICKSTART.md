# Quick Start Guide

## 🚀 Getting Started in 3 Steps

### Step 1: Install Dependencies

```bash
npm run install:all
```

This installs dependencies for:
- Root project (concurrently for running both servers)
- Frontend (Next.js)
- Backend (Express)

### Step 2: Configure Environment Files

```bash
node setup-env.js
```

This automatically creates:
- `backend/.env` with a secure random JWT_SECRET
- `frontend/.env.local` with API URL configuration

Or manually copy `backend/env.example` to `backend/.env` and set your JWT_SECRET.

### Step 3: Start Development Servers

From the root directory:

```bash
npm run dev
```

This starts:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## 🎮 First Use

1. Open http://localhost:3000
2. Click "Register" tab
3. Create an account (email + password)
4. Select "Find the Truth" story
5. Read Chapter 1
6. Answer the memory questions
7. Unlock Chapter 2!

## 📁 Project Structure

```
memory_maze/
├── frontend/          # Next.js app (port 3000)
│   ├── pages/        # Routes
│   ├── styles/       # CSS modules
│   └── lib/          # API & utilities
├── backend/          # Express API (port 5000)
│   ├── routes/       # API endpoints
│   └── data/         # JSON storage
└── package.json      # Root scripts
```

## 🔧 Available Scripts

- `npm run dev` - Start both frontend and backend
- `npm run dev:frontend` - Frontend only
- `npm run dev:backend` - Backend only
- `npm run build` - Build frontend for production
- `npm run install:all` - Install all dependencies

## 🐛 Troubleshooting

### Port Already in Use
- Change `PORT` in `backend/.env` for backend
- Change port in `frontend/package.json` scripts for frontend

### Module Not Found
- Run `npm run install:all` again
- Delete `node_modules` and reinstall

### Backend Not Starting
- Check if `.env` file exists in `backend/`
- Ensure `JWT_SECRET` is set

### Frontend Can't Connect to Backend
- Verify backend is running on port 5000
- Check `frontend/next.config.js` has correct `API_URL`

## 📝 Next Steps

- Add more stories in `backend/data/stories/`
- Customize styling in `frontend/styles/`
- Add features from the roadmap in README.md

Happy coding! 🎉
