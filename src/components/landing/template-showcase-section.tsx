'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { ArrowRight } from 'lucide-react';
import { ResumePreview } from '@/components/preview/resume-preview';
import type { Resume } from '@/types/resume';

const FEATURED_TEMPLATES = [
  { id: 'modern', labelKey: 'dashboard.templateModern' },
  { id: 'creative', labelKey: 'dashboard.templateCreative' },
  { id: 'two-column', labelKey: 'dashboard.templateTwoColumn' },
  { id: 'elegant', labelKey: 'dashboard.templateElegant' },
] as const;

// Stable date to avoid SSR/client hydration mismatch
const MOCK_DATE = new Date('2025-01-01T00:00:00Z');

function buildMockResume(template: string): Resume {
  return ({
    id: 'mock',
    userId: 'mock',
    title: '陈思远｜高级前端工程师',
    template,
    themeConfig: {
      primaryColor: '#1a1a1a',
      accentColor: '#3b82f6',
      fontFamily: 'Inter',
      fontSize: 'medium',
      lineSpacing: 1.5,
      margin: { top: 20, right: 20, bottom: 20, left: 20 },
      sectionSpacing: 16,
    },
    isDefault: false,
    language: 'en',
    sections: [
      {
        id: 's1', resumeId: 'mock', type: 'personal_info', title: 'Personal Info', sortOrder: 0, visible: true,
        content: {
          fullName: '陈思远', jobTitle: '高级前端工程师',
          email: 'siyuan.chen@zhice.ai', phone: '138 0000 2026',
          location: '上海 · 中国', website: 'https://zhice.ai/portfolio',
          linkedin: 'linkedin.com/in/siyuan-chen', github: 'github.com/zhice-ai/sample-portfolio',
        },
        createdAt: MOCK_DATE, updatedAt: MOCK_DATE,
      },
      {
        id: 's2', resumeId: 'mock', type: 'summary', title: 'Summary', sortOrder: 1, visible: true,
        content: { text: '拥有 8 年全栈开发经验，专注于构建稳定、易维护的 Web 产品。擅长前端架构、工程效率与团队协作，持续将复杂业务转化为清晰可用的产品体验。' },
        createdAt: MOCK_DATE, updatedAt: MOCK_DATE,
      },
      {
        id: 's3', resumeId: 'mock', type: 'work_experience', title: 'Work Experience', sortOrder: 2, visible: true,
        content: {
          items: [
            { id: 'w1', company: '澄明科技', position: '高级前端工程师', location: '上海', startDate: '2021-03', endDate: null, current: true, description: '负责企业协作平台的前端架构与核心模块建设，推动产品从试点走向规模化使用。', highlights: ['通过代码分割与资源懒加载，将核心页面首屏时间降低 40%', '设计可观测的前端应用架构，支撑日活 200 万级的业务访问'] },
            { id: 'w2', company: '云桥网络', position: '前端工程师', location: '杭州', startDate: '2018-06', endDate: '2021-02', current: false, description: '参与客户管理与数据分析产品从 0 到 1 的设计和开发。', highlights: ['使用 WebSocket 实现实时协作能力，完善异常重连与消息状态反馈', '优化 CI/CD 流程，将常规版本发布耗时缩短 60%'] },
          ],
        },
        createdAt: MOCK_DATE, updatedAt: MOCK_DATE,
      },
      {
        id: 's4', resumeId: 'mock', type: 'education', title: 'Education', sortOrder: 3, visible: true,
        content: {
          items: [{ id: 'e1', institution: '华东理工大学', degree: '工学学士', field: '软件工程', location: '上海', startDate: '2014-09', endDate: '2018-05', gpa: '3.8/4.0', highlights: ['校级奖学金', '软件工程实践优秀项目'] }],
        },
        createdAt: MOCK_DATE, updatedAt: MOCK_DATE,
      },
      {
        id: 's5', resumeId: 'mock', type: 'skills', title: 'Skills', sortOrder: 4, visible: true,
        content: {
          categories: [
            { id: 'sk1', name: 'Frontend', skills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS'] },
            { id: 'sk2', name: 'Backend', skills: ['Node.js', 'Python', 'PostgreSQL', 'Redis'] },
            { id: 'sk3', name: 'DevOps', skills: ['Docker', 'AWS', 'CI/CD', 'Kubernetes'] },
          ],
        },
        createdAt: MOCK_DATE, updatedAt: MOCK_DATE,
      },
      {
        id: 's6', resumeId: 'mock', type: 'projects', title: 'Projects', sortOrder: 5, visible: true,
        content: {
          items: [{ id: 'p1', name: '职策求职工作台', url: 'https://zhice.ai/portfolio', description: '面向求职者的简历管理与面试准备工作台。', technologies: ['Next.js', 'GraphQL', 'PostgreSQL'], highlights: ['支持多模板简历管理', '提供 AI 辅助编辑与面试练习'] }],
        },
        createdAt: MOCK_DATE, updatedAt: MOCK_DATE,
      },
    ],
    createdAt: MOCK_DATE,
    updatedAt: MOCK_DATE,
  }) as Resume;
}

function TemplateCard({ template, label }: { template: string; label: string }) {
  const mockResume = buildMockResume(template);

  return (
    <div className="group overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-zinc-200/50 dark:border-zinc-700 dark:bg-zinc-800 dark:hover:shadow-zinc-900/50">
      <div className="relative h-[320px] overflow-hidden bg-zinc-50 dark:bg-zinc-950">
        <div
          className="absolute left-1/2 top-1/2"
          style={{ width: '794px', transform: 'translate(-50%, -50%) scale(0.28)', transformOrigin: 'center center' }}
        >
          <ResumePreview resume={mockResume} />
        </div>
      </div>
      <div className="border-t border-zinc-100 px-4 py-3 dark:border-zinc-700">
        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
          {label}
        </p>
      </div>
    </div>
  );
}

export function TemplateShowcaseSection() {
  const t = useTranslations('landing.templates');
  const tGlobal = useTranslations();

  return (
    <section
      id="templates"
      className="bg-zinc-50 px-4 py-24 sm:px-6 sm:py-32 lg:px-8 dark:bg-zinc-900/50"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto mb-12 max-w-2xl text-center sm:mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900 sm:text-4xl dark:text-zinc-100">
            {t('title')}
          </h2>
          <p className="mt-4 text-base text-zinc-600 sm:text-lg dark:text-zinc-400">
            {t('subtitle')}
          </p>
        </div>

        {/* Mobile horizontal scroll */}
        <div
          className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-4 snap-x snap-mandatory sm:hidden [&::-webkit-scrollbar]:hidden"
          style={{ scrollbarWidth: 'none' }}
        >
          {FEATURED_TEMPLATES.map(({ id, labelKey }) => (
            <div key={id} className="w-[280px] flex-shrink-0 snap-center">
              <TemplateCard template={id} label={tGlobal(labelKey)} />
            </div>
          ))}
        </div>

        {/* Desktop grid */}
        <div className="hidden gap-6 sm:grid sm:grid-cols-2 lg:grid-cols-4">
          {FEATURED_TEMPLATES.map(({ id, labelKey }) => (
            <TemplateCard key={id} template={id} label={tGlobal(labelKey)} />
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/templates"
            className="inline-flex items-center gap-2 text-sm font-semibold text-brand transition-colors hover:text-brand dark:text-brand dark:hover:text-brand"
          >
            {t('viewAll')}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
