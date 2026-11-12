import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { createServer } from 'node:net';
import { setTimeout as delay } from 'node:timers/promises';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

async function availablePort() {
  const listener = createServer();
  listener.listen(0, '127.0.0.1');
  await once(listener, 'listening');
  const { port } = listener.address();
  await new Promise((resolve, reject) => listener.close(error => error ? reject(error) : resolve()));
  return port;
}

async function waitForServer(url, server, logs) {
  const deadline = Date.now() + 90_000;
  while (Date.now() < deadline) {
    if (server.exitCode !== null) throw new Error(`Next server exited: ${logs()}`);
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(1500) });
      if (response.ok) return;
    } catch { /* Startup has not opened the listener yet. */ }
    await delay(200);
  }
  throw new Error(`Next server did not become ready: ${logs()}`);
}

async function stopServer(server) {
  if (server.exitCode !== null) return;
  const exited = once(server, 'exit');
  if (process.platform === 'win32') server.kill('SIGTERM');
  else process.kill(-server.pid, 'SIGTERM');
  await exited;
}

export async function startMarketplace() {
  const port = await availablePort();
  const url = `http://127.0.0.1:${port}`;
  const root = fileURLToPath(new URL('../../', import.meta.url));
  const server = spawn(process.execPath,
    ['node_modules/next/dist/bin/next', 'dev', '--hostname', '127.0.0.1', '--port', String(port)], {
      cwd: root,
      detached: process.platform !== 'win32',
      env: { ...process.env, NEXT_TELEMETRY_DISABLED: '1', NEXT_PUBLIC_API_URL: `${url}/fixture-api`, NEXT_PUBLIC_API_KEY: '' },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
  let logs = '';
  const capture = chunk => { logs = (logs + chunk).slice(-8000); };
  server.stdout.on('data', capture);
  server.stderr.on('data', capture);
  try {
    await waitForServer(url, server, () => logs);
    const browser = await chromium.launch({ headless: true });
    return { url, browser, close: async () => { await browser.close(); await stopServer(server); } };
  } catch (error) {
    await stopServer(server);
    throw error;
  }
}

export async function marketplacePage(t, fixture, handler, { lang = 'en', mobile = false } = {}) {
  const context = await fixture.browser.newContext({
    locale: lang === 'pt' ? 'pt-BR' : 'en-US',
    viewport: mobile ? { width: 390, height: 844 } : { width: 1280, height: 900 },
  });
  t.after(() => context.close());
  await context.route('https://**/*', route => route.abort());
  await context.addInitScript(language => localStorage.setItem('agri_lang', language), lang);
  const page = await context.newPage();
  await page.route('**/fixture-api/listings?**', handler);
  await page.goto(`${fixture.url}/marketplace`);
  return page;
}

export function listingsResponse(route, listings = []) {
  return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ listings }) });
}

export const actualListing = {
  id: 'fixture-offer', title: 'Actual fixture offer', category: 'frutas', city: 'Campinas',
  state: 'SP', price: 45, unit: 'kg', quantity_available: 100,
};
