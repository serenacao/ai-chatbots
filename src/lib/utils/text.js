export function normalize(text) {
  return (text || '').toLowerCase();
}

export function containsAny(text, terms) {
  const t = normalize(text);
  return terms.some((w) => t.includes(w));
}

export function sentenceCase(text) {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function clamp(v, min = 0, max = 1) {
  return Math.max(min, Math.min(v, max));
}

export function pick(arr) {
  if (!arr || !arr.length) return '';
  return arr[Math.floor(Math.random() * arr.length)];
}

export function parseStepMention(text) {
  if (!text) return null;
  const m = text.match(/step\s*(\d{1,2})/i);
  if (m) return parseInt(m[1], 10);
  const map = { first: 1, second: 2, third: 3, fourth: 4, fifth: 5 };
  const w = (text.toLowerCase().match(/first|second|third|fourth|fifth/) || [])[0];
  return w ? map[w] : null;
}

export function extractJson(text) {
  if (!text) return null;
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1 || end <= start) return null;
  const slice = text.slice(start, end + 1);
  try {
    return JSON.parse(slice);
  } catch {
    return null;
  }
}

