# Denials AI Copilot — Qualified Health Prototype

AI-powered claim denial analysis, evidence matching, and appeal generation.

## Quick Start (Local)

```bash
# 1. Install dependencies
npm install

# 2. Add your API key
cp .env.local.example .env.local
# Edit .env.local and add your Anthropic API key

# 3. Run locally
npm run dev
```

Open http://localhost:3000

## Deploy to Vercel

1. Push this repo to GitHub
2. Go to https://vercel.com/new and import the repo
3. Add environment variable: `ANTHROPIC_API_KEY` = your key
4. Deploy — done!

## Features

- **Denial Queue Dashboard** — 4 realistic claim scenarios with different denial types
- **AI-Powered Analysis** — Claude analyzes each denial in real-time (category, root cause, policy match, overturn probability)
- **Appeal Letter Generation** — Streams a payer-specific appeal letter grounded in clinical evidence
- **AI Copilot Chat** — Ask follow-up questions about denial strategy, payer policies, missing documentation
