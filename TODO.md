# TODO — Z Roadmap

> Prioritized backlog. Check `[ ]` items as you go. Target: turn a **prompt-sharing** clone into a real **prompt analyzer**.

Date created: 2026-09-20

---

## P0 — Critical Fixes (Do First)

- [ ] **Fix typos** — `components/Feed/Feed.jsx:65` `Search fro tag`, `utils/database.js:9` `alredy`, `models/user.js:6` `alredy`, `app/api/auth/[...nextauth]/route.js:28` `chect`
- [ ] **Harden search regex** — `components/Feed/Feed.jsx:35` escapes `searchText` (`new RegExp(escapeRegExp(...))`) or switch to case-insensitive `includes()`; prevents crash on inputs like `*(` or `(`
- [ ] **Add `.env.example`** — template with `MONGODB_URI`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`
- [ ] **Fix NextAuth `session` callback** — `app/api/auth/[...nextauth]/route.js:15` handle `sessionUser == null` (throw/return early) to avoid `Cannot read _id of null`
- [ ] **Username creation collision** — `app/api/auth/[...nextauth]/route.js:35` `profile.name.replaceAll(' ', '')` can violate `models/user.js:12` regex (8-20 chars, unique). Add fallback + uniqueness check + slugify
- [ ] **Replace deprecated `findByIdAndRemove`** — `app/api/prompt/[id]/route.js:51` → `findByIdAndDelete`
- [ ] **Remove unused `bcrypt`** — either implement credentials auth or `npm uninstall bcrypt` (`package.json:13`)
- [ ] **Add owner authorization on PATCH/DELETE** — `app/api/prompt/[id]/route.js:23` / `:47` verify `session.user.id === existingPrompt.creator`

## P1 — Make It Actually an Analyzer

Core value proposition missing — repo name promises analysis.

- [ ] **Define analyzer spec** — what scores? e.g.: clarity, specificity, context, role-definition, constraints, token efficiency, jailbreak/harm risk
- [ ] **Choose LLM provider** — OpenAI / Anthropic / local (Ollama). Add `OPENAI_API_KEY` env + `utils/analyzer.js` wrapper
- [ ] **API: `POST /api/analyze`** — input `prompt`, output `{ score 0-100, breakdown, suggestions[], improvedPrompt, tokenEstimate }`
- [ ] **UI: Analyzer page** — `/analyze` with textarea, live score gauge, suggestion list, "Apply improvement" button
- [ ] **Inline analysis on create/edit** — `components/Form/Form.jsx:3` add "Analyze" button + feedback before submit
- [ ] **Batch analyze feed** — opt-in badge on `components/PromptCard/PromptCard.jsx:9` showing score (cached in DB)
- [ ] **Persist analysis** — extend `models/prompt.js:4` with `analysis: { score, breakdown, updatedAt }`
- [ ] **Prompt improvement history** — version/iteration tracking

## P2 — Upgrade & Tech Debt

- [ ] **Upgrade Next.js `13.4.9` → `14` or `15`** — remove `experimental.appDir` flag (`next.config.js:4`), migrate `next-auth` to `Auth.js v5` if needed, test `app/` breaking changes
- [ ] **Migrate images domains → remotePatterns** — `next.config.js:8` `domains` is deprecated
- [ ] **Replace `mongoose` options** — `utils/database.js:16` remove `useNewUrlParser` / `useUnifiedTopology` (deprecated in Mongoose 7+)
- [ ] **Add validation** — Zod schemas for all `app/api/**/route.js` bodies; strip `#` prefix, normalize tag to lowercase, trim/length checks
- [ ] **Add pagination + server-side search** — `app/api/prompt/route.js:4` add `?q=&page=&limit=&tag=` with MongoDB text index or Atlas Search; update `components/Feed/Feed.jsx:16` to call server search
- [ ] **Multi-tag support** — `models/prompt.js:13` `tag: String` → `tags: [String]` with deduplication
- [ ] **Add `loading.jsx` / `error.jsx` / `not-found.jsx`** in each `app/` segment
- [ ] **Add proper path aliases** — `jsconfig.json:4` narrow `@/*` to `@components/*`, `@models/*`, etc. to avoid collisions
- [ ] **Add tests** — Vitest/Jest + React Testing Library for `Feed`, `PromptCard`, API routes
- [ ] **Add ESLint config** — `npm run lint` currently has no `.eslintrc`

## P3 — Security & Reliability

- [ ] **Input sanitization & rate limiting** — add `next-rate-limit` or Upstash on `POST /api/prompt/new` and `/api/analyze`
- [ ] **Env validation at startup** — `utils/database.js:5` throw if `MONGODB_URI` missing; add `lib/env.js` with Zod
- [ ] **CSRF / ownership checks** — ensure `DELETE`/`PATCH` require authenticated session (`getServerSession`)
- [ ] **Error handling** — consistent JSON error shape `{ error, details }`, proper `.catch` logging (currently `console.log` only)
- [ ] **Indexed DB queries** — `db.prompts.createIndex({ prompt: "text", tag: "text" })`, `creator` index, `user.email` unique already but verify
- [ ] **Remove `debug: true`** in production — `app/api/auth/[...nextauth]/route.js:51`
- [ ] **Add Sentry / logging** — replace raw `console.log` with structured logging

## P4 — UX / Product Enhancements

- [ ] **Likes / Bookmarks / Views** — new `models/like.js`, counters on `Prompt` schema
- [ ] **Comments** — `models/comment.js` + `app/api/prompt/[id]/comments/route.js`
- [ ] **Sort & filter** — by popular, recent, tag cloud, trending
- [ ] **Copy analytics** — track copy count, show popular prompts
- [ ] **User settings** — edit username/bio, delete account, avatar upload
- [ ] **Dark mode** — toggle + persist, update `styles/globals.css:76` utilities
- [ ] **Share page** — `/prompt/[id]` public detail view with OG meta (`app/layout.jsx:6` metadata per page)
- [ ] **SEO** — `sitemap.js`, `robots.txt`, `opengraph-image`, `twitter-image`
- [ ] **Accessibility** — labels, focus rings, `aria-*` on `components/Form/Form.jsx`
- [ ] **Empty / loading skeletons** — Feed skeleton, empty state illustration
- [ ] **Debounce hook extraction** — `components/Feed/Feed.jsx:42` replace manual `setTimeout` + `searchTimeout` state with `useDebounce` hook

## P5 — DevOps & DX

- [ ] **Add `README` badges** — build, license, Next.js version
- [ ] **CI (GitHub Actions)** — lint, build, test on PR
- [ ] **Husky + lint-staged** — pre-commit `prettier --check` + `eslint`
- [ ] **Dockerfile + docker-compose** — for local Mongo + Next.js
- [ ] **Vercel deploy** — connect repo, set envs, add deploy preview comment
- [ ] **Dependabot / Renovate** — auto-updates for `next`, `mongoose`, `next-auth`
- [ ] **Changelog & versioning** — `CHANGELOG.md` + semver

---

## Suggested Milestones

| Milestone | Scope | ETA |
|---|---|---|
| **v0.2 — Stabilize** | P0 fixes + `.env.example` + validation + pagination | 1–2 weeks |
| **v0.5 — Analyzer MVP** | P1 first 5 items — single LLM call, score + suggestions | 2–4 weeks |
| **v1.0 — Production-ready** | P2 upgrades + P3 security + tests + deploy | 4–6 weeks |
| **v1.5 — Community** | P4 likes/comments/share + P5 CI/CD | 6–8 weeks |

---

## Notes

- Current DB is `share_prompt` (`utils/database.js:15`) — consider renaming to `z` or `z_prompts` to match **Z** branding during next migration.
- Branding is now **Z** everywhere (`app/layout.jsx:7`, `package.json:2`, `components/Nav/Nav.jsx:33`, `app/page.jsx:10`). Keep it consistent — avoid reintroducing old names.
