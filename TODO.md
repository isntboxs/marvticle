# Marvticle — Project Tracker

> Last updated: 2026-04-29
> Status: active build
> Runtime stack: Bun + React 19 + TanStack Start + TanStack Router + TanStack Query + TanStack Form
> App stack: Better Auth + Drizzle ORM + PostgreSQL + oRPC/OpenAPI + Tailwind CSS v4 + shadcn/ui + Tigris Storage

## Current Snapshot

- Repo ini bukan lagi scaffold blank. Fondasi app, auth, database, RPC, file upload, dan home feed sudah lengkap.
- **Routing aktif**: `/` (home feed), `/new` (create post), `/sign-in`, `/sign-up`, `/$username/$postSlug` (post detail), `/api/auth/$`, `/api/orpc/$`, `/api/s3/cover-image`.
- **Home feed**: Infinite scroll dengan TanStack Query + SSR prefetch, render published posts dengan PostFeedCard.
- **Create post**: Full-featured markdown editor dengan live preview, cover image upload ke Tigris S3-compatible storage via presigned URLs.
- **Post detail**: Render post content dengan markdown renderer.
- **Auth**: Better Auth dengan username/email + password, session management, halaman sign-in/sign-up.
- **Database**: Drizzle ORM dengan PostgreSQL, schema untuk auth tables + posts + users.
- **File upload**: S3-compatible storage (Tigris) untuk cover images dengan ownership-based path structure (`posts/cover/{userId}/{uuid}_{timestamp}.png`).
- **API layer**: oRPC contract/router untuk `posts.getMany`, `posts.getOneByUsernameAndSlug`, `posts.create`, `posts.update`, `posts.delete`.

### Recent Changes (2026-04-27)

- Fixed file deletion ownership verification menggunakan path-based approach (bukan S3 metadata, karena Tigris tidak mengembalikan metadata via HeadObject).
- File key sekarang include userId: `posts/cover/{userId}/{uuid}_{timestamp}.{ext}`.

### Not Yet Implemented

- Profile page
- Settings page
- Dashboard
- Bookmarks
- Comments
- Edit post
- Deployment target

## Environment And Commands

### Required env

- [x] `DATABASE_URL`
- [x] `BETTER_AUTH_SECRET`
- [x] `BETTER_AUTH_URL`
- [x] `VITE_APP_URL`
- [x] `AWS_ACCESS_KEY_ID`
- [x] `AWS_SECRET_ACCESS_KEY`
- [x] `AWS_ENDPOINT_URL_S3` (Tigris: https://t3.storage.dev)
- [x] `AWS_BUCKET_NAME`
- [x] `VITE_BUCKET_PUBLIC_URL`

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
- [x] Single post fetch by username and slug already exists at contract/router level.
- [x] Create post endpoint already exists and requires auth.
- [x] Create post endpoint now rejects authors without username because canonical post URLs depend on it.
- [ ] No update post endpoint yet.
- [ ] No delete post endpoint yet.
- [ ] No profile/settings endpoints yet.
- [ ] No bookmark/comment/like endpoints yet.

### UI And Routes

- [x] Public feed route `/` exists under app shell.
- [x] Authenticated create route `/new` exists under app shell.
- [x] Public post detail route `/$username/$postSlug` exists under app shell.
- [x] Navbar is already present and auth-aware.
- [x] Empty state, pending skeleton, spinner, and toast feedback already exist.
- [x] Feed card already shows author, date, reading time, likes, comments, and views.
- [x] Feed card title now links to the real detail route.
- [x] Create post CTA in navbar now links to `/new`.
- [ ] Profile menu items exist but are still placeholder actions.
- [ ] No edit post route yet.
- [ ] No dashboard route yet.
- [ ] No settings route yet.
- [ ] No user profile route yet.
- [ ] No 404/product-specific error UX yet beyond basic framework behavior.

## Active Gaps

- [ ] Connect navbar actions to real routes instead of placeholders.
- [ ] Wire profile/settings dropdown items to actual routes.
- [ ] Build edit/delete/dashboard flow around existing authoring model.
- [ ] Expose drafts somewhere before enabling draft creation in the public UI.
- [ ] Define whether canonical post URLs should remain username-aware or get an alias/redirect layer later.
- [ ] Decide whether feed should stay infinite scroll/button-based or switch to paginated route search params.
- [ ] Add local seed data to make feed/auth testing less manual.
- [ ] Add route protection for future authenticated app pages such as create, dashboard, and settings.
- [ ] Add better empty/error states for unauthenticated, not-found, and failed-query scenarios.

## Known Bugs And Risks

- [ ] Draft posts are still supported at API level, but there is no dashboard or draft detail route yet. The `/new` page intentionally publishes immediately to avoid sending users into a dead end.
- [ ] Canonical post URLs depend on `username`. Backend create now blocks users without username, but there is still no UI flow to repair legacy/OAuth accounts that might miss that field.
- [ ] Post detail still renders plain text content only. Rich text or markdown rendering is not implemented yet.
- [ ] Production build currently emits large chunk warnings, and Nitro logs a non-blocking `shiki/unwasm` fallback warning during build. It still completes successfully, but bundle hygiene should be reviewed.

## Near-Term Plan

### Milestone 1 — Close the current MVP gap

- [x] Add `/new` or equivalent create-post route.
- [x] Build post form with TanStack Form and submit through oRPC create mutation.
- [x] After create, redirect to the live post detail page with success toast.
- [x] Add username-aware detail route for published posts.
- [x] Wire feed cards to the real detail route.
- [ ] Decide when draft creation should be exposed in UI, since draft management surface still does not exist.

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

## Prioritized Implementation Roadmap

### Dependencies Analysis

**Dependency Chain (harus dikerjakan berurutan):**

```
1. Dashboard/My-Posts (Foundation)
   └── 2. Edit Post
   └── 3. Delete Post
   └── 4. Status Filtering (DRAFT/PUBLISHED/ARCHIVED)

5. User Profile Page
   └── 6. Settings Page (edit profile, avatar)

7. Comments System
   └── 8. Likes System (bisa parallel dengan comments)
   └── 9. Bookmarks (bisa parallel dengan comments/likes)
```

### Urutan Pengerjaan yang Direkomendasikan

#### Phase 1: Dashboard & Author Workflow (Wajib Pertama)

**Kenapa harus ini dulu:**

- User sudah bisa create post, tapi tidak ada tempat untuk melihat/mengelola post mereka
- Edit dan Delete post butuh UI entry point (dari dashboard)
- Draft posts sudah ada di DB tapi tidak ada UI untuk mengaksesnya

**Fitur yang harus dikerjakan (urutan dalam phase ini):**

1. **Dashboard/My-Posts Page** - halaman daftar semua post milik user yang login
2. **Edit Post endpoint + route** - `/posts/$postId/edit` atau `/$username/$postSlug/edit`
3. **Delete Post endpoint + confirmation flow** - dengan modal konfirmasi
4. **Status Filtering** - tab/filter untuk DRAFT, PUBLISHED, ARCHIVED di dashboard

#### Phase 2: Profile & Settings (Bisa Parallel dengan Phase 1 bagian akhir)

**Kenapa setelah/bareng dashboard:**

- Username sudah required untuk create post, tapi belum ada halaman profil
- Navbar dropdown sudah ada menu Profile/Settings tapi masih placeholder
- Independent dari post management, bisa dikerjakan bareng akhir Phase 1

**Fitur:** 5. **User Profile Page** - `/$username` - menampilkan semua post public milik user tersebut 6. **Settings Page** - `/settings` - edit profile, upload avatar, ganti password

#### Phase 3: Engagement Features (Terakhir)

**Kenapa terakhir:**

- Butuh user profile yang stabil dulu (siapa yang like/comment)
- Butuh post management yang lengkap dulu
- Ini fitur "nice to have" setelah core authoring flow lengkap

**Fitur (bisa parallel semua):** 7. **Comments** - schema, API, UI di post detail 8. **Likes** - schema, API, tombol like di feed dan detail 9. **Bookmarks** - schema, API, halaman reading list

### Critical Dependencies yang Harus Diperhatikan

| Fitur            | Bergantung Pada           | Alasan                                 |
| ---------------- | ------------------------- | -------------------------------------- |
| Edit Post        | Dashboard                 | Butuh entry point untuk edit           |
| Delete Post      | Dashboard                 | Butuh entry point untuk delete         |
| Status Filtering | Dashboard                 | Butuh halaman untuk menampilkan filter |
| Draft Access     | Dashboard + Status Filter | Draft tidak muncul di public feed      |
| Settings         | Auth Session              | Butuh data user yang login             |
| Profile Page     | Username field            | URL struktur pakai `/$username`        |
| Comments         | Auth + Profile            | Butuh identitas user yang comment      |
| Likes            | Auth                      | Butuh user yang like                   |
| Bookmarks        | Auth + Profile            | Butuh user yang bookmark               |

### Recommended Next Move (Updated)

**Mulai dari:** Implement Dashboard/My-Posts page - ini akan unlock Edit dan Delete post.

**Urutan eksekusi konkret:**

1. Dashboard page (`/dashboard` atau `/$username/dashboard`)
2. Edit post route + endpoint
3. Delete post flow
4. Status filter di dashboard (draft/published/archived)
5. Profile page + Settings page (bisa parallel)
6. Comments → Likes → Bookmarks
