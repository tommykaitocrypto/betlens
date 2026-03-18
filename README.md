# BetLens ⚽

Decision support tool for football bettors. Champions League · Premier League · Ligue 1.

## Deploy to Vercel (5 minutes)

```bash
# 1. Clone / init
git init && git add . && git commit -m "init"

# 2. Push to GitHub
git remote add origin https://github.com/YOU/betlens.git
git push -u origin main

# 3. Go to vercel.com → Import → Deploy
```

## Local dev

```bash
npm install
npm run dev
```

## Update matches

Edit `src/lib/matches.js`. Each match has `expiresAt` (kickoff + 2h) — auto-removed from UI after that.
