# VoidRouter upstream runtime inventory

Snapshot audited from `release/v3.8.55` at commit `16c9247c236d2a70e988750253cb1b06890d49d8` (17 November 2026). Counts are path-based and should be refreshed when the upstream base is advanced.

## Repository shape

| Inventory item | Count / finding |
|---|---:|
| Git tree entries | 32,428 |
| Next.js API Route Handler files under `src/app/api` | 810 |
| TypeScript/JavaScript files under `src/lib/db` | 267 |
| SQL files in repository | 240 |
| Files with migration in the path/name and SQL/TS/JS extension | 359 |
| Files under `src/lib/db/adapters` | 9 |
| Root Vercel configuration | Not present |
| Next.js config | `next.config.mjs` |

The migration-path count includes migration-related support files and is not a count of executable migration steps. Do not use it as a schema-version count.

## Database implementation

The current adapter family is SQLite-specific:

- `betterSqliteAdapter.ts`
- `bunSqliteAdapter.ts`
- `nodeSqliteAdapter.ts`
- `sqljsAdapter.ts`
- `driverFactory.ts`
- `types.ts` and diagnostics/runtime helpers

The public adapter contract is synchronous for `prepare().run/get/all`, `exec`, and transaction helpers. The core database module also owns local path resolution, SQLite health checks, WAL maintenance, backups, and startup initialization.

The current cloud-mode branch in `getDbInstance()` opens `:memory:`, creates the schema, and caches that database in process memory. This is not durable across Vercel Function instances or cold starts. The new `vercelPersistenceGuard.ts` deliberately rejects Vercel request-time database access until a durable adapter is integrated.

## HTTP and runtime implications

- 810 API route files means the port must preserve existing route behavior; do not replace the API surface with a small demo endpoint and call the port complete.
- Route handlers need an explicit runtime audit. Node-only modules, local filesystem writes, child processes, persistent listeners, and timers must be classified per route.
- Streaming HTTP/SSE is the target for model responses. A persistent in-process WebSocket server is not a Vercel Function deployment model.
- The absence of `vercel.json` is not itself a blocker: Next.js can be detected by Vercel. The blocker is runtime and persistence compatibility, not a missing config file.

## Immediate engineering consequence

A hosted libSQL/Turso adapter cannot be wired into the existing synchronous interface by changing a driver factory. A correct port needs an asynchronous persistence contract and a staged conversion of the domain modules and their callers, with migration parity and transaction tests. Until then, the Vercel guard is a safety measure, not a completed deployment implementation.
