'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { useTranslations } from 'next-intl';
import { useSession } from 'next-auth/react';
import { Link } from '@/i18n/routing';
import { ArrowRight, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useRuntimeConfig } from '@/components/providers/runtime-config-provider';

const NAV_ITEMS = [
  { href: '#features', label: 'PROJECTS' },
  { href: '#templates', label: 'BLOG' },
  { href: '#about', label: 'ABOUT' },
] as const;

const emptySubscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export function LandingHeader() {
  const t = useTranslations('landing.header');
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const mounted = useSyncExternalStore(emptySubscribe, getClientSnapshot, getServerSnapshot);
  const { data: session } = useSession();
  const { authEnabled } = useRuntimeConfig();
  const ctaLabel = authEnabled && session?.user ? t('dashboard') : t('getStarted');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      className={`absolute inset-x-0 top-0 z-50 border-b transition-all duration-300 ${
        scrolled
          ? 'border-white/10 bg-[#070b0a]/80 backdrop-blur-xl'
          : 'border-transparent bg-transparent'
      }`}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-12">
        <Link href="/" className="font-jakarta text-lg font-bold tracking-[-0.04em] text-white">
          职策<span className="text-[#5ed29c]">AI</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="font-inter text-[13px] font-medium tracking-[0.16em] text-white/65 transition-colors hover:text-[#5ed29c]"
            >
              {item.label}
            </a>
          ))}
          <Link
            href="/dashboard"
            className="font-inter text-[13px] font-medium tracking-[0.16em] text-white/65 transition-colors hover:text-[#5ed29c]"
          >
            RESUME
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Button
            asChild
            className="hidden h-10 rounded-full bg-[#5ed29c] px-5 font-inter text-xs font-bold uppercase tracking-wide text-[#070b0a] hover:bg-[#78e0af] sm:inline-flex"
          >
            <Link href="/dashboard">
              {ctaLabel}
              <ArrowRight className="ml-2 h-3.5 w-3.5" />
            </Link>
          </Button>

          {mounted ? (
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-full border border-white/15 text-white hover:bg-white/10 hover:text-[#5ed29c] md:hidden"
                  aria-label="Open navigation"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="top"
                showCloseButton={false}
                className="h-screen w-full border-0 bg-[#070b0a] p-0 text-white"
              >
                <SheetTitle className="sr-only">Navigation</SheetTitle>
                <div className="flex h-full flex-col px-6 pb-8 pt-6 sm:px-10">
                  <div className="flex items-center justify-between">
                    <span className="font-jakarta text-lg font-bold tracking-[-0.04em]">
                      职策<span className="text-[#5ed29c]">AI</span>
                    </span>
                    <SheetClose asChild>
                      <button
                        type="button"
                        className="rounded-full border border-white/15 p-2 text-white/80 transition-colors hover:text-[#5ed29c]"
                        aria-label="Close navigation"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </SheetClose>
                  </div>
                  <nav className="flex flex-1 flex-col justify-center gap-6">
                    {[...NAV_ITEMS, { href: '#resume', label: 'RESUME' }].map((item) => (
                      <a
                        key={item.href}
                        href={item.href === '#resume' ? '/dashboard' : item.href}
                        onClick={() => setOpen(false)}
                        className="font-inter text-3xl font-semibold tracking-[-0.04em] text-white/85 transition-colors hover:text-[#5ed29c]"
                      >
                        {item.label}
                      </a>
                    ))}
                  </nav>
                  <Button
                    asChild
                    className="h-12 rounded-full bg-[#5ed29c] font-inter text-sm font-bold uppercase tracking-wide text-[#070b0a] hover:bg-[#78e0af]"
                  >
                    <Link href="/dashboard" onClick={() => setOpen(false)}>
                      {ctaLabel}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full border border-white/15 text-white hover:bg-white/10 hover:text-[#5ed29c] md:hidden"
              aria-label="Open navigation"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
