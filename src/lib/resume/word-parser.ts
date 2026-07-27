const DOCX_MIME_TYPES = new Set([
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
  'application/octet-stream',
]);

export function isDocxFile(type: string, name: string) {
  return DOCX_MIME_TYPES.has(type.toLowerCase()) && name.toLowerCase().endsWith('.docx');
}

export async function extractDocxText(buffer: Buffer) {
  const mammoth = await import('mammoth');
  const result = await mammoth.extractRawText({ buffer });
  return result.value.trim();
}
