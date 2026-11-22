import { getValueType } from './json.js';

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function escapePathPart(part) {
  return String(part).replaceAll('~', '~0').replaceAll('/', '~1');
}

/**
 * Deep comparison using JSON Pointer-like paths.
 * Object keys are compared independent of key order. Array order is significant.
 */
export function compareJson(left, right) {
  const differences = [];

  function walk(a, b, path) {
    if (Object.is(a, b)) return;

    if (Array.isArray(a) && Array.isArray(b)) {
      const max = Math.max(a.length, b.length);
      for (let i = 0; i < max; i += 1) {
        const childPath = `${path}/${i}`;
        if (i >= a.length) {
          differences.push({ path: childPath || '/', type: 'added', left: undefined, right: b[i] });
        } else if (i >= b.length) {
          differences.push({ path: childPath || '/', type: 'removed', left: a[i], right: undefined });
        } else {
          walk(a[i], b[i], childPath);
        }
      }
      return;
    }

    if (isObject(a) && isObject(b)) {
      const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
      for (const key of [...keys].sort()) {
        const childPath = `${path}/${escapePathPart(key)}`;
        if (!Object.prototype.hasOwnProperty.call(a, key)) {
          differences.push({ path: childPath, type: 'added', left: undefined, right: b[key] });
        } else if (!Object.prototype.hasOwnProperty.call(b, key)) {
          differences.push({ path: childPath, type: 'removed', left: a[key], right: undefined });
        } else {
          walk(a[key], b[key], childPath);
        }
      }
      return;
    }

    differences.push({
      path: path || '/',
      type: getValueType(a) !== getValueType(b) ? 'type-changed' : 'changed',
      left: a,
      right: b,
    });
  }

  walk(left, right, '');
  return differences;
}
