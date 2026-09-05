export function readSessionJson(key: string): unknown {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.sessionStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function readStorage(
  key: string,
  kind: 'localStorage' | 'sessionStorage' = 'sessionStorage',
): string | null {
  try {
    return typeof window === 'undefined' ? null : window[kind].getItem(key);
  } catch {
    return null;
  }
}

export function writeStorage(
  key: string,
  value: string,
  kind: 'localStorage' | 'sessionStorage' = 'sessionStorage',
): void {
  try {
    if (typeof window !== 'undefined') window[kind].setItem(key, value);
  } catch {
    /* Persistence is optional when storage is blocked or full. */
  }
}

export function removeSessionValue(key: string): void {
  try {
    if (typeof window !== 'undefined') window.sessionStorage.removeItem(key);
  } catch {
    /* Do not mask the original failure with a second storage error. */
  }
}

export function writeSessionJson(key: string, value: unknown): void {
  if (typeof window === 'undefined') return;

  try {
    window.sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage can be unavailable or full. UI state persistence is optional.
  }
}
