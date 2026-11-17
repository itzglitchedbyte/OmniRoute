import assert from "node:assert/strict";
import test from "node:test";

import { assertDurableStorageForVercel } from "../../../src/lib/db/vercelPersistenceGuard";

test("allows local runtime", () => {
  assert.doesNotThrow(() => assertDurableStorageForVercel({ isVercel: false, isBuildPhase: false }));
});

test("allows Vercel build evaluation", () => {
  assert.doesNotThrow(() => assertDurableStorageForVercel({ isVercel: true, isBuildPhase: true }));
});

test("fails closed for Vercel request runtime until durable storage is configured", () => {
  assert.throws(
    () => assertDurableStorageForVercel({ isVercel: true, isBuildPhase: false }),
    /Durable storage is not configured for Vercel/
  );
});
