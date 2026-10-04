// Stops the throwaway database of the e2e API cleanly (Playwright then stops the processes).
export default async function globalTeardown() {
  await fetch("http://127.0.0.1:5056/__e2e/shutdown", { method: "POST" }).catch(() => undefined);
}
