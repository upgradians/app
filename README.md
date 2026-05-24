# Upgradian — Production Platform

Full-stack coding platform: Next.js web app, React Native mobile, Electron desktop, FastAPI backend, Supabase database.

---

## Prerequisites

- Node.js 20+
- pnpm 9+ (`npm i -g pnpm`)
- Python 3.12+
- Docker + Docker Compose (for deployment)
- Supabase account
- Judge0 API key (RapidAPI)
- OpenAI API key

---

## Quick Start

### 1. Clone and install

```bash
cd Upgradian_app
pnpm install
```

### 2. Environment variables

```bash
cp .env.example .env
# Edit .env with your Supabase URL, keys, OpenAI key, Judge0 key
```

### 3. Database setup

```bash
# Install Supabase CLI
npm i -g supabase

# Link to your project
supabase login
supabase link --project-ref YOUR_PROJECT_REF

# Run migrations
supabase db push
```

### 4. Generate TypeScript types

```bash
pnpm db:types
```

### 5. Run all apps in development

```bash
pnpm dev
# Web:  http://localhost:3000
# API:  http://localhost:8000
```

---

## Individual App Commands

### Next.js Web (`apps/web`)

```bash
pnpm --filter @upgradian/web dev     # Dev server
pnpm --filter @upgradian/web build   # Production build
pnpm --filter @upgradian/web start   # Start production
```

### FastAPI (`apps/api`)

```bash
cd apps/api
python -m venv venv
source venv/bin/activate       # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### React Native Mobile (`apps/mobile`)

```bash
cd apps/mobile
pnpm install
pnpm start          # Expo dev server
pnpm android        # Android emulator
pnpm ios            # iOS simulator (macOS only)
```

### Electron Desktop (`apps/desktop`)

```bash
cd apps/desktop
pnpm install
pnpm build          # Compile TypeScript
pnpm start          # Launch electron
pnpm build:win      # Windows installer
pnpm build:mac      # macOS DMG
pnpm build:linux    # Linux AppImage + deb
```

---

## Production Deployment

### Docker Compose

```bash
# Add your production env vars to .env
docker-compose up -d

# View logs
docker-compose logs -f web
docker-compose logs -f api
```

### Vercel (recommended for web)

```bash
pnpm --filter @upgradian/web build
vercel --prod
```

---

## Project Structure

```
Upgradian_app/
├── apps/
│   ├── web/                    # Next.js 15 App Router
│   │   ├── app/
│   │   │   ├── (auth)/         # Login, Register
│   │   │   ├── (student)/      # Dashboard, Arena, Leaderboard, Contests...
│   │   │   ├── (recruiter)/    # Recruiter portal
│   │   │   ├── (admin)/        # Admin dashboard
│   │   │   └── api/            # API routes (submissions, interview)
│   │   ├── components/         # Shared components
│   │   └── store/              # Zustand stores
│   ├── api/                    # FastAPI backend
│   │   ├── main.py
│   │   ├── core/               # Config, auth, Supabase client
│   │   └── routers/            # challenges, submissions, leaderboard...
│   ├── mobile/                 # React Native Expo
│   │   └── app/
│   │       ├── (tabs)/         # Dashboard, Arena, Leaderboard, Profile
│   │       └── _layout.tsx
│   └── desktop/                # Electron
│       └── src/main.ts
├── packages/
│   ├── types/                  # Shared TypeScript types
│   └── ui/                     # Shared UI components (Button, Badge, Card)
├── supabase/
│   └── migrations/             # SQL migrations + RLS + seed data
├── docker-compose.yml
└── nginx.conf
```

---

## Key Features

| Feature | Web | Mobile | Desktop |
|---|---|---|---|
| Coding Arena (Monaco Editor) | ✅ | WebView | ✅ |
| Real-time Judge0 execution | ✅ | ✅ | ✅ |
| AI Interview (GPT-4o mini) | ✅ | ✅ | ✅ |
| Leaderboard | ✅ | ✅ | ✅ |
| XP + Galaxy Rank system | ✅ | ✅ | ✅ |
| Contests | ✅ | ✅ | ✅ |
| Internship Missions | ✅ | ✅ | ✅ |
| Skill Tracks | ✅ | ✅ | ✅ |
| Recruiter Portal | ✅ | — | ✅ |
| Admin Dashboard | ✅ | — | ✅ |
| Dark Mode | ✅ | System | ✅ |
| PWA | ✅ | — | — |
| Auto-updates | — | EAS | electron-updater |

---

## Environment Variables Reference

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Supabase service role (backend only) |
| `NEXT_PUBLIC_API_URL` | ✅ | FastAPI base URL |
| `OPENAI_API_KEY` | ✅ | For AI interview feature |
| `JUDGE0_API_KEY` | ✅ | For code execution |
| `JUDGE0_URL` | — | Judge0 host (default: RapidAPI) |
