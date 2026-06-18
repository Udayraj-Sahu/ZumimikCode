type Platform = "web" | "android" | "ios";

let cachedPlatform: Platform = "web";

export function getPlatform(): Platform {
  return cachedPlatform;
}

export function setPlatform(p: Platform) {
  cachedPlatform = p;
}

export async function getDeviceInfo(): Promise<{ model: string; osVersion: string }> {
  try {
    const { Device } = await import("@capacitor/device");
    const info = await Device.getInfo();
    return { model: info.model ?? "unknown", osVersion: info.osVersion ?? "unknown" };
  } catch {
    return { model: "web", osVersion: typeof navigator !== "undefined" ? navigator.userAgent : "unknown" };
  }
}

export function getWindowSize(): { width: number; height: number } {
  if (typeof window === "undefined") return { width: 375, height: 812 };
  return { width: window.innerWidth, height: window.innerHeight };
}

export function isTouchDevice(): boolean {
  if (typeof window === "undefined") return false;
  return "ontouchstart" in window || navigator.maxTouchPoints > 0;
}
