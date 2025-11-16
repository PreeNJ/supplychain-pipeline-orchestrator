 ## ChainTrack AI – Live Supply Chain Orchestration

ChainTrack AI is a demo control tower that ingests webhook callbacks (a built-in simulator), persists them with Prisma/PostgreSQL, and streams status changes to the UI over Server-Sent Events. Use it to showcase real-time shipment tracking, AI summaries, and modern App Router patterns.

## Features
- Next.js App Router + React client components
- Prisma ORM with PostgreSQL backing store
- SSE broker to fan out live execution events
- Mock execution simulator for local demos when no webhook is available
- n8n integration via `N8N_WEBHOOK_URL`
- Tailwind v4 styling + Lucide icons

## Prerequisites
- Node.js 18+
- npm
- PostgreSQL database (Supabase, local Docker)
-  n8n instance reachable from this app

## Setup
1. **Install dependencies**
	```bash
	npm install
	```
2. **Configure environment**
	```bash
	cp .env.example .env.local
	```
	Edit `.env.local` with your database credentials. To hit your real n8n workflow, set `N8N_WEBHOOK_URL` to the public webhook endpoint; otherwise leave it empty to use the mock flow. For faster demos you can tweak `MOCK_TIME_COMPRESSION` (default `5`, meaning each simulated minute renders in ~12 seconds).
3. **Generate Prisma client & apply schema**
	```bash
	npx prisma migrate deploy
	```
4. **Run the dev server**
	```bash
	npm run dev
	```
	Visit `http://localhost:3000` for the marketing page, `/run` to start a shipment, and `/executions/[id]` to watch the live stream.

## How n8n integration works
- `POST /api/executions` creates the execution row and then:
  - If `N8N_WEBHOOK_URL` is defined, the server `fetch`es that URL with `{ trackingNumber, executionId }`.
  - If not defined, `simulateExecutionFlow` seeds mock events for local demos.
- n8n should call `POST /api/callbacks` whenever pipeline milestones finish; those callbacks persist events and publish them through the SSE broker.

## Troubleshooting
- **Not hitting n8n:** ensure `N8N_WEBHOOK_URL` exists in `.env.local`, restart `npm run dev`, and confirm your webhook is accessible from the Next.js server.
- **UI stuck in PENDING:** verify callbacks are reaching `/api/callbacks`; check terminal logs for `[SSE Broker]` messages.
- **Prisma errors:** ensure `DATABASE_URL` and `DIRECT_URL` are valid and migrations ran successfully.

## Scripts
- `npm run dev` – start Next.js 
- `npm run lint` – run ESLint
- `npm run build` / `npm start` – production build & run

## Deployment
Deploy to Vercel, Fly.io, or any Node-friendly host. Remember to set the same environment variables (`DATABASE_URL`, `DIRECT_URL`, `N8N_WEBHOOK_URL`, `N8N_HOST`) on the hosting platform.

## Copyright
Copyright (c) 2025 Priscillah.