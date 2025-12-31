# InfluiX - Copilot Instructions

## 📌 Project Overview

**InfluiX** is an AI-native influence intelligence platform that helps creators and teams understand **why content works**. It's a thinking system, not just a dashboard.

### Vision
- Provide AI-powered insights for content creators
- Explain "why" content succeeds, not just metrics
- Build a scalable, modular architecture for 6-12 months of growth
- Focus on meaningful insights over flashy UI

### Core Tagline
"Less UI, more meaning. Every element serves a purpose."

---

## 🏗 Architecture Overview

### Monorepo Structure (npm workspaces)

```
influix/
├── apps/
│   ├── web/              # React + Vite + TypeScript frontend
│   ├── api/              # Node.js + Express + TypeScript backend
│   └── .env.example      # Environment variables template
├── packages/
│   ├── types/            # Shared TypeScript types & interfaces
│   ├── config/           # Shared configuration & constants
│   ├── ui/               # React UI components (Tailwind CSS)
│   └── ai/               # AI prompts, schemas, and inference
├── database/
│   └── init.sql          # PostgreSQL initialization
├── api/                  # Cloudflare Workers - Hono framework
│   └── routes/           # API endpoints for Workers
├── wrangler.jsonc        # Cloudflare Workers configuration
└── package.json          # Root workspace configuration
```

### Tech Stack

**Frontend (apps/web)**
- React 18 + Vite for fast development
- TypeScript for type safety
- Tailwind CSS (dark mode first)
- Zustand for global state (auth, UI)
- React Router for navigation
- Axios for HTTP client with interceptors

**Backend (apps/api)**
- Node.js + Express.js
- TypeScript for type safety
- Prisma ORM for database access
- PostgreSQL via Supabase
- JWT authentication
- Service-layer architecture

**Deployment**
- Frontend: Cloudflare Pages (static SPA)
- API: Cloudflare Workers + Hono (edge computing)
- Database: Supabase PostgreSQL
- Auth: JWT tokens

**Shared Packages**
- `@influix/types`: Type definitions (User, Content, Insight, Note, Workspace)
- `@influix/config`: Constants (AUTH settings, API endpoints)
- `@influix/ui`: Reusable components (Button, Input, Card, etc.)
- `@influix/ai`: AI prompt templates & inference logic

---

## 🗄 Database Schema (PostgreSQL)

### Core Models

**Users**
- `id`: UUID primary key
- `email`: Unique identifier
- `password_hash`: Bcrypt hashed
- `name`: Display name
- `avatar_url`: Profile picture
- `role`: ADMIN, MEMBER, or VIEWER
- `preferences`: JSON (theme, language, notifications)
- `last_login_at`: Last authentication time
- Relations: owns Workspaces, has WorkspaceMembers, creates Content/Notes

**Workspaces** (Multi-tenant)
- `id`: UUID primary key
- `name`: Workspace name
- `slug`: URL-friendly identifier
- `owner_id`: Creator (User)
- `description`: Optional description
- `settings`: JSON configuration
- Relations: has Members, has Content, has Notes, has Insights

**Content** (Analyzed items)
- `id`: UUID primary key
- `workspace_id`: Which workspace
- `creator_id`: Who uploaded
- `title`: Content title
- `source_url`: Link to original
- `source_type`: VIDEO, ARTICLE, IMAGE, etc.
- `platform`: YOUTUBE, TWITTER, TIKTOK, etc.
- `metadata`: JSON (thumbnails, durations, etc.)
- `status`: PENDING, ANALYZING, COMPLETE, FAILED
- Relations: has Insights, has Notes

**Notes** (User annotations)
- `id`: UUID primary key
- `content_id`: Associated Content (nullable - can be standalone)
- `workspace_id`: Which workspace
- `author_id`: Who wrote it
- `title`: Note title
- `content`: Markdown body
- `tags`: JSON array of tags
- Relations: belongs to Content, Workspace, User

**Insights** (AI-generated analysis)
- `id`: UUID primary key
- `content_id`: What was analyzed
- `workspace_id`: Which workspace
- `prompt_id`: Which AI prompt version
- `prompt_version`: Versioning for reproducibility
- `analysis`: JSON with AI output
- `confidence`: 0-1 score
- `status`: GENERATING, COMPLETE, FAILED, STALE
- Relations: belongs to Content

**WorkspaceMembers** (Access control)
- `id`: UUID primary key
- `workspace_id`: Member of
- `user_id`: The member
- `role`: OWNER, ADMIN, MEMBER, VIEWER
- `joined_at`: When they joined

---

## 🔑 API Endpoints (`/api/v1`)

### Authentication
- `POST /auth/register` - Create account (email, name, password)
- `POST /auth/login` - Login (email, password)
- `POST /auth/refresh` - Get new access token
- `GET /auth/me` - Get current user
- `POST /auth/logout` - Logout

### Users
- `GET /users/me` - Get authenticated user details
- `PATCH /users/me` - Update name, avatar
- `PUT /users/me/preferences` - Update theme, language, notifications

### Workspaces
- `GET /workspaces` - List user's workspaces
- `POST /workspaces` - Create new workspace
- `GET /workspaces/:id` - Get workspace details
- `GET /workspaces/default` - Get or create default workspace

### Content
- `GET /content` - List content (filterable by workspace)
- `POST /content` - Upload/add content
- `GET /content/:id` - Get content details
- `DELETE /content/:id` - Delete content

### Notes
- `GET /notes` - List notes (filterable by content/workspace)
- `POST /notes` - Create note
- `GET /notes/:id` - Get note
- `PATCH /notes/:id` - Update note
- `DELETE /notes/:id` - Delete note

### Insights
- `GET /insights` - List AI insights
- `GET /insights/:id` - Get insight
- `POST /insights/generate` - Trigger AI analysis

### Dashboard
- `GET /dashboard` - Get overview (stats, recent activity)
- `GET /dashboard/insights` - Get dashboard-level insights

---

## 🚀 Development Workflow

### Setup
```bash
# Clone and install
git clone https://github.com/skps2000/influix.git
cd influix
npm install

# Environment
cp apps/api/.env.example apps/api/.env
# Edit: DATABASE_URL, JWT_SECRET, OPENAI_API_KEY
```

### Local Development
```bash
# Start all services (frontend + API)
npm run dev

# Or individually
npm run dev:web       # Frontend only (http://localhost:5173)
npm run dev:api       # API only (http://localhost:3001)
npm run dev:worker    # Workers locally (wrangler dev)
```

### Building
```bash
# Build everything
npm run build

# Build only packages
npm run build:packages

# Build only web
npm run build:web

# Deploy to Cloudflare
npm run deploy
```

### Development Mode Features
- **DEV_MODE=true**: Auto-login without credentials
- Demo User: `dev@example.com`
- "🚀 Demo Login" button on LoginPage
- Toggle in `apps/web/src/stores/authStore.ts`

---

## 📂 Directory Reference

### Frontend (apps/web)
```
apps/web/src/
├── pages/              # Page components (Dashboard, Content, Notes, etc.)
├── components/         # Reusable UI components
├── layouts/            # Layout wrappers (MainLayout, AuthLayout)
├── stores/             # Zustand state (authStore, etc.)
├── lib/                # Utilities (api.ts, helpers)
├── styles/             # CSS files (Tailwind index)
└── App.tsx, main.tsx   # Entry points
```

### Backend (apps/api)
```
apps/api/src/
├── routes/             # API endpoints (auth, users, content, etc.)
├── services/           # Business logic (userService, contentService)
├── middleware/         # Express middleware (auth, errorHandler, logger)
├── lib/                # Utilities (prisma.ts)
└── index.ts            # Express app setup
```

### Shared Packages
```
packages/
├── types/src/          # TypeScript interfaces
├── config/src/         # Constants, settings
├── ui/src/             # React components + Tailwind styles
└── ai/src/             # AI prompts & Zod schemas
```

### Cloudflare Workers (api/)
```
api/
├── index.js            # Main Hono app
├── lib/                # Utilities (mockData, utils)
└── routes/             # Hono route handlers
    ├── auth.js         # JWT-based auth for Workers
    ├── users.js        # User management
    ├── workspaces.js   # Workspace CRUD
    ├── content.js      # Content management
    ├── notes.js        # Notes management
    ├── insights.js     # AI insights
    ├── dashboard.js    # Dashboard stats
    └── books.js        # Legacy endpoint
```

---

## 🔐 Authentication & Authorization

### How It Works
1. **Registration/Login** → JWT tokens issued
2. **Access Token** → Short-lived (15 min), in Authorization header
3. **Refresh Token** → Long-lived (7 days), stored securely
4. **Protected Routes** → Middleware validates token
5. **Workspace Access** → Checked via WorkspaceMembers table

### Implementation
- **Frontend**: `authStore.ts` manages tokens & user state
- **Backend**: `middleware/auth.ts` validates JWT
- **Storage**: LocalStorage for tokens (consider secure storage for production)

### Development Override
- Set `DEV_MODE=true` in authStore.ts
- Auto-login with dev user
- No API calls needed

---

## ✨ Key Features

### Multi-Tenant Workspaces
- Users can create/join multiple workspaces
- Each workspace has independent content, notes, insights
- Role-based access (OWNER, ADMIN, MEMBER, VIEWER)

### Content Management
- Upload/link videos, articles, images
- Track source (YouTube, Twitter, TikTok, etc.)
- Status tracking (pending, analyzing, complete)

### AI Insights
- Generate insights for content
- Versioned prompts for reproducibility
- Confidence scores
- Structured JSON outputs

### Notes System
- Create standalone or linked to content
- Tagging system
- Workspace-scoped
- Markdown support

### Dashboard
- Overview statistics
- Recent activity timeline
- Quick access to workspaces

---

## 🛠 Common Tasks & Patterns

### Adding a New API Endpoint

1. **Create Route Handler** (apps/api/src/routes/)
```typescript
// routes/newFeature.ts
import { Router, Response } from 'express';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';

export const newRouter = Router();
newRouter.use(authenticate);

newRouter.get('/', async (req: AuthenticatedRequest, res: Response) => {
  // Access req.userId from auth middleware
  // Use services for business logic
  res.json({ success: true, data: [] });
});
```

2. **Create Service** (apps/api/src/services/)
```typescript
import prisma from '../lib/prisma';

export const newService = {
  async create(data) {
    return prisma.model.create({ data });
  },
};
```

3. **Register Route** (apps/api/src/index.ts)
```typescript
import { newRouter } from './routes/newFeature';
app.use(`${API_PREFIX}/new-feature`, newRouter);
```

4. **Add Types** (packages/types/src/)
```typescript
export interface NewItem {
  id: string;
  title: string;
  // ...
}
```

### Adding a New UI Component

1. **Create Component** (packages/ui/src/components/)
```tsx
export function MyComponent({ prop }: Props) {
  return <div>{prop}</div>;
}
```

2. **Export** (packages/ui/src/index.ts)
```typescript
export { MyComponent } from './components/MyComponent';
```

3. **Use in Apps**
```tsx
import { MyComponent } from '@influix/ui';
```

### Database Changes

1. **Update Schema** (apps/api/prisma/schema.prisma)
2. **Run Migration**
```bash
cd apps/api
npx prisma migrate dev --name "description"
```

3. **Test with Supabase** (or reset for dev)
```bash
npx prisma db push --accept-data-loss
```

---

## 🐛 Troubleshooting

### Database Connection Issues
- Check `DATABASE_URL` in `.env`
- Verify Supabase credentials
- For Cloudflare: Configure Hyperdrive binding

### Build Failures
- Clear cache: `npm run clean`
- Reinstall: `rm -rf node_modules && npm install`
- Check TypeScript: `npm run typecheck`

### Dev Mode Not Working
- Ensure `DEV_MODE=true` in authStore.ts
- Clear localStorage
- Hard refresh browser (Ctrl+F5)

### API 401 Unauthorized
- Token expired? Use refresh endpoint
- Missing Authorization header?
- Dev mode should skip auth

---

## 📚 Code Quality Guidelines

### TypeScript
- Use strict mode
- Define interfaces in `@influix/types`
- Avoid `any`, use `unknown` if needed

### Services
- Business logic in services, not routes
- Keep routes thin (validation + delegation)
- Use Prisma for all DB access

### Error Handling
- Use custom Errors middleware class
- Consistent error response format
- Log errors for debugging

### Testing (Future)
- Unit tests for services
- Integration tests for routes
- E2E tests for critical flows

---

## 🎯 User Request Interpretation

When users ask for features, consider:

1. **"Add X feature"** → Where does it fit in the data model? Does it need a new table?
2. **"Fix X bug"** → Is it frontend, backend, or database-related? Add logging if needed
3. **"Improve X"** → Maintain consistency with existing patterns
4. **"Deploy X"** → Use `npm run deploy` for Workers, Pages auto-deploys on push

---

## 📊 Current Development Status

- ✅ Core infrastructure (monorepo, CI/CD)
- ✅ Authentication system
- ✅ Multi-tenant workspaces
- ✅ Content management basics
- ✅ Notes system
- ✅ Cloudflare Workers integration
- 🔄 AI insights integration (In progress)
- 🔄 Production database setup (Supabase + Hyperdrive)
- ⏳ Analytics dashboard (Planned)
- ⏳ Advanced AI features (Planned)

---

## 🔗 Useful Links

- **Monorepo Docs**: https://docs.npmjs.com/cli/v7/using-npm/workspaces
- **Prisma**: https://www.prisma.io/docs/
- **Supabase**: https://supabase.com/docs
- **Cloudflare Workers**: https://developers.cloudflare.com/workers/
- **Hono Framework**: https://hono.dev/
- **Tailwind CSS**: https://tailwindcss.com/docs
- **React Router**: https://reactrouter.com/
- **Zustand**: https://github.com/pmndrs/zustand

---

**Last Updated**: December 31, 2025
**Maintained By**: @skps2000
