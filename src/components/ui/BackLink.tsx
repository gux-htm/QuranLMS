import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

interface BackLinkProps {
  /** Navigate to this path when clicked */
  to?: string
  /** Or call this handler directly (for in-page state navigation) */
  onClick?: () => void
  label: string
  /** 'link' (default) = plain text link. 'pill' = bordered pill button. */
  variant?: 'link' | 'pill'
}

export function BackLink({ to, onClick, label, variant = 'link' }: BackLinkProps) {
  const navigate = useNavigate()
  const handleClick = onClick ?? (() => to && navigate(to))

  if (variant === 'pill') {
    return (
      <button
        onClick={handleClick}
        className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-white px-3 py-1.5 text-sm text-ink/65 hover:bg-paper-dim"
      >
        <ArrowLeft className="h-4 w-4" />
        {label}
      </button>
    )
  }

  return (
    <button
      onClick={handleClick}
      className="inline-flex items-center gap-1 text-sm font-medium text-green-700 hover:text-green-800"
    >
      <ArrowLeft className="h-4 w-4" />
      {label}
    </button>
  )
}
