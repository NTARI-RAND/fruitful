import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import {
  startMarketplace, marketplacePage, listingsResponse, actualListing,
} from './helpers/marketplace-browser.mjs';

let fixture;
before(async () => { fixture = await startMarketplace(); }, { timeout: 120_000 });
after(async () => { await fixture?.close(); });

// Restoring the demo fallback would show invented inventory and hide these errors.
for (const failure of ['network', 401, 500]) {
  test(`marketplace reports ${failure} without demo inventory`, async t => {
    const page = await marketplacePage(t, fixture, route => failure === 'network'
      ? route.abort('failed')
      : route.fulfill({ status: failure, contentType: 'application/json', body: '{"error":"fixture failure"}' }));
    await page.locator('main').getByRole('alert').waitFor({ timeout: 5000 });
    assert.equal(await page.locator('.listing-card').count(), 0);
    assert.equal(await page.getByText('No products found', { exact: true }).count(), 0);
    assert.equal(await page.getByText('0 products found', { exact: true }).count(), 0);
    assert.equal(await page.getByRole('button', { name: 'Try again', exact: true }).count(), 1);
  });
}

test('successful empty response uses the empty state', async t => {
  const page = await marketplacePage(t, fixture, route => listingsResponse(route));
  await page.getByText('No products found', { exact: true }).waitFor();
  assert.equal(await page.locator('main').getByRole('alert').count(), 0);
  assert.equal(await page.locator('.listing-card').count(), 0);
});

test('retry restores actual data and retains selected filters', async t => {
  const requests = [];
  let fail = false;
  const page = await marketplacePage(t, fixture, route => {
    requests.push(new URL(route.request().url()));
    return fail ? route.fulfill({ status: 500, contentType: 'application/json', body: '{}' })
      : listingsResponse(route, [actualListing]);
  });
  await page.getByText(actualListing.title, { exact: true }).waitFor();
  await page.getByRole('button', { name: /Fruits/, exact: false }).click();
  await page.locator('aside select').selectOption('SP');
  await page.getByText('Lowest price', { exact: true }).click();
  await page.getByPlaceholder('Min', { exact: true }).fill('10');
  await page.getByPlaceholder('Max', { exact: true }).fill('90');
  await page.getByPlaceholder('Search product or city...').fill('Actual');
  fail = true;
  await page.getByRole('button', { name: 'Apply filters', exact: true }).click();
  await page.locator('main').getByRole('alert').waitFor();
  assert.equal(await page.locator('.listing-card').count(), 0);
  fail = false;
  await page.getByRole('button', { name: 'Try again', exact: true }).click();
  await page.getByText(actualListing.title, { exact: true }).waitFor();
  const latest = requests.at(-1).searchParams;
  assert.equal(latest.get('category'), 'frutas');
  assert.equal(latest.get('state'), 'SP');
  assert.equal(latest.get('minPrice'), '10');
  assert.equal(latest.get('maxPrice'), '90');
  assert.equal(await page.getByPlaceholder('Search product or city...').inputValue(), 'Actual');
  assert.equal(await page.locator('aside select').inputValue(), 'SP');
  assert.equal(await page.getByRole('radio').nth(1).isChecked(), true);
  assert.equal(await page.locator('main').getByRole('alert').count(), 0);
});

for (const older of ['success', 'failure']) {
  test(`older ${older} cannot replace a newer category result`, async t => {
    let release;
    const held = new Promise(resolve => { release = resolve; });
    let oldRequest;
    const oldStarted = new Promise(resolve => { oldRequest = resolve; });
    let calls = 0;
    const page = await marketplacePage(t, fixture, async route => {
      if (++calls === 1) {
        oldRequest();
        await held;
        return older === 'failure'
          ? route.fulfill({ status: 500, contentType: 'application/json', body: '{}' })
          : listingsResponse(route, [{ ...actualListing, id: 'old-offer', title: 'Obsolete offer' }]);
      }
      return listingsResponse(route, [actualListing]);
    });
    t.after(() => release());
    await oldStarted;
    await page.getByRole('button', { name: /Fruits/ }).click();
    await page.getByText(actualListing.title, { exact: true }).waitFor();
    const oldResponse = page.waitForResponse(response => response.url().includes('/fixture-api/listings?')
      && !new URL(response.url()).searchParams.has('category'));
    release();
    await oldResponse;
    await page.waitForLoadState('networkidle');
    assert.equal(await page.getByText(actualListing.title, { exact: true }).count(), 1);
    assert.equal(await page.getByText('Obsolete offer', { exact: true }).count(), 0);
    assert.equal(await page.locator('main').getByRole('alert').count(), 0);
  });
}

test('Portuguese mobile error offers a localized retry', async t => {
  const page = await marketplacePage(t, fixture,
    route => route.fulfill({ status: 500, contentType: 'application/json', body: '{}' }),
    { lang: 'pt', mobile: true });
  await page.locator('main').getByRole('alert').waitFor({ timeout: 5000 });
  assert.equal(await page.getByRole('button', { name: 'Tentar novamente', exact: true }).isVisible(), true);
  assert.equal(await page.locator('.listing-card').count(), 0);
});

test('successful raw array response retains the existing API shape', async t => {
  const page = await marketplacePage(t, fixture, route => route.fulfill({
    status: 200, contentType: 'application/json', body: JSON.stringify([actualListing]),
  }));
  await page.getByText(actualListing.title, { exact: true }).waitFor();
  assert.equal(await page.locator('main').getByRole('alert').count(), 0);
});

test('unexpected response shape shows a recoverable error instead of crashing', async t => {
  const page = await marketplacePage(t, fixture, route => route.fulfill({
    status: 200, contentType: 'application/json', body: '{}',
  }));
  await page.locator('main').getByRole('alert').waitFor({ timeout: 5000 });
  assert.equal(await page.getByRole('button', { name: 'Try again', exact: true }).count(), 1);
  assert.equal(await page.locator('.listing-card').count(), 0);
});
