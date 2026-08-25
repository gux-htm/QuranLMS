import { RUBRIC_LABELS, RUBRIC_MAX } from '@/types'
import type { LessonRubric } from '@/types'

interface ScoringRubricProps {
  value: LessonRubric
  onChange: (next: LessonRubric) => void
}

// Slider color follows the score: green (high) -> gold (mid) -> clay (low)
function sliderAccent(ratio: number): string {
  if (ratio >= 0.8) return '#2F6B4F'
  if (ratio >= 0.55) return '#BC8E55'
  return '#C4632F'
}

export function ScoringRubric({ value, onChange }: ScoringRubricProps) {
  return (
    <div className="space-y-2.5">
      {(Object.keys(RUBRIC_MAX) as (keyof LessonRubric)[]).map((k) => {
        const max = RUBRIC_MAX[k]
        const current = value[k]
        const ratio = current / max
        return (
          <div key={k} className="flex items-center gap-3">
            <span className="w-24 shrink-0 text-xs font-medium text-ink/70">{RUBRIC_LABELS[k]}</span>
            <input
              type="range"
              min={0}
              max={max}
              value={current}
              onChange={(e) => onChange({ ...value, [k]: Number(e.target.value) })}
              className="flex-1"
              style={{ accentColor: sliderAccent(ratio) }}
              aria-label={`${RUBRIC_LABELS[k]} score`}
            />
            <input
              type="number"
              min={0}
              max={max}
              value={current}
              onChange={(e) =>
                onChange({ ...value, [k]: Math.min(max, Math.max(0, Number(e.target.value) || 0)) })
              }
              className="h-8 w-14 rounded-md border border-line bg-white px-1.5 text-center text-sm tabular-nums text-ink focus:outline-none focus:ring-2 focus:ring-green-600/40"
              aria-label={`${RUBRIC_LABELS[k]} score input`}
            />
            <span className="w-9 shrink-0 text-right text-xs tabular-nums text-ink/45">/{max}</span>
          </div>
        )
      })}
    </div>
  )
}
