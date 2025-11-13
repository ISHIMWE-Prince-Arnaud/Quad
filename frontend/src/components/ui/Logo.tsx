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
    <div className={cn('flex items-center gap-3', className)}>
      <Logo size={size} />
      <span className="text-2xl font-bold text-foreground">Quad</span>
    </div>
  )
}
