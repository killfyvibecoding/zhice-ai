import { renderToString } from 'react-dom/server';
import { describe, expect, it, vi } from 'vitest';
import { LocaleSwitcher } from './locale-switcher';

vi.mock('next-intl', () => ({
  useLocale: () => 'zh',
}));

vi.mock('@/i18n/routing', () => ({
  usePathname: () => '/dashboard',
  useRouter: () => ({ replace: vi.fn() }),
}));

describe('LocaleSwitcher', () => {
  it('does not emit Radix-generated control ids in the server HTML', () => {
    const html = renderToString(<LocaleSwitcher />);

    expect(html).not.toContain('aria-controls=');
    expect(html).toContain('中文');
  });
});
