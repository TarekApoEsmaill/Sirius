import { cn } from '@/lib/utils';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

// ============================================================
// SIRIUS — Application Shell
// Shared by both store and warehouse interfaces
// ============================================================

interface AppShellProps {
  children: React.ReactNode;
  className?: string;
}

export function AppShell({ children, className }: AppShellProps) {
  return (
    <>
      {/* ── Skip to content (accessibility) ───────────────────
          Completely hidden from view and pointer events.
          Only surfaces when keyboard-focused (Tab key).        */}
      <a
        href="#main-content"
        className={cn(
          'sr-only focus:not-sr-only',
          'fixed top-3 end-3 z-[9999]',
          'px-4 py-2 rounded-[var(--radius-md)]',
          'bg-[#4C8CE4] text-white text-sm font-semibold',
          'shadow-[var(--shadow-3)]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60'
        )}
      >
        انتقل إلى المحتوى
      </a>

      {/*
        RTL layout: html[dir=rtl] + Tailwind logical properties handle
        sidebar placement. We use a normal flex row — Tailwind's `border-s`
        renders on the inline-start side which is the RIGHT in RTL, so the
        sidebar correctly sits on the right without needing flex-row-reverse.
      */}
      <div
        className={cn(
          'flex min-h-screen bg-[var(--bg-page)]',
          className
        )}
      >
        {/* Desktop Sidebar — rendered first in DOM, floats to inline-start
            (right in RTL) via the flex + dir=rtl combination            */}
        <Sidebar />

        {/* Main area: stretches to fill remaining width */}
        <div className="flex flex-col flex-1 min-w-0 min-h-screen overflow-x-hidden">
          {/* Sticky header */}
          <Header />

          {/* Page content — scroll anchor for skip-to-content */}
          <main
            id="main-content"
            className="flex-1 outline-none"
            tabIndex={-1}
          >
            {children}
          </main>
        </div>
      </div>
    </>
  );
}

// ── Content Container ───────────────────────────────────────
interface ContentContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

const maxWidthClasses = {
  sm:   'max-w-2xl',
  md:   'max-w-4xl',
  lg:   'max-w-6xl',
  xl:   'max-w-7xl',
  '2xl':'max-w-[1600px]',
  full: 'max-w-none',
};

export function ContentContainer({
  children,
  className,
  maxWidth = 'xl',
}: ContentContainerProps) {
  return (
    <div
      className={cn(
        'w-full mx-auto',
        'px-4 sm:px-6 lg:px-8',
        'py-6',
        maxWidthClasses[maxWidth],
        className
      )}
    >
      {children}
    </div>
  );
}
