import { ReactNode } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
  {
    variants: {
      variant: {
        default: 'bg-green-600 text-paper hover:bg-green-700 focus-visible:ring-green-700 focus-visible:ring-offset-paper',
        secondary: 'bg-paper-dim text-ink hover:bg-line focus-visible:ring-clay-600 focus-visible:ring-offset-paper',
        outline: 'border border-line text-ink hover:bg-paper-dim focus-visible:ring-green-700 focus-visible:ring-offset-paper',
        ghost: 'hover:bg-paper-dim focus-visible:ring-green-700',
        danger: 'bg-clay-600 text-paper hover:bg-clay-700 focus-visible:ring-clay-600 focus-visible:ring-offset-paper',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  }
)

interface ButtonProps extends VariantProps<typeof buttonVariants> {
  children: ReactNode
  className?: string
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  onClick?: () => void
}

export function Button({ variant, size, className, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />
}
