import { useNavigate } from 'react-router-dom';
import { Home, ArrowRight } from 'lucide-react';
import { useRole } from '@/contexts/RoleContext';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

// ============================================================
// SIRIUS — 404 Not Found Page
// ============================================================

export function NotFound() {
  const { role } = useRole();
  const navigate = useNavigate();
  const homePath = role === 'store' ? '/store' : '/warehouse';

  return (
    <div className={cn(
      'min-h-screen flex flex-col items-center justify-center gap-6',
      'bg-[var(--bg-page)] px-4 text-center'
    )}>
      <div className="flex flex-col items-center gap-4">
        {/* Large 404 */}
        <div className="relative">
          <p className="text-[8rem] font-black leading-none text-[var(--border-default)] select-none">
            ٤٠٤
          </p>
          <p className="absolute inset-0 flex items-center justify-center text-[8rem] font-black leading-none text-[#4C8CE4]/10 select-none blur-sm">
            ٤٠٤
          </p>
        </div>

        <div>
          <h1 className="text-h2 font-bold text-[var(--text-primary)] mb-2">
            الصفحة غير موجودة
          </h1>
          <p className="text-sm text-[var(--text-muted)] max-w-sm mx-auto">
            الصفحة التي تبحث عنها غير موجودة أو انتقلت إلى عنوان مختلف.
          </p>
        </div>

        <div className="flex items-center gap-3 mt-2">
          <Button
            variant="primary"
            iconStart={<Home size={16} />}
            onClick={() => navigate(homePath)}
          >
            العودة للرئيسية
          </Button>
          <Button
            variant="ghost"
            iconStart={<ArrowRight size={16} />}
            onClick={() => navigate(-1)}
          >
            الصفحة السابقة
          </Button>
        </div>
      </div>
    </div>
  );
}
