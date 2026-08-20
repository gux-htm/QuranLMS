import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helper?: string
  icon?: ReactNode
}

export function Input({ label, error, helper, icon, className, ...props }: InputProps) {
  return (
    <div className="space-y-1.5">
      {label && <label className="mb-1.5 block text-sm font-medium text-ink">{label}</label>}
      <div className="relative">
        {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/50">{icon}</div>}
        <input
          className={cn(
            'h-10 w-full rounded-md border border-line bg-white px-3 text-sm text-ink placeholder:text-ink/40 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-green-700',
            icon && 'pl-10',
            error && 'border-clay-600 focus:ring-clay-600',
            className
          )}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-clay-600">{error}</p>}
      {helper && <p className="text-xs text-ink/50">{helper}</p>}
    </div>
  )
}
