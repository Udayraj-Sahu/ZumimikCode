export async function share({ title, text, url }: { title?: string; text?: string; url?: string }) {
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
