# 无量 Ananta

A Buddhist practice tracking and community social app.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Mobile & Web | React Native + Expo (iOS, Android, Web) |
| Backend | Node.js + TypeScript, Hono, Drizzle ORM, PostgreSQL |
| Monorepo | pnpm workspaces + Turborepo |

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+
- PostgreSQL (for backend)

### Install Dependencies

```bash
pnpm install
```

### Run Development Servers

```bash
# All apps (mobile + api)
pnpm dev

# Mobile only (iOS/Android)
pnpm --filter mobile dev

# Mobile web
pnpm --filter mobile web

# API only
pnpm --filter api dev
```

### Build

```bash
# Build all
pnpm build

# Build mobile (iOS/Android)
pnpm --filter mobile build

# Build mobile web
pnpm --filter mobile build:web
```

## Project Structure

```
ananta/
├── apps/
│   ├── mobile/          # React Native + Expo
│   └── api/             # Hono + Drizzle backend
├── packages/
│   ├── types/           # Shared TypeScript types
│   └── utils/           # Shared utilities (fmtN, constants)
├── package.json
├── pnpm-workspace.yaml
└── turbo.json
```

## Features

- **Practice tracking** — Record mantra recitations, prostrations, lamp offerings, and more
- **Campaign management** — Set time-bound goals attached to practices
- **Statistics** — View weekly/monthly/yearly practice charts
- **Anonymous accounts** — Local-first, optional email binding for cloud sync
- **Dark theme** — Gold (#f0c040) on dark (#080c18)

## Development

### Adding a dependency

```bash
# To mobile app
pnpm --filter mobile add <package>

# To api
pnpm --filter api add <package>

# To shared package
pnpm --filter @ananta/types add <package>
```

### Database Migrations

```bash
# Generate migration
pnpm --filter api drizzle-kit generate

# Push schema to database
pnpm --filter api drizzle-kit push
```
