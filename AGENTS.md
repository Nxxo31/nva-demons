## PROJECT.md — Fuente de Verdad (OBLIGATORIO)
PROJECT.md es la **unica fuente de verdad** del estado, desarrollo y documentacion de este proyecto.
- Leer PROJECT.md ANTES de cualquier accion.
- Actualizar PROJECT.md DESPUES de cada desarrollo significativo.
- No crear .md separados para specs, docs o arquitectura — todo va en PROJECT.md.

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## MCP Tools — MANDATORY for this project

| Task | Tool | NEVER use |
|------|------|-----------|
| Understand component structure | `mcp__lsp_intelligence__document_symbols` | grep |
| Verify type safety | `mcp__lsp_intelligence__live_diagnostics` | tsc --noEmit |
| Edit TSX/TS files | `mcp__zenith__edit_file or write_file` | sed |
| Search across codebase | `mcp__zenith__search_files` | grep, rg |
| Commit to GitHub | `mcp__github__push_files` | git commit + git push |
| Code review | `mcp__mcp_code_review_pro__review_diff` | manual inspection only |
| Visual QA | `mcp__playwright__browser_take_screenshot + browser_snapshot` | guessing UI |

## Test Strategy
- Playwright: visual QA (3D desert scene, events, checkout flow, tickets page)
- LSP live_diagnostics: 0 type errors
- npm run build: compile check
- Three.js perf: FPS monitor, AdaptiveDpr active

## Development loop (MCP-first)
1. Read PROJECT.md FIRST
2. `mcp__lsp_intelligence__document_symbols` on files to modify — understand structure before editing
3. Edit via `mcp__zenith__edit_file` or `write_file` — NEVER sed for code
4. `mcp__lsp_intelligence__live_diagnostics` after edit — 0 errors
5. Code review via `mcp__mcp_code_review_pro__review_diff` or `delegate_task`
6. gitleaks on staged diff
7. Update PROJECT.md before commit
8. Commit via `mcp__github__push_files` — atomic conventional commit

## Development loop for this project

1. Read PROJECT.md → check active phase and known limitations
2. `git status` → ver estado del repo
3. Verificar LSP activo: `hermes lsp status` — si no hay clientes: `hermes lsp restart`
   **Nota en WSL**: El servidor LSP de TypeScript está instalado, pero el cliente solo se conecta cuando un editor (VS Code, etc.) abre un archivo `.ts` o `.tsx`. Mientras no haya un archivo abierto, `hermes lsp status` mostrará `active clients: none`; esto es esperado y no indica un problema. La fuente de verdad para tipos es `mcp__lsp_intelligence__live_diagnostics`, que debe dar 0 errores antes de hacer commit.
4. Skills loaded automatically by the agent before writing code: based on the project's stack (e.g., for Electron projects: electron-desktop-dev; for Next.js: nextjs-best-practices; for Go: go-environment-setup, etc.). The agent loads the appropriate stack-specific skills without needing a file reminder.
5. For tasks >1 archivo or UI work: the agent thinks first about what it's going to build, shows mockups if UI, and only then writes code. No intermediate .md files — design lives inline in PROJECT.md if needed.
6. **LSP gate**: `mcp__lsp_intelligence__live_diagnostics` en archivos modificados — 0 errores
7. **Code review gate**: `delegate_task` con skill `code-review-and-quality` — todos los findings addressados
8. **Secret scan gate**: run `gitleaks detect --staged` (via terminal tool) — no secrets detected
9. Update PROJECT.md with results BEFORE commit (only project doc allowed)
10. **Commit gate**: use GitHub MCP tools to create a commit with conventional message (type(scope): description) and push to the current branch.
11. Next task immediately.

NO vitest, NO jest, NO playwright, NO `tsc --noEmit` directo. Los gates son determinísticos: LSP live_diagnostics + delegate_task review + gitleaks + GitHub commit.
NO separate spec files, drift reports, docs/specs/, architecture overviews, or any .md outside PROJECT.md. Everything goes in PROJECT.md.

