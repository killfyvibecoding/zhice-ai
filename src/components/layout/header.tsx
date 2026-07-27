'use client';

import { Menu, Settings } from 'lucide-react';
import { useSyncExternalStore } from 'react';
import { LocaleSwitcher } from './locale-switcher';
import { UserMenu } from './user-menu';
import { Link, usePathname } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useUIStore } from '@/stores/ui-store';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

const NAV_ITEMS: { href: string; i18nKey: string; match: string; tourId?: string }[] = [
  { href: '/dashboard', i18nKey: 'dashboard.nav', match: '/dashboard' },
  { href: '/templates', i18nKey: 'templates.nav', match: '/templates', tourId: 'dash-templates' },
  { href: '/interview', i18nKey: 'interview.nav', match: '/interview' },
];

const emptySubscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export function Header() {
  const { openModal } = useUIStore();
  const t = useTranslations();
  const pathname = usePathname();
  const mounted = useSyncExternalStore(emptySubscribe, getClientSnapshot, getServerSnapshot);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#070b0a]/90 text-white backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-8">
          <Link href="/dashboard" className="font-jakarta text-lg font-bold tracking-[-0.04em] text-white">
            职策<span className="text-[#5ed29c]">AI</span>
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname.startsWith(item.match);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  data-tour={item.tourId}
                  className={cn(
                    'relative rounded-full px-4 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-white/10 text-[#5ed29c]'
                      : 'text-white/60 hover:bg-white/5 hover:text-white'
                  )}
                >
                  {t(item.i18nKey)}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <LocaleSwitcher />
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => openModal('settings')}
            className="cursor-pointer text-white/60 hover:bg-white/10 hover:text-[#5ed29c]"
            title={t('settings.title')}
          >
            <Settings className="h-4 w-4" />
          </Button>
          <UserMenu />
          <div className="md:hidden">
            {mounted ? <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-full border border-white/15 text-white hover:bg-white/10 hover:text-[#5ed29c]"
                  aria-label="Open navigation"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="top" className="h-screen w-full border-0 bg-[#070b0a] p-6 text-white">
                <SheetTitle className="sr-only">Navigation</SheetTitle>
                <nav className="flex flex-col gap-3 pt-8">
                  {NAV_ITEMS.map((item) => {
                    const isActive = pathname.startsWith(item.match);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        data-tour={item.tourId}
                        className={cn(
                          'rounded-xl px-4 py-3 text-base font-medium transition-colors',
                          isActive
                            ? 'bg-white/10 text-[#5ed29c]'
                            : 'text-white/65 hover:bg-white/5 hover:text-white'
                        )}
                      >
                        {t(item.i18nKey)}
                      </Link>
                    );
                  })}
                </nav>
              </SheetContent>
            </Sheet> : (
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full border border-white/15 text-white hover:bg-white/10 hover:text-[#5ed29c]"
                aria-label="Open navigation"
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
