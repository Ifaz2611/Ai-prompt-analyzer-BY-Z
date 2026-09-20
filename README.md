# Z — AI Prompt Analyzer

> **Z** — Discover, create, and share AI prompts. An open-source community platform for AI enthusiasts to find inspiration and publish prompts for ChatGPT, Midjourney, and other generative models.

This project is a **Next.js 13** full-stack CRUD app branded as **Z** (`package.json:2`, `app/layout.jsx:7`, `components/Nav/Nav.jsx:33`). In its current state it is a prompt *sharing* platform — **no prompt analysis / scoring / LLM integration** is implemented yet. See `TODO.md` for the roadmap to add real analyzer capabilities.

---

## Table of Contents
- [Live Features](#live-features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [Data Models](#data-models)
- [Known Limitations](#known-limitations)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## Live Features

| Feature | Description | Location |
|---|---|---|
| **Google OAuth** | Sign in/out via NextAuth, auto-create user on first login | `app/api/auth/[...nextauth]/route.js:6` |
| **Create Prompt** | Authenticated users create prompt + tag | `app/create-prompt/page.jsx:8` , `app/api/prompt/new/route.js:4` |
| **Feed + Search** | Browse all prompts, debounce search by username/tag/content, click tag to filter | `components/Feed/Feed.jsx:16` |
| **Copy to Clipboard** | One-click copy with tick feedback | `components/PromptCard/PromptCard.jsx:15` |
| **User Profiles** | View own posts (`/profile`) and others (`/profile/[id]`) | `app/profile/page.jsx:8` , `app/profile/[id]/page.jsx:8` |
| **Edit / Delete** | Owner-only edit/delete from profile view | `app/update-prompt/page.jsx:9` , `app/api/prompt/[id]/route.js:23` |
| **Responsive Nav** | Desktop + mobile dropdown | `components/Nav/Nav.jsx:8` |

## Tech Stack

- **Framework:** Next.js `13.4.9` with App Router (`app/` directory) — `next.config.js:3`
- **UI:** React `18.2.0`, Tailwind CSS `3.3.2`, `styles/globals.css:1` (custom gradients, glassmorphism, masonry `prompt_layout`)
- **Auth:** NextAuth `4.22.1` with Google Provider
- **Database:** MongoDB + Mongoose `7.3.2` (`utils/database.js:5`, `models/`)
- **Other:** `bcrypt` installed but unused, `prettier` + `prettier-plugin-tailwindcss` for formatting

## Project Structure

```
app/
  api/
    auth/[...nextauth]/route.js   # NextAuth config + session callbacks
    prompt/route.js                # GET all prompts
    prompt/new/route.js            # POST create prompt
    prompt/[id]/route.js           # GET / PATCH / DELETE single prompt
    users/[id]/posts/route.js      # GET prompts by user
  create-prompt/page.jsx           # Create form wrapper
  update-prompt/page.jsx           # Edit form (query ?id=)
  profile/page.jsx                 # My profile (my posts + edit/delete)
  profile/[id]/page.jsx            # Other user's profile
  layout.jsx                       # Root layout, Nav, SessionProvider
  page.jsx                         # Home: hero + <Feed />
components/
  Feed/Feed.jsx                    # Feed + search + tag filter
  PromptCard/PromptCard.jsx        # Card with copy, profile link, edit/delete
  Form/Form.jsx                    # Reusable Create/Edit form
  Nav/Nav.jsx                      # Navigation + auth buttons
  Profile/Profile.jsx              # Profile header + PromptCard grid
  Provider/Provider.jsx            # SessionProvider wrapper
models/
  user.js                          # User schema (email, username, image)
  prompt.js                        # Prompt schema (creator ref, prompt, tag)
utils/
  database.js                      # Mongoose connection singleton
public/assets/                     # logo.svg, grid.svg, icons (copy/tick/menu)
styles/globals.css                 # Tailwind base + custom utilities
```

Path alias `@/*` mapped to `./*` in `jsconfig.json:3` (e.g., `@components/...`, `@utils/...`).

## Getting Started

### Prerequisites
- Node.js `>= 18`
- MongoDB Atlas URI (or local MongoDB)
- Google OAuth credentials (Cloud Console)

### Installation

```bash
# 1. Clone
git clone <repo-url>
cd Ai-prompt-analyzer

# 2. Install
npm install

# 3. Configure env (see below)
cp .env.example .env.local  # create this file
# fill in values

# 4. Run dev server (Turbo)
npm run dev
# -> http://localhost:3000

# 5. Build / Production
npm run build
npm start

# 6. Lint
npm run lint
```

## Environment Variables

Create `.env.local` / `.env` in the project root:

```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/?retryWrites=true&w=majority
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxx
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-random-secret  # generate: openssl rand -base64 32
```

> Currently no `.env.example` exists — this is tracked in `TODO.md`.

| Var | Required | Used In |
|---|---|---|
| `MONGODB_URI` | Yes | `utils/database.js:14` |
| `GOOGLE_CLIENT_ID` | Yes | `app/api/auth/[...nextauth]/route.js:9` |
| `GOOGLE_CLIENT_SECRET` | Yes | `app/api/auth/[...nextauth]/route.js:10` |
| `NEXTAUTH_URL` | Yes (prod) | NextAuth |
| `NEXTAUTH_SECRET` | Yes (prod) | NextAuth |

## API Reference

Base: `http://localhost:3000/api`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/prompt` | No | List all prompts `.populate('creator')` — `app/api/prompt/route.js:4` |
| `POST` | `/api/prompt/new` | Yes | Create prompt. Body: `{ userId, prompt, tag }` — `app/api/prompt/new/route.js:4` |
| `GET` | `/api/prompt/:id` | No | Get single prompt — `app/api/prompt/[id]/route.js:5` |
| `PATCH` | `/api/prompt/:id` | Owner | Update `{ prompt, tag }` — `app/api/prompt/[id]/route.js:23` |
| `DELETE` | `/api/prompt/:id` | Owner | Delete prompt — `app/api/prompt/[id]/route.js:47` |
| `GET` | `/api/users/:id/posts` | No | List prompts by user — `app/api/users/[id]/posts/route.js:4` |
| `GET/POST` | `/api/auth/[...nextauth]` | — | NextAuth Google flow — `app/api/auth/[...nextauth]/route.js:6` |

## Data Models

**User** — `models/user.js:3`
```js
{
  email: String (unique, required),
  username: String (required, regex 8-20 chars),
  image: String
}
```

**Prompt** — `models/prompt.js:4`
```js
{
  creator: ObjectId -> User,
  prompt: String (required),
  tag: String (required) // single tag, stored without '#'
}
```

Database name: `share_prompt` — `utils/database.js:15`.

## Known Limitations

- **Name vs. reality:** No AI analysis, scoring, or LLM call — only CRUD sharing (see Roadmap).
- **Next.js 13.4** is EOL; `appDir: true` in `next.config.js:4` is now default and deprecated flag.
- **No pagination / infinite scroll** — `app/api/prompt/route.js:8` fetches all documents.
- **Single tag** per prompt, no validation/normalization.
- **Client-side search** uses `RegExp` from raw input (`components/Feed/Feed.jsx:35`) — can throw on invalid regex and is unindexed.
- **`bcrypt` unused** — auth is OAuth only.
- **`findByIdAndRemove`** is deprecated (`app/api/prompt/[id]/route.js:51`).
- **Typos:** `"Search fro tag"` (`components/Feed/Feed.jsx:65`), `"alredy"` (`utils/database.js:9`, `models/user.js:6`).
- **No tests, no CI, no `env` validation, no error boundaries.**

## Roadmap

Short version — the full prioritized backlog is in [`TODO.md`](./TODO.md):

1. **Real Analyzer** — LLM-powered quality/vagueness scoring, suggestions, token estimate.
2. **Upgrade to Next.js 15+**, fix deprecations, add `loading.tsx`/`error.tsx`.
3. **Search & Pagination** — server-side indexed search, pagination, multi-tag.
4. **Security & Validation** — Zod validation, rate limiting, owner checks on PATCH/DELETE.
5. **UX** — likes, bookmarks, comments, user settings.

## Contributing

PRs welcome. Please:
1. Run `npm run lint` and `npx prettier --check .`.
2. Keep components in `components/<Name>/<Name>.jsx` + `index.js` re-export.
3. Add API routes under `app/api/` with proper status codes.

## License

ISC / MIT — see [`LICENSE`](./LICENSE).

---

Built for **Z** — evolving from a prompt-sharing starter toward a full AI Prompt *Analyzer*.
