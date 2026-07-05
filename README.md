# AI Pulse

A consumer-friendly daily AI briefing app powered by [TensorFeed.ai](https://tensorfeed.ai).

## Features

- **Home** — Daily brief from `/api/today`, status summary, trending research
- **News** — AI news feed with category filters and urgency badges from action cards
- **Status** — Live provider uptime dashboard with TensorFeed status widget and incident triage
- **Discover** — Models/pricing, research papers, funding rounds, attention index
- **Premium Preview** — Free routing preview + premium trial features (100 calls/day)

## Architecture

- **Frontend:** Vite + React + TanStack Query + PWA
- **Backend:** Express proxy with 5-minute cache (2 min for status) to respect TensorFeed rate limits

## Development

```bash
npm install
npm run dev
```

Opens the Vite dev server at http://localhost:5173 with API proxied to the cache server on port 8787.

## Production

```bash
npm run build
npm start
```

Serves the built SPA and API from port 8787 (override with `PORT` env var).

## Data attribution

All data sourced from TensorFeed.ai. News articles link to original publishers. Pricing and routing information is informational only.
