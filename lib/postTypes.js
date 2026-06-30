// Frontend descriptors for the whitepaper post types (Phase 2: high-value types first).
// Each field: { key, label, kind, options?, payload?, required?, placeholder? }
//   kind: 'text' | 'textarea' | 'number' | 'select' | 'date'
// Keys in TOP_LEVEL map to post columns; everything else goes into the JSON payload.

export const USE_CATEGORIES = ['food', 'pharmaceutical', 'fiber', 'chemical', 'mineral', 'ornamental'];
const ucOptions = USE_CATEGORIES.map((c) => [c, c.charAt(0).toUpperCase() + c.slice(1)]);

const PING_OPTS = [['daily', 'Daily'], ['weekly', 'Weekly'], ['monthly', 'Monthly']];
const SHARES_OPTS = [['none', 'No shares'], ['fixed', 'Fixed shares'], ['variable', 'Variable shares']];
const SETTLEMENT_OPTS = [['on_confirmation', 'On confirmation'], ['maturity', 'At maturity (harvest date)']];

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
  plan_producer: {
    label: 'Producer Plan',
    icon: '🌱',
    blurb: 'A plant→harvest plan buyers can contract against, with scheduled PING updates.',
    fields: [
      { key: 'title', label: 'Title', kind: 'text', required: true },
      { key: 'description', label: 'Description', kind: 'textarea' },
      { key: 'variety', label: 'Variety', kind: 'text', payload: true },
      { key: 'use_category', label: 'Use category', kind: 'select', payload: true, options: ucOptions },
      { key: 'planting_date', label: 'Planting date', kind: 'date', payload: true },
      { key: 'expected_harvest_date', label: 'Expected harvest date', kind: 'date', payload: true },
      { key: 'quantity_available', label: 'Expected yield (amount)', kind: 'number' },
      { key: 'unit', label: 'Unit', kind: 'text', placeholder: 'kg, saca…' },
      { key: 'price', label: 'Sold by price (per unit)', kind: 'number' },
      { key: 'ping_rate', label: 'PING rate', kind: 'select', payload: true, options: PING_OPTS },
      { key: 'contract_shares', label: 'Contract shares', kind: 'select', payload: true, options: SHARES_OPTS },
      { key: 'settlement', label: 'Settlement', kind: 'select', payload: true, options: SETTLEMENT_OPTS },
      { key: 'hydration_plan', label: 'Hydration plan', kind: 'text', payload: true },
      { key: 'nutrition_plan', label: 'Nutrition plan', kind: 'text', payload: true },
      { key: 'health_plan', label: 'Health plan', kind: 'text', payload: true },
      { key: 'city', label: 'City', kind: 'text' },
      { key: 'state', label: 'State (UF)', kind: 'text' },
    ],
  },
  plan_consumer: {
    label: 'Consumer Plan',
    icon: '📋',
    blurb: 'Request future production from growers, with optional contract shares.',
    fields: [
      { key: 'title', label: 'Title', kind: 'text', required: true },
      { key: 'description', label: 'Description', kind: 'textarea' },
      { key: 'variety', label: 'Variety', kind: 'text', payload: true },
      { key: 'use_category', label: 'Use category', kind: 'select', payload: true, options: ucOptions },
      { key: 'desired_planting_date', label: 'Desired planting date', kind: 'date', payload: true },
      { key: 'desired_harvest_date', label: 'Desired harvest date', kind: 'date', payload: true },
      { key: 'needed_by_date', label: 'Needed by date', kind: 'date', payload: true },
      { key: 'quantity_available', label: 'Required amount', kind: 'number' },
      { key: 'unit', label: 'Unit', kind: 'text', placeholder: 'kg, saca…' },
      { key: 'price', label: 'Price per amount', kind: 'number' },
      { key: 'ping_rate', label: 'PING rate', kind: 'select', payload: true, options: PING_OPTS },
      { key: 'contract_shares', label: 'Contract shares', kind: 'select', payload: true, options: SHARES_OPTS },
      { key: 'settlement', label: 'Settlement', kind: 'select', payload: true, options: SETTLEMENT_OPTS },
      { key: 'hydration_plan', label: 'Hydration plan (optional)', kind: 'text', payload: true },
      { key: 'nutrition_plan', label: 'Nutrition plan (optional)', kind: 'text', payload: true },
      { key: 'health_plan', label: 'Health plan (optional)', kind: 'text', payload: true },
      { key: 'city', label: 'City', kind: 'text' },
      { key: 'state', label: 'State (UF)', kind: 'text' },
    ],
  },
  agrotourism: {
    label: 'Agrotourism',
    icon: '🌄',
    blurb: 'Market gardens, events, tours, education, and volunteering.',
    fields: [
      { key: 'title', label: 'Title', kind: 'text', required: true },
      { key: 'category', label: 'Type', kind: 'select', options: [['market_garden', 'Market Garden'], ['event', 'Event']] },
      { key: 'event_kind', label: 'Event kind (if event)', kind: 'select', payload: true, options: [['entertainment', 'Entertainment'], ['education', 'Education'], ['volunteering', 'Volunteering'], ['community', 'Community'], ['tour', 'Tour']] },
      { key: 'description', label: 'Description', kind: 'textarea' },
      { key: 'price', label: 'Cost (optional)', kind: 'number' },
      { key: 'date_time', label: 'Date', kind: 'date', payload: true },
      { key: 'city', label: 'City', kind: 'text' },
      { key: 'state', label: 'State (UF)', kind: 'text' },
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
