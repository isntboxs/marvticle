# Marvticle — Project Tracker

> Last updated: 2026-04-22
> Status: active build
> Runtime stack: Bun + React 19 + TanStack Start + TanStack Router + TanStack Query + TanStack Form
> App stack: Better Auth + Drizzle ORM + PostgreSQL + oRPC/OpenAPI + Tailwind CSS v4 + shadcn/ui

## Current Snapshot

- Repo ini bukan lagi scaffold blank. Fondasi app, auth, database, RPC, dan home feed awal sudah ada.
- Routing yang aktif saat ini: `/`, `/sign-in`, `/sign-up`, `/api/auth/$`, `/api/orpc/$`.
- Feed home sudah render published posts via TanStack Query infinite query dengan SSR prefetch dari route loader.
- Auth username/email + password sudah terhubung ke Better Auth, lengkap dengan halaman sign-in dan sign-up.
- Database schema awal dan migration sudah ada untuk auth tables + posts.
- API layer sudah punya oRPC contract/router untuk `posts.getMany`, `posts.getOnePostSlug`, dan `posts.create`.
- UI untuk create/edit/detail post, profile, settings, dashboard, bookmark, dan comments belum ada.
- Deployment target belum dipilih. Project masih pakai default TanStack Start + Vite/Nitro output.

## Environment And Commands

### Required env

- [x] `DATABASE_URL`
- [x] `BETTER_AUTH_SECRET`
- [x] `BETTER_AUTH_URL`
- [x] `VITE_APP_URL`

### Core commands

- [x] `bun run dev`
- [x] `bun run build`
- [x] `bun run test`
- [x] `bun run lint`
- [x] `bun run check`
- [x] `bun run db:push`
- [x] `bun run db:generate`
- [x] `bun run db:migrate`
- [x] `bun run db:studio`

## What Is Already Done

### Foundation

- [x] TanStack Start app scaffolded and running on Bun.
- [x] TanStack Router file-based routing is wired.
- [x] Router context already injects shared `queryClient` and `orpc` client.
- [x] SSR query integration already enabled with `@tanstack/react-router-ssr-query`.
- [x] Root shell already includes theme provider, tooltip provider, toaster, and TanStack devtools.
- [x] Tailwind CSS v4 and shadcn/ui primitives are already installed and used.
- [x] ESLint, Prettier, Vitest, and CodeRabbit config are already present.

### Authentication

- [x] Better Auth server is configured with Drizzle adapter.
- [x] Auth API endpoint exists at `/api/auth/$`.
- [x] Session can be read from TanStack Start server function via `getAuthFn`.
- [x] Root route loads auth session into router context before rendering.
- [x] Sign-in page exists and uses TanStack Form validation + Better Auth client.
- [x] Sign-up page exists and uses TanStack Form validation + Better Auth client.
- [x] Auth layout already redirects signed-in users away from `/sign-in` and `/sign-up`.
- [x] Sign-out action is already wired in navbar dropdown.
- [ ] OAuth provider flow exists only at config level; no UI/button wiring yet.

### Data Layer

- [x] Drizzle database client is configured with `node-postgres`.
- [x] Auth schema is already modeled in `src/db/schemas/auth.ts`.
- [x] Posts schema already exists with `DRAFT`, `PUBLISHED`, `ARCHIVED` status.
- [x] Post counters already exist for views, likes, and comments.
- [x] Initial SQL migration already exists under `src/db/migrations`.
- [ ] No seed script yet for local demo data.

### API And Server Logic

- [x] oRPC context already injects auth session and DB connection.
- [x] OpenAPI reference endpoint is served from `/api/orpc/reference`.
- [x] Published posts list endpoint already supports cursor pagination.
- [x] Single post fetch by slug already exists at contract/router level.
- [x] Create post endpoint already exists and requires auth.
- [ ] No update post endpoint yet.
- [ ] No delete post endpoint yet.
- [ ] No profile/settings endpoints yet.
- [ ] No bookmark/comment/like endpoints yet.

### UI And Routes

- [x] Public feed route `/` exists under app shell.
- [x] Navbar is already present and auth-aware.
- [x] Empty state, pending skeleton, spinner, and toast feedback already exist.
- [x] Feed card already shows author, date, reading time, likes, comments, and views.
- [ ] Feed card title still links to `.`; real detail route is not wired yet.
- [ ] Create post CTA exists in navbar but has no route/action behind it yet.
- [ ] Profile menu items exist but are still placeholder actions.
- [ ] No post detail route yet.
- [ ] No create post route yet.
- [ ] No edit post route yet.
- [ ] No dashboard route yet.
- [ ] No settings route yet.
- [ ] No user profile route yet.
- [ ] No 404/product-specific error UX yet beyond basic framework behavior.

## Active Gaps

- [ ] Connect navbar actions to real routes instead of placeholders.
- [ ] Build authenticated create-post flow around existing `posts.create` RPC.
- [ ] Add post detail route that consumes existing `posts.getOnePostSlug`.
- [ ] Define canonical route shape for posts, ideally slug-based and username-aware only if really needed.
- [ ] Decide whether feed should stay infinite scroll/button-based or switch to paginated route search params.
- [ ] Add local seed data to make feed/auth testing less manual.
- [ ] Add route protection for future authenticated app pages such as create, dashboard, and settings.
- [ ] Add better empty/error states for unauthenticated, not-found, and failed-query scenarios.

## Near-Term Plan

### Milestone 1 — Close the current MVP gap

- [ ] Add `/new` or equivalent create-post route.
- [ ] Build post form with TanStack Form and submit through oRPC create mutation.
- [ ] After create, redirect to either draft detail page or feed with success toast.
- [ ] Add `/posts/$slug` detail route using the existing post-by-slug API.
- [ ] Wire feed cards to the real detail route.
- [ ] Decide whether first release supports draft-only create or full publish workflow.

### Milestone 2 — Author workflow

- [ ] Add edit post endpoint and route.
- [ ] Add delete post endpoint and confirmation flow.
- [ ] Add dashboard/my-posts page for signed-in users.
- [ ] Add status filtering for `DRAFT`, `PUBLISHED`, and `ARCHIVED`.
- [ ] Add simple author ownership checks in router/API/UI flow.

### Milestone 3 — Account surface

- [ ] Add profile route by username.
- [ ] Add settings route for profile editing.
- [ ] Decide whether avatar upload stays generated/URL-based or gets real upload storage.
- [ ] Expose current user data cleanly for navbar/profile pages without duplicated fetch logic.

### Milestone 4 — Engagement

- [ ] Implement comments schema and API.
- [ ] Implement likes schema and API.
- [ ] Implement bookmarks/reading list schema and API.
- [ ] Replace placeholder count buttons with real interactions.

## Later Backlog

- [ ] Search and tags.
- [ ] Rich markdown rendering for post detail.
- [ ] Cover image upload flow.
- [ ] Better content editor UX.
- [ ] Social login UI if OAuth providers are going to be used.
- [ ] Production deployment target and adapter selection.
- [ ] E2E test coverage for auth and author workflow.
- [ ] Observability/logging cleanup for production readiness.

## Guardrails

- [ ] Keep implementation aligned with TanStack Start patterns, not Next.js conventions.
- [ ] Keep server-only DB/auth logic inside TanStack Start server functions or server handlers.
- [ ] Reuse existing shared `queryClient` and router context instead of creating per-route clients.
- [ ] Keep Better Auth secrets and DB credentials server-only.
- [ ] Prefer extending existing oRPC contracts/routers before adding ad-hoc fetch code.

## Recommended Next Move

- [ ] Implement the first real authoring slice end-to-end: create post route, create mutation, success redirect, and detail route.
