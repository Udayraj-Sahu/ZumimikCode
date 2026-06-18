export async function share({ title, text, url }: { title?: string; text?: string; url?: string }) {
  try {
    const { Share } = await import("@capacitor/share");
    await Share.share({ title, text, url });
    return;
  } catch {
    // Capacitor share not available, fall through to web
  }

  if (typeof navigator === "undefined" || !navigator.share) {
    // Fallback — copy to clipboard
    const payload = text ?? url ?? title ?? "";
    try {
      await navigator.clipboard.writeText(payload);
    } catch {
      // Clipboard unavailable
    }
    return;
  }

  try {
    await navigator.share({ title, text, url });
  } catch {
    // User cancelled
  }
}
