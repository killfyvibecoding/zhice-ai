import { NextRequest, NextResponse } from 'next/server';
import { generateText } from 'ai';
import { z } from 'zod/v4';
import { getModel, extractAIConfig, getJsonProviderOptions, AIConfigError } from '@/lib/ai/provider';
import { resolveUser, getUserIdFromRequest } from '@/lib/auth/helpers';
import { resumeRepository } from '@/lib/db/repositories/resume.repository';
import { extractJson } from '@/lib/ai/extract-json';
import { mergeOptimizedSections } from '@/lib/resume/optimize-sections';
import { consumeMiniProgramCredits, getMiniProgramAccount, MINI_CREDIT_COSTS, MINI_INSUFFICIENT_CREDITS_MESSAGE } from '@/lib/miniprogram/entitlements';
import { buildResumeTitle, shouldAutoRename } from '@/lib/resume/title';
import { TEMPLATES } from '@/lib/constants';

const inputSchema = z.object({
  resumeId: z.string().min(1),
  jobTitle: z.string().trim().max(120).optional(),
  template: z.enum(TEMPLATES).optional(),
  jobDescription: z.string().trim().min(10).max(10000),
});

const outputSchema = z.object({
  sections: z.array(z.object({
    type: z.string(),
    title: z.string().optional(),
    content: z.unknown(),
  })),
});

type ExistingResumeSection = {
  id: string;
  type: string;
  title: string;
  sortOrder?: number;
  visible?: boolean;
  content: unknown;
};

const SYSTEM_PROMPT = `你是一名专业简历优化顾问。根据岗位 JD 优化候选人的原简历，并严格返回 JSON。
规则：
- 只优化原简历中已有的 sections，保持原有 section type 不变。
- 保留候选人的真实公司、职位、项目、时间和联系方式，不得编造经历、数字或技能。
- 重点优化 summary、work_experience、projects、skills 的表达，使其与 JD 更匹配。
- 只把 JD 中与原简历事实一致的关键词自然融入，不要为了匹配而虚构能力。
- 保留每个 section 原本的数据结构，只修改文字内容。
- 返回单个 JSON 对象，格式必须是 {"sections":[{"type":"summary","title":"个人简介","content":{}}]}，不要 Markdown，不要解释文字。`;

export async function POST(request: NextRequest) {
  try {
    const user = await resolveUser(getUserIdFromRequest(request));
    if (!user) return NextResponse.json({ error: '请先完成微信登录' }, { status: 401 });

    const parsed = inputSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: '请提供有效的简历和岗位 JD' }, { status: 400 });
    }

    const resume = await resumeRepository.findById(parsed.data.resumeId);
    if (!resume) return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    if (resume.userId !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    if (parsed.data.template && parsed.data.template !== resume.template) {
      await resumeRepository.update(resume.id, { template: parsed.data.template });
    }

    const isMiniProgram = request.headers.get('x-client') === 'miniprogram';
    if (isMiniProgram) {
      const account = await getMiniProgramAccount(user.id);
      if (account.credits < MINI_CREDIT_COSTS.optimizeResume) return NextResponse.json({ error: MINI_INSUFFICIENT_CREDITS_MESSAGE }, { status: 402 });
    }

    const aiConfig = extractAIConfig(request);
    const model = getModel(aiConfig);
    const templateContext = parsed.data.template ? `\nSelected visual resume template: ${parsed.data.template}. Keep the optimized content concise and structured for this layout.` : '';
    const result = await generateText({
      model,
      maxOutputTokens: 12000,
      system: SYSTEM_PROMPT,
      prompt: `原简历 sections：\n${JSON.stringify(resume.sections)}\n\n岗位 JD：\n${parsed.data.jobDescription}${templateContext}\n\n只返回 JSON。`,
      providerOptions: getJsonProviderOptions(aiConfig),
    });
    const output = extractJson(result.text, outputSchema);
    const sections = mergeOptimizedSections(resume.sections as ExistingResumeSection[], output.sections);

    for (const section of sections) {
      await resumeRepository.updateSection(section.id, {
        title: section.title,
        sortOrder: section.sortOrder,
        visible: section.visible,
        content: section.content,
      });
    }

    const personalInfo = ((resume.sections as Array<{ type: string; content: unknown }>).find((section) => section.type === 'personal_info')?.content || {}) as { fullName?: string; jobTitle?: string };
    const targetJob = parsed.data.jobTitle || personalInfo.jobTitle || '';
    if (targetJob && shouldAutoRename(resume.title, personalInfo.fullName || '')) {
      await resumeRepository.update(resume.id, {
        title: buildResumeTitle(personalInfo.fullName || '', targetJob),
      });
    }

    if (isMiniProgram) await consumeMiniProgramCredits(user.id, MINI_CREDIT_COSTS.optimizeResume);
    return NextResponse.json({ resumeId: resume.id, resume: await resumeRepository.findById(resume.id) });
  } catch (error) {
    if (error instanceof AIConfigError) {
      return NextResponse.json({ error: '智能服务尚未配置，请联系管理员' }, { status: 503 });
    }
    console.error('POST /api/ai/optimize-resume error:', error);
    const detail = error instanceof Error ? error.message : '';
    return NextResponse.json({ error: detail || '简历优化失败，请稍后再试' }, { status: 500 });
  }
}
