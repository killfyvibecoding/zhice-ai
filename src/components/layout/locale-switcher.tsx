'use client';

import { useSyncExternalStore } from 'react';
import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/routing';
import { locales, localeNames } from '@/i18n/config';
import { Globe } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const emptySubscribe = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const mounted = useSyncExternalStore(emptySubscribe, getClientSnapshot, getServerSnapshot);

  function onValueChange(newLocale: string) {
    router.replace(pathname, { locale: newLocale });
  }

  if (!mounted) {
    return (
      <button
        type="button"
        disabled
        aria-label={localeNames[locale as keyof typeof localeNames]}
        className="flex h-9 w-auto items-center gap-1.5 rounded-md bg-transparent px-2 text-sm text-white"
      >
        <Globe className="h-4 w-4 text-zinc-500" />
        <span>{localeNames[locale as keyof typeof localeNames]}</span>
      </button>
    );
  }

  return (
    <Select value={locale} onValueChange={onValueChange}>
      <SelectTrigger className="w-auto gap-1.5 border-none bg-transparent px-2 text-sm shadow-none">
        <Globe className="h-4 w-4 text-zinc-500" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {locales.map((loc) => (
          <SelectItem key={loc} value={loc}>
            {localeNames[loc]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
