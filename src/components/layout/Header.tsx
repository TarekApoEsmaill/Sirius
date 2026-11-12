import { useState, useCallback } from 'react';
import { Menu, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { NotificationButton } from '@/components/common/NotificationButton';
import { RoleSwitcher } from '@/components/common/RoleSwitcher';
import { UserIdentity } from '@/components/common/UserIdentity';
import { MobileNav } from '@/components/layout/MobileNav';
import { Divider } from '@/components/ui/Divider';

// ============================================================
// SIRIUS — Application Header
// ============================================================

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const handleClose = useCallback(() => setMobileNavOpen(false), []);

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-[200]',
          'bg-[var(--bg-surface)]/90 backdrop-blur-sm',
          'border-b border-[var(--border-subtle)]',
          'shadow-[0_1px_3px_0_rgb(0_0_0/0.06)]',
          className
        )}
      >
        <div className="flex items-center h-14 px-4 gap-3">
          {/* Mobile: hamburger + brand */}
          <div className="flex items-center gap-2.5 lg:hidden">
            <button
              onClick={() => setMobileNavOpen(true)}
              aria-label="فتح القائمة"
              aria-expanded={mobileNavOpen}
              aria-controls="mobile-nav"
              className={cn(
                'flex items-center justify-center w-9 h-9',
                'rounded-[var(--radius-md)]',
                'text-[var(--text-muted)] hover:text-[var(--text-primary)]',
                'hover:bg-[var(--interactive-secondary)]',
                'transition-colors duration-[120ms]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4C8CE4]/40'
              )}
            >
              <Menu size={20} aria-hidden="true" />
            </button>

            {/* Brand on mobile */}
            <div className="flex items-center gap-2">
              <div className="flex items-center justify-center w-7 h-7 rounded-[8px] bg-gradient-to-br from-[#4C8CE4] to-[#406093]">
                <Star size={13} className="text-white" fill="white" aria-hidden="true" />
              </div>
              <span className="text-sm font-black text-[var(--text-primary)]">سيريوس</span>
            </div>
          </div>

          {/* Desktop: identity */}
          <div className="hidden lg:flex items-center">
            <UserIdentity />
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Actions row */}
          <div className="flex items-center gap-1">
            {/* Role switcher — desktop only inline */}
            <div className="hidden md:block me-2">
              <RoleSwitcher />
            </div>

            <Divider orientation="vertical" className="hidden md:block h-6 mx-1" />

            <NotificationButton />
            <ThemeToggle variant="icon" />
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      <MobileNav
        open={mobileNavOpen}
        onClose={handleClose}
      />
    </>
  );
}
