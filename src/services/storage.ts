export async function getItem<T>(key: string): Promise<T | null> {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export async function setItem<T>(key: string, value: T): Promise<void> {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or unavailable
  }
}

export async function removeItem(key: string): Promise<void> {
  try {
    localStorage.removeItem(key);
  } catch {
    // Unavailable
  }
}

export async function clear(): Promise<void> {
  try {
    localStorage.clear();
  } catch {
    // Unavailable
  }
}
