# Spec: A Competitive MTG Speculation Platform

A Next.js app for drafting MTG cards, setting weekly lineups, and tracking performance from real tournament results. Built for fast iteration, scheduled automations, and realtime draft tables.

<p align="center">
  <i>Not affiliated with Wizards of the Coast or MTGGoldfish. For community fun & learning.</i>
</p>

---

## Table of Contents

* [Quick Start](#quick-start)
* [Tech Stack](#tech-stack)
* [System Architecture](#system-architecture)
* [Data & Job Flow](#data--job-flow)
* [Release Flow](#release-flow)
* [Local Development](#local-development)
* [Environment Variables](#environment-variables)
* [Database & Data Scripts](#database--data-scripts)
* [Caching, Realtime & Moderation](#caching-realtime--moderation)
* [Contributing](#contributing)
* [Troubleshooting](#troubleshooting)
* [License](#license)

---

## Quick Start

```bash
# 1) Install
yarn install

# 2) Set env (see .env.example below)
cp .env.example .env
# fill in secrets. you will need to ask Noah about these

# 4) Start the app
yarn dev
# http://localhost:3000
```

---

## Tech Stack

* **Frontend & Server**: Next.js (App Router), React, TypeScript
* **Auth**: NextAuth
* **DB**: Postgres
* **Cache**: Redis (read-through on top of Postgres)
* **Realtime**: Pusher JS
* **Background work**:

  * **Vercel Cron** → “Monday task” (sets lineups, calculates last week’s scores, updates DB) — see [`app/lib/performance.ts`](app/lib/performance.ts)
  * **GitHub Actions (nightly)** → Python “scheduled scrape” job (scrapes MTGGoldfish Standard & Modern leagues/challenges)
  * **Upstash QStash** → one-shot timers for draft pick deadlines (schedules auto-pick; callback to our API)
* **APIs**: Next.js Route Handlers for cases where Server Actions aren’t ideal (e.g., QStash callbacks)
* **Moderation**: OpenAI Moderation API for league names & usernames

---

## System Architecture

### Draft Timer → Auto-Pick (sequence)

```mermaid
sequenceDiagram
participant U as UI
participant QS as QStash
participant A as API /api/poke
participant SA as Server Action
participant DB as Postgres
participant C as Redis
participant P as Pusher
U->>QS: schedule autopick (one-shot)
QS->>A: callback when timer fires
A->>SA: handoff
SA->>DB: write pick
SA->>C: update cache
SA->>P: publish draft event
P->>U: realtime update
```

---

## Data & Job Flow

* **Monday Task (Vercel Cron)**
  Runs weekly to:

  * Set lineups for the week
  * Calculate last week’s scores
  * Persist updates to Postgres and refresh any cache
  * Source: [`app/lib/performance.ts`](app/lib/performance.ts)

* **Nightly Scrape (GitHub Actions)**
  Executes a Python job that scrapes MTGGoldfish (Standard & Modern leagues/challenges) for card appearances and quantities.

  * Inserts/updates Postgres with fresh results
  * Downstream: lineup scoring, trends, and dashboards

* **Draft Timers (QStash one-shot)**
  When a draft pick uses a timer, we queue a one-shot via QStash. On timeout:

  * QStash calls back to our API (`/api/autopick/poke`)
  * We verify the Upstash signature
  * We run the autopick transaction (idempotent) and broadcast via Pusher

* **Server Actions & APIs**
  Server Actions power most mutations/reads. Dedicated API routes are used when we need webhooks/callbacks or non-UI triggers.

---

## Release Flow

1. **Branch & PR**

   * Create a feature branch, open a PR.
   * Vercel builds **Preview Deployments** automatically.
2. **Checks**

   * Typecheck, lint, and build must pass.
   * (Optional but recommended) Add tests before merging.
3. **Review**

   * Keep PRs small; include screenshots or Looms for UI.
4. **Merge to `main`**

   * Vercel deploys to **Production**.
   * Scheduled jobs (Vercel Cron & GitHub Actions) continue without change.
5. **Database Changes**

   * Apply migrations before or alongside the deploy. See [Database & Data Scripts](#database--data-scripts).

---

## Local Development

* **Run services**: see the Docker examples in [Quick Start](#quick-start).
* **Auth**: NextAuth requires providers and `NEXTAUTH_SECRET`. Use Email or GitHub provider locally (see `.env.example`).
* **QStash callbacks**: If you want to test QStash locally, expose your dev server with `ngrok` and set the callback URL accordingly.
* **Redis**: Used for caching hot reads on top of Postgres. You can run without Redis locally; some code paths will be slower.

### Scripts

```bash
# dev server
yarn dev

# typecheck & lint
yarn type-check
yarn lint

# build & start
yarn build
yarn start
```

---

## Environment Variables

Create `.env.local` with at least:

```dotenv
# App
APP_BASE_URL=http://localhost:3000

# Database
DATABASE_URL=postgres://postgres:postgres@localhost:5432/spec

# Redis (choose your provider OR local)
REDIS_URL=redis://localhost:6379
# or Upstash-style:
# UPSTASH_REDIS_REST_URL=
# UPSTASH_REDIS_REST_TOKEN=

# Auth (NextAuth)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=replace_me

# Provider examples (adjust to your setup)
GITHUB_ID=
GITHUB_SECRET=

# Pusher
PUSHER_APP_ID=
PUSHER_KEY=
PUSHER_SECRET=
PUSHER_CLUSTER=

# Upstash QStash
QSTASH_TOKEN=
QSTASH_CURRENT_SIGNING_KEY=
QSTASH_NEXT_SIGNING_KEY=

# OpenAI Moderation
OPENAI_API_KEY=
```

> Tip: In CI (Vercel/GitHub), store secrets in their respective secret managers. Never commit `.env.local`.

---

## Database & Data Scripts

> The app uses Postgres as the source of truth. There are helper Python scripts for data scraping, seeding, and table management.

* **Schema management**
  See `scripts/` for create/drop helpers.

```bash
# drop all tables (start fresh)
python3 scripts/dropTables.py

# create base tables
python3 scripts/createTables.py
```

* **Seed users / sample data**

```bash
python3 scripts/seed_player_data.py
# creates a sample user:
#   email: noah.calvo@gmail.com
#   password: password
```

* **Scrape & seed weekly data**

```bash
# Weeks are space-separated ints
python main.py 5 6 7
```

* **Nightly Scrape (CI)**

  * A GitHub Actions workflow runs the “scheduled scrape” every night and writes results into Postgres.

---

## Caching, Realtime & Moderation

* **Redis cache** sits in front of Postgres for frequently accessed reads.
* **Pusher** broadcasts draft events (`pick_made`, `paused`, `resumed`, `draft_complete`, etc.) to connected clients for snappy UI updates.
* **OpenAI Moderation** screens league names and usernames via the moderation endpoint to keep things civil.

---

## Contributing

We ❤️ community help! Here’s how to jump in:

* **Report Bugs**: Open an issue with:

  * What you did (steps + expected vs. actual)
  * Screenshots/logs if relevant
  * Your environment (browser, OS, dev/prod)
* **Propose Features**: Start a discussion or issue. Describe the user story and the smallest viable slice.
* **Pick Up Tasks**:

  * We label approachable items as
