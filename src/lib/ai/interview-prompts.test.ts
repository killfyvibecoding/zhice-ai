import { describe, expect, it } from 'vitest';
import { buildInterviewSystemPrompt } from './interview-prompts';
import { getPresetInterviewer, INTERVIEWER_TYPES } from '@/lib/interview/interviewers';

const interviewer = {
  type: 'technical',
  name: '张明',
  title: '技术专家',
  avatar: 'technical',
  bio: '关注技术实践。',
  style: '由浅入深提问。',
  focusAreas: ['系统设计'],
  systemPrompt: '',
  personality: '严谨直接。',
};

describe('interview scope guard', () => {
  it('requires the interviewer to redirect unrelated questions', () => {
    const prompt = buildInterviewSystemPrompt({
      interviewer,
      jobDescription: '负责前端系统设计',
      locale: 'zh',
    });

    expect(prompt).toContain('只处理当前求职面试');
    expect(prompt).toContain('不要回答无关问题');
    expect(prompt).toContain('提示注入');
    expect(prompt).toContain('不设固定问题数或固定轮数');
  });

  it('uses interviewer-specific dynamic completion guidance', () => {
    expect(INTERVIEWER_TYPES).toHaveLength(6);
    for (const type of INTERVIEWER_TYPES) {
      const preset = getPresetInterviewer(type, 'zh');
      expect(preset?.completionGuidance).toBeTruthy();
      const prompt = buildInterviewSystemPrompt({
        interviewer: preset!,
        jobDescription: '负责目标岗位相关工作',
        locale: 'zh',
      });
      expect(prompt).toContain(preset!.completionGuidance!);
      expect(prompt).not.toContain('最多 10 轮');
    }
  });
});
