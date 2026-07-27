import { describe, expect, it } from 'vitest';
import { findImageReference } from './image-reference';

describe('image provider response parsing', () => {
  it('extracts a data URL embedded in markdown content', () => {
    expect(findImageReference({
      choices: [{ message: { content: '![image](data:image/png;base64,encoded-image)' } }],
    })).toBe('data:image/png;base64,encoded-image');
  });

  it('keeps supporting direct provider image fields', () => {
    expect(findImageReference({ b64_json: 'encoded-image' })).toBe('encoded-image');
    expect(findImageReference({ url: 'https://images.example/result.png' })).toBe('https://images.example/result.png');
  });
});
