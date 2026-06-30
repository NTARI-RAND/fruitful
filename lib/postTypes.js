// Frontend descriptors for the whitepaper post types (Phase 2: high-value types first).
// Each field: { key, label, kind, options?, payload?, required?, placeholder? }
//   kind: 'text' | 'textarea' | 'number' | 'select' | 'date'
// Keys in TOP_LEVEL map to post columns; everything else goes into the JSON payload.

export const USE_CATEGORIES = ['food', 'pharmaceutical', 'fiber', 'chemical', 'mineral', 'ornamental'];
const ucOptions = USE_CATEGORIES.map((c) => [c, c.charAt(0).toUpperCase() + c.slice(1)]);

const TOP_LEVEL = new Set(['title', 'description', 'category', 'price', 'unit', 'quantity_available', 'city', 'state', 'terms']);

export const POST_TYPE_FORMS = {
  service: {
    label: 'Service',
    icon: '🧰',
    blurb: 'Labor, logistics, processing, composting, or environmental services.',
    fields: [
      { key: 'title', label: 'Title', kind: 'text', required: true },
      { key: 'category', label: 'Category', kind: 'select', required: true, options: [['la', 'Labor'], ['lr', 'Logistics'], ['pr', 'Processing'], ['cr', 'Composting / Recycling'], ['es', 'Environmental']] },
      { key: 'sub', label: 'Subcategory', kind: 'text', payload: true, placeholder: 'e.g. pa = planning, sm = setup, ph = planting/harvest' },
      { key: 'description', label: 'Description', kind: 'textarea' },
      { key: 'city', label: 'City', kind: 'text' },
      { key: 'state', label: 'State (UF)', kind: 'text' },
      { key: 'terms', label: 'Terms (pricing & conditions)', kind: 'text', placeholder: 'e.g. USD 120 / month' },
    ],
  },
  direct_market: {
    label: 'Direct Market',
    icon: '🥕',
    blurb: 'Harvested goods for immediate sale.',
    fields: [
      { key: 'title', label: 'Title', kind: 'text', required: true },
      { key: 'description', label: 'Description', kind: 'textarea' },
      { key: 'variety', label: 'Variety', kind: 'text', payload: true },
      { key: 'use_category', label: 'Use category', kind: 'select', payload: true, options: ucOptions },
      { key: 'price', label: 'Price', kind: 'number', required: true },
      { key: 'unit', label: 'Unit', kind: 'text', placeholder: 'kg, saca, tonelada…' },
      { key: 'quantity_available', label: 'Starting inventory', kind: 'number' },
      { key: 'date_harvested', label: 'Date harvested', kind: 'date', payload: true },
      { key: 'spoil_date', label: 'Expected spoil date', kind: 'date', payload: true },
      { key: 'pickup_delivery', label: 'Pickup / Delivery', kind: 'select', payload: true, options: [['pickup', 'Pickup'], ['delivery', 'Delivery'], ['both', 'Both']] },
      { key: 'city', label: 'City', kind: 'text' },
      { key: 'state', label: 'State (UF)', kind: 'text' },
    ],
  },
  product: {
    label: 'Product',
    icon: '📦',
    blurb: 'Value-added goods, seeds, tools, infrastructure, or soil inputs.',
    fields: [
      { key: 'title', label: 'Title', kind: 'text', required: true },
      { key: 'category', label: 'Product category', kind: 'select', required: true, options: [['value_added', 'Value-Added Good'], ['seeds_young', 'Seeds / Live Plants / Young'], ['tools', 'Node Management Tools'], ['infrastructure', 'Infrastructure & Environmental Control'], ['soil_input', 'Soil Input']] },
      { key: 'description', label: 'Description', kind: 'textarea' },
      { key: 'price', label: 'Price per item', kind: 'number', required: true },
      { key: 'quantity_available', label: 'Inventory (blank = made to order)', kind: 'number' },
      { key: 'city', label: 'City', kind: 'text' },
      { key: 'state', label: 'State (UF)', kind: 'text' },
      { key: 'terms', label: 'Terms', kind: 'text' },
    ],
  },
};

// Build the POST /posts request body from collected form values + uploaded media.
export function buildPostBody(postType, values, media) {
  const form = POST_TYPE_FORMS[postType];
  const body = { post_type: postType, media: media || [], payload: {} };
  for (const f of form.fields) {
    const v = values[f.key];
    if (v === undefined || v === '') continue;
    const val = f.kind === 'number' ? Number(v) : v;
    if (f.payload || !TOP_LEVEL.has(f.key)) body.payload[f.key] = val;
    else body[f.key] = val;
  }
  return body;
}
