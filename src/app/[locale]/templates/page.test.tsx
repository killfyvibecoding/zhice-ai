import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { TEMPLATES } from '@/lib/constants';
import TemplatesPage from './page';

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}));

vi.mock('@/hooks/use-resume', () => ({
  useResume: () => ({ createResume: vi.fn() }),
}));

vi.mock('@/i18n/routing', () => ({
  Link: ({ children, href, ...props }: React.ComponentProps<'a'>) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock('@/stores/tour-store', () => ({
  hasCompletedTour: () => true,
  useTourStore: () => vi.fn(),
}));

vi.mock('@/components/tour/tour-overlay', () => ({
  TourOverlay: () => null,
}));

describe('TemplatesPage', () => {
  it('keeps all template choices without eagerly rendering every resume preview', () => {
    const html = renderToString(<TemplatesPage />);
    const placeholderCount =
      html.match(/data-template-preview-placeholder/g)?.length ?? 0;

    expect(placeholderCount).toBe(TEMPLATES.length);
    expect(html).not.toContain('siyuan.chen@zhice.ai');
  });
});
