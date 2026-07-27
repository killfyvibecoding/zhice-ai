'use client';

import { useEffect, useRef } from 'react';
import Hls from 'hls.js';
import { ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';

const HERO_STREAM =
  'https://stream.mux.com/tLkHO1qZoaaQOUeVWo8hEBeGQfySP02EPS02BmnNFyXys.m3u8';

function HeroVideoBackground() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.playsInline = true;

    if (Hls.isSupported()) {
      const hls = new Hls({ enableWorker: false });
      hls.loadSource(HERO_STREAM);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        void video.play().catch(() => undefined);
      });

      return () => {
        hls.destroy();
        video.pause();
        video.removeAttribute('src');
        video.load();
      };
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = HERO_STREAM;
      void video.play().catch(() => undefined);
    }

    return () => {
      video.pause();
      video.removeAttribute('src');
      video.load();
    };
  }, []);

  return (
    <video
      ref={videoRef}
      aria-hidden="true"
      autoPlay
      loop
      muted
      playsInline
      className="absolute inset-0 h-full w-full object-cover opacity-60"
    />
  );
}

export function HeroSection() {
  const t = useTranslations('landing.hero');

  return (
    <section className="codenest-hero relative isolate flex min-h-[100svh] items-center overflow-hidden bg-[#070b0a] px-5 pb-16 pt-28 text-white sm:px-8 lg:px-12">
      <HeroVideoBackground />

      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,#070b0a_0%,rgba(7,11,10,.72)_42%,rgba(7,11,10,.2)_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(0deg,#070b0a_0%,rgba(7,11,10,.78)_20%,transparent_66%)]" />

      <div className="pointer-events-none absolute inset-y-0 left-1/4 hidden w-px bg-white/10 lg:block" />
      <div className="pointer-events-none absolute inset-y-0 left-1/2 hidden w-px bg-white/10 lg:block" />
      <div className="pointer-events-none absolute inset-y-0 left-3/4 hidden w-px bg-white/10 lg:block" />

      <svg
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[18%] h-[240px] w-[92%] -translate-x-1/2 opacity-70"
        viewBox="0 0 1000 280"
        fill="none"
      >
        <defs>
          <linearGradient id="codenest-glow" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#5ed29c" stopOpacity="0" />
            <stop offset="0.5" stopColor="#5ed29c" stopOpacity="0.8" />
            <stop offset="1" stopColor="#5ed29c" stopOpacity="0" />
          </linearGradient>
          <filter id="codenest-glow-blur" x="-20%" y="-100%" width="140%" height="300%">
            <feGaussianBlur stdDeviation="25" />
          </filter>
        </defs>
        <ellipse
          cx="500"
          cy="130"
          rx="390"
          ry="52"
          fill="url(#codenest-glow)"
          filter="url(#codenest-glow-blur)"
        />
      </svg>

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center text-center">
        <p className="font-jakarta text-[11px] font-bold uppercase tracking-[0.24em] text-[#5ed29c]">
          Career-Ready Workflow
        </p>

        <div className="liquid-glass-card mt-16 flex h-[200px] w-[200px] -translate-y-[50px] flex-col justify-between rounded-[28px] p-5 text-left sm:mt-20">
          <span className="font-jakarta text-[14px] font-medium tracking-[0.16em] text-white/65">
            [ 2025 ]
          </span>
          <div>
            <h2 className="font-jakarta text-[18px] font-semibold leading-tight text-white/95">
              Taught by{' '}
              <em className="font-instrument text-[23px] font-normal text-[#5ed29c]">
                Industry
              </em>{' '}
              Professionals
            </h2>
            <p className="mt-2 text-[11px] leading-relaxed text-white/55">
              AI-assisted tools to sharpen your next career move.
            </p>
          </div>
        </div>

        <p className="-mt-7 font-jakarta text-[11px] font-bold uppercase tracking-[0.24em] text-[#5ed29c] sm:-mt-8">
          Career-Ready Curriculum
        </p>
        <h1 className="mt-4 max-w-5xl font-inter text-[40px] font-extrabold uppercase leading-[0.98] tracking-[-0.06em] text-white sm:text-[56px] lg:text-[72px]">
          {t('title')}
          <span className="text-[#5ed29c]">.</span>
        </h1>
        <p className="mx-auto mt-6 max-w-[512px] font-inter text-[14px] leading-relaxed text-white/70">
          {t('subtitle')}
        </p>
        <Button
          asChild
          className="mt-9 h-12 rounded-full bg-[#5ed29c] px-7 font-inter text-sm font-bold uppercase tracking-wide text-[#070b0a] shadow-[0_12px_40px_rgba(94,210,156,.2)] transition-transform hover:-translate-y-0.5 hover:bg-[#78e0af]"
        >
          <Link href="/dashboard">
            {t('cta')}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
