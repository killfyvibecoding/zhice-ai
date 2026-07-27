'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import type { Resume } from '@/types/resume';

function PreviewPlaceholder() {
  return (
    <div
      data-template-preview-placeholder
      className="absolute inset-4 rounded-lg border border-zinc-200/80 bg-white/70 dark:border-zinc-800 dark:bg-zinc-900/70"
    >
      <div className="mx-auto mt-8 h-3 w-20 rounded-full bg-zinc-200 dark:bg-zinc-800" />
      <div className="mx-auto mt-5 h-2 w-36 rounded-full bg-zinc-100 dark:bg-zinc-800/70" />
      <div className="mx-auto mt-3 h-2 w-28 rounded-full bg-zinc-100 dark:bg-zinc-800/70" />
    </div>
  );
}

export const DynamicResumePreview = dynamic(
  () =>
    import('@/components/preview/resume-preview').then(
      (module) => module.ResumePreview
    ),
  {
    ssr: false,
    loading: PreviewPlaceholder,
  }
);

export function LazyTemplatePreview({ resume }: { resume: Resume }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (!('IntersectionObserver' in window)) {
      const timer = setTimeout(() => setShouldRender(true), 0);
      return () => clearTimeout(timer);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setShouldRender(true);
        observer.disconnect();
      },
      { rootMargin: '400px 0px' }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative h-[320px] overflow-hidden bg-zinc-50 dark:bg-zinc-950"
    >
      {shouldRender ? (
        <div
          className="absolute left-1/2 top-0 origin-top"
          style={{
            width: '794px',
            transform: 'translateX(-50%) scale(0.28)',
          }}
        >
          <DynamicResumePreview resume={resume} />
        </div>
      ) : (
        <PreviewPlaceholder />
      )}
    </div>
  );
}
