/**
 * Prevent production use of the in-memory SQLite fallback on Vercel.
 *
 * Vercel Functions are not durable processes: instances can be recycled and
 * concurrent invocations can run in separate instances. A process-local
 * database therefore cannot safely hold user or application state.
 */
export function assertDurableStorageForVercel(runtime: {
  isVercel: boolean;
  isBuildPhase: boolean;
}): void {
  if (runtime.isVercel && !runtime.isBuildPhase) {
    throw new Error(
      "[VoidRouter] Durable storage is not configured for Vercel. " +
        "The current cloud-mode SQLite adapter is in-memory and will lose data " +
        "across function invocations. Configure the hosted database adapter " +
        "before serving requests; do not use ephemeral storage for production data."
    );
  }
}
