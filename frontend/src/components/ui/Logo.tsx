import { cn } from '@/lib/utils'

export interface LogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'h-8 w-8',
  md: 'h-12 w-12', 
  lg: 'h-16 w-16'
}

export function Logo({ className, size = 'lg' }: LogoProps) {
  return (
    <img
      src="/logo.png"
      alt="Quad"
      draggable={false}
      className={cn(
        'object-contain select-none',
        sizeClasses[size],
        className
      )}
    />
  )
}

// Logo with text for branding
export function LogoWithText({ className, size = 'lg' }: LogoProps) {
  const gapClass = size === 'sm' ? 'gap-3' : size === 'md' ? 'gap-3.5' : 'gap-4'
  const titleClass =
    size === 'sm' ? 'text-lg' : size === 'md' ? 'text-xl' : 'text-[22px]'

  return (
    <div className={cn('flex items-center', gapClass, className)}>
      <div className="p-1.5 rounded-2xl bg-white/[0.03] border border-white/5 shadow-sm">
        <Logo size={size} className="rounded-xl" />
      </div>

      <div className="flex flex-col leading-tight">
        <span
          className={cn(
            titleClass,
            'font-extrabold tracking-tight',
            'bg-gradient-to-r from-[#2563eb] to-[#ff6b6b] bg-clip-text text-transparent'
          )}>
          Quad
        </span>
        <span className="text-[11px] text-[#94a3b8] font-semibold tracking-[0.12em]">
          Connect, Share, Grow.
        </span>
      </div>
    </div>
  )
}
