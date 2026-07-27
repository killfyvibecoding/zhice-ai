import { describe, expect, it } from 'vitest';
import { isDocxFile } from './word-parser';

describe('isDocxFile', () => {
  it('accepts Word Open XML files selected with a generic MIME type', () => {
    expect(isDocxFile('application/octet-stream', 'resume.docx')).toBe(true);
    expect(isDocxFile('application/msword', 'resume.docx')).toBe(true);
  });

  it('rejects legacy .doc files because they are not OOXML documents', () => {
    expect(isDocxFile('application/msword', 'resume.doc')).toBe(false);
  });
});
