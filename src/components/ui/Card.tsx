import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface CardProps {
  children: ReactNode
  className?: string
}

export function Card({ children, className }: CardProps) {
  return <div className={cn('rounded-lg border border-line bg-white p-6 shadow-card', className)}>{children}</div>
}

export function CardHeader({ children, className }: CardProps) {
  return <div className={cn('mb-4 flex items-start justify-between', className)}>{children}</div>
}

export function CardTitle({ children, className }: CardProps) {
  return <h2 className={cn('font-display text-lg font-semibold text-ink', className)}>{children}</h2>
}

export function CardContent({ children, className }: CardProps) {
  return <div className={cn('space-y-3', className)}>{children}</div>
}
