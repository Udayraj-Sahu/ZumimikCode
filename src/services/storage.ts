export async function getItem<T>(key: string): Promise<T | null> {
  try {
    const { Preferences } = await import("@capacitor/preferences");
    const { value } = await Preferences.get({ key });
    return value ? (JSON.parse(value) as T) : null;
  } catch {
    // Fallback to localStorage
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  }
}

export async function setItem<T>(key: string, value: T): Promise<void> {
  try {
    const { Preferences } = await import("@capacitor/preferences");
    await Preferences.set({ key, value: JSON.stringify(value) });
  } catch {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage full or unavailable
    }
  }
}

export async function removeItem(key: string): Promise<void> {
  try {
    const { Preferences } = await import("@capacitor/preferences");
    await Preferences.remove({ key });
  } catch {
    try {
      localStorage.removeItem(key);
    } catch {
      // Unavailable
    }
  }
}

export async function clear(): Promise<void> {
  try {
    const { Preferences } = await import("@capacitor/preferences");
    await Preferences.clear();
  } catch {
    try {
      localStorage.clear();
    } catch {
      // Unavailable
    }
  }
}
