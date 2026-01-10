import { cn } from '@/lib/utils'

interface LogoProps {
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
      className={cn(
        'object-contain',
        sizeClasses[size],
        className
      )}
    />
  )
}

// Logo with text for branding
export function LogoWithText({ className, size = 'lg' }: LogoProps) {
  return (
    <div className={cn('flex items-center gap-4', className)}>
      <Logo size={size} className="rounded-xl shadow-sm" />
      <div className="flex flex-col">
        <span className="text-xl font-bold text-foreground leading-tight tracking-tight">Quad</span>
        <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-[0.05em]">Connect. Share. Grow.</span>
      </div>
    </div>
  )
}
