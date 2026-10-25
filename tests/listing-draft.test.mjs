import test from 'node:test';
import assert from 'node:assert/strict';
import { createDraftStore, draftOwner } from '../lib/listing-draft.mjs';

function storage() {
  const entries = new Map();
  return {
    getItem: key => entries.get(key) ?? null,
    setItem: (key, value) => entries.set(key, value),
    removeItem: key => entries.delete(key),
    entries,
  };
}

const draft = {
  form: { title: 'Fresh tomatoes', category: 'frutas', unit: 'kg', price: '3.20',
    quantity_available: '24', city: 'Cajamar', state: 'SP', description: 'Pickup Saturday' },
  images: ['https://images.example.test/tomatoes.webp', '/uploads/tomatoes.webp'],
  step: 2,
};

test('saved details, photo references and wizard step survive a new store instance', () => {
  const browser = storage();
  createDraftStore(browser, 'grower-1').save(draft);
  const restored = createDraftStore(browser, 'grower-1').read();
  assert.equal(restored.status, 'ready');
  assert.deepEqual(restored.draft.form, draft.form);
  assert.deepEqual(restored.draft.images, draft.images);
  assert.equal(restored.draft.step, 2);
  assert.ok(Number.isFinite(Date.parse(restored.draft.savedAt)));
});

test('incomplete details can be saved without publishing', () => {
  const store = createDraftStore(storage(), 'grower-1');
  store.save({ ...draft, form: { ...draft.form, title: '', price: '' }, step: 0 });
  assert.equal(store.read().draft.form.title, '');
});

test('accounts cannot read or delete each other’s drafts', () => {
  const browser = storage();
  const alice = createDraftStore(browser, 'alice');
  const bob = createDraftStore(browser, 'bob');
  alice.save(draft);
  assert.equal(bob.read().status, 'empty');
  bob.save({ ...draft, form: { ...draft.form, title: 'Oranges' } });
  bob.remove();
  assert.equal(bob.read().status, 'empty');
  assert.equal(alice.read().draft.form.title, 'Fresh tomatoes');
});

test('saving stores only listing data, never credentials or unrelated user data', () => {
  const browser = storage();
  createDraftStore(browser, 'alice').save({ ...draft, token: 'secret', user: { email: 'private' },
    form: { ...draft.form, password: 'secret' } });
  const raw = [...browser.entries.values()][0];
  assert.ok(!raw.includes('secret'));
  assert.ok(!raw.includes('private'));
});

test('corrupt or incompatible storage is reported without deleting it', () => {
  for (const raw of ['{broken', '{}', JSON.stringify({ version: 99, ...draft })]) {
    const browser = storage();
    const store = createDraftStore(browser, 'alice');
    store.save(draft);
    const key = [...browser.entries.keys()][0];
    browser.setItem(key, raw);
    assert.equal(store.read().status, 'invalid');
    assert.equal(browser.getItem(key), raw);
  }
});

test('invalid fields, wizard steps and unsafe photo URLs never enter storage', () => {
  for (const changed of [
    { step: -1 }, { step: 3 }, { step: 1.5 },
    { form: { ...draft.form, title: 123 } },
    { form: { ...draft.form, category: 'unknown' } },
    { form: { ...draft.form, unit: 'unknown' } },
    { images: ['javascript:alert(1)'] }, { images: ['//tracking.example.test/pixel'] },
    { images: ['data:image/svg+xml,bad'] }, { images: Array(6).fill('/photo.png') },
    { form: { ...draft.form, description: 'x'.repeat(10001) } },
  ]) {
    const browser = storage();
    const store = createDraftStore(browser, 'alice');
    assert.throws(() => store.save({ ...draft, ...changed }));
    assert.equal(store.read().status, 'empty');
  }
});

test('read validates stored data again before showing it', () => {
  const browser = storage();
  const store = createDraftStore(browser, 'alice');
  store.save(draft);
  const [key, raw] = [...browser.entries][0];
  browser.setItem(key, JSON.stringify({ ...JSON.parse(raw), images: ['javascript:alert(1)'] }));
  assert.equal(store.read().status, 'invalid');
});

test('blocked storage and quota failures remain visible and preserve saved work', () => {
  const denied = { getItem() { throw new Error('denied'); }, setItem() { throw new Error('quota'); },
    removeItem() { throw new Error('denied'); } };
  const store = createDraftStore(denied, 'alice');
  assert.equal(store.read().status, 'unavailable');
  assert.throws(() => store.save(draft), /quota/);
  assert.throws(() => store.remove(), /denied/);
  assert.equal(createDraftStore(null, 'alice').read().status, 'unavailable');
});

test('missing identity and shared demo accounts cannot persist drafts', () => {
  assert.equal(draftOwner({ id: 'alice' }, 'token'), 'alice');
  assert.equal(draftOwner({ sub: 'alice' }, 'token'), 'alice');
  assert.equal(draftOwner({ id: 'demo-001' }, 'demo'), null);
  assert.equal(draftOwner({ id: 'demo-001' }, 'token'), null);
  assert.equal(draftOwner({ id: 'alice' }, null), null);
  assert.equal(draftOwner(null, 'token'), null);
  const browser = storage();
  const store = createDraftStore(browser, null);
  assert.equal(store.read().status, 'unavailable');
  assert.throws(() => store.save(draft));
  assert.equal(browser.entries.size, 0);
});
