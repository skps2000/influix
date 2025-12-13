# InfluiX

**AI-native influence intelligence platform**

InfluiX helps creators and teams understand why content works. It's not just a dashboard—it's a thinking system.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Start development servers
npm run dev
```

- **Frontend**: http://localhost:5173
- **API**: http://localhost:3001

## 📁 Project Structure

```
/apps
  /web        # React + Vite frontend
  /api        # Node.js + Express backend
/packages
  /ui         # Shared UI components (React + Tailwind)
  /types      # Shared TypeScript types
  /ai         # AI prompts & inference logic
  /config     # Shared configuration
```

## 🛠 Tech Stack

### Frontend
- Vite + React + TypeScript
- Tailwind CSS (dark-mode first)
- Zustand for state management
- React Router for navigation

### Backend
- Node.js + Express + TypeScript
- Service-layer architecture
- JWT authentication
- PostgreSQL (via Prisma)

### AI
- OpenAI-compatible interface
- Versioned prompts
- JSON-structured outputs with Zod validation

## 🎯 Core Philosophy

- **Less UI, more meaning** - Every element serves a purpose
- **AI explains "why", not just "what"** - Insights make you smarter
- **Built for expansion** - Clean architecture for 6-12 month growth

## 📝 Available Scripts

```bash
# Development
npm run dev           # Start all services
npm run dev:web       # Start frontend only
npm run dev:api       # Start backend only

# Build
npm run build         # Build all packages
npm run build:packages # Build shared packages only

# Quality
npm run lint          # Lint all files
npm run typecheck     # TypeScript checks
```

## 🔑 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `JWT_SECRET` | Secret for JWT tokens (min 32 chars) | Yes |
| `OPENAI_API_KEY` | OpenAI API key | Yes |
| `PORT` | API server port | No (default: 3001) |
| `FRONTEND_URL` | Frontend URL for CORS | No (default: http://localhost:5173) |

## 📄 License

Private - All rights reserved
