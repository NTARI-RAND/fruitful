const FIELDS = ['title', 'category', 'unit', 'price', 'quantity_available', 'city', 'state', 'description'];
const CATEGORIES = ['graos', 'frutas', 'gado', 'maquinas', 'outros'];
const UNITS = ['saca', 'kg', 'tonelada', 'cabeca', 'unidade', 'caixa'];

export function draftOwner(user, token) {
  const id = user?.id ?? user?.sub;
  if (!token || token === 'demo' || id === 'demo-001') return null;
  return typeof id === 'string' && id.trim() ? id : null;
}

function listingData(value) {
  if (!value || !Number.isInteger(value.step) || value.step < 0 || value.step > 2 ||
      !value.form || !FIELDS.every(key => typeof value.form[key] === 'string' && value.form[key].length <= 10000) ||
      !CATEGORIES.includes(value.form.category) || !UNITS.includes(value.form.unit) ||
      !Array.isArray(value.images) || value.images.length > 5 || !value.images.every(safeImage)) {
    throw new Error('Invalid listing draft');
  }
  return {
    form: Object.fromEntries(FIELDS.map(key => [key, value.form[key]])),
    images: [...value.images],
    step: value.step,
  };
}

function safeImage(value) {
  if (typeof value !== 'string' || value.length > 2048 || /[\s\\]/.test(value)) return false;
  if (value.startsWith('/') && !value.startsWith('//')) return true;
  try { return ['https:', 'http:'].includes(new URL(value).protocol); } catch { return false; }
}

// Storage is injected so denied access and quota errors can be handled by the UI.
// Account separation is a convenience, not encryption or a browser security boundary.
export function createDraftStore(storage, owner) {
  const key = owner ? `fruitful:listing-draft:v1:${encodeURIComponent(owner)}` : null;
  function available() {
    if (!storage || !key) throw new Error('Draft storage unavailable');
  }
  return {
    read() {
      let raw;
      try { available(); raw = storage.getItem(key); } catch { return { status: 'unavailable' }; }
      if (raw === null) return { status: 'empty' };
      try {
        const value = JSON.parse(raw);
        if (value.version !== 1 || value.owner !== owner ||
            typeof value.savedAt !== 'string' || !Number.isFinite(Date.parse(value.savedAt))) {
          throw new Error('Invalid listing draft');
        }
        return { status: 'ready', draft: { ...listingData(value), savedAt: value.savedAt } };
      } catch { return { status: 'invalid' }; }
    },
    save(value) {
      available();
      const draft = { ...listingData(value), savedAt: new Date().toISOString() };
      storage.setItem(key, JSON.stringify({ version: 1, owner, ...draft }));
      return draft;
    },
    remove() { available(); storage.removeItem(key); },
  };
}
