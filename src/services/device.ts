type Platform = "web" | "android" | "ios";

let cachedPlatform: Platform = "web";

export function setPlatform(p: Platform) {
  cachedPlatform = p;
}

export function getPlatform(): Platform {
  return cachedPlatform;
}

export function isOnline(): boolean {
  if (typeof navigator === "undefined") return true;
  return navigator.onLine;
}

export function getWidth(): number {
  if (typeof window === "undefined") return 1024;
  return window.innerWidth;
}

export function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

export function isAndroid(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Android/.test(navigator.userAgent);
}

type OnlineCallback = () => void;

export function onOnline(cb: OnlineCallback): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("online", cb);
  return () => window.removeEventListener("online", cb);
}

export function onOffline(cb: OnlineCallback): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("offline", cb);
  return () => window.removeEventListener("offline", cb);
}
