import { ReactNode } from 'react'
import { CheckCircle2 } from 'lucide-react'
import { LogoLink } from '@/components/ui/Logo'

interface AuthBrandPanelProps {
  arabic: string
  translation: string
  features: string[]
  footer: string
  extraRing?: boolean
  /** 'dot' (default) = gold bullet dot, 'check' = CheckCircle2 icon */
  featureStyle?: 'dot' | 'check'
  children?: ReactNode
}

export function AuthBrandPanel({
  arabic,
  translation,
  features,
  footer,
  extraRing = false,
  featureStyle = 'dot',
}: AuthBrandPanelProps) {
  return (
    <div className="relative hidden flex-col justify-between overflow-hidden bg-green-900 px-10 py-12 lg:flex lg:w-[42%]">
      {/* Decorative rings */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full border border-white/10" />
      <div className="pointer-events-none absolute -bottom-16 -left-16 h-64 w-64 rounded-full border border-white/10" />
      {extraRing && (
        <div className="pointer-events-none absolute right-10 top-1/3 h-40 w-40 rounded-full border border-white/10" />
      )}

      <LogoLink variant="light" />

      <div className="relative">
        <p className="font-arabic text-4xl leading-relaxed text-paper/90">{arabic}</p>
        <p className="mt-3 text-sm leading-6 text-paper/55">{translation}</p>
        <div className="mt-8 space-y-3 text-sm text-paper/60">
          {features.map((item) => (
            <div key={item} className="flex items-center gap-2">
              {featureStyle === 'check' ? (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-gold-300" />
              ) : (
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-gold-300" />
              )}
              {item}
            </div>
          ))}
        </div>
      </div>

      <p className="relative text-xs text-paper/35">{footer}</p>
    </div>
  )
}

/** Mobile-only logo shown on auth pages when the left panel is hidden */
export function AuthMobileLogo() {
  return (
    <div className="mb-8 lg:hidden">
      <LogoLink size="md" />
    </div>
  )
}
