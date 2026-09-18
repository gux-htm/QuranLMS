import { ElementType } from 'react'
import { TrendingUp } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'

export interface StatCardItem {
  icon: ElementType
  /** Tailwind bg + text colour classes, e.g. 'bg-green-50 text-green-700' */
  tone: string
  value: string | number
  label: string
  detail: string
}

interface StatCardsProps {
  stats: StatCardItem[]
  /** Grid column count at xl breakpoint. Defaults to stats.length capped at 4. */
  cols?: 2 | 3 | 4
}

const colsClass: Record<2 | 3 | 4, string> = {
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-3',
  4: 'sm:grid-cols-2 xl:grid-cols-4',
}

export function StatCards({ stats, cols }: StatCardsProps) {
  const resolvedCols = cols ?? (Math.min(stats.length, 4) as 2 | 3 | 4)
  return (
    <div className={`grid gap-4 ${colsClass[resolvedCols]}`}>
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card
            key={stat.label}
            className="group relative overflow-hidden p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
          >
            <CardContent className="space-y-0">
              <div className="flex items-start justify-between">
                <span className={`flex h-11 w-11 items-center justify-center rounded-2xl ${stat.tone}`}>
                  <Icon className="h-5 w-5" />
                </span>
                <TrendingUp className="h-4 w-4 text-ink/15 transition-colors group-hover:text-green-500" />
              </div>
              <div className="mt-5 font-display text-3xl font-semibold tracking-tight text-ink">
                {stat.value}
              </div>
              <div className="mt-1 text-sm font-semibold text-ink">{stat.label}</div>
              <div className="mt-1 text-xs text-ink/45">{stat.detail}</div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
