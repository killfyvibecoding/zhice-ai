import { describe, expect, it } from 'vitest';
import { buildResumeTitle, shouldAutoRename } from './title';

describe('buildResumeTitle', () => {
  it('combines the candidate name and target job', () => {
    expect(buildResumeTitle('陈思远', '高级前端工程师')).toBe('陈思远｜高级前端工程师');
  });

  it('falls back to a readable default when fields are missing', () => {
    expect(buildResumeTitle('', '')).toBe('我的简历');
    expect(buildResumeTitle('陈思远', '')).toBe('陈思远｜求职简历');
  });

  it('does not replace a title manually chosen by the user', () => {
    expect(shouldAutoRename('陈思远｜高级前端工程师', '陈思远')).toBe(false);
    expect(shouldAutoRename('我的简历', '陈思远')).toBe(true);
  });
});
