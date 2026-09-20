# Agent Guide

## Project overview

This repository is **Z**, a Next.js 13 App Router application for discovering,
creating, searching, and sharing AI prompts. It currently provides prompt
sharing CRUD functionality; prompt scoring or LLM-powered analysis is planned
but is not implemented yet.

## Development setup

- Use Node.js 18 or newer.
- Install dependencies with `npm install`.
- Create `.env.local` in the repository root. Required variables are:
  `MONGODB_URI`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`,
  `NEXTAUTH_URL`, and `NEXTAUTH_SECRET`.
- Start the development server with `npm run dev`; it runs at
  `http://localhost:3000`.
- Do not commit `.env`, `.env.local`, credentials, API keys, or other secrets.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Next.js development server with Turbo |
| `npm run build` | Create a production build |
| `npm start` | Serve the production build |
| `npm run lint` | Run the configured Next.js lint command |
| `npx prettier --check .` | Check formatting |

There is currently no automated test suite. For changes that affect the
application, run the narrowest relevant checks and at minimum run lint and a
production build when practical.

## Repository layout

- `app/` contains pages, layouts, and API route handlers.
- `components/<Name>/` contains reusable UI components. Keep a component in
  `<Name>.jsx` and export it through that directory's `index.js` when following
  the existing pattern.
- `models/` contains Mongoose schemas.
- `utils/database.js` contains the MongoDB connection helper.
- `styles/globals.css` contains Tailwind base styles and project utilities.
- `public/assets/` contains static images and icons.
- `TODO.md` is the current prioritized roadmap, including planned analyzer
  functionality and known technical debt.

The `@*` path alias maps to the repository root. Existing imports commonly use
aliases such as `@components/...`, `@models/...`, and `@utils/...`.

## Implementation conventions

- Follow the existing JavaScript/JSX style and use functional React components.
- Keep server-only database and authentication work in server components or
  route handlers; do not import Mongoose into client components.
- API handlers should connect through `connectToDB()`, return appropriate HTTP
  status codes, and use consistent JSON responses.
- Preserve the existing NextAuth Google OAuth flow and verify authentication
  and ownership before changing or deleting user-owned prompts.
- Keep prompt and tag validation at API boundaries. Trim user input and avoid
  constructing regular expressions from unescaped user input.
- Reuse existing components and Tailwind utilities rather than introducing a
  second styling system.
- Keep changes focused. Do not rewrite unrelated files or remove existing
  uncommitted work.

## Verification checklist

Before submitting a change:

1. Confirm the affected page or API route works with the required environment
   variables configured.
2. Run `npm run lint`.
3. Run `npx prettier --check .` for formatting-sensitive changes.
4. Run `npm run build` for changes to routing, server code, configuration,
   dependencies, or data models.
5. Update `README.md` or `TODO.md` when behavior, setup, or planned work
   changes.

## Scope and safety

Treat `README.md` as the source of truth for the current feature set and
`TODO.md` as the backlog. Do not describe planned analyzer behavior as
implemented. Avoid destructive database operations and never expose secrets in
logs, responses, commits, or documentation.
