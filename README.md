# GRE Math Practice

Full-stack rebuild of the original single-file GRE Math practice tool: React frontend + Node/Express backend + PostgreSQL, with per-user accounts, server-side AI question generation, and a progress dashboard.

## Stack
- `client/` — React (Vite), React Router
- `server/` — Node/Express, PostgreSQL (`pg`), JWT auth (`jsonwebtoken` + `bcryptjs`)

## Local development

### 1. Database
Create a Postgres database (local or hosted, e.g. Railway/Render/Neon free tier) and note its connection string.

### 2. Server
```bash
cd server
cp .env.example .env   # fill in DATABASE_URL, JWT_SECRET, optional ANTHROPIC_API_KEY
npm install
npm run migrate         # creates users / sessions / attempts tables
npm run dev              # http://localhost:4000
```

### 3. Client
```bash
cd client
cp .env.example .env    # VITE_API_URL=/api (proxied to the server in dev)
npm install
npm run dev               # http://localhost:5173
```

The Vite dev server proxies `/api/*` to `http://localhost:4000`. Set `VITE_DEV_API_PROXY` if your server runs elsewhere.

## How question generation works
`POST /api/questions/generate` calls the Anthropic API server-side (key never reaches the browser) to create a fresh GRE question. If no `ANTHROPIC_API_KEY` is set, or the call fails/times out, it falls back to the built-in 72-question offline bank (`server/src/data/questionBank.js`) automatically — same behavior as "offline mode" in the original HTML version. Users can also force offline mode from the practice screen.

## Auth & data isolation
Email + password accounts (bcrypt-hashed, JWT sessions, 7-day expiry). Every session/attempt/history/dashboard row is scoped to `user_id`, so two people (e.g. you and a partner) get fully separate histories and progress under one deployment.

## Deploying (Railway or Render, free tier)
This is set up as a **single deployable service**: in production the Express server serves the built React app as static files (see `server/src/index.js`), so you only need one web service plus one Postgres add-on.

1. Provision a Postgres database (Railway/Render managed Postgres, or Neon) and copy its connection string.
2. Create a web service from this repo with:
   - Build command: `cd client && npm install && npm run build && cd ../server && npm install`
   - Start command: `cd server && npm run migrate && npm start`
   - Env vars: `DATABASE_URL`, `JWT_SECRET` (long random string), `ANTHROPIC_API_KEY` (optional), `CORS_ORIGIN` (your deployed URL, or omit/`*` since client and server share an origin in this setup), `PORT` (usually auto-set by the platform).
3. Once deployed, register two accounts — one per profile — and you're set.

## Project structure
```
server/
  src/
    index.js          Express app, serves API + built client
    db.js              pg connection pool
    migrate.js          runs SQL files in migrations/
    migrations/          schema (users, sessions, attempts)
    middleware/auth.js   JWT verification
    routes/              auth, questions, flashcards, sessions, history, dashboard
    data/                ported question bank + flashcards
client/
  src/
    pages/              Home, Login, Register, Session, Results, Flashcards, History, Dashboard
    components/QuestionRenderer/  MC, QC, Numeric Entry question UIs
    context/AuthContext.jsx        JWT/user state, persisted to localStorage
    api/client.js                  fetch wrapper for the backend
    styles.css                      ported from the original HTML design
```
