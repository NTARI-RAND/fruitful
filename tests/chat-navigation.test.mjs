import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { createServer } from 'node:net';
import { after, before, test } from 'node:test';
import { setTimeout as delay } from 'node:timers/promises';
import { chromium } from 'playwright';

const user = { id: 'buyer-1', name: 'Morgan', role: 'buyer' };
const conversations = [
  {
    id: 'room-corn', transaction_id: 'trade-corn',
    buyer_id: user.id, buyer_name: user.name, seller_id: 'seller-1', seller_name: 'Ana Costa',
    listing_title: 'Sweet corn', last_message: 'The corn is ready.', unread_count: 1,
    last_message_at: '2026-11-20T12:00:00Z',
  },
  {
    transaction_id: 'trade-beans',
    buyer_id: user.id, buyer_name: user.name, seller_id: 'seller-1', seller_name: 'Ana Costa',
    listing_title: 'Black beans', last_message: 'The beans are packed.', unread_count: 0,
  },
  {
    id: 'room-rice',
    buyer_id: user.id, buyer_name: user.name, seller_id: 'seller-1', seller_name: 'Ana Costa',
    listing_title: 'Brown rice', last_message: 'The rice is packed.', unread_count: 12,
  },
];

let url;
let server;
let browser;

before(async () => {
  const listener = createServer();
  listener.listen(0, '127.0.0.1');
  await once(listener, 'listening');
  const { port } = listener.address();
  await new Promise((resolve, reject) => listener.close(error => error ? reject(error) : resolve()));
  url = `http://127.0.0.1:${port}`;
  server = spawn(process.execPath, [
    'node_modules/next/dist/bin/next', 'dev', '--hostname', '127.0.0.1', '--port', String(port),
  ], {
    detached: process.platform !== 'win32',
    env: {
      ...process.env,
      NEXT_TELEMETRY_DISABLED: '1',
      NEXT_PUBLIC_API_URL: `${url}/api`,
      NEXT_PUBLIC_API_KEY: '',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let logs = '';
  const capture = chunk => { logs = (logs + chunk).slice(-8000); };
  server.stdout.on('data', capture);
  server.stderr.on('data', capture);

  const deadline = Date.now() + 90_000;
  while (Date.now() < deadline && server.exitCode === null) {
    const response = await fetch(`${url}/chat`, { signal: AbortSignal.timeout(2_000) }).catch(() => null);
    if (response?.ok) {
      browser = await chromium.launch();
      return;
    }
    await delay(200);
  }
  throw new Error(`Fruitful test server failed to start:\n${logs}`);
});

after(async () => {
  try {
    await browser?.close();
  } finally {
    if (server?.pid && server.exitCode === null && server.signalCode === null) {
      const exited = once(server, 'exit');
      if (process.platform === 'win32') server.kill();
      else process.kill(-server.pid, 'SIGTERM');
      await exited;
    }
  }
});

async function chatPage(t, path = '/chat', language = 'en') {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 }, timezoneId: 'UTC',
  });
  t.after(() => context.close());
  await context.addInitScript(({ user, language }) => {
    localStorage.setItem('agri_user', JSON.stringify(user));
    localStorage.setItem('agri_token', 'fixture-token');
    localStorage.setItem('agri_lang', language);
  }, { user, language });
  await context.route('https://**/*', route => route.abort());
  await context.route('**/api/notifications?*', route => route.fulfill({ json: { unread_count: 0 } }));
  await context.route('**/api/messages/conversations', route => route.fulfill({ json: { conversations } }));
  for (const [index, path] of ['/api/messages/room-corn', '/api/messages/trade-beans'].entries()) {
    const conversation = conversations[index];
    await context.route(`${url}${path}`, route => route.fulfill({
      json: {
        conversation,
        messages: [{
          id: `message-${index}`, sender_id: 'seller-1', sender_name: 'Ana Costa',
          message: conversation.last_message, created_at: '2026-11-20T12:00:00Z',
        }],
      },
    }));
  }
  await context.routeWebSocket('**/socket.io/**', socket => socket.close());
  const page = await context.newPage();
  page.setDefaultTimeout(5_000);
  // The first room navigation can include Next.js compiling the dynamic route.
  page.setDefaultNavigationTimeout(30_000);
  await page.goto(url + path);
  return page;
}

async function tabTo(page, control, name) {
  await control.waitFor({ state: 'visible' });
  for (let tabs = 0; tabs < 30; tabs++) {
    await page.keyboard.press('Tab');
    if (await control.evaluate(element => element === document.activeElement)) return;
  }
  assert.fail(`Tab never reached ${name}`);
}

async function assertFocusOutline(control) {
  const focus = await control.evaluate(element => {
    const style = getComputedStyle(element);
    return {
      active: element === document.activeElement,
      focusVisible: element.matches(':focus-visible'),
      outlineStyle: style.outlineStyle,
      outlineWidth: parseFloat(style.outlineWidth),
    };
  });
  assert.equal(focus.active, true, 'The control should retain keyboard focus');
  assert.equal(focus.focusVisible, true, 'The control should match :focus-visible');
  assert.notEqual(focus.outlineStyle, 'none', 'The keyboard-focused control should have an outline');
  assert.ok(focus.outlineWidth >= 2, 'The keyboard focus outline should be at least 2px wide');
}

for (const [language, singular, plural] of [
  ['en', '1 unread message', '12 unread messages'],
  ['pt', '1 mensagem não lida', '12 mensagens não lidas'],
]) {
  test(`Chat links expose message details to Chromium accessibility in ${language}`, async t => {
    const page = await chatPage(t, '/chat', language);
    await page.getByRole('link', { name: 'Ana Costa · Brown rice', exact: true }).waitFor();
    const session = await page.context().newCDPSession(page);
    try {
      const { nodes } = await session.send('Accessibility.getFullAXTree');
      const descriptionFor = listing => nodes.find(node =>
        node.role?.value === 'link' && node.name?.value === `Ana Costa · ${listing}`
      )?.description?.value;

      const corn = descriptionFor('Sweet corn');
      assert.ok(corn, 'The named conversation link must have an accessible description');
      assert.ok(corn.includes('The corn is ready.'), corn);
      assert.ok(corn.includes('20/11/26'), corn);
      assert.ok(corn.includes('12:00'), corn);
      assert.ok(corn.includes(singular), corn);
      assert.equal(descriptionFor('Black beans'), 'The beans are packed.');
      assert.equal(descriptionFor('Brown rice'), `The rice is packed. ${plural}`);
    } finally {
      await session.detach();
    }
  });
}

for (const [listing, room, message] of [
  ['Sweet corn', '/chat/room-corn', 'The corn is ready.'],
  ['Black beans', '/chat/trade-beans', 'The beans are packed.'],
]) {
  test(`Tab follows conversation order and Enter opens the ${listing} room`, async t => {
    const page = await chatPage(t);
    const corn = page.getByRole('link', { name: 'Ana Costa · Sweet corn', exact: true });
    const beans = page.getByRole('link', { name: 'Ana Costa · Black beans', exact: true });
    await page.getByText('Sweet corn', { exact: false }).first().waitFor();
    await tabTo(page, page.getByPlaceholder('Search conversation...'), 'conversation search');
    assert.equal(await corn.count(), 1, 'The Sweet corn conversation should be a named link');
    assert.equal(await beans.count(), 1, 'The Black beans conversation should be a named link');
    await page.keyboard.press('Tab');
    await assertFocusOutline(corn);
    if (listing === 'Black beans') {
      await page.keyboard.press('Tab');
      await assertFocusOutline(beans);
    }
    await page.keyboard.press('Enter');
    await page.waitForURL(url + room);
    await page.getByText(message, { exact: true }).waitFor();

    const back = page.getByRole('link', { name: 'Back to messages', exact: true });
    await tabTo(page, back, 'Back to messages');
    await assertFocusOutline(back);
    await page.keyboard.press('Enter');
    await page.waitForURL(url + '/chat');
    await corn.waitFor();
  });
}

test('A direct room visit has a named Portuguese keyboard return link', async t => {
  const page = await chatPage(t, '/chat/trade-beans', 'pt');
  const back = page.getByRole('link', { name: 'Voltar para mensagens', exact: true });
  await tabTo(page, back, 'Voltar para mensagens');
  await assertFocusOutline(back);
  await page.keyboard.press('Enter');
  await page.waitForURL(url + '/chat');
  await page.getByRole('heading', { name: 'Mensagens', exact: true }).waitFor();
});

test('Clicking a conversation preview still opens its room', async t => {
  const page = await chatPage(t);
  await page.getByText('The beans are packed.', { exact: false }).click();
  await page.waitForURL(url + '/chat/trade-beans');
  await page.getByText('The beans are packed.', { exact: true }).waitFor();
});
