const NAMESPACE = 'askApp';

function makeKey(key: string) {
  return `${NAMESPACE}:${key}`;
}

export function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(makeKey(key));
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function save<T>(key: string, value: T) {
  try {
    localStorage.setItem(makeKey(key), JSON.stringify(value));
  } catch {
    // ignore
  }
}

export function remove(key: string) {
  try {
    localStorage.removeItem(makeKey(key));
  } catch {
    // ignore
  }
}
