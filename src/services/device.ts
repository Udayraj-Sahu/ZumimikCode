type Platform = "web" | "android" | "ios";

let cachedPlatform: Platform = "web";

export function setPlatform(p: Platform) {
  cachedPlatform = p;
}


