'use client';

import { usePathname } from 'next/navigation';
import { Suspense } from 'react';
import Header from '@/components/Header';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? '';
  const HIDE_HEADER_EXACT: string[] = [
    '/login',
    '/auth/callback',
  ];
  const HIDE_HEADER_PREFIX: string[] = [
  ];

  const hideHeader =
    HIDE_HEADER_EXACT.includes(pathname) ||
    HIDE_HEADER_PREFIX.some((p) => pathname.startsWith(p));

  return (
    <Suspense fallback={null}>
      <div className="min-h-dvh flex flex-col bg-gray-100">
        {!hideHeader && <Header />}
          {children}
      </div>
    </Suspense>
  );
}
