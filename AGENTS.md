# Project Context

## Scaffold History

- Exact requested scratch scaffold command: `bunx @tanstack/cli@latest create my-tanstack-app --agent`
- Final repo base scaffold command: `bunx @tanstack/cli@latest create query-probe --non-interactive --package-manager bun --toolchain eslint --no-examples --add-ons tanstack-query,form --no-install`
- Follow-up TanStack Intent commands run after scaffolding:
  - `bunx @tanstack/intent@latest install`
  - `bunx @tanstack/intent@latest list`

## Stack And Integrations

- React + TanStack Start
- TanStack Router with file-based routing
- TanStack Query with router SSR integration
- TanStack Form with a minimal inline example on `/`
- Bun for package management
- ESLint + Prettier via `@tanstack/eslint-config`
- CodeRabbit as external repository tooling via GitHub App and `.coderabbit.yaml`

## Environment Variables

- None required for the current blank app

## Deployment Notes

- No deployment adapter was selected during scaffolding
- The project keeps the default TanStack Start + Vite setup
- If deployment is added later, prefer a real TanStack CLI add-on instead of custom wiring

## Key Architectural Decisions

- Keep the generated TanStack Start project shape rather than replacing it with a custom bootstrap
- Use a single `QueryClient` from router context in [src/integrations/tanstack-query/root-provider.tsx](/home/mrboxs/boxs-dev/personal/marvticle/src/integrations/tanstack-query/root-provider.tsx)
- Demonstrate TanStack Query through a route loader plus `useSuspenseQuery` backed by a Start server function in [src/lib/app-status.ts](/home/mrboxs/boxs-dev/personal/marvticle/src/lib/app-status.ts) and [src/routes/index.tsx](/home/mrboxs/boxs-dev/personal/marvticle/src/routes/index.tsx)
- Demonstrate TanStack Form directly in [src/routes/index.tsx](/home/mrboxs/boxs-dev/personal/marvticle/src/routes/index.tsx) to avoid extra component scaffolding
- Keep CodeRabbit out of runtime code; repository setup lives in GitHub + `.coderabbit.yaml`

## Known Gotchas

- On 2026-04-14, `bunx @tanstack/intent@latest list` failed in this environment with `FileNotFound: copying file dist/schema/tags.d.ts`
- Because `list` failed, TanStack skill discovery was done by searching installed packages for `skills/**/SKILL.md`
- No TanStack Query or TanStack Form skills were discovered in installed `node_modules`; routing and Start skills were available
- Do not add CodeRabbit secrets or credentials to client code; the standard GitHub App installation handles repository access externally

## Follow-Up Setup

- Install the CodeRabbit GitHub App for the target GitHub repository or org, then open or update a pull request to trigger reviews
- Replace the placeholder blank home route with product-specific routes when real app requirements exist
- Add a deployment adapter with the TanStack CLI if a target platform is chosen

## Next Steps

- Pick a deployment target if this app should ship somewhere specific
- Add application routes under `src/routes`
- Replace the placeholder form and query example when real data and UX requirements are known

## Agent skills

### Issue tracker

Issues are tracked in the repo's GitHub Issues. See `docs/agents/issue-tracker.md`.

### Triage labels

Uses default canonical labels: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Multi-context layout: `CONTEXT-MAP.md` at repo root maps to per-context `CONTEXT.md` files. See `docs/agents/domain.md`.

<!-- intent-skills:start -->
# Skill mappings - when working in these areas, load the linked skill file into context.
skills:
  - task: "TanStack Start app structure and React-specific framework work"
    load: "node_modules/@tanstack/react-start/skills/react-start/SKILL.md"
  - task: "TanStack Router route files, loaders, navigation, and router context"
    load: "node_modules/@tanstack/router-core/skills/router-core/SKILL.md"
  - task: "TanStack Start server functions and server-only logic"
    load: "node_modules/@tanstack/start-client-core/skills/start-core/server-functions/SKILL.md"
<!-- intent-skills:end -->
