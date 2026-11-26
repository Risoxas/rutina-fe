export function isValidVideoUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  const trimmed = url.trim();
  if (!trimmed) return false;
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function getEmbedVideoUrl(url: string | null | undefined): string | null {
  if (!isValidVideoUrl(url) || !url) return null;
  const parsed = new URL(url.trim());
  const host = parsed.hostname.replace(/^www\./, "").toLowerCase();

  if (host === "youtube.com" || host === "m.youtube.com") {
    const videoId = parsed.searchParams.get("v");
    if (videoId) return `https://www.youtube.com/embed/${videoId}`;
    if (parsed.pathname.startsWith("/embed/")) return parsed.toString();
  }

  if (host === "youtu.be") {
    const videoId = parsed.pathname.slice(1).split("/")[0];
    if (videoId) return `https://www.youtube.com/embed/${videoId}`;
  }

  if (host === "vimeo.com") {
    const videoId = parsed.pathname.slice(1).split("/")[0];
    if (videoId && /^\d+$/.test(videoId)) {
      return `https://player.vimeo.com/video/${videoId}`;
    }
  }

  return parsed.toString();
}
