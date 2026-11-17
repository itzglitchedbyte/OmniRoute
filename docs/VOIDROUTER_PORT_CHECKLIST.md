# VoidRouter Vercel port: implementation checklist

This checklist tracks actual engineering gates. Items are intentionally unchecked until code and tests demonstrate completion.

## Repository and runtime inventory
- [ ] Map all Next.js routes and API compatibility surface.
- [ ] Find all synchronous database call sites, including transactions and raw adapter access.
- [ ] Find all filesystem writes/reads used for persistent state, uploads, logs, and backups.
- [ ] Find timers, child processes, startup hooks, local listeners, WebSocket servers, and singleton state.
- [ ] Classify each feature as preserve, adapt, replace, or unsupported on Vercel.

## Durable storage
- [ ] Specify an async database contract with explicit transaction semantics.
- [ ] Implement hosted libSQL adapter.
- [ ] Port migrations and verify idempotency.
- [ ] Port domain modules without silently changing consistency behavior.
- [ ] Add integration tests against a real hosted test database.
- [ ] Fail closed if production is configured with ephemeral/local SQLite.

## Vercel runtime
- [ ] Ensure all API entry points are supported Route Handlers.
- [ ] Implement and test SSE streaming, including client disconnect/abort.
- [ ] Remove assumptions about persistent timers and process lifetime.
- [ ] Replace filesystem persistence with database or durable storage.
- [ ] Verify function bundle size and execution duration against current Vercel limits.

## Security and operations
- [ ] Encrypt provider credentials at rest and test key rotation.
- [ ] Hash user API keys when plaintext recovery is unnecessary.
- [ ] Verify tenant isolation and authorization on every data access path.
- [ ] Add rate limits and bounded provider retries/timeouts.
- [ ] Document required environment variables and secret generation.
- [ ] Document no-credit-card signup checks and free-tier quota ceilings.

## Release validation
- [ ] Lint and typecheck pass.
- [ ] Unit and integration suites pass.
- [ ] Production Vercel build passes.
- [ ] Hosted database smoke test passes.
- [ ] Cold-start and multi-instance persistence tests pass.
- [ ] API compatibility tests pass for models, non-streaming, and streaming chat completions.
- [ ] Deployment guide and troubleshooting guide are complete.
- [ ] Upstream MIT license and notices remain intact.
