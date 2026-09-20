# Z

### AI Prompt Analyzer

**Discover, create, and share AI prompts.**<br>
An open-source community platform for AI enthusiasts to find inspiration and publish prompts for ChatGPT, Midjourney, and other generative models.

[![Next.js](https://img.shields.io/badge/Next.js-13.4.9-black?logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18.2.0-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.3.2-38BDF8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose%207.3.2-47A248?logo=mongodb&logoColor=white)](https://mongoosejs.com/)
[![NextAuth](https://img.shields.io/badge/Auth-NextAuth%204.22.1-8B5CF6)](https://next-auth.js.org/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](#contributing)

</div>

---

> ### status: Sharing platform — not yet an analyzer
> **Z** is currently a **Next.js 13 full-stack CRUD app** for sharing prompts. There is **no prompt analysis, scoring, or LLM integration** implemented yet.
> The path from "share" to "analyze" is tracked in [`TODO.md`](./TODO.md).

---

## Table of Contents

- [Features](#features)
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

## Features

### Live

| Feature | Description | Location |
| :--- | :--- | :--- |
| **Google OAuth** | Sign in/out via NextAuth; user auto-created on first login | `app/api/auth/[...nextauth]/route.js:6` |
| **Create Prompt** | Authenticated users create a prompt + tag | `app/create-prompt/page.jsx:8`<br>`app/api/prompt/new/route.js:4` |
| **Feed + Search** | Browse all prompts; debounced search by username, tag, or content; click a tag to filter | `components/Feed/Feed.jsx:16` |
| **Copy to Clipboard** | One-click copy with tick feedback | `components/PromptCard/PromptCard.jsx:15` |
| **User Profiles** | View your own posts (`/profile`) and others' (`/profile/[id]`) | `app/profile/page.jsx:8`<br>`app/profile/[id]/page.jsx:8` |
| **Edit / Delete** | Owner-only edit and delete from the profile view | `app/update-prompt/page.jsx:9`<br>`app/api/prompt/[id]/route.js:23` |
| **Responsive Nav** | Desktop layout + mobile dropdown | `components/Nav/Nav.jsx:8` |

### Planned

LLM-powered analysis, likes, bookmarks, comments, pagination, and more — see the [Roadmap](#roadmap).

---

## Tech Stack

| Layer | Technology | Notes |
| :--- | :--- | :--- |
| **Framework** | Next.js `13.4.9` — App Router | `app/` directory · `next.config.js:3` |
| **UI** | React `18.2.0` · Tailwind CSS `3.3.2` | Custom gradients, glassmorphism, masonry `prompt_layout` — `styles/globals.css:1` |
| **Auth** | NextAuth `4.22.1` | Google Provider |
| **Database** | MongoDB + Mongoose `7.3.2` | `utils/database.js:5` · `models/` |
| **Tooling** | Prettier + `prettier-plugin-tailwindcss` | `bcrypt` is installed but currently unused |

---

## Project Structure

```text
app/
  api/
    auth/[...nextauth]/route.js   # NextAuth config + session callbacks
    prompt/route.js               # GET all prompts
    prompt/new/route.js           # POST create prompt
    prompt/[id]/route.js          # GET / PATCH / DELETE single prompt
    users/[id]/posts/route.js     # GET prompts by user
  create-prompt/page.jsx          # Create form wrapper
  update-prompt/page.jsx          # Edit form (query ?id=)
  profile/page.jsx                # My profile (my posts + edit/delete)
  profile/[id]/page.jsx           # Other user's profile
  layout.jsx                      # Root layout, Nav, SessionProvider
  page.jsx                        # Home: hero + <Feed />
components/
  Feed/Feed.jsx                   # Feed + search + tag filter
  PromptCard/PromptCard.jsx       # Card with copy, profile link, edit/delete
  Form/Form.jsx                   # Reusable Create/Edit form
  Nav/Nav.jsx                     # Navigation + auth buttons
  Profile/Profile.jsx             # Profile header + PromptCard grid
  Provider/Provider.jsx           # SessionProvider wrapper
models/
  user.js                         # User schema (email, username, image)
  prompt.js                       # Prompt schema (creator ref, prompt, tag)
utils/
  database.js                     # Mongoose connection singleton
public/assets/                    # logo.svg, grid.svg, icons (copy/tick/menu)
styles/globals.css                # Tailwind base + custom utilities
```

> **Path alias:** `@/*` → `./*`, configured in `jsconfig.json:3` (e.g. `@components/...`, `@utils/...`).

---

## Getting Started

### Prerequisites

- **Node.js** `>= 18`
- **MongoDB Atlas** URI (or a local MongoDB instance)
- **Google OAuth** credentials from the Google Cloud Console

### Installation

```bash
# 1. Clone
git clone <repo-url>
cd Ai-prompt-analyzer

# 2. Install dependencies
npm install

# 3. Configure environment (see below)
cp .env.example .env.local   # create this file, then fill in values

# 4. Start the dev server (Turbo)
npm run dev
# -> http://localhost:3000
```

### Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Start the dev server at `http://localhost:3000` |
| `npm run build` | Create a production build |
| `npm start` | Serve the production build |
| `npm run lint` | Run ESLint |

---

## Environment Variables

Create `.env.local` (or `.env`) in the project root:

```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/?retryWrites=true&w=majority
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxx
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-random-secret   # generate: openssl rand -base64 32
```

| Variable | Required | Used In |
| :--- | :---: | :--- |
| `MONGODB_URI` | ✅ | `utils/database.js:14` |
| `GOOGLE_CLIENT_ID` | ✅ | `app/api/auth/[...nextauth]/route.js:9` |
| `GOOGLE_CLIENT_SECRET` | ✅ | `app/api/auth/[...nextauth]/route.js:10` |
| `NEXTAUTH_URL` | ✅ (prod) | NextAuth |
| `NEXTAUTH_SECRET` | ✅ (prod) | NextAuth |

> 📌 No `.env.example` exists in the repo yet — this is tracked in [`TODO.md`](./TODO.md).

---

## API Reference

**Base URL:** `http://localhost:3000/api`

| Method | Endpoint | Auth | Description |
| :---: | :--- | :---: | :--- |
| `GET` | `/api/prompt` | — | List all prompts, `.populate('creator')` — `app/api/prompt/route.js:4` |
| `POST` | `/api/prompt/new` | ✅ | Create a prompt. Body: `{ userId, prompt, tag }` — `app/api/prompt/new/route.js:4` |
| `GET` | `/api/prompt/:id` | — | Get a single prompt — `app/api/prompt/[id]/route.js:5` |
| `PATCH` | `/api/prompt/:id` | Owner | Update `{ prompt, tag }` — `app/api/prompt/[id]/route.js:23` |
| `DELETE` | `/api/prompt/:id` | Owner | Delete a prompt — `app/api/prompt/[id]/route.js:47` |
| `GET` | `/api/users/:id/posts` | — | List prompts by user — `app/api/users/[id]/posts/route.js:4` |
| `GET/POST` | `/api/auth/[...nextauth]` | — | NextAuth Google flow — `app/api/auth/[...nextauth]/route.js:6` |

---

## Data Models

### User — `models/user.js:3`

```js
{
  email:    String,  // unique, required
  username: String,  // required, regex 8–20 chars
  image:    String
}
```

### Prompt — `models/prompt.js:4`

```js
{
  creator: ObjectId,  // -> User
  prompt:  String,    // required
  tag:     String     // required, single tag, stored without '#'
}
```

> **Database name:** `share_prompt` — `utils/database.js:15`

---

## Known Limitations

| Area | Issue |
| :--- | :--- |
| **Name vs. reality** | No AI analysis, scoring, or LLM call — only CRUD sharing. |
| **Framework** | Next.js 13.4 is EOL; `appDir: true` in `next.config.js:4` is now the default and a deprecated flag. |
| **Pagination** | None — `app/api/prompt/route.js:8` fetches all documents. |
| **Tags** | Single tag per prompt; no validation or normalization. |
| **Search** | Client-side, builds a `RegExp` from raw input (`components/Feed/Feed.jsx:35`) — can throw on invalid patterns and is unindexed. |
| **Auth** | `bcrypt` is unused; auth is OAuth-only. |
| **Deprecations** | `findByIdAndRemove` is deprecated (`app/api/prompt/[id]/route.js:51`). |
| **Typos** | `"Search fro tag"` (`components/Feed/Feed.jsx:65`), `"alredy"` (`utils/database.js:9`, `models/user.js:6`). |
| **Quality gates** | No tests, no CI, no env validation, no error boundaries. |

---

## Roadmap

The full prioritized backlog lives in [`TODO.md`](./TODO.md). Short version:

1. **Real Analyzer** — LLM-powered quality/vagueness scoring, suggestions, and token estimation.
2. **Upgrade to Next.js 15+** — fix deprecations, add `loading.tsx` / `error.tsx`.
3. **Search & Pagination** — server-side indexed search, pagination, multi-tag support.
4. **Security & Validation** — Zod validation, rate limiting, owner checks on PATCH/DELETE.
5. **UX** — likes, bookmarks, comments, and user settings.

---

## Contributing

PRs are welcome! Please:

1. Run `npm run lint` and `npx prettier --check .` before opening a PR.
2. Keep components in `components/<Name>/<Name>.jsx` with an `index.js` re-export.
3. Add API routes under `app/api/` and return proper HTTP status codes.

---

## License

ISC / MIT — see [`LICENSE`](./LICENSE).
