# VoidRouter: Vercel port architecture

> Status: engineering plan; this document does not claim that the Vercel port is deployable yet.

VoidRouter is a Vercel-oriented derivative of OmniRoute. The goal is to retain the upstream provider integrations, OpenAI-compatible API, model discovery, routing, fallback, key management, and dashboard while replacing assumptions that require a persistent Node.js host.

## Non-negotiable constraints

- Vercel deployment must use request-scoped/serverless execution. Do not start a persistent listener, WebSocket server, child process, or background worker from a Function.
- Persistent state must live outside the Function filesystem. The deployment filesystem is not a durable database or artifact store.
- A provider's API key is supplied by the user. VoidRouter does not provide free model inference.
- The baseline must not require a credit card to create its database or hosting account. Free-tier quotas and acceptable-use terms still apply and can change.
- Keep the upstream MIT license and copyright notices intact. This file does not replace the upstream LICENSE.
- Never silently fall back to ephemeral local storage for production secrets, API keys, sessions, or user data.

## Architecture decision record

### Database: libSQL/Turso is the first candidate, not a drop-in replacement

The upstream database contract is synchronous SQLite: callers use synchronous `prepare().get/all/run`, transactions, pragmas, checkpoints, and filesystem backup APIs. Turso's hosted libSQL client is asynchronous and remote. Replacing the connection string or swapping the adapter alone would break call sites and transaction assumptions.

Required work before enabling hosted persistence:

1. Inventory every direct database call and classify read, write, transaction, pragma, and backup behavior.
2. Define an asynchronous storage contract and transaction boundary.
3. Port domain modules incrementally, preserving parameter binding and migration ordering.
4. Add a libSQL adapter with explicit transaction semantics and bounded request timeouts.
5. Run the existing migration suite and data-integrity tests against both local SQLite and hosted libSQL.
6. Keep local SQLite as a development/test adapter only; reject it in Vercel production.

Turso is selected for a prototype because its published free tier has advertised no-credit-card signup. Re-check live pricing, quotas, region availability, and terms before launch; do not promise permanent free capacity.

### Vercel request lifecycle

- Use Next.js Route Handlers / Vercel Functions for HTTP APIs.
- Use streaming HTTP responses (SSE) for token streaming. Do not depend on an in-process WebSocket server.
- Any durable jobs must be triggered through a supported external scheduler/queue or converted to request-driven work. Do not rely on timers surviving a Function invocation.
- Avoid writing durable artifacts to `/tmp` or the deployment filesystem. Store small records in the database; select a separately verified no-card object store only if artifacts are genuinely required.
- Keep provider calls behind abortable fetches and enforce the platform's execution deadline.

### Secrets and authentication

- Use Vercel environment variables for deployment-level secrets.
- Encrypt user-supplied provider credentials with a dedicated application encryption key; never log plaintext credentials.
- Persist encrypted credentials only in the durable database.
- Ensure API keys are hashed where only verification is required; do not store recoverable plaintext user API keys.
- Require secure, production-grade session/JWT secrets and fail closed when absent.

## Feature preservation matrix

| Area | Target | Port requirement |
|---|---|---|
| OpenAI-compatible endpoints | Preserve | Route handlers, request validation, streaming |
| Provider integrations | Preserve where HTTP-based | Abortable fetch, per-provider timeout and error mapping |
| Model discovery | Preserve | Request/cache strategy compatible with stateless functions |
| Routing, fallback, load balancing | Preserve | Durable configuration; no in-memory cross-instance state |
| Dashboard and settings | Preserve | Next.js deployment and auth/session review |
| API keys and provider credentials | Preserve | Durable DB, encryption, isolation tests |
| Usage and call logs | Preserve | Async persistence and write-volume controls |
| WebSockets | Replace | SSE/HTTP where possible; document unsupported features |
| Background maintenance | Replace | Request-driven or external scheduler |
| Local backups and filesystem artifacts | Replace | Database backup/export and verified durable storage |

## Delivery gates

A phase is not complete merely because the app builds.

1. **Inventory:** route, database, filesystem, process, timer, WebSocket, and environment dependency maps.
2. **Storage foundation:** async adapter, migrations, transaction tests, production fail-closed behavior.
3. **Runtime port:** route handlers, SSE streaming, no persistent server/process assumptions.
4. **State and jobs:** durable cache/config, scheduler replacement, artifact strategy.
5. **Security:** credential encryption, session hardening, tenant isolation, rate limits.
6. **Validation:** lint, typecheck, unit/integration tests, Vercel build, smoke tests with a hosted database.
7. **Deployment:** documented one-click Vercel setup and a clean install/deploy test.

## Current known blockers

- The upstream core database layer is tightly coupled to synchronous SQLite operations and local-file lifecycle management.
- Vercel Functions cannot be used as persistent WebSocket servers or background workers.
- A successful Next.js build alone does not prove runtime compatibility or durable persistence.
- Vercel Hobby is subject to its current plan terms and usage restrictions; confirm eligibility for the intended use before public launch.

## Definition of done

VoidRouter is ready only when a clean Vercel deployment can initialize against a durable remote database, create an account, store encrypted provider credentials, list models, execute a chat completion, stream a response, record usage, survive cold starts and multiple instances, and pass the repository's relevant CI suites. No production feature may rely on local persistent disk or process memory for durable state.
