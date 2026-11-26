# AGENTS.md — AI Coding Harness for Rutina Frontend (`rutina-fe`)

## Overview
Next.js 16 + React 19 + TypeScript + Prisma + NextAuth v5 exercise routines organizer frontend.

## Commands
```bash
npm ci
npx prisma generate
npm run typecheck
npm run lint
npm run build
```

## Security & Hygiene Rules
1. **Never commit secrets**: `.env`, `.env.local`, database URLs, or `AUTH_SECRET` values must never be committed.
2. **Type safety**: Never use `any` (`@typescript-eslint/no-explicit-any`). Define explicit interfaces or infer from Prisma types.
3. **Database changes**: Update `prisma/schema.prisma` and create a Prisma migration before deploying.

## Git Flow Workflow
- `main`: Production branch (deployed to Vercel).
- `develop`: Integration branch for completed features.
- `feature/<slug>`: Branched from `develop` (or `main`), verified with `npm run typecheck` and `npm run lint` before merging.
