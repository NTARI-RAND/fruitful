// LBTAS scale (client-side mirror of the backend services/lbtas.js).
// Levels run -1..+4 ascending — the order used by the reputation display.
export const LEVELS = [-1, 0, 1, 2, 3, 4];

export const LEVEL_LABELS = {
  '-1': 'No Trust',
  '0': 'Cynical Satisfaction',
  '1': 'Basic Promise',
  '2': 'Basic Satisfaction',
  '3': 'No Negative Consequences',
  '4': 'Delight',
};

export const LEVEL_DESCRIPTIONS = {
  '-1': 'User was harmed, exploited, or received a product/service with evidence of no discipline or malicious intent.',
  '0': 'Interaction fulfills a basic promise requiring little to no discipline toward user satisfaction.',
  '1': 'Interaction meets all articulated user demands, no more.',
  '2': 'Interaction meets socially acceptable standards, exceeding articulated user demands.',
  '3': 'Interaction designed to prevent loss, exceeding basic quality standards.',
  '4': 'Interaction anticipates the evolution of user practices and concerns post-transaction.',
};

export const MAX_COMMENT_WORDS = 500;

// Total = sum of all per-level counts. Reputation is this distribution, never an average.
export function totalOf(dist) {
  return LEVELS.reduce((s, l) => s + Number(dist?.[String(l)] || 0), 0);
}

export function wordCount(text) {
  return String(text || '').trim().split(/\s+/).filter(Boolean).length;
}

export function signed(level) {
  return level > 0 ? `+${level}` : String(level);
}
