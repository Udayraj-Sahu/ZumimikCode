type Platform = "web" | "android" | "ios";

let cachedPlatform: Platform = "web";

export function getPlatform(): Platform {
  return cachedPlatform;
}

export function setPlatform(p: Platform) {
  cachedPlatform = p;
}

export function getWindowSize(): { width: number; height: number } {
  if (typeof window === "undefined") return { width: 375, height: 812 };
  return { width: window.innerWidth, height: window.innerHeight };
}

export function isTouchDevice(): boolean {
  if (typeof window === "undefined") return false;
  return "ontouchstart" in window || navigator.maxTouchPoints > 0;
}
