<div align="center">

# Zhice AI

**AI-powered career preparation workspace**

Create, tailor, review, export, and share professional resumes from one responsive web workspace. Zhice AI also provides JD-aware resume optimization, professional photo generation, and adaptive mock interviews.

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61dafb)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6)](https://www.typescriptlang.org/)
[![Docker](https://img.shields.io/badge/Docker-ready-2496ed)](Dockerfile)

[中文文档](README.zh-CN.md) · [Architecture](ARCHITECTURE.md) · [Contributing](CONTRIBUTING.md)

</div>

---

## What it does

Zhice AI is a self-hostable career toolkit for people preparing for a specific role. The application keeps the resume data, AI workflows, interview history, and export tools in one Next.js application.

- **Resume workspace** — drag-and-drop sections, inline editing, autosave, undo/redo, Markdown-aware fields, multiple resumes, duplicate and rename.
- **Template system** — professional templates with live preview, color, typography, spacing, and layout controls.
- **AI writing** — generation from a target role, resume optimization against a JD, chat assistance, grammar checks, translation, JD matching, and cover letters.
- **Document intelligence** — parse PDF, DOCX, and image resumes, then turn the extracted content into editable sections.
- **Career photo** — generate professional profile photos through a server-side image provider without exposing provider keys to clients.
- **Adaptive mock interview** — six preset interviewer roles plus custom interviewers, resume-aware follow-ups, scope protection, dynamic progression, and reports.
- **Export and sharing** — PDF, DOCX, HTML, Markdown, TXT, and JSON export with share links and optional passwords.
- **Mini Program bridge** — server routes for WeChat Mini Program login, resume workflows, credits, AI generation, image generation, and overview data.
- **Bilingual interface** — Chinese and English routes under `/zh` and `/en`.

## Design direction

The web UI uses an original dark, business-oriented visual system: deep green-black surfaces, mint accents, responsive layout primitives, custom font tokens, liquid-glass cards, and a video-backed landing hero. The visual layer is separate from the business APIs so the resume, AI, interview, login, database, and export connections remain stable.

## Stack

| Area | Technology |
| --- | --- |
| Application | Next.js 16 App Router, React 19, TypeScript |
| UI | Tailwind CSS 4, shadcn/ui, Radix UI, lucide-react |
| State | Zustand |
| AI | Vercel AI SDK with OpenAI-compatible, Anthropic, and Google providers |
| Persistence | SQLite by default, PostgreSQL supported through Drizzle ORM |
| Documents | Puppeteer/Chromium PDF, DOCX, HTML, Markdown, TXT, JSON |
| Media | hls.js for the landing video and server-side image generation |
| Runtime | Node.js 22+, pnpm, Docker |

## Quick start

### Requirements

- Node.js 22 or newer
- pnpm 10 or newer
- SQLite for the zero-configuration path, or PostgreSQL for production
- An AI provider key for AI features

### Local development

```bash
git clone https://github.com/killfyvibecoding/zhice-ai.git
cd zhice-ai
pnpm install
cp .env.example .env.local
```

Set at least a stable `AUTH_SECRET` in `.env.local`:

```bash
AUTH_SECRET="$(openssl rand -base64 32)"
DB_TYPE=sqlite
SQLITE_PATH=./data/jade.db
```

Start the development server:

```bash
pnpm dev
```

Open [http://localhost:3000/zh](http://localhost:3000/zh). The default development mode uses browser fingerprinting when `AUTH_ENABLED=false`, so users can enter the workspace without configuring OAuth.

## AI configuration

There are two supported AI paths:

1. **Web workspace:** users can configure a compatible provider, base URL, model, and key in the in-app settings. The browser-side configuration is used for the web editor workflow.
2. **Server-managed workflows:** the Mini Program and server-only image generation routes use `AI_API_KEY`, `AI_BASE_URL`, `AI_MODEL`, `IMAGE_API_KEY`, `IMAGE_BASE_URL`, and `IMAGE_MODEL`. These values must stay in the server environment and must never be committed or sent by the Mini Program.

The default `.env.example` uses placeholders only. Replace them with your own provider values and rotate any key that has ever appeared in a public log, screenshot, issue, or chat.

## Database

SQLite is the default and stores data under `./data`. For PostgreSQL:

```bash
DB_TYPE=postgresql
DATABASE_URL=postgresql://user:password@localhost:5432/zhice_ai
pnpm db:generate:pg
pnpm db:migrate
```

Run SQLite migrations with:

```bash
pnpm db:generate
pnpm db:migrate
```

Back up the database and uploaded assets before production migrations. The application does not provide a payment gateway; credits and AI usage accounting still need a production billing provider and reconciliation process before commercial launch.

## Docker

Build and run locally:

```bash
docker build -t zhice-ai:local .
AUTH_SECRET="$(openssl rand -base64 32)" \
  IMAGE=zhice-ai:local \
  ./docker_run_local.sh
```

The helper exposes port `3003` by default and stores SQLite data in `./zhice-ai-data`. It never contains a hardcoded secret. The GitHub Actions workflow builds multi-architecture images after you configure Docker Hub secrets.

## Project layout

```text
src/
├── app/                  Next.js routes and server APIs
├── components/           Landing, dashboard, editor, interview, and UI components
├── hooks/                Client hooks for editor and interview interactions
├── i18n/                 Locale routing and message loading
├── lib/                  AI, auth, database, resume, interview, and export services
├── stores/               Client state stores
└── types/                Shared TypeScript types
drizzle/                  SQLite and PostgreSQL migrations
messages/                 Chinese and English translations
public/                   Icons and static assets
images/                   Product screenshots used by the documentation
docs/                     Setup, privacy, architecture, and operational notes
```

## Verification

```bash
pnpm type-check
pnpm test
pnpm build
```

The repository currently contains a number of historical lint findings inherited from the upstream codebase. Type checking, the automated test suite, and the production build are the primary release gates; see [CONTRIBUTING.md](CONTRIBUTING.md) for the validation policy.

## Security and privacy

- Do not commit `.env`, `.env.local`, database files, API keys, cookies, uploads, or provider responses containing personal data.
- Treat resumes, photos, interview transcripts, and generated documents as personal information.
- Use HTTPS, secure cookies, a production `AUTH_SECRET`, rate limiting, request-size limits, and log redaction in production.
- Read [SECURITY.md](SECURITY.md) before reporting a vulnerability.

## License and provenance

Zhice AI is distributed under the Apache License 2.0. This repository is an independently branded and modified derivative of an Apache-2.0 codebase. See [NOTICE](NOTICE) for the source attribution and [LICENSE](LICENSE) for the full license text.
