import { describe, expect, it } from 'vitest';
import { mergeOptimizedSections } from './optimize-sections';

describe('mergeOptimizedSections', () => {
  it('updates returned sections while preserving sections AI did not return', () => {
    const existing = [
      { id: 'summary-1', type: 'summary', title: '个人简介', content: { text: '旧简介' } },
      { id: 'custom-1', type: 'custom', title: '补充信息', content: { text: '保留' } },
    ];

    const merged = mergeOptimizedSections(existing, [
      { type: 'summary', title: '个人简介', content: { text: '按 JD 优化后的简介' } },
    ]);

    expect(merged).toEqual([
      { id: 'summary-1', type: 'summary', title: '个人简介', content: { text: '按 JD 优化后的简介' } },
      { id: 'custom-1', type: 'custom', title: '补充信息', content: { text: '保留' } },
    ]);
  });
});
