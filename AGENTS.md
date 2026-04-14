# O Decimal — Agent instructions

Obsidian plugin that enhances the file explorer with prefix display modes (original / badge / hidden), numeric mixed sorting, and custom prefix regex. Plugin ID: `nerd-is-in-o-decimal`.

## Commands

```bash
pnpm install            # install deps (uses pnpm, not npm)
pnpm dev                # esbuild watch (no typecheck)
pnpm build              # tsc --noEmit first, then esbuild production bundle
pnpm lint               # eslint . (flat config at eslint.config.mts)
```

Before committing: `pnpm build && pnpm lint`. The build step doubles as typecheck (`tsc -noEmit`).

## Architecture

All source is flat in `src/` (no subdirectories):

| File | Role |
|---|---|
| `main.ts` | Plugin lifecycle, settings load/save, command registration |
| `settings.ts` | Settings tab UI, `ODecimalSettings` interface, defaults |
| `fileExplorerEnhancer.ts` | Core: observes file-explorer DOM, applies display transforms |
| `fileExplorer.ts` | Low-level file-explorer API access (internal Obsidian API) |
| `prefix.ts` | Prefix regex matching and parsing |
| `prefixDisplay.ts` | Display-mode rendering (original / badge / hidden) |
| `prefixStyle.ts` | Prefix style types and normalization |
| `styleManager.ts` | Injects CSS variables into the document |
| `treeSort.ts` | Numeric-aware mixed sorting for file-explorer items |
| `hiddenFilesManager.ts` | Syncs hidden files into the file-explorer view |
| `i18n.ts` | Translator factory (zh / en) |

Entry point: `src/main.ts` → bundled to root `main.js`.

## Key conventions

- **Indentation: tabs** (see `.editorconfig`).
- **ESLint**: flat config (`eslint.config.mts`) with `eslint-plugin-obsidianmd`. `src/styleManager.ts` disables `obsidianmd/no-forbidden-elements` because it manipulates DOM styles directly.
- **No automated tests** — verify changes by loading the built plugin into a vault.
- **CSS**: plugin styles live in `styles.css` (settings UI) and `styleManager.ts` (runtime CSS variables). Badge appearance uses CSS custom properties prefixed `--o-decimal-*`.
- **i18n**: user-facing strings go through `createTranslator()` from `i18n.ts`. Add new keys there, not hardcoded.

## Version and release

- Bump version via `npm version <major|minor|patch>` — the `version` script (`version-bump.mjs`) syncs `manifest.json` and `versions.json` automatically and stages them.
- Tags have no `v` prefix (`.npmrc`: `tag-version-prefix=""`).
- Pushing a tag triggers the `release` CI workflow, which verifies tag == manifest version == package version, builds, and attaches `main.js`, `manifest.json`, `styles.css` to the GitHub release.

## Things an agent might get wrong

- The package manager is **pnpm** (v10.30.2), not npm. The lockfile is `pnpm-lock.yaml`.
- `main.js` is gitignored — don't commit it. It's built by esbuild and attached to GitHub releases.
- `data.json` is gitignored — it's runtime plugin data created by Obsidian.
- `PRD.md` is also gitignored; it's the original requirements doc (Chinese), useful for understanding intent but may not match current implementation exactly.
- The plugin uses Obsidian internal APIs (file-explorer DOM, `view.registerSort`) that are not in the public API docs. `eslint-plugin-obsidianmd` warns about some of these; suppress only when intentional (see styleManager override in eslint config).
- `baseUrl` in tsconfig is `src/`, so imports like `"./prefix"` resolve from `src/`.
- This plugin only modifies **file explorer display** — it never renames real files or modifies links.
