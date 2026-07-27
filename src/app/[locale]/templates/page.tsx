'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ArrowLeft, Eye, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { TEMPLATES } from '@/lib/constants';
import { useResume } from '@/hooks/use-resume';
import { Link, useRouter } from '@/i18n/routing';
import {
  DynamicResumePreview,
  LazyTemplatePreview,
} from '@/components/templates/lazy-template-preview';
import { TourOverlay, type TourStepConfig } from '@/components/tour/tour-overlay';
import { useTourStore, hasCompletedTour } from '@/stores/tour-store';
import { templateLabelsMap as templateLabelKeys } from '@/lib/template-labels';
import type { Resume } from '@/types/resume';

const TEMPLATES_TOUR_STEPS: TourStepConfig[] = [
  { target: 'tpl-preview', placement: 'bottom', i18nKey: 'tplPreview' },
  { target: 'tpl-use', placement: 'bottom', i18nKey: 'tplUse' },
];

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
        id: 's1',
        resumeId: 'mock',
        type: 'personal_info',
        title: 'Personal Info',
        sortOrder: 0,
        visible: true,
        content: {
          fullName: '陈思远',
          jobTitle: '高级前端工程师',
          email: 'siyuan.chen@zhice.ai',
          phone: '138 0000 2026',
          location: '上海 · 中国',
          website: 'https://zhice.ai/portfolio',
          linkedin: 'linkedin.com/in/siyuan-chen',
          github: 'github.com/zhice-ai/sample-portfolio',
        },
        createdAt: MOCK_DATE,
        updatedAt: MOCK_DATE,
      },
      {
        id: 's2',
        resumeId: 'mock',
        type: 'summary',
        title: 'Summary',
        sortOrder: 1,
        visible: true,
        content: {
          text: '拥有 8 年全栈开发经验，专注于构建稳定、易维护的 Web 产品。擅长前端架构、工程效率与团队协作，持续将复杂业务转化为清晰可用的产品体验。',
        },
        createdAt: MOCK_DATE,
        updatedAt: MOCK_DATE,
      },
      {
        id: 's3',
        resumeId: 'mock',
        type: 'work_experience',
        title: 'Work Experience',
        sortOrder: 2,
        visible: true,
        content: {
          items: [
            {
              id: 'w1',
              company: '澄明科技',
              position: '高级前端工程师',
              location: '上海',
              startDate: '2021-03',
              endDate: null,
              current: true,
              description: '负责企业协作平台的前端架构与核心模块建设，推动产品从试点走向规模化使用。',
              highlights: [
                '通过代码分割与资源懒加载，将核心页面首屏时间降低 40%',
                '设计可观测的前端应用架构，支撑日活 200 万级的业务访问',
              ],
            },
            {
              id: 'w2',
              company: '云桥网络',
              position: '前端工程师',
              location: '杭州',
              startDate: '2018-06',
              endDate: '2021-02',
              current: false,
              description: '参与客户管理与数据分析产品从 0 到 1 的设计和开发。',
              highlights: [
                '使用 WebSocket 实现实时协作能力，完善异常重连与消息状态反馈',
                '优化 CI/CD 流程，将常规版本发布耗时缩短 60%',
              ],
            },
          ],
        },
        createdAt: MOCK_DATE,
        updatedAt: MOCK_DATE,
      },
      {
        id: 's4',
        resumeId: 'mock',
        type: 'education',
        title: 'Education',
        sortOrder: 3,
        visible: true,
        content: {
          items: [
            {
              id: 'e1',
              institution: '华东理工大学',
              degree: '工学学士',
              field: '软件工程',
              location: '上海',
              startDate: '2014-09',
              endDate: '2018-05',
              gpa: '3.8/4.0',
              highlights: ['校级奖学金', '软件工程实践优秀项目'],
            },
          ],
        },
        createdAt: MOCK_DATE,
        updatedAt: MOCK_DATE,
      },
      {
        id: 's5',
        resumeId: 'mock',
        type: 'skills',
        title: 'Skills',
        sortOrder: 4,
        visible: true,
        content: {
          categories: [
            { id: 'sk1', name: 'Frontend', skills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS'] },
            { id: 'sk2', name: 'Backend', skills: ['Node.js', 'Python', 'PostgreSQL', 'Redis'] },
            { id: 'sk3', name: 'DevOps', skills: ['Docker', 'AWS', 'CI/CD', 'Kubernetes'] },
          ],
        },
        createdAt: MOCK_DATE,
        updatedAt: MOCK_DATE,
      },
      {
        id: 's6',
        resumeId: 'mock',
        type: 'projects',
        title: 'Projects',
        sortOrder: 5,
        visible: true,
        content: {
          items: [
            {
              id: 'p1',
              name: '职策求职工作台',
              url: 'https://zhice.ai/portfolio',
              description: '面向求职者的简历管理与面试准备工作台。',
              technologies: ['Next.js', 'GraphQL', 'PostgreSQL'],
              highlights: ['支持多模板简历管理', '提供 AI 辅助编辑与面试练习'],
            },
          ],
        },
        createdAt: MOCK_DATE,
        updatedAt: MOCK_DATE,
      },
      {
        id: 's7',
        resumeId: 'mock',
        type: 'certifications',
        title: 'Certifications',
        sortOrder: 6,
        visible: true,
        content: {
          items: [
            { id: 'c1', name: '云原生应用开发认证', issuer: '职策AI 示例项目', date: '2023-05' },
          ],
        },
        createdAt: MOCK_DATE,
        updatedAt: MOCK_DATE,
      },
      {
        id: 's8',
        resumeId: 'mock',
        type: 'languages',
        title: 'Languages',
        sortOrder: 7,
        visible: true,
        content: {
          items: [
            { id: 'l1', language: '普通话', proficiency: '母语' },
            { id: 'l2', language: '英语', proficiency: '工作交流' },
          ],
        },
        createdAt: MOCK_DATE,
        updatedAt: MOCK_DATE,
      },
    ],
    createdAt: MOCK_DATE,
    updatedAt: MOCK_DATE,
  }) as Resume;
}

export default function TemplatesPage() {
  const t = useTranslations();
  const router = useRouter();
  const { createResume } = useResume();
  const [previewTemplate, setPreviewTemplate] = useState<string | null>(null);
  const [creatingTemplate, setCreatingTemplate] = useState<string | null>(null);
  const startTour = useTourStore((s) => s.startTour);

  useEffect(() => {
    if (hasCompletedTour('templates')) return;
    if (window.innerWidth < 768) return;
    const timer = setTimeout(() => startTour('templates', TEMPLATES_TOUR_STEPS.length), 800);
    return () => clearTimeout(timer);
  }, [startTour]);

  const handleUseTemplate = async (template: string) => {
    setCreatingTemplate(template);
    try {
      const resume = await createResume({ template });
      if (resume) {
        router.push(`/editor/${resume.id}`);
      }
    } finally {
      setCreatingTemplate(null);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('common.back')}
        </Link>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-foreground">
          {t('templates.title')}
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          {t('templates.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {TEMPLATES.map((template, idx) => {
          const mockResume = buildMockResume(template);
          const label = t(templateLabelKeys[template]);
          const isCreating = creatingTemplate === template;
          const isFirst = idx === 0;

          return (
            <div
              key={template}
              className="group flex flex-col overflow-hidden rounded-xl border border-zinc-200 bg-white transition-shadow hover:shadow-lg dark:border-zinc-700 dark:bg-zinc-900"
            >
              {/* Template name */}
              <div className="border-b border-zinc-100 px-4 py-3 text-center dark:border-zinc-800">
                <h3 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                  {label}
                </h3>
              </div>

              {/* Scaled preview */}
              <LazyTemplatePreview resume={mockResume} />

              {/* Buttons */}
              <div className="flex gap-2 border-t border-zinc-100 px-4 py-3 dark:border-zinc-800">
                <Button
                  {...(isFirst ? { 'data-tour': 'tpl-preview' } : {})}
                  variant="outline"
                  size="sm"
                  className="flex-1 cursor-pointer gap-1.5"
                  onClick={() => setPreviewTemplate(template)}
                >
                  <Eye className="h-3.5 w-3.5" />
                  {t('templates.preview')}
                </Button>
                <Button
                  {...(isFirst ? { 'data-tour': 'tpl-use' } : {})}
                  size="sm"
                  className="flex-1 cursor-pointer gap-1.5 bg-brand hover:bg-brand-hover"
                  onClick={() => handleUseTemplate(template)}
                  disabled={isCreating}
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      {t('templates.creating')}
                    </>
                  ) : (
                    t('templates.useTemplate')
                  )}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Full-size preview dialog */}
      <Dialog
        open={!!previewTemplate}
        onOpenChange={(open) => {
          if (!open) setPreviewTemplate(null);
        }}
      >
        <DialogContent className="flex h-[90vh] w-[90vw] max-h-[90vh] flex-col gap-0 overflow-hidden p-0 sm:max-w-[900px]">
          <DialogHeader className="shrink-0 border-b border-zinc-100 px-6 py-4 dark:border-zinc-800">
            <DialogTitle>
              {previewTemplate && t(templateLabelKeys[previewTemplate])}
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {previewTemplate && (
              <div className="mx-auto w-full max-w-[794px] p-6">
                <DynamicResumePreview resume={buildMockResume(previewTemplate)} />
              </div>
            )}
          </div>
          <div className="sticky bottom-0 border-t bg-white p-3 dark:bg-background sm:hidden">
            <Button
              className="w-full cursor-pointer bg-brand hover:bg-brand-hover"
              disabled={creatingTemplate === previewTemplate}
              onClick={() => previewTemplate && handleUseTemplate(previewTemplate)}
            >
              {creatingTemplate === previewTemplate ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('templates.creating')}
                </>
              ) : (
                t('templates.useTemplate')
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <TourOverlay tourId="templates" steps={TEMPLATES_TOUR_STEPS} />
    </div>
  );
}
