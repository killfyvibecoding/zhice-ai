function extractMarkdownImage(value: string): string | null {
  if (value.startsWith('data:image/')) return value;
  const match = value.match(/!\[[^\]]*\]\((data:image\/[^)\s]+|https?:\/\/[^)\s]+)\)/i);
  return match?.[1] || null;
}

export function findImageReference(value: unknown): string | null {
  if (typeof value === 'string') return extractMarkdownImage(value);
  if (!value || typeof value !== 'object') return null;

  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findImageReference(item);
      if (found) return found;
    }
    return null;
  }

  const item = value as Record<string, unknown>;
  const direct = [item.b64_json, item.url].find((candidate) => typeof candidate === 'string') as string | undefined;
  if (direct) return direct;
  if (typeof item.image_url === 'string') return item.image_url;
  if (item.image_url && typeof item.image_url === 'object') {
    const nested = (item.image_url as Record<string, unknown>).url;
    if (typeof nested === 'string') return nested;
  }

  for (const nested of Object.values(item)) {
    const found = findImageReference(nested);
    if (found) return found;
  }
  return null;
}
