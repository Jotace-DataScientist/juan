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

## Deploying (Render, free tier — no technical steps required)
This repo includes a `render.yaml` "Blueprint" that automatically creates the database, sets the build/start commands, and generates the secret keys for you. You only need a free Render account.

1. Go to [render.com](https://render.com) and create a free account (you can sign up with your GitHub account).
2. Click **New +** → **Blueprint**.
3. Connect your GitHub account and select this repository.
4. Render will detect `render.yaml` automatically and show you a preview of what it will create (1 free database + 1 free web service). Click **Apply**.
5. (Optional) If you want AI-generated questions instead of only the offline question bank, open the new service's **Environment** tab and paste your Anthropic API key into `ANTHROPIC_API_KEY`. If you skip this, the app works fine using the built-in 72-question bank.
6. Wait a few minutes for the first build to finish. Render will give you a public URL (something like `https://gre-math-app.onrender.com`) — open it, register two accounts (one per profile), and you're done.

Everything else (database connection, JWT secret, build/start commands) is wired up automatically by the Blueprint — nothing to configure by hand.

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
