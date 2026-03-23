# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

无量（藏文: དཔག་མེད་, Ananta）is a Buddhist practice tracking and community social app. The name derives from Sanskrit "ananta" (infinite/endless), reflecting how small daily practices accumulate into something boundless.

Target users: Buddhist practitioners (Chinese, Tibetan, Southern tradition), with special attention to readability for middle-aged/elderly users.

## Technology Stack

| Layer | Technology |
|-------|------------|
| Mobile | React Native + Expo, Expo Router (file-based routing), Zustand (state) |
| Backend | Node.js + TypeScript, Hono framework, Drizzle ORM, PostgreSQL |
| Deployment | Alibaba Cloud Hong Kong (RDS PostgreSQL, OSS) |
| Monorepo | pnpm workspaces + Turborepo |

## Monorepo Structure

```
ananta/
├── apps/
│   ├── mobile/              # React Native (Expo)
│   └── api/                 # Node.js + Hono backend
├── packages/
│   ├── types/               # Shared TypeScript types
│   └── utils/               # Shared utilities
├── package.json             # Root workspace config
├── pnpm-workspace.yaml
└── turbo.json
```

## Core Data Models

- **Practice (课目)** — Permanent, accumulating records (e.g., mantras, prostrations, lamp offerings)
- **Campaign (发愿)** — Time-bound goals attached to a practice
- **Record (记录)** — Individual practice entries
- **Retreat (共修)** — Group activities with anonymous aggregation
- **User** — Anonymous local account by default, optional email binding
- **Friendship** — Mutual confirmation required

## Design System

| Item | Value |
|------|-------|
| Theme | Dark only |
| Primary color | Gold #f0c040 |
| Background | #080c18 |
| Font | Noto Serif SC |
| Base font size | 14px |
| Language | Simplified Chinese, Traditional Chinese, Japanese, English, Tibetan (day 1 support) |

## Development Commands

```bash
# Install dependencies (pnpm workspaces)
pnpm install

# Run all apps (mobile + api)
pnpm dev

# Run mobile app only
pnpm --filter mobile dev

# Run API only
pnpm --filter api dev

# Build mobile app
pnpm --filter mobile build

# Type check all packages
pnpm typecheck

# Lint all packages
pnpm lint
```

## Implementation Phases

1. **Phase 1 (MVP)** — Local features: Practice/Campaign/Record CRUD, home views, stats, settings, anonymous accounts
2. **Phase 2** — Cloud + Social: Email auth, cloud sync, friends, leaderboards
3. **Phase 3** — Retreats: Group activities, URL/QR sharing
4. **Phase 4** — Polish: Push notifications, data export, i18n

## Key Files

- PRD: `docs/PRD.md` — Full product requirements document
