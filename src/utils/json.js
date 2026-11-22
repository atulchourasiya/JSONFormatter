
import JSON5 from 'json5';

// Detect whether the input is strict JSON or JSON5 object syntax
export function detectJsonFormat(text) {
  if (!text.trim()) return 'empty';

  try {
    JSON.parse(text);
    return 'JSON';
  } catch {
    try {
      JSON5.parse(text);
      return 'OBJ';
    } catch {
      return 'INVALID';
    }
  }
}

// Parse either JSON or JSON5
export function parseJson(text) {
  return JSON5.parse(text);
}

// Convert data into formatted strict JSON
export function prettyJson(value) {
  return JSON.stringify(value, null, 2);
}

// Convert data into formatted JSON5 object syntax
export function prettyObject(value) {
  return JSON5.stringify(value, null, 2);
}

// Convert between JSON and OBJ
export function convertFormat(text, targetFormat) {
  const parsed = JSON5.parse(text);

  if (targetFormat === 'JSON') {
    return JSON.stringify(parsed, null, 2);
  }

  return JSON5.stringify(parsed, null, 2);
}

// Get JavaScript value type (used by compare.js)
export function getValueType(value) {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value;
}


export function minifyJson(text) {
  const format = detectJsonFormat(text);

  if (format === "INVALID" || format === "empty") {
    throw new Error("Invalid JSON or OBJ syntax.");
  }

  const parsed = JSON5.parse(text);

  return format === "JSON"
    ? JSON.stringify(parsed)
    : JSON5.stringify(parsed);
}
