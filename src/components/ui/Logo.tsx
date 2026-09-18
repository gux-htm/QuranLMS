import { useNavigate } from 'react-router-dom'
import { BookOpenText } from 'lucide-react'
import { cn } from '@/lib/utils'

type LogoSize = 'sm' | 'md' | 'lg'
type LogoVariant = 'dark' | 'light' // dark = on light bg (green-800 icon bg), light = on dark bg (white/15 icon bg)

const iconBox: Record<LogoSize, string> = {
  sm: 'h-8 w-8 rounded-xl',
  md: 'h-9 w-9 rounded-xl',
  lg: 'h-10 w-10 rounded-2xl',
}
const iconSize: Record<LogoSize, string> = {
  sm: 'h-4 w-4',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
}
const wordmarkSize: Record<LogoSize, string> = {
  sm: 'text-base',
  md: 'text-lg',
  lg: 'text-xl',
}
const subtitleTracking = 'text-[10px] font-semibold uppercase tracking-[0.18em]'

interface LogoProps {
  size?: LogoSize
  variant?: LogoVariant
  className?: string
  /** If omitted the logo is not clickable */
  onClick?: () => void
}

/** TILP brand logo — icon + wordmark. Wrap in a button externally if you need custom nav. */
export function Logo({ size = 'lg', variant = 'dark', className, onClick }: LogoProps) {
  const iconBg = variant === 'dark' ? 'bg-green-800 text-paper shadow-card' : 'bg-white/15 text-paper'
  const wordColor = variant === 'dark' ? 'text-green-900' : 'text-paper'
  const subColor = variant === 'dark' ? 'text-ink/40' : 'text-paper/50'

  const inner = (
    <span className={cn('flex items-center gap-3', className)}>
      <span className={cn('flex shrink-0 items-center justify-center', iconBox[size], iconBg)}>
        <BookOpenText className={iconSize[size]} />
      </span>
      <span>
        <span className={cn('block font-display font-semibold leading-none', wordmarkSize[size], wordColor)}>
          TILP
        </span>
        <span className={cn('mt-0.5 block', subtitleTracking, subColor)}>Quran learning</span>
      </span>
    </span>
  )

  if (onClick) {
    return (
      <button onClick={onClick} className="text-left">
        {inner}
      </button>
    )
  }
  return inner
}

/** Convenience hook-free version for layouts that already have navigate. */
export function LogoLink({ size, variant, className }: Omit<LogoProps, 'onClick'>) {
  const navigate = useNavigate()
  return <Logo size={size} variant={variant} className={className} onClick={() => navigate('/')} />
}
